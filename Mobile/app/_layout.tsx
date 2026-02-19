/**
 * Root Layout
 * - Loads fonts
 * - Initialises auth store
 * - Wraps app in TanStack Query client
 * - Handles splash screen
 */
import '../global.css';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../stores/authStore';
import { setForceLogoutCallback } from '../services/api';
import { useCartStore } from '../stores/cartStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:  1000 * 60 * 2,  // 2 min
      retry:      1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const logout     = useAuthStore((s) => s.logout);
  const hydrateCart = useCartStore((s) => s.hydrate);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    setForceLogoutCallback(logout);
    initialize();
    hydrateCart();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding"        options={{ animation: 'fade' }} />
          <Stack.Screen name="(auth)"            options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="(tabs)"            options={{ animation: 'fade' }} />
          <Stack.Screen name="listing/[id]"      options={{ animation: 'slide_from_right', headerShown: false }} />
          <Stack.Screen name="cart"              options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
          <Stack.Screen name="checkout"          options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
          <Stack.Screen name="notifications"     options={{ animation: 'slide_from_right' }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
