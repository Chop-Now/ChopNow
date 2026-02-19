/**
 * ListingCard — The most important component in the app.
 * Every micro-interaction matters here. Rules applied:
 * - Spring animation on press (natural physics)
 * - Haptic feedback on add-to-cart
 * - Discount badge always visible (loss aversion psychology)
 * - Pickup time prominent (urgency driver)
 * - Smooth image loading with blur placeholder
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../stores/cartStore';
import { Colors } from '../../constants/colors';
import type { Listing } from '../../types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ListingCardProps {
  listing:    Listing;
  horizontal?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, horizontal }) => {
  const router    = useRouter();
  const add       = useCartStore((s) => s.add);
  const cache     = useCartStore((s) => s.cacheListing);
  const cartItems = useCartStore((s) => s.items);
  const inCart    = (cartItems[listing._id] ?? 0) > 0;

  const scale    = useSharedValue(1);
  const btnScale = useSharedValue(1);

  const cardAnim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const btnAnim  = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const handlePress = () => {
    cache(listing);
    router.push(`/listing/${listing._id}`);
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation?.();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    btnScale.value = withSpring(0.85, { damping: 10, stiffness: 400 }, () => {
      btnScale.value = withSpring(1, { damping: 12, stiffness: 300 });
    });
    add(listing._id);
    cache(listing);
  };

  const pickupTime = listing.pickupFrom
    ? new Date(listing.pickupFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <AnimatedPressable
      style={[cardAnim, { width: horizontal ? 200 : '100%' }]}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1,    { damping: 15, stiffness: 300 }); }}
      onPress={handlePress}
      className="bg-white rounded-2xl overflow-hidden mb-4"
      style={{ elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } } as any}
    >
      {/* Image */}
      <View className="relative">
        <Image
          source={listing.images?.[0] ?? 'https://via.placeholder.com/400x200/f0fdf4/16a34a?text=ChopNow'}
          style={{ height: horizontal ? 130 : 160, width: '100%' }}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          transition={300}
        />
        {/* Discount Badge */}
        {listing.discountPercentage > 0 && (
          <View className="absolute top-2 left-2 bg-primary-600 rounded-full px-2.5 py-1">
            <Text className="text-white text-xs font-bold">-{listing.discountPercentage}%</Text>
          </View>
        )}
        {/* Out of stock overlay */}
        {listing.status !== 'active' && (
          <View className="absolute inset-0 bg-black/40 items-center justify-center">
            <Text className="text-white font-bold text-sm">Sold Out</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-3">
        <Text className="text-gray-900 font-semibold text-sm mb-0.5" numberOfLines={1}>
          {listing.name}
        </Text>
        <Text className="text-gray-500 text-xs mb-2" numberOfLines={1}>
          {listing.business?.name}
        </Text>

        {/* Pickup time */}
        {pickupTime && (
          <View className="flex-row items-center mb-2">
            <Ionicons name="time-outline" size={12} color={Colors.textTertiary} />
            <Text className="text-xs text-gray-400 ml-1">Pick up by {pickupTime}</Text>
          </View>
        )}

        {/* Price row */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-primary-600 font-bold text-base">
              RWF {listing.discountedPrice.toLocaleString()}
            </Text>
            {listing.originalPrice > listing.discountedPrice && (
              <Text className="text-gray-400 text-xs line-through">
                RWF {listing.originalPrice.toLocaleString()}
              </Text>
            )}
          </View>

          {/* Add to cart button */}
          <Animated.View style={btnAnim}>
            <Pressable
              onPress={handleAddToCart}
              disabled={listing.status !== 'active'}
              className={`w-9 h-9 rounded-full items-center justify-center ${
                inCart ? 'bg-primary-600' : 'bg-primary-100'
              }`}
            >
              <Ionicons
                name={inCart ? 'checkmark' : 'add'}
                size={20}
                color={inCart ? Colors.white : Colors.primary[600]}
              />
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </AnimatedPressable>
  );
};
