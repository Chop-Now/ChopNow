/**
 * Admin Payouts Screen
 * All payout requests. Approve or reject with notes.
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
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input  } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';

const TABS = ['pending', 'all'];

const statusVariant: Record<string, any> = {
  pending:   'warning',
  approved:  'info',
  completed: 'success',
  rejected:  'error',
};

export default function AdminPayouts() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const qc       = useQueryClient();
  const [tab,    setTab]    = useState('pending');
  const [modal,  setModal]  = useState<{ type: 'approve' | 'reject'; item: any } | null>(null);
  const [notes,  setNotes]  = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-payouts', tab],
    queryFn:  () => payoutService.getAll({ status: tab === 'all' ? undefined : tab }),
  });

  const payouts: any[] = (data as any)?.payouts ?? [];

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      payoutService.updateStatus(id, status, notes || undefined),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-payouts'] });
      setModal(null); setNotes('');
      Alert.alert(
        vars.status === 'approved' ? 'Payout Approved' : 'Payout Rejected',
        'Vendor has been notified.'
      );
    },
    onError: (e: any) => Alert.alert('Error', e?.response?.data?.message ?? 'Could not update payout'),
  });

  const handleSubmit = () => {
    if (!modal) return;
    if (modal.type === 'reject' && !notes.trim()) {
      Alert.alert('Please provide a rejection reason'); return;
    }
    updateMut.mutate({ id: modal.item._id, status: modal.type === 'approve' ? 'approved' : 'rejected' });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center gap-3 mb-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">Payouts</Text>
        </View>
        <View className="flex-row gap-2">
          {TABS.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`px-4 py-2 rounded-full border capitalize ${tab === t ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-sm font-medium capitalize ${tab === t ? 'text-white' : 'text-gray-600'}`}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={payouts}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[600]} />}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
            <View className="flex-row items-start justify-between mb-2">
              <View>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-primary-600">
                  RWF {item.amount?.toLocaleString()}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">
                  {item.business?.name ?? 'Vendor'} · {item.method?.toUpperCase()}
                </Text>
                <Text className="text-gray-300 text-xs">
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Badge label={item.status} variant={statusVariant[item.status] ?? 'neutral'} dot />
            </View>
            {item.details?.phone && (
              <Text className="text-gray-500 text-sm">📱 {item.details.phone}</Text>
            )}
            {item.notes && (
              <Text className="text-gray-400 text-xs mt-1 italic">"{item.notes}"</Text>
            )}
            {item.status === 'pending' && (
              <View className="flex-row gap-2 mt-3">
                <Pressable
                  onPress={() => { setModal({ type: 'approve', item }); setNotes(''); }}
                  className="flex-1 bg-green-500 rounded-xl py-2.5 items-center"
                >
                  <Text className="text-white font-semibold text-sm">Approve</Text>
                </Pressable>
                <Pressable
                  onPress={() => { setModal({ type: 'reject', item }); setNotes(''); }}
                  className="flex-1 border border-red-300 rounded-xl py-2.5 items-center"
                >
                  <Text className="text-red-500 font-semibold text-sm">Reject</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20">
              <Ionicons name="wallet-outline" size={48} color={Colors.gray[300]} />
              <Text className="text-gray-400 mt-3">
                {tab === 'pending' ? 'No pending payouts' : 'No payouts found'}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Approve / Reject Modal */}
      <Modal visible={!!modal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: insets.bottom + 16 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900 mb-1">
              {modal?.type === 'approve' ? 'Approve Payout' : 'Reject Payout'}
            </Text>
            <Text className="text-gray-400 text-sm mb-1">
              RWF {modal?.item?.amount?.toLocaleString()} · {modal?.item?.business?.name ?? 'Vendor'}
            </Text>
            <Text className="text-gray-300 text-xs mb-4">
              {modal?.item?.method?.toUpperCase()} · {modal?.item?.details?.phone}
            </Text>
            <Input
              label={modal?.type === 'reject' ? 'Rejection Reason *' : 'Notes (optional)'}
              value={notes}
              onChangeText={setNotes}
              placeholder={modal?.type === 'reject' ? 'Explain why...' : 'Any internal notes'}
              multiline numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' } as any}
            />
            <Button
              label={modal?.type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              onPress={handleSubmit}
              loading={updateMut.isPending}
              fullWidth size="lg"
              variant={modal?.type === 'approve' ? 'primary' : 'outline'}
            />
            <Pressable onPress={() => setModal(null)} className="mt-3 items-center py-2">
              <Text className="text-gray-400 text-sm">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
