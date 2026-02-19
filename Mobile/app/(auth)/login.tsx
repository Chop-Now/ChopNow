/**
 * Login Screen
 * UX principles:
 * - Email first, password second (natural top-to-bottom flow)
 * - Show/hide password toggle (reduces frustration)
 * - Inline validation, not modal errors
 * - Biometric auth hook (prepared, can activate)
 * - Social login prominent (reduces friction)
 */
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

export default function LoginScreen() {
  const router     = useRouter();
  const insets     = useSafeAreaInsets();
  const login      = useAuthStore((s) => s.login);

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState<{ email?: string; password?: string; global?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim())             e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password)                 e.password = 'Password is required';
    else if (password.length < 6)  e.password = 'At least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrors({ global: err?.response?.data?.message ?? 'Login failed. Check your credentials.' });
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
        {/* Header */}
        <View style={{ paddingTop: insets.top + 20 }} className="px-6 mb-8">
          <View className="w-14 h-14 bg-primary-600 rounded-2xl items-center justify-center mb-6">
            <Text style={{ fontSize: 28 }}>🌿</Text>
          </View>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 28 }} className="text-gray-900 mb-2">
            Welcome back
          </Text>
          <Text className="text-gray-500 text-base">
            Sign in to discover food near you
          </Text>
        </View>

        {/* Form */}
        <View className="px-6 flex-1">
          {errors.global ? (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex-row items-center">
              <Ionicons name="alert-circle-outline" size={18} color={Colors.error} />
              <Text className="text-red-600 text-sm ml-2 flex-1">{errors.global}</Text>
            </View>
          ) : null}

          <Input
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            error={errors.email}
            leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textTertiary} />}
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            autoComplete="password"
            error={errors.password}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />}
            rightIcon={
              <Pressable onPress={() => setShowPw((v) => !v)}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textTertiary} />
              </Pressable>
            }
            placeholder="Your password"
          />

          {/* Forgot password */}
          <Pressable className="self-end -mt-2 mb-6">
            <Text className="text-primary-600 text-sm font-medium">Forgot password?</Text>
          </Pressable>

          <Button
            label="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
          />

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-gray-400 text-sm mx-4">or</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Sign up link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-500 text-base">Don't have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/signup')}>
              <Text className="text-primary-600 font-semibold text-base">Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
