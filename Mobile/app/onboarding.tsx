/**
 * Onboarding — 3-slide value proposition.
 * UX principles:
 * - Progress dots (not numbers) — less intimidating
 * - Swipe + button navigation (dual affordance)
 * - Skip always visible (respect user's time)
 * - Brand story: Save food → Save money → Save planet
 */
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id:          '1',
    emoji:       '🍱',
    title:       'Great food at\nhalf the price',
    subtitle:    'Restaurants and stores in Kigali sell their surplus meals at up to 70% off — before they go to waste.',
    bg:          '#f0fdf4',
    accent:      Colors.primary[600],
  },
  {
    id:          '2',
    emoji:       '💚',
    title:       'Save food,\nsave the planet',
    subtitle:    'Every meal you rescue prevents CO₂ emissions. Track your real-world environmental impact.',
    bg:          '#ecfdf5',
    accent:      Colors.primary[700],
  },
  {
    id:          '3',
    emoji:       '⚡',
    title:       'Ready in minutes,\npickup in seconds',
    subtitle:    'Order, pay, and pick up — no waiting, no delivery fees. Just great food, right now.',
    bg:          '#f0fdf4',
    accent:      Colors.primary[600],
  },
] as const;

export default function Onboarding() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const flatRef  = useRef<FlatList>(null);
  const [index, setIndex]  = useState(0);

  const finish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
    router.replace('/(auth)/login');
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: index + 1, animated: true });
      setIndex((i) => i + 1);
    } else {
      finish();
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Skip */}
      <Pressable
        onPress={finish}
        style={{ paddingTop: insets.top + 12, paddingRight: 20 }}
        className="items-end"
      >
        <Text className="text-gray-400 font-medium text-sm">Skip</Text>
      </Pressable>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 items-center justify-center px-8">
            {/* Illustration circle */}
            <View
              className="w-56 h-56 rounded-full items-center justify-center mb-10"
              style={{ backgroundColor: item.bg }}
            >
              <Text style={{ fontSize: 80 }}>{item.emoji}</Text>
            </View>
            <Text
              className="text-gray-900 text-center mb-4"
              style={{ fontSize: 28, fontFamily: 'Inter_700Bold', lineHeight: 36 }}
            >
              {item.title}
            </Text>
            <Text className="text-gray-500 text-center text-base leading-6">
              {item.subtitle}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Bottom controls */}
      <View style={{ paddingBottom: insets.bottom + 24 }} className="px-6">
        {/* Dots */}
        <View className="flex-row justify-center mb-8 gap-2">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                width:  i === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === index ? Colors.primary[600] : Colors.gray[200],
                transition: 'width 0.3s',
              } as any}
            />
          ))}
        </View>

        <Button
          label={index === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          onPress={next}
          size="lg"
          fullWidth
        />
      </View>
    </View>
  );
}
