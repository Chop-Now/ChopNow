/**
 * Premium Onboarding Flow — ChopNow
 * Full-bleed food photography · Real logo · Animated progress segments
 * 4 slides educating users on the ChopNow value proposition
 * Skip always visible · Swipe + button navigation · Haptic feedback
 */
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import ChopNowLogo from '../components/ChopNowLogo';
import { Button } from '../components/ui/Button';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    image: require('../assets/images/sandwich.jpg') as number,
    tag: 'Save up to 70%',
    tagColor: '#0EB000',
    tagBg: '#E8F5E9',
    title: 'Rescue Great\nFood Today',
    body: 'Discover surplus meals from top Kigali restaurants and cafés — fresh, delicious, and ready for you at a fraction of the price.',
  },
  {
    id: '2',
    image: require('../assets/images/fresh_produce.png') as number,
    tag: 'Real environmental impact',
    tagColor: '#0EB000',
    tagBg: '#E8F5E9',
    title: 'Every Order\nSaves the Planet',
    body: 'When you rescue food, you prevent CO₂ emissions and reduce landfill waste. ChopNow tracks your personal environmental footprint in real time.',
  },
  {
    id: '3',
    image: require('../assets/images/pastry_box.jpg') as number,
    tag: 'No delivery fees',
    tagColor: '#FA9B03',
    tagBg: '#FFF8E1',
    title: 'Order. Pay.\nPick Up.',
    body: 'Browse listings near you, pay securely in seconds, and show your unique pickup code at the store. No waiting. No extra charges.',
  },
  {
    id: '4',
    image: require('../assets/images/fresh_fruits_image.png') as number,
    tag: 'Join the movement',
    tagColor: '#0EB000',
    tagBg: '#E8F5E9',
    title: "Be Part of\nRwanda's Change",
    body: "Thousands of food lovers and local businesses are already reducing waste together. Join ChopNow and make a real difference today.",
  },
] as const;

// ─── Progress segments ────────────────────────────────────────────────────────
function ProgressSegments({ total, current }: { total: number; current: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.28)',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: 0, bottom: 0, left: 0,
              width: i <= current ? '100%' : '0%',
              backgroundColor: '#fff',
              borderRadius: 2,
            }}
          />
        </View>
      ))}
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  // Animated values for bottom card content
  const cardOpacity  = useSharedValue(1);
  const cardSlide    = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    opacity:   cardOpacity.value,
    transform: [{ translateY: cardSlide.value }],
  }));

  // Fade-slide content in after slide change
  const animateContent = () => {
    cardOpacity.value = 0;
    cardSlide.value   = 14;
    cardOpacity.value = withTiming(1, { duration: 320 });
    cardSlide.value   = withTiming(0, { duration: 320 });
  };

  // Mark onboarding seen, go to auth
  const finish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
    router.replace('/(auth)/login');
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      flatRef.current?.scrollToIndex({ index: next, animated: true });
      animateContent();
      setIndex(next);
    } else {
      finish();
    }
  };

  const slide = SLIDES[index];

  return (
    <View style={styles.root}>
      {/* ── Full-screen image pager ───────────────────────────────── */}
      <FlatList
        ref={flatRef}
        data={SLIDES as any}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          if (newIndex !== index) {
            animateContent();
            setIndex(newIndex);
          }
        }}
        renderItem={({ item }: { item: typeof SLIDES[number] }) => (
          <View style={{ width, height }}>
            <Image
              source={item.image}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={400}
            />
            {/* Dark scrim — readability */}
            <View style={[StyleSheet.absoluteFill, styles.scrim]} />
          </View>
        )}
        keyExtractor={(item: any) => item.id}
      />

      {/* ── Logo (top-left) ──────────────────────────────────────── */}
      <View style={[styles.logoWrap, { top: insets.top + 14 }]}>
        <ChopNowLogo width={120} height={42} />
      </View>

      {/* ── Skip (top-right, hidden on last slide) ───────────────── */}
      {index < SLIDES.length - 1 && (
        <Pressable
          onPress={finish}
          hitSlop={16}
          style={[styles.skipBtn, { top: insets.top + 22 }]}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      {/* ── Progress segments (below logo row) ───────────────────── */}
      <View style={[styles.progressWrap, { top: insets.top + 72 }]}>
        <ProgressSegments total={SLIDES.length} current={index} />
      </View>

      {/* ── Bottom content card ──────────────────────────────────── */}
      <View style={styles.cardShell}>
        <Animated.View
          style={[styles.card, { paddingBottom: Math.max(insets.bottom + 20, 32) }, cardStyle]}
        >
          {/* Tag badge */}
          <View style={[styles.tagBadge, { backgroundColor: slide.tagBg }]}>
            <Text style={[styles.tagText, { color: slide.tagColor }]}>
              {slide.tag}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{slide.title}</Text>

          {/* Body */}
          <Text style={styles.body}>{slide.body}</Text>

          {/* CTA */}
          <Button
            label={index === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
            onPress={goNext}
            size="lg"
            fullWidth
          />

          {/* Sign-in hint on last slide */}
          {index === SLIDES.length - 1 && (
            <View style={styles.signinRow}>
              <Text style={styles.signinHint}>Already have an account?  </Text>
              <Pressable onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.signinLink}>Sign In</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrim: {
    backgroundColor: 'rgba(0,0,0,0.42)',
  },

  // Logo
  logoWrap: {
    position: 'absolute',
    left: 20,
  },

  // Skip
  skipBtn: {
    position: 'absolute',
    right: 20,
  },
  skipText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },

  // Progress bar
  progressWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
  },

  // Bottom card
  cardShell: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 28,
    paddingHorizontal: 24,
  },

  // Tag badge
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    marginBottom: 14,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.4,
  },

  // Title
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 30,
    lineHeight: 38,
    color: '#111827',
    marginBottom: 12,
  },

  // Body copy
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: '#6B7280',
    marginBottom: 28,
  },

  // Sign-in row
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signinHint: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  signinLink: {
    color: Colors.primary[600],
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
