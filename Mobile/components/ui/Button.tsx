/**
 * Button — Primary interactive element.
 * - Minimum 44pt touch target (Apple HIG)
 * - Haptic feedback on press
 * - Loading state with spinner
 * - Spring animation on press (feels alive, not mechanical)
 */
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label:      string;
  onPress:    () => void;
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  disabled?:  boolean;
  fullWidth?: boolean;
  icon?:      React.ReactNode;
  className?: string;
}

const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary:   { bg: 'bg-primary-600',  text: 'text-white' },
  secondary: { bg: 'bg-primary-100',  text: 'text-primary-700' },
  outline:   { bg: 'bg-transparent',  text: 'text-primary-600', border: 'border border-primary-600' },
  ghost:     { bg: 'bg-transparent',  text: 'text-gray-700' },
  danger:    { bg: 'bg-red-500',       text: 'text-white' },
};

const sizeStyles: Record<Size, { padding: string; text: string; minH: number }> = {
  sm: { padding: 'px-4 py-2',    text: 'text-sm',  minH: 36 },
  md: { padding: 'px-6 py-3',    text: 'text-base', minH: 48 },
  lg: { padding: 'px-8 py-4',    text: 'text-lg',  minH: 56 },
};

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant    = 'primary',
  size       = 'md',
  loading    = false,
  disabled   = false,
  fullWidth  = false,
  icon,
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const isDisabled = disabled || loading;
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <AnimatedPressable
      style={animStyle}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1,    { damping: 15, stiffness: 300 }); }}
      onPress={handlePress}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center rounded-2xl',
        v.bg, v.border ?? '',
        s.padding,
        fullWidth ? 'w-full' : 'self-start',
        isDisabled ? 'opacity-50' : '',
      ].join(' ')}
      style={{ minHeight: s.minH }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? Colors.white : Colors.primary[600]}
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`font-semibold ${s.text} ${v.text}`}>{label}</Text>
        </>
      )}
    </AnimatedPressable>
  );
};
