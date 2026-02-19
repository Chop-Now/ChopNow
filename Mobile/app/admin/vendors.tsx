/**
 * Admin Vendors Screen
 * Tabs: Pending Approval | All Vendors.
 * Approve / Reject with reason, rescind approval.
 */
import React, { useState } from 'react';
import {
  Alert, FlatList, Modal, Pressable, RefreshControl, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { businessService } from '../../services/business';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input  } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';

const TABS = ['pending', 'all'];

const statusVariant: Record<string, any> = {
  pending:  'warning',
  approved: 'success',
  rejected: 'error',
};

export default function AdminVendors() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const qc       = useQueryClient();
  const [tab,    setTab]    = useState('pending');
  const [modal,  setModal]  = useState<{ type: 'reject' | 'rescind'; id: string } | null>(null);
  const [reason, setReason] = useState('');

  const { data: pending, refetch: refetchPending, isRefetching: rp } = useQuery({
    queryKey: ['admin-pending-vendors'],
    queryFn:  () => businessService.getPending(),
    enabled:  tab === 'pending',
  });

  const { data: allData, refetch: refetchAll, isRefetching: ra } = useQuery({
    queryKey: ['admin-all-vendors'],
    queryFn:  () => businessService.getAll(),
    enabled:  tab === 'all',
  });

  const vendors: any[] = tab === 'pending'
    ? ((pending as any)?.businesses ?? pending ?? [])
    : ((allData  as any)?.businesses ?? []);

  const approveMut = useMutation({
    mutationFn: (id: string) => businessService.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pending-vendors'] });
      qc.invalidateQueries({ queryKey: ['admin-all-vendors'] });
      Alert.alert('Approved!', 'Vendor has been notified.');
    },
    onError: (e: any) => Alert.alert('Error', e?.response?.data?.message ?? 'Could not approve'),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => businessService.reject(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pending-vendors'] });
      qc.invalidateQueries({ queryKey: ['admin-all-vendors'] });
      setModal(null); setReason('');
      Alert.alert('Rejected', 'Vendor has been notified.');
    },
    onError: (e: any) => Alert.alert('Error', e?.response?.data?.message ?? 'Could not reject'),
  });

  const rescindMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => businessService.rescind(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-all-vendors'] });
      setModal(null); setReason('');
      Alert.alert('Approval Rescinded', 'Vendor has been notified.');
    },
    onError: (e: any) => Alert.alert('Error', e?.response?.data?.message ?? 'Could not rescind'),
  });

  const handleApprove = (id: string, name: string) => {
    Alert.alert('Approve Vendor', `Approve "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => approveMut.mutate(id) },
    ]);
  };

  const handleRejectSubmit = () => {
    if (!reason.trim()) { Alert.alert('Please provide a reason'); return; }
    if (modal?.type === 'reject') rejectMut.mutate({ id: modal.id, reason: reason.trim() });
    else if (modal?.type === 'rescind') rescindMut.mutate({ id: modal.id, reason: reason.trim() });
  };

  const renderVendor = ({ item }: { item: any }) => (
    <View className="bg-white mx-4 mb-3 rounded-2xl border border-gray-100 p-4">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-gray-900">{item.name}</Text>
          <Text className="text-gray-400 text-xs mt-0.5">{item.category} · {item.address}</Text>
          <Text className="text-gray-400 text-xs">{item.email}</Text>
        </View>
        <Badge label={item.status} variant={statusVariant[item.status] ?? 'neutral'} dot />
      </View>

      {item.status === 'pending' && (
        <View className="flex-row gap-2 mt-2">
          <Pressable
            onPress={() => handleApprove(item._id, item.name)}
            className="flex-1 bg-green-500 rounded-xl py-2.5 items-center"
          >
            <Text className="text-white font-semibold text-sm">Approve</Text>
          </Pressable>
          <Pressable
            onPress={() => { setModal({ type: 'reject', id: item._id }); setReason(''); }}
            className="flex-1 border border-red-300 rounded-xl py-2.5 items-center"
          >
            <Text className="text-red-500 font-semibold text-sm">Reject</Text>
          </Pressable>
        </View>
      )}
      {item.status === 'approved' && (
        <Pressable
          onPress={() => { setModal({ type: 'rescind', id: item._id }); setReason(''); }}
          className="mt-2 border border-orange-300 rounded-xl py-2.5 items-center"
        >
          <Text className="text-orange-500 font-semibold text-sm">Rescind Approval</Text>
        </Pressable>
      )}
    </View>
  );

  const isRefetching = rp || ra;
  const refetch = tab === 'pending' ? refetchPending : refetchAll;

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center gap-3 mb-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">Vendors</Text>
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
        data={vendors}
        keyExtractor={(i) => i._id}
        renderItem={renderVendor}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[600]} />}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="storefront-outline" size={48} color={Colors.gray[300]} />
            <Text className="text-gray-400 mt-3">
              {tab === 'pending' ? 'No pending vendors' : 'No vendors yet'}
            </Text>
          </View>
        }
      />

      {/* Reject / Rescind Modal */}
      <Modal visible={!!modal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: insets.bottom + 16 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900 mb-1">
              {modal?.type === 'reject' ? 'Reject Vendor' : 'Rescind Approval'}
            </Text>
            <Text className="text-gray-400 text-sm mb-4">
              Please provide a reason. The vendor will be notified.
            </Text>
            <Input
              label="Reason *"
              value={reason}
              onChangeText={setReason}
              placeholder="e.g. Incomplete documentation"
              multiline numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' } as any}
            />
            <Button
              label={modal?.type === 'reject' ? 'Reject' : 'Rescind'}
              onPress={handleRejectSubmit}
              loading={rejectMut.isPending || rescindMut.isPending}
              fullWidth size="lg"
              variant="outline"
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
