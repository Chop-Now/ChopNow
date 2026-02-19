/**
 * Entry point — decides where to send the user:
 * - First launch   → Onboarding
 * - Not logged in  → Login
 * - Logged in      → Tabs (Home)
 */
import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/colors';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync('hasSeenOnboarding').then((v) => {
      setHasSeenOnboarding(v === 'true');
    });
  }, []);

  if (isLoading || hasSeenOnboarding === null) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>
    );
  }

  if (!hasSeenOnboarding) return <Redirect href="/onboarding" />;
  if (!isAuthenticated)    return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)" />;
}
