/**
 * Vendor Orders Screen
 * Status tabs: All | Pending | Confirmed | Ready | Completed.
 * Tap an order to update status or verify pickup code.
 */
import React, { useState } from 'react';
import {
  Alert, FlatList, Modal, Pressable, RefreshControl, Text,
  TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../../services/orders';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import type { Order, OrderStatus } from '../../types';

const TABS: Array<{ key: string; label: string }> = [
  { key: 'all',       label: 'All'       },
  { key: 'pending',   label: 'Pending'   },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'ready',     label: 'Ready'     },
  { key: 'completed', label: 'Done'      },
];

const STATUS_NEXT: Record<string, { label: string; next: string }> = {
  pending:   { label: 'Confirm Order',  next: 'confirmed' },
  confirmed: { label: 'Mark Ready',     next: 'ready'     },
  ready:     { label: 'Verify Pickup',  next: 'completed' },
};

const statusVariant: Record<OrderStatus, any> = {
  pending:   'warning',
  confirmed: 'info',
  ready:     'success',
  completed: 'neutral',
  cancelled: 'error',
};

export default function VendorOrders() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const qc      = useQueryClient();

  const [activeTab, setActiveTab] = useState('all');
  const [verifyOrder, setVerifyOrder] = useState<Order | null>(null);
  const [codeInput,   setCodeInput]   = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['vendor-orders', activeTab],
    queryFn:  () => orderService.getBusinessOrders(
      activeTab === 'all' ? {} : { status: activeTab }
    ),
    refetchInterval: 30_000, // poll every 30s for new orders
  });

  const orders: Order[] = (data as any)?.orders ?? [];

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-orders'] });
      qc.invalidateQueries({ queryKey: ['business-stats'] });
    },
    onError: (e: any) => Alert.alert('Error', e?.response?.data?.message ?? 'Could not update status'),
  });

  const verifyMut = useMutation({
    mutationFn: ({ id, code }: { id: string; code: string }) =>
      orderService.verifyPickup(id, code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-orders'] });
      setVerifyOrder(null);
      setCodeInput('');
      Alert.alert('Pickup Confirmed!', 'Order marked as completed.');
    },
    onError: (e: any) => Alert.alert('Invalid Code', e?.response?.data?.message ?? 'Please check the code and try again.'),
  });

  const handleAction = (order: Order) => {
    const next = STATUS_NEXT[order.status];
    if (!next) return;
    if (order.status === 'ready') {
      setVerifyOrder(order);
      setCodeInput('');
    } else {
      Alert.alert(next.label, `Update order #${order._id?.slice(-6).toUpperCase()} to "${next.next}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => updateMut.mutate({ id: order._id, status: next.next }) },
      ]);
    }
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const next = STATUS_NEXT[item.status];
    const dateStr = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <View className="bg-white mx-4 mb-3 rounded-2xl border border-gray-100 p-4">
        <View className="flex-row items-start justify-between mb-2">
          <View>
            <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900">
              #{item._id?.slice(-6).toUpperCase()}
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">{dateStr}</Text>
          </View>
          <Badge label={item.status} variant={statusVariant[item.status]} dot />
        </View>

        <Text className="text-gray-600 text-sm" numberOfLines={1}>
          {item.items?.map((i) => `${i.quantity}× ${i.listing?.name}`).join(', ')}
        </Text>
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-primary-600 mt-1">
          RWF {item.totalAmount?.toLocaleString()}
        </Text>

        {next && (
          <Pressable
            onPress={() => handleAction(item)}
            className="mt-3 bg-primary-600 rounded-xl py-2.5 items-center"
          >
            <Text className="text-white font-semibold text-sm">{next.label}</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center gap-3 mb-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">Orders</Text>
        </View>
        {/* Tabs */}
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i.key}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setActiveTab(item.key)}
              className={`mr-2 px-4 py-2 rounded-full border ${activeTab === item.key ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-sm font-medium ${activeTab === item.key ? 'text-white' : 'text-gray-600'}`}>
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(i) => i._id}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[600]} />}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20">
              <Ionicons name="receipt-outline" size={48} color={Colors.gray[300]} />
              <Text className="text-gray-400 mt-3">No orders yet</Text>
            </View>
          ) : null
        }
      />

      {/* Verify Pickup Modal */}
      <Modal visible={!!verifyOrder} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: insets.bottom + 16 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20 }} className="text-gray-900 mb-1">
              Verify Pickup Code
            </Text>
            <Text className="text-gray-400 text-sm mb-5">
              Ask the customer for their 4-digit pickup code.
            </Text>
            <TextInput
              value={codeInput}
              onChangeText={setCodeInput}
              placeholder="Enter code"
              keyboardType="number-pad"
              maxLength={6}
              className="border border-gray-200 rounded-xl px-4 py-3 text-center text-3xl font-bold tracking-widest mb-4 text-gray-900"
            />
            <Button
              label="Confirm Pickup"
              onPress={() => verifyOrder && verifyMut.mutate({ id: verifyOrder._id, code: codeInput })}
              loading={verifyMut.isPending}
              fullWidth
              size="lg"
            />
            <Pressable onPress={() => setVerifyOrder(null)} className="mt-3 items-center py-2">
              <Text className="text-gray-400 text-sm">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
