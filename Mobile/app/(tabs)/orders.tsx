/**
 * My Orders Screen
 * - Status filter tabs (All | Processing | Completed | Cancelled)
 * - Tap order card → full order detail screen
 * - Pickup code prominently displayed when ready
 * - Pull-to-refresh
 */
import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../../services/orders';
import { Badge } from '../../components/ui/Badge';
import { ListingCardSkeleton } from '../../components/ui/SkeletonLoader';
import { Colors } from '../../constants/colors';
import type { Order, OrderStatus } from '../../types';

const STATUS_TABS: Array<{ key: string; label: string }> = [
  { key: 'all',       label: 'All'       },
  { key: 'pending',   label: 'Processing' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const statusMap: Record<OrderStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' | 'error' }> = {
  pending:   { label: 'Processing', variant: 'warning' },
  confirmed: { label: 'Confirmed',  variant: 'info'    },
  ready:     { label: 'Ready!',     variant: 'success' },
  completed: { label: 'Collected',  variant: 'neutral' },
  cancelled: { label: 'Cancelled',  variant: 'error'   },
};

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const status  = statusMap[order.status] ?? { label: order.status, variant: 'neutral' };
  const dateStr = new Date(order.createdAt).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 active:opacity-80"
      style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 }}
    >
      {/* Header row */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 text-sm" numberOfLines={1}>
            {order.business?.name}
          </Text>
          <Text className="text-gray-400 text-xs mt-0.5">{dateStr}</Text>
        </View>
        <Badge label={status.label} variant={status.variant} dot />
      </View>

      {/* Items summary */}
      <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>
        {order.items?.map((i) => `${i.listing?.name ?? i.name} ×${i.quantity}`).join(', ')}
      </Text>

      {/* Pickup code highlight */}
      {order.status === 'ready' && order.pickupCode && (
        <View className="bg-primary-50 rounded-xl px-4 py-3 flex-row items-center mb-3">
          <Ionicons name="qr-code-outline" size={20} color={Colors.primary[600]} />
          <View className="ml-3">
            <Text className="text-primary-700 text-xs font-medium">Pickup Code</Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, letterSpacing: 4 }} className="text-primary-600">
              {order.pickupCode}
            </Text>
          </View>
        </View>
      )}

      {/* Footer */}
      <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
        <Text className="text-gray-400 text-sm">
          {order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-gray-900">
            RWF {(order.totalAmount ?? (order as any).pricing?.total ?? 0).toLocaleString()}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.gray[300]} />
        </View>
      </View>
    </Pressable>
  );
}

export default function OrdersScreen() {
  const insets   = useSafeAreaInsets();
  const router   = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-orders', activeTab],
    queryFn:  () => orderService.getMyOrders(),
  });

  const allOrders: Order[] = data?.orders ?? [];

  // Client-side filter — backend returns all, we filter locally for instant tab switching
  const orders = activeTab === 'all'
    ? allOrders
    : allOrders.filter((o) => {
        if (activeTab === 'pending')   return o.status === 'pending' || o.status === 'confirmed' || o.status === 'ready';
        if (activeTab === 'completed') return o.status === 'completed';
        if (activeTab === 'cancelled') return o.status === 'cancelled';
        return true;
      });

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-3 border-b border-gray-100">
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20 }} className="text-gray-900 mb-3">
          My Orders
        </Text>

        {/* Status filter tabs */}
        <View className="flex-row gap-2">
          {STATUS_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`px-3 py-2 rounded-full border ${activeTab === tab.key ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'}`}
            >
              <Text
                style={{ fontSize: 12, fontFamily: 'Inter_500Medium' }}
                className={activeTab === tab.key ? 'text-white' : 'text-gray-600'}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View className="px-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text style={{ fontSize: 56 }}>📋</Text>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20 }} className="text-gray-900 mt-4 text-center">
            {activeTab === 'all' ? 'No orders yet' : `No ${STATUS_TABS.find(t => t.key === activeTab)?.label.toLowerCase()} orders`}
          </Text>
          <Text className="text-gray-400 text-base text-center mt-2">
            {activeTab === 'all'
              ? 'Your food rescue history will appear here'
              : 'Try a different filter'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o._id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[600]} />
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => router.push(`/order/${item._id}`)}
            />
          )}
        />
      )}
    </View>
  );
}
