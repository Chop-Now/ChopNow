/**
 * Input — Text field with floating label animation.
 * - 48pt height for comfortable touch (Material Design 3)
 * - Animated focus border
 * - Inline error state
 */
import React, { useState } from 'react';
import { TextInput, Text, View, type TextInputProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';

interface InputProps extends TextInputProps {
  label:       string;
  error?:      string;
  leftIcon?:   React.ReactNode;
  rightIcon?:  React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    borderColor: borderAnim.value === 1
      ? Colors.primary[600]
      : error ? Colors.error : Colors.border,
  }));

  const onFocus = () => {
    setFocused(true);
    borderAnim.value = withTiming(1, { duration: 180 });
    props.onFocus?.({} as any);
  };

  const onBlur = () => {
    setFocused(false);
    borderAnim.value = withTiming(0, { duration: 180 });
    props.onBlur?.({} as any);
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      <Animated.View
        style={[animStyle, { borderWidth: focused ? 2 : 1.5 }]}
        className="flex-row items-center rounded-xl bg-white overflow-hidden"
      >
        {leftIcon && <View className="pl-4">{leftIcon}</View>}
        <TextInput
          {...props}
          onFocus={onFocus}
          onBlur={onBlur}
          className="flex-1 px-4 text-base text-gray-900"
          style={{ height: 52, fontFamily: 'Inter_400Regular' }}
          placeholderTextColor={Colors.textTertiary}
        />
        {rightIcon && <View className="pr-4">{rightIcon}</View>}
      </Animated.View>
      {error ? (
        <Text className="text-xs text-red-500 mt-1 ml-1">{error}</Text>
      ) : null}
    </View>
  );
};
