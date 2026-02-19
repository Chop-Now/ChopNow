import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { disputeService } from '../../services/disputes';
import { Button } from '../../components/ui/Button';
import { Input  } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';

const TYPES = ['Wrong item', 'Missing item', 'Quality issue', 'Order not ready', 'Other'];

export default function DisputeScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router      = useRouter();
  const insets      = useSafeAreaInsets();

  const [type,    setType]    = useState('');
  const [title,   setTitle]   = useState('');
  const [desc,    setDesc]    = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!type || !title.trim() || !desc.trim()) {
      Alert.alert('Please fill in all fields'); return;
    }
    setLoading(true);
    try {
      await disputeService.create({ orderId, title: title.trim(), description: desc.trim(), type });
      Alert.alert('Dispute Submitted', 'Our team will review your case within 24 hours.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Failed', e?.response?.data?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={Colors.textPrimary} /></Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">Report an Issue</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 mb-3">What went wrong?</Text>
        <View className="flex-row flex-wrap gap-2 mb-5">
          {TYPES.map((t) => (
            <Pressable key={t} onPress={() => setType(t)}
              className={`px-4 py-2 rounded-full border ${type === t ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'}`}>
              <Text className={`text-sm font-medium ${type === t ? 'text-white' : 'text-gray-700'}`}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <Input label="Subject" value={title} onChangeText={setTitle} placeholder="Brief summary of the issue" />
        <Input label="Description" value={desc} onChangeText={setDesc}
          placeholder="Please describe what happened in detail..."
          multiline numberOfLines={5}
          style={{ height: 120, textAlignVertical: 'top' } as any} />
        <Button label="Submit Dispute" onPress={handleSubmit} loading={loading} fullWidth size="lg" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
