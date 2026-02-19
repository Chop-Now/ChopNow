import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable,
  ScrollView, Text, View
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input  } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';

export default function SignupScreen() {
  const router    = useRouter();
  const insets    = useSafeAreaInsets();
  const register  = useAuthStore((s) => s.register);

  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [phone,   setPhone]   = useState('');
  const [password,setPassword]= useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())              e.name     = 'Name is required';
    if (!email.trim())             e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password || password.length < 6) e.password = 'At least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, phone.trim() || undefined);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrors({ global: err?.response?.data?.message ?? 'Registration failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back + Header */}
        <View style={{ paddingTop: insets.top + 12 }} className="px-6 mb-6">
          <Pressable onPress={() => router.back()} className="mb-6 self-start">
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 28 }} className="text-gray-900 mb-2">
            Create account
          </Text>
          <Text className="text-gray-500 text-base">Join thousands saving food in Kigali</Text>
        </View>

        <View className="px-6">
          {errors.global ? (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex-row items-center">
              <Ionicons name="alert-circle-outline" size={18} color={Colors.error} />
              <Text className="text-red-600 text-sm ml-2 flex-1">{errors.global}</Text>
            </View>
          ) : null}

          <Input label="Full name"       value={name}     onChangeText={setName}
            autoCapitalize="words" error={errors.name}
            leftIcon={<Ionicons name="person-outline" size={20} color={Colors.textTertiary} />}
            placeholder="Your full name" />

          <Input label="Email address"   value={email}    onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" autoCorrect={false} error={errors.email}
            leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textTertiary} />}
            placeholder="you@example.com" />

          <Input label="Phone (optional)" value={phone}   onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Ionicons name="call-outline" size={20} color={Colors.textTertiary} />}
            placeholder="+250 7XX XXX XXX" />

          <Input label="Password"        value={password} onChangeText={setPassword}
            secureTextEntry={!showPw} error={errors.password}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />}
            rightIcon={
              <Pressable onPress={() => setShowPw((v) => !v)}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textTertiary} />
              </Pressable>
            }
            placeholder="At least 6 characters" />

          <Text className="text-gray-400 text-xs mb-6">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </Text>

          <Button label="Create Account" onPress={handleSignup} loading={loading} fullWidth size="lg" />

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500 text-base">Already have an account? </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text className="text-primary-600 font-semibold text-base">Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
