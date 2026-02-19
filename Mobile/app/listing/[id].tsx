/**
 * Product Detail Screen
 * UX: This is the conversion screen. Every detail matters.
 * - Hero image fills top half (visual appetite appeal)
 * - Price and discount immediately visible (value proposition)
 * - Sticky CTA bar at bottom (always reachable — thumb zone)
 * - Quantity stepper with haptic on each step
 * - Business info with rating
 * - Smooth swipe-back gesture (native feel)
 */
import React, { useState } from 'react';
import {
  Dimensions, Platform, Pressable,
  ScrollView, StatusBar, Text, View
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { listingService } from '../../services/listings';
import { useCartStore } from '../../stores/cartStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const IMG_HEIGHT = width * 0.75;

export default function ListingDetailScreen() {
  const { id }      = useLocalSearchParams<{ id: string }>();
  const router      = useRouter();
  const insets      = useSafeAreaInsets();
  const cartItems   = useCartStore((s) => s.items);
  const add         = useCartStore((s) => s.add);
  const remove      = useCartStore((s) => s.remove);
  const cache       = useCartStore((s) => s.cacheListing);

  const quantity    = cartItems[id] ?? 0;
  const btnScale    = useSharedValue(1);
  const btnAnim     = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn:  () => listingService.getById(id),
    enabled:  !!id,
  });

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    btnScale.value = withSpring(0.9, { damping: 10 }, () => {
      btnScale.value = withSpring(1, { damping: 12 });
    });
    if (listing) { add(id); cache(listing); }
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    remove(id);
  };

  const pickupFrom = listing?.pickupFrom
    ? new Date(listing.pickupFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;
  const pickupTo = listing?.pickupTo
    ? new Date(listing.pickupTo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  if (isLoading || !listing) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Ionicons name="restaurant-outline" size={48} color={Colors.gray[300]} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
        {/* Hero image */}
        <View style={{ height: IMG_HEIGHT }}>
          <Image
            source={listing.images?.[0]}
            style={{ width, height: IMG_HEIGHT }}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
          {/* Gradient overlay */}
          <View
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%)' } as any}
          />
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={{ top: insets.top + 12, left: 16 }}
            className="absolute w-10 h-10 bg-black/40 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </Pressable>
          {/* Discount badge */}
          {listing.discountPercentage > 0 && (
            <View
              style={{ top: insets.top + 12, right: 16 }}
              className="absolute bg-primary-600 rounded-full px-3 py-1"
            >
              <Text className="text-white font-bold text-sm">-{listing.discountPercentage}%</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View className="px-4 pt-5 pb-32">
          {/* Name + status */}
          <View className="flex-row items-start justify-between mb-2">
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, flex: 1 }} className="text-gray-900 mr-3">
              {listing.name}
            </Text>
            <Badge
              label={listing.status === 'active' ? 'Available' : 'Sold Out'}
              variant={listing.status === 'active' ? 'success' : 'error'}
              dot
            />
          </View>

          {/* Business */}
          <Pressable className="flex-row items-center mb-4">
            <Ionicons name="storefront-outline" size={16} color={Colors.textTertiary} />
            <Text className="text-gray-500 text-sm ml-1.5">{listing.business?.name}</Text>
            <Ionicons name="location-outline" size={14} color={Colors.textTertiary} className="ml-3" />
            <Text className="text-gray-500 text-sm ml-1" numberOfLines={1}>
              {listing.business?.address}
            </Text>
          </Pressable>

          {/* Price */}
          <View className="flex-row items-baseline gap-3 mb-4">
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 28 }} className="text-primary-600">
              RWF {listing.discountedPrice.toLocaleString()}
            </Text>
            {listing.originalPrice > listing.discountedPrice && (
              <Text className="text-gray-400 text-lg line-through">
                RWF {listing.originalPrice.toLocaleString()}
              </Text>
            )}
          </View>

          {/* Pickup window */}
          {pickupFrom && (
            <View className="flex-row items-center bg-amber-50 rounded-xl px-4 py-3 mb-4 gap-2">
              <Ionicons name="time-outline" size={18} color={Colors.warning} />
              <View>
                <Text className="text-amber-800 font-medium text-sm">Pickup window</Text>
                <Text className="text-amber-700 text-sm">{pickupFrom}{pickupTo ? ` – ${pickupTo}` : ''}</Text>
              </View>
            </View>
          )}

          {/* Quantity */}
          <View className="flex-row items-center gap-2 mb-6">
            <Ionicons name="cube-outline" size={16} color={Colors.textTertiary} />
            <Text className="text-gray-500 text-sm">{listing.quantity} available</Text>
          </View>

          {/* Description */}
          {listing.description ? (
            <>
              <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 text-base mb-2">
                About this item
              </Text>
              <Text className="text-gray-500 text-base leading-6">{listing.description}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View
        style={{ paddingBottom: insets.bottom + 8 }}
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3"
      >
        {quantity === 0 ? (
          <Button
            label="Add to Cart"
            onPress={handleAdd}
            fullWidth
            size="lg"
            disabled={listing.status !== 'active'}
          />
        ) : (
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <Pressable
                onPress={handleRemove}
                className="w-11 h-11 border border-gray-200 rounded-full items-center justify-center"
              >
                <Ionicons name="remove" size={20} color={Colors.textPrimary} />
              </Pressable>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20 }} className="text-gray-900 w-8 text-center">
                {quantity}
              </Text>
              <Animated.View style={btnAnim}>
                <Pressable
                  onPress={handleAdd}
                  className="w-11 h-11 bg-primary-600 rounded-full items-center justify-center"
                >
                  <Ionicons name="add" size={20} color="white" />
                </Pressable>
              </Animated.View>
            </View>
            <Button
              label={`View Cart · RWF ${(listing.discountedPrice * quantity).toLocaleString()}`}
              onPress={() => router.push('/cart')}
              size="md"
            />
          </View>
        )}
      </View>
    </View>
  );
}
