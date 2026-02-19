/**
 * Checkout Screen
 * UX: Reduce friction to zero. One-tap checkout where possible.
 * - Payment method selection
 * - Order summary
 * - Clear total with no hidden fees
 * - Confirmation with pickup instructions
 */
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { orderService } from '../services/orders';
import { useCartStore } from '../stores/cartStore';
import { Button } from '../components/ui/Button';
import { Colors } from '../constants/colors';

const PAYMENT_METHODS = [
  { id: 'cash',    label: 'Cash at Pickup',  icon: 'cash-outline'        },
  { id: 'momo',    label: 'MTN Mobile Money', icon: 'phone-portrait-outline' },
  { id: 'airtel',  label: 'Airtel Money',     icon: 'phone-portrait-outline' },
] as const;

export default function CheckoutScreen() {
  const router      = useRouter();
  const insets      = useSafeAreaInsets();
  const items       = useCartStore((s) => s.items);
  const listings    = useCartStore((s) => s.listings);
  const total       = useCartStore((s) => s.totalAmount());
  const clearCart   = useCartStore((s) => s.clear);

  const [payMethod, setPayMethod] = useState<string>('cash');
  const [loading,   setLoading]   = useState(false);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await orderService.place({ items, paymentMethod: payMethod });
      clearCart();
      Alert.alert(
        '🎉 Order Placed!',
        'Head to the restaurant to pick up your food. Show your pickup code at the counter.',
        [{ text: 'View Orders', onPress: () => router.replace('/(tabs)/orders') }]
      );
    } catch (err: any) {
      Alert.alert('Order Failed', err?.response?.data?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cartEntries = Object.entries(items).filter(([, q]) => q > 0);

  return (
    <View className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">
            Checkout
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Order summary */}
        <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 text-base mb-3">
          Order Summary
        </Text>
        <View className="bg-gray-50 rounded-2xl p-4 mb-5">
          {cartEntries.map(([id, qty]) => {
            const listing = listings[id];
            if (!listing) return null;
            return (
              <View key={id} className="flex-row justify-between mb-2">
                <Text className="text-gray-700 flex-1 mr-2" numberOfLines={1}>
                  {listing.name} ×{qty}
                </Text>
                <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900">
                  RWF {(listing.discountedPrice * qty).toLocaleString()}
                </Text>
              </View>
            );
          })}
          <View className="border-t border-gray-200 mt-2 pt-3 flex-row justify-between">
            <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-gray-900">Total</Text>
            <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-primary-600 text-lg">
              RWF {total.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Payment method */}
        <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 text-base mb-3">
          Payment Method
        </Text>
        <View className="gap-3 mb-6">
          {PAYMENT_METHODS.map((method) => {
            const selected = payMethod === method.id;
            return (
              <Pressable
                key={method.id}
                onPress={() => setPayMethod(method.id)}
                className={`flex-row items-center p-4 rounded-2xl border-2 ${
                  selected ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white'
                }`}
              >
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${selected ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  <Ionicons name={method.icon as any} size={20} color={selected ? Colors.primary[600] : Colors.textSecondary} />
                </View>
                <Text style={{ fontFamily: selected ? 'Inter_600SemiBold' : 'Inter_400Regular' }}
                  className={`flex-1 text-base ${selected ? 'text-primary-700' : 'text-gray-700'}`}>
                  {method.label}
                </Text>
                {selected && <Ionicons name="checkmark-circle" size={22} color={Colors.primary[600]} />}
              </Pressable>
            );
          })}
        </View>

        {/* Pickup note */}
        <View className="bg-amber-50 rounded-xl px-4 py-3 flex-row gap-3 mb-6">
          <Ionicons name="information-circle-outline" size={20} color={Colors.warning} style={{ marginTop: 2 }} />
          <Text className="text-amber-800 text-sm flex-1 leading-5">
            Pick up your order during the listed time window. Show your pickup code to staff.
          </Text>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={{ paddingBottom: insets.bottom + 8 }} className="px-4 pt-3 border-t border-gray-100 bg-white">
        <Button
          label={`Place Order · RWF ${total.toLocaleString()}`}
          onPress={handlePlaceOrder}
          loading={loading}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}
