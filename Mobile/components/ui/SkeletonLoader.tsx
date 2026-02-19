/**
 * Skeleton Loader
 * Research: Skeleton screens reduce perceived load time by 20%
 * (Luke Wroblewski / Facebook Paper research).
 * Uses shimmer animation moving left-to-right.
 */
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?:  number | string;
  height?: number;
  radius?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width  = '100%',
  height = 16,
  radius = 8,
  className,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#e5e7eb', '#f3f4f6']
    ),
  }));

  return (
    <Animated.View
      style={[animStyle, { width: width as any, height, borderRadius: radius }]}
      className={className}
    />
  );
};

// ── Listing Card Skeleton ─────────────────────────────────────────────────────
export const ListingCardSkeleton: React.FC = () => (
  <View className="bg-white rounded-2xl overflow-hidden mb-4" style={{ elevation: 2 }}>
    <Skeleton height={160} radius={0} />
    <View className="p-3 gap-2">
      <Skeleton height={14} width="70%" />
      <Skeleton height={12} width="45%" />
      <View className="flex-row justify-between mt-1">
        <Skeleton height={18} width={80} />
        <Skeleton height={32} width={32} radius={16} />
      </View>
    </View>
  </View>
);

// ── Home Hero Skeleton ────────────────────────────────────────────────────────
export const HeroSkeleton: React.FC = () => (
  <View className="mx-4 mb-6 gap-3">
    <Skeleton height={24} width="60%" />
    <Skeleton height={16} width="80%" />
    <Skeleton height={52} radius={16} />
  </View>
);
