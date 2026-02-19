/**
 * Vendor Payouts Screen
 * Request a payout (with available balance), payout history with status.
 */
import React, { useState } from 'react';
import {
  Alert, FlatList, Modal, Pressable, RefreshControl, Text, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { payoutService } from '../../services/payouts';
import { analyticsService } from '../../services/analytics';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input  } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';

const METHODS = [
  { key: 'mtn_momo',   label: 'MTN MoMo',    icon: 'phone-portrait-outline' },
  { key: 'airtel',     label: 'Airtel Money', icon: 'phone-portrait-outline' },
  { key: 'bank',       label: 'Bank Transfer', icon: 'business-outline'     },
];

const payoutVariant: Record<string, any> = {
  pending:   'warning',
  approved:  'info',
  completed: 'success',
  rejected:  'error',
};

export default function VendorPayouts() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const qc       = useQueryClient();
  const [showModal, setShowModal]   = useState(false);
  const [amount,    setAmount]      = useState('');
  const [method,    setMethod]      = useState(METHODS[0].key);
  const [phone,     setPhone]       = useState('');

  const { data: overview } = useQuery({
    queryKey: ['business-analytics'],
    queryFn:  () => analyticsService.getBusinessOverview(),
  });

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-payouts'],
    queryFn:  () => payoutService.getMyOwn(),
  });

  const payouts: any[] = (data as any)?.payouts ?? (data as any)?.data ?? [];
  const available: number = (overview as any)?.availableBalance ?? 0;

  const requestMut = useMutation({
    mutationFn: () => payoutService.request(
      parseFloat(amount),
      method,
      { phone: phone.trim() }
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-payouts'] });
      setShowModal(false);
      setAmount('');
      setPhone('');
      Alert.alert('Request Submitted', 'Your payout request is being processed. Usually 1–3 business days.');
    },
    onError: (e: any) => Alert.alert('Error', e?.response?.data?.message ?? 'Please try again.'),
  });

  const handleRequest = () => {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) { Alert.alert('Enter a valid amount'); return; }
    if (!phone.trim()) { Alert.alert('Enter your mobile number'); return; }
    requestMut.mutate();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">Payouts</Text>
        </View>
      </View>

      <FlatList
        data={payouts}
        keyExtractor={(i) => i._id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[600]} />}
        ListHeaderComponent={
          <>
            {/* Balance card */}
            <View className="mx-4 mt-4 bg-primary-600 rounded-2xl p-5">
              <Text className="text-primary-200 text-sm">Available Balance</Text>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 32 }} className="text-white mt-1">
                RWF {available.toLocaleString()}
              </Text>
              <Pressable
                onPress={() => setShowModal(true)}
                className="mt-4 bg-white rounded-xl py-3 items-center"
              >
                <Text style={{ color: Colors.primary[600], fontFamily: 'Inter_700Bold' }}>Request Payout</Text>
              </Pressable>
            </View>

            {/* History header */}
            <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-700 px-4 mt-6 mb-3">
              Payout History
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View className="bg-white mx-4 mb-3 rounded-2xl border border-gray-100 p-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-gray-900">
                  RWF {item.amount?.toLocaleString()}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">
                  {item.method?.toUpperCase()} · {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Badge label={item.status} variant={payoutVariant[item.status] ?? 'neutral'} dot />
            </View>
            {item.notes && (
              <Text className="text-gray-400 text-xs mt-2 italic">"{item.notes}"</Text>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 48 }}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-16">
              <Ionicons name="wallet-outline" size={48} color={Colors.gray[300]} />
              <Text className="text-gray-400 mt-3">No payouts yet</Text>
            </View>
          ) : null
        }
      />

      {/* Request Payout Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: insets.bottom + 16 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20 }} className="text-gray-900 mb-5">
              Request Payout
            </Text>

            <Input
              label="Amount (RWF)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="e.g. 50000"
            />

            <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-gray-700 mb-2">Payment Method</Text>
            <View className="flex-row gap-2 mb-4">
              {METHODS.map((m) => (
                <Pressable
                  key={m.key}
                  onPress={() => setMethod(m.key)}
                  className={`flex-1 border rounded-xl py-3 items-center ${method === m.key ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white'}`}
                >
                  <Ionicons name={m.icon as any} size={18} color={method === m.key ? Colors.primary[600] : Colors.gray[400]} />
                  <Text style={{ fontSize: 11, marginTop: 4, color: method === m.key ? Colors.primary[600] : Colors.textSecondary, fontFamily: 'Inter_500Medium' }}>
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Input
              label="Mobile Number / Account"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+250 7XX XXX XXX"
            />

            <Button label="Submit Request" onPress={handleRequest} loading={requestMut.isPending} fullWidth size="lg" />
            <Pressable onPress={() => setShowModal(false)} className="mt-3 items-center py-2">
              <Text className="text-gray-400 text-sm">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
