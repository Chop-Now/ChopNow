/**
 * Admin Disputes Screen
 * All disputes. Filter by status. Resolve with outcome.
 */
import React, { useState } from 'react';
import {
  Alert, FlatList, Modal, Pressable, RefreshControl, Text, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { disputeService } from '../../services/disputes';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input  } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';

const STATUS_TABS = ['all', 'open', 'under_review', 'resolved', 'closed'];

const statusVariant: Record<string, any> = {
  open:         'error',
  under_review: 'warning',
  resolved:     'success',
  closed:       'neutral',
};

const OUTCOMES = [
  { key: 'refund_customer',  label: 'Refund Customer'  },
  { key: 'compensate',       label: 'Compensate'       },
  { key: 'no_action',        label: 'No Action Needed' },
  { key: 'vendor_penalised', label: 'Vendor Penalised' },
];

export default function AdminDisputes() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const qc       = useQueryClient();
  const [tab,     setTab]     = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [resolution, setResolution] = useState('');
  const [outcome,    setOutcome]    = useState(OUTCOMES[0].key);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-disputes', tab],
    queryFn:  () => disputeService.getAll({ status: tab === 'all' ? undefined : tab }),
  });

  const disputes: any[] = (data as any)?.disputes ?? [];

  const resolveMut = useMutation({
    mutationFn: () => disputeService.resolve(selected._id, resolution, outcome),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-disputes'] });
      setSelected(null); setResolution(''); setOutcome(OUTCOMES[0].key);
      Alert.alert('Resolved', 'Dispute has been resolved and all parties notified.');
    },
    onError: (e: any) => Alert.alert('Error', e?.response?.data?.message ?? 'Could not resolve'),
  });

  const handleResolve = () => {
    if (!resolution.trim()) { Alert.alert('Please provide a resolution note'); return; }
    resolveMut.mutate();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center gap-3 mb-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">Disputes</Text>
        </View>
        <FlatList
          data={STATUS_TABS}
          horizontal showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setTab(item)}
              className={`mr-2 px-3 py-1.5 rounded-full border ${tab === item ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-xs font-medium ${tab === item ? 'text-white' : 'text-gray-600'}`}>
                {item.replace('_', ' ')}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={disputes}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[600]} />}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1 mr-3">
                <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">
                  {item.type} · Order #{item.order?._id?.slice(-6).toUpperCase() ?? item.orderId?.slice(-6).toUpperCase()}
                </Text>
                <Text className="text-gray-300 text-xs mt-0.5">
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Badge label={item.status?.replace('_', ' ')} variant={statusVariant[item.status] ?? 'neutral'} dot />
            </View>
            <Text className="text-gray-500 text-sm" numberOfLines={2}>{item.description}</Text>

            {(item.status === 'open' || item.status === 'under_review') && (
              <Pressable
                onPress={() => { setSelected(item); setResolution(''); setOutcome(OUTCOMES[0].key); }}
                className="mt-3 bg-primary-600 rounded-xl py-2.5 items-center"
              >
                <Text className="text-white font-semibold text-sm">Resolve Dispute</Text>
              </Pressable>
            )}
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20">
              <Ionicons name="shield-checkmark-outline" size={48} color={Colors.gray[300]} />
              <Text className="text-gray-400 mt-3">No disputes found</Text>
            </View>
          ) : null
        }
      />

      {/* Resolve Modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: insets.bottom + 16 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900 mb-1">
              Resolve Dispute
            </Text>
            <Text className="text-gray-400 text-sm mb-4" numberOfLines={2}>{selected?.title}</Text>

            <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-gray-700 mb-2">Outcome</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {OUTCOMES.map((o) => (
                <Pressable
                  key={o.key}
                  onPress={() => setOutcome(o.key)}
                  className={`px-3 py-2 rounded-full border ${outcome === o.key ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`text-xs font-medium ${outcome === o.key ? 'text-white' : 'text-gray-700'}`}>{o.label}</Text>
                </Pressable>
              ))}
            </View>

            <Input
              label="Resolution Note *"
              value={resolution}
              onChangeText={setResolution}
              placeholder="Explain the resolution to both parties..."
              multiline numberOfLines={4}
              style={{ height: 90, textAlignVertical: 'top' } as any}
            />
            <Button label="Submit Resolution" onPress={handleResolve} loading={resolveMut.isPending} fullWidth size="lg" />
            <Pressable onPress={() => setSelected(null)} className="mt-3 items-center py-2">
              <Text className="text-gray-400 text-sm">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
