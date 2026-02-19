import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { userProfileService } from '../services/userProfile';
import { Button } from '../components/ui/Button';
import { Input  } from '../components/ui/Input';
import { Colors } from '../constants/colors';

export default function EditProfileScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const user    = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [name,    setName]    = useState(user?.name ?? '');
  const [phone,   setPhone]   = useState(user?.phone ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Name is required'); return; }
    setLoading(true);
    try {
      const updated = await userProfileService.update({ name: name.trim(), phone: phone.trim() });
      setUser({ ...user!, ...updated });
      router.back();
    } catch (e: any) {
      Alert.alert('Update failed', e?.response?.data?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={Colors.textPrimary} /></Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">Edit Profile</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-primary-600 rounded-full items-center justify-center mb-3">
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 32 }} className="text-white">
              {name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </Text>
          </View>
          <Pressable className="flex-row items-center gap-1">
            <Ionicons name="camera-outline" size={16} color={Colors.primary[600]} />
            <Text className="text-primary-600 text-sm font-medium">Change photo</Text>
          </Pressable>
        </View>

        <Input label="Full name" value={name} onChangeText={setName} autoCapitalize="words"
          leftIcon={<Ionicons name="person-outline" size={20} color={Colors.textTertiary} />} />
        <Input label="Email address" value={user?.email ?? ''} editable={false}
          leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textTertiary} />}
          className="opacity-60" />
        <Input label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad"
          leftIcon={<Ionicons name="call-outline" size={20} color={Colors.textTertiary} />}
          placeholder="+250 7XX XXX XXX" />

        <Button label="Save Changes" onPress={handleSave} loading={loading} fullWidth size="lg" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
