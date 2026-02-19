import React from 'react';
import { Text, View } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const variants: Record<BadgeVariant, string> = {
  success: 'bg-green-100',
  warning: 'bg-yellow-100',
  error:   'bg-red-100',
  info:    'bg-blue-100',
  neutral: 'bg-gray-100',
};

const textVariants: Record<BadgeVariant, string> = {
  success: 'text-green-700',
  warning: 'text-yellow-700',
  error:   'text-red-700',
  info:    'text-blue-700',
  neutral: 'text-gray-600',
};

interface BadgeProps {
  label:    string;
  variant?: BadgeVariant;
  dot?:     boolean;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', dot }) => (
  <View className={`flex-row items-center rounded-full px-2.5 py-1 self-start ${variants[variant]}`}>
    {dot && (
      <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        variant === 'success' ? 'bg-green-500'
        : variant === 'warning' ? 'bg-yellow-500'
        : variant === 'error' ? 'bg-red-500'
        : 'bg-blue-500'
      }`} />
    )}
    <Text className={`text-xs font-medium ${textVariants[variant]}`}>{label}</Text>
  </View>
);
