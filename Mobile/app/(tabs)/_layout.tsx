/**
 * Bottom Tab Navigator
 * Research: Bottom nav outperforms hamburger menus by 20% for task completion
 * (NNGroup). Primary actions in thumb zone (bottom of screen).
 * Custom tab bar with spring animations and haptic feedback.
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { useCartStore } from '../../stores/cartStore';

const TABS = [
  { name: 'index',   label: 'Home',    icon: 'home',           iconActive: 'home'           },
  { name: 'explore', label: 'Explore', icon: 'search-outline', iconActive: 'search'         },
  { name: 'orders',  label: 'Orders',  icon: 'receipt-outline', iconActive: 'receipt'       },
  { name: 'impact',  label: 'Impact',  icon: 'leaf-outline',   iconActive: 'leaf'           },
  { name: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person'         },
] as const;

function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  React.useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.2, { damping: 10, stiffness: 400 }, () => {
        scale.value = withSpring(1, { damping: 12, stiffness: 300 });
      });
      Haptics.selectionAsync();
    }
  }, [focused]);

  return (
    <Animated.View style={animStyle} className="items-center">
      <Ionicons
        name={(focused ? name.replace('-outline', '') : name) as any}
        size={24}
        color={focused ? Colors.primary[600] : Colors.gray[400]}
      />
    </Animated.View>
  );
}

export default function TabLayout() {
  const insets    = useSafeAreaInsets();
  const cartCount = useCartStore((s) => s.totalItems());

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, descriptors, navigation }) => (
        <View
          className="bg-white border-t border-gray-100 flex-row"
          style={{ paddingBottom: insets.bottom, elevation: 20,
            shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: -4 } }}
        >
          {state.routes.map((route, idx) => {
            const { options } = descriptors[route.key];
            const focused = state.index === idx;
            const tab = TABS[idx];

            return (
              <Pressable
                key={route.key}
                className="flex-1 items-center pt-3 pb-1"
                style={{ minHeight: 56 }}
                onPress={() => {
                  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
              >
                <View className="relative">
                  <TabBarIcon
                    name={tab.icon}
                    focused={focused}
                  />
                  {/* Cart badge on Explore tab or elsewhere if needed */}
                  {route.name === 'index' && cartCount > 0 && (
                    <View className="absolute -top-1 -right-2 bg-primary-600 rounded-full w-4 h-4 items-center justify-center">
                      <Text className="text-white text-xs font-bold" style={{ fontSize: 9 }}>{cartCount > 9 ? '9+' : cartCount}</Text>
                    </View>
                  )}
                </View>
                <Text
                  className="text-xs mt-1"
                  style={{
                    color: focused ? Colors.primary[600] : Colors.gray[400],
                    fontFamily: focused ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    >
      <Tabs.Screen name="index"   />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="orders"  />
      <Tabs.Screen name="impact"  />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
