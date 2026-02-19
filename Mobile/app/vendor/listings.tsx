/**
 * Vendor Listings Screen
 * Full CRUD listing management. Toggle active/paused, delete with confirm.
 */
import React, { useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { listingService } from '../../services/listings';
import { businessService } from '../../services/business';
import { Badge } from '../../components/ui/Badge';
import { Colors } from '../../constants/colors';
import type { Listing } from '../../types';

export default function VendorListings() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const qc      = useQueryClient();

  const { data: businesses } = useQuery({
    queryKey: ['my-businesses'],
    queryFn:  () => businessService.getMyList(),
  });
  const business = businesses?.[0];

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['vendor-listings', business?._id],
    queryFn:  () => listingService.getByBusiness(business!._id, { limit: 100 }),
    enabled:  !!business?._id,
  });

  const listings: Listing[] = (data as any)?.listings ?? [];

  const deleteMut = useMutation({
    mutationFn: (id: string) => listingService.remove(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['vendor-listings'] }),
    onError:    (e: any) => Alert.alert('Error', e?.response?.data?.message ?? 'Could not delete'),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      listingService.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-listings'] }),
  });

  const confirmDelete = (item: Listing) => {
    Alert.alert('Delete Listing', `Are you sure you want to delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMut.mutate(item._id) },
    ]);
  };

  const renderItem = ({ item }: { item: Listing }) => {
    const isActive = item.status === 'active';
    return (
      <View className="bg-white mx-4 mb-3 rounded-2xl border border-gray-100 overflow-hidden">
        <View className="flex-row">
          {item.images?.[0] ? (
            <Image
              source={item.images[0]}
              style={{ width: 80, height: 80 }}
              contentFit="cover"
            />
          ) : (
            <View style={{ width: 80, height: 80 }} className="bg-gray-100 items-center justify-center">
              <Ionicons name="fast-food-outline" size={28} color={Colors.gray[300]} />
            </View>
          )}
          <View className="flex-1 p-3">
            <View className="flex-row items-start justify-between">
              <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 flex-1 mr-2" numberOfLines={1}>
                {item.name}
              </Text>
              <Badge
                label={isActive ? 'Active' : 'Paused'}
                variant={isActive ? 'success' : 'warning'}
              />
            </View>
            <Text className="text-primary-600 font-semibold text-sm mt-1">
              RWF {item.discountedPrice?.toLocaleString() ?? item.price?.toLocaleString()}
            </Text>
            <Text className="text-gray-400 text-xs mt-0.5">
              {item.quantity} available · {item.category}
            </Text>
          </View>
        </View>

        {/* Action row */}
        <View className="flex-row border-t border-gray-50">
          <Pressable
            onPress={() => toggleMut.mutate({ id: item._id, status: isActive ? 'paused' : 'active' })}
            className="flex-1 flex-row items-center justify-center py-3 gap-1.5"
          >
            <Ionicons
              name={isActive ? 'pause-circle-outline' : 'play-circle-outline'}
              size={18}
              color={isActive ? Colors.warning : Colors.success}
            />
            <Text style={{ fontSize: 13, color: isActive ? Colors.warning : Colors.success, fontFamily: 'Inter_500Medium' }}>
              {isActive ? 'Pause' : 'Activate'}
            </Text>
          </Pressable>
          <View className="w-px bg-gray-50" />
          <Pressable
            onPress={() => router.push({ pathname: '/vendor/add-listing', params: { id: item._id } })}
            className="flex-1 flex-row items-center justify-center py-3 gap-1.5"
          >
            <Ionicons name="create-outline" size={18} color={Colors.info} />
            <Text style={{ fontSize: 13, color: Colors.info, fontFamily: 'Inter_500Medium' }}>Edit</Text>
          </Pressable>
          <View className="w-px bg-gray-50" />
          <Pressable
            onPress={() => confirmDelete(item)}
            className="flex-1 flex-row items-center justify-center py-3 gap-1.5"
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
            <Text style={{ fontSize: 13, color: Colors.error, fontFamily: 'Inter_500Medium' }}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </Pressable>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">My Listings</Text>
          </View>
          <Pressable
            onPress={() => router.push('/vendor/add-listing')}
            className="bg-primary-600 rounded-xl px-3 py-2 flex-row items-center gap-1.5"
          >
            <Ionicons name="add" size={18} color="white" />
            <Text className="text-white text-sm font-semibold">Add</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(i) => i._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[600]} />}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20">
              <Ionicons name="list-outline" size={48} color={Colors.gray[300]} />
              <Text className="text-gray-400 mt-3 text-base">No listings yet</Text>
              <Pressable
                onPress={() => router.push('/vendor/add-listing')}
                className="mt-4 bg-primary-600 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Add your first listing</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </View>
  );
}
