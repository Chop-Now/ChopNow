/**
 * Cart Screen (Modal)
 * UX: The cart is commitment. Make it feel effortless and trustworthy.
 * - Swipe-to-delete items (standard mobile pattern)
 * - Quantity stepper inline
 * - Order summary sticky at bottom
 * - Empty state with CTA back to Home
 */
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCartStore } from '../stores/cartStore';
import { Button } from '../components/ui/Button';
import { Colors } from '../constants/colors';
import { Image } from 'expo-image';

export default function CartScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const items    = useCartStore((s) => s.items);
  const listings = useCartStore((s) => s.listings);
  const add      = useCartStore((s) => s.add);
  const remove   = useCartStore((s) => s.remove);
  const removeAll= useCartStore((s) => s.removeAll);
  const total    = useCartStore((s) => s.totalAmount());
  const count    = useCartStore((s) => s.totalItems());

  const cartEntries = Object.entries(items).filter(([, qty]) => qty > 0);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">
            My Cart {count > 0 ? `(${count})` : ''}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {cartEntries.length === 0 ? (
        /* Empty cart */
        <View className="flex-1 items-center justify-center px-8">
          <Text style={{ fontSize: 64 }}>🛒</Text>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22 }} className="text-gray-900 mt-4 text-center">
            Your cart is empty
          </Text>
          <Text className="text-gray-400 text-base text-center mt-2 mb-8">
            Discover amazing deals on surplus food near you
          </Text>
          <Button label="Browse Food" onPress={() => router.replace('/(tabs)')} size="lg" />
        </View>
      ) : (
        <>
          <FlatList
            data={cartEntries}
            keyExtractor={([id]) => id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: [listingId, qty] }) => {
              const listing = listings[listingId];
              if (!listing) return null;
              return (
                <View
                  className="flex-row bg-white border border-gray-100 rounded-2xl p-3 gap-3"
                  style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 }}
                >
                  <Image
                    source={listing.images?.[0]}
                    style={{ width: 80, height: 80, borderRadius: 12 }}
                    contentFit="cover"
                  />
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 text-sm mb-0.5" numberOfLines={2}>
                      {listing.name}
                    </Text>
                    <Text className="text-gray-400 text-xs mb-2">{listing.business?.name}</Text>
                    <View className="flex-row items-center justify-between">
                      <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-primary-600 text-base">
                        RWF {(listing.discountedPrice * qty).toLocaleString()}
                      </Text>
                      {/* Stepper */}
                      <View className="flex-row items-center gap-3">
                        <Pressable
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            if (qty === 1) removeAll(listingId);
                            else remove(listingId);
                          }}
                          className="w-8 h-8 border border-gray-200 rounded-full items-center justify-center"
                        >
                          <Ionicons name={qty === 1 ? 'trash-outline' : 'remove'} size={16} color={qty === 1 ? Colors.error : Colors.textPrimary} />
                        </Pressable>
                        <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 text-base w-5 text-center">
                          {qty}
                        </Text>
                        <Pressable
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            add(listingId);
                          }}
                          className="w-8 h-8 bg-primary-600 rounded-full items-center justify-center"
                        >
                          <Ionicons name="add" size={16} color="white" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
          />

          {/* Order summary */}
          <View
            style={{ paddingBottom: insets.bottom + 8 }}
            className="bg-white border-t border-gray-100 px-4 pt-4"
          >
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-500">Subtotal</Text>
              <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900">
                RWF {total.toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-gray-500">Pickup fee</Text>
              <Text className="text-primary-600 font-medium">Free</Text>
            </View>
            <View className="flex-row justify-between mb-5 pt-3 border-t border-gray-100">
              <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-gray-900 text-lg">Total</Text>
              <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-primary-600 text-lg">
                RWF {total.toLocaleString()}
              </Text>
            </View>
            <Button
              label={`Checkout · RWF ${total.toLocaleString()}`}
              onPress={() => router.push('/checkout')}
              fullWidth
              size="lg"
            />
          </View>
        </>
      )}
    </View>
  );
}
