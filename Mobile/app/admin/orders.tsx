/**
 * Admin Orders Screen
 * All orders across all businesses. Search, filter by status.
 */
import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../../services/orders';
import { Badge } from '../../components/ui/Badge';
import { Colors } from '../../constants/colors';
import type { OrderStatus } from '../../types';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'ready', 'completed', 'cancelled'];

const statusVariant: Record<OrderStatus, any> = {
  pending:   'warning',
  confirmed: 'info',
  ready:     'success',
  completed: 'neutral',
  cancelled: 'error',
};

export default function AdminOrders() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-orders', status, page],
    queryFn:  () => orderService.getAdminOrders({
      status: status === 'all' ? undefined : status,
      page,
    }),
  });

  const orders: any[] = (data as any)?.orders ?? [];

  const filtered = search
    ? orders.filter((o) =>
        o._id?.includes(search) ||
        o.business?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center gap-3 mb-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">All Orders</Text>
          <Text className="text-gray-400 text-sm ml-auto">
            {(data as any)?.total ?? 0} total
          </Text>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 mb-3">
          <Ionicons name="search-outline" size={18} color={Colors.gray[400]} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by order ID or vendor..."
            className="flex-1 py-2.5 px-2 text-gray-800"
          />
        </View>

        {/* Status tabs */}
        <FlatList
          data={STATUS_TABS}
          horizontal showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => { setStatus(item); setPage(1); }}
              className={`mr-2 px-3 py-1.5 rounded-full border ${status === item ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-xs font-medium capitalize ${status === item ? 'text-white' : 'text-gray-600'}`}>{item}</Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[600]} />}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
            <View className="flex-row items-start justify-between mb-2">
              <View>
                <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900">
                  #{item._id?.slice(-8).toUpperCase()}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">{item.business?.name}</Text>
                <Text className="text-gray-300 text-xs">
                  {new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Badge label={item.status} variant={statusVariant[item.status as OrderStatus] ?? 'neutral'} dot />
            </View>
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-gray-500 text-sm" numberOfLines={1}>
                {item.items?.length ?? 0} item{item.items?.length !== 1 ? 's' : ''}
              </Text>
              <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-primary-600">
                RWF {item.totalAmount?.toLocaleString()}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20">
              <Ionicons name="receipt-outline" size={48} color={Colors.gray[300]} />
              <Text className="text-gray-400 mt-3">No orders found</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          (data as any)?.pages > page ? (
            <Pressable
              onPress={() => setPage((p) => p + 1)}
              className="mx-4 py-3 border border-gray-200 rounded-xl items-center mb-4"
            >
              <Text className="text-primary-600 font-medium">Load more</Text>
            </Pressable>
          ) : null
        }
      />
    </View>
  );
}
