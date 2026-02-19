/**
 * Order Detail Screen
 * Full order detail with items, status timeline, pickup code, and dispute option.
 */
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { orderService } from '../../services/orders';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import type { OrderStatus } from '../../types';

const statusMap: Record<OrderStatus, { label: string; variant: any; icon: string }> = {
  pending:   { label: 'Pending',   variant: 'warning', icon: 'time-outline'         },
  confirmed: { label: 'Confirmed', variant: 'info',    icon: 'checkmark-outline'    },
  ready:     { label: 'Ready!',    variant: 'success', icon: 'bag-check-outline'    },
  completed: { label: 'Collected', variant: 'neutral', icon: 'checkmark-done-outline'},
  cancelled: { label: 'Cancelled', variant: 'error',   icon: 'close-outline'        },
};

export default function OrderDetailScreen() {
  const { id }    = useLocalSearchParams<{ id: string }>();
  const router    = useRouter();
  const insets    = useSafeAreaInsets();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn:  () => orderService.getById(id),
    enabled:  !!id,
  });

  if (isLoading || !order) {
    return <View className="flex-1 bg-white items-center justify-center">
      <Ionicons name="receipt-outline" size={48} color={Colors.gray[300]} />
    </View>;
  }

  const status = statusMap[order.status];
  const dateStr = new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={Colors.textPrimary} /></Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">Order Details</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Status card */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-400 text-sm">{dateStr}</Text>
            <Badge label={status.label} variant={status.variant} dot />
          </View>
          <Text className="text-gray-400 text-xs">Order #{order._id?.slice(-8).toUpperCase()}</Text>
          <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 mt-1">{order.business?.name}</Text>
        </View>

        {/* Pickup code */}
        {order.status === 'ready' && order.pickupCode && (
          <View className="bg-primary-600 rounded-2xl p-5 mb-4 items-center">
            <Ionicons name="qr-code" size={32} color="white" />
            <Text className="text-primary-200 text-sm mt-2 font-medium">Show this code at pickup</Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 36, letterSpacing: 8 }} className="text-white mt-1">
              {order.pickupCode}
            </Text>
          </View>
        )}

        {/* Items */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 mb-3">Items</Text>
          {order.items?.map((item, i) => (
            <View key={i} className={`flex-row items-center gap-3 ${i < order.items.length - 1 ? 'mb-3' : ''}`}>
              {item.listing?.images?.[0] && (
                <Image source={item.listing.images[0]} style={{ width: 52, height: 52, borderRadius: 10 }} contentFit="cover" />
              )}
              <View className="flex-1">
                <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-gray-800 text-sm" numberOfLines={1}>
                  {item.listing?.name}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">Qty: {item.quantity}</Text>
              </View>
              <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 text-sm">
                RWF {(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
          <View className="border-t border-gray-100 mt-3 pt-3 flex-row justify-between">
            <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-gray-900">Total</Text>
            <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-primary-600 text-base">
              RWF {order.totalAmount?.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {order.status === 'pending' && (
          <Button label="Cancel Order" onPress={() => router.push(`/dispute/${order._id}`)}
            variant="outline" fullWidth />
        )}
        {order.status === 'completed' && (
          <View className="gap-3">
            <Button label="Leave a Review" onPress={() => router.push(`/review/${order._id}`)} fullWidth />
            <Button label="Report an Issue" onPress={() => router.push(`/dispute/${order._id}`)}
              variant="ghost" fullWidth />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
