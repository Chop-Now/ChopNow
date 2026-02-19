import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { userProfileService } from '../services/userProfile';
import { Button } from '../components/ui/Button';
import { Input  } from '../components/ui/Input';
import { Colors } from '../constants/colors';

export default function ForgotPasswordScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [email, setEmail]     = useState('');
  const [sent,  setSent]      = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSend = async () => {
    if (!email.trim()) { setError('Enter your email address'); return; }
    setLoading(true);
    try {
      await userProfileService.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top + 12 }} className="px-6 flex-1">
        <Pressable onPress={() => router.back()} className="mb-8 self-start">
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>

        {sent ? (
          <View className="flex-1 items-center justify-center">
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="mail-open-outline" size={36} color={Colors.primary[600]} />
            </View>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 24 }} className="text-gray-900 text-center mb-3">Check your email</Text>
            <Text className="text-gray-500 text-base text-center leading-6 mb-8">
              We've sent a password reset link to {email}
            </Text>
            <Button label="Back to Login" onPress={() => router.replace('/(auth)/login')} fullWidth size="lg" />
          </View>
        ) : (
          <>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 28 }} className="text-gray-900 mb-2">Forgot password?</Text>
            <Text className="text-gray-500 text-base mb-8">Enter your email and we'll send a reset link</Text>
            <Input label="Email address" value={email} onChangeText={(v) => { setEmail(v); setError(''); }}
              keyboardType="email-address" autoCapitalize="none" error={error}
              leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textTertiary} />}
              placeholder="you@example.com" />
            <Button label="Send Reset Link" onPress={handleSend} loading={loading} fullWidth size="lg" />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
