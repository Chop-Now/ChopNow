/**
 * Admin Users Screen
 * Search, filter by role, suspend / activate users.
 */
import React, { useState } from 'react';
import {
  Alert, FlatList, Pressable, RefreshControl, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { userProfileService } from '../../services/userProfile';
import { Badge } from '../../components/ui/Badge';
import { Colors } from '../../constants/colors';

const ROLES = ['all', 'consumer', 'business_owner', 'admin'];

export default function AdminUsers() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const qc       = useQueryClient();
  const [search, setSearch] = useState('');
  const [role,   setRole]   = useState('all');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-users', role, search],
    queryFn:  () => userProfileService.getAll({ role: role === 'all' ? undefined : role, search }),
  });

  const users: any[] = (data as any)?.users ?? [];

  const suspendMut = useMutation({
    mutationFn: (id: string) => userProfileService.suspendUser(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
    onError:    (e: any) => Alert.alert('Error', e?.response?.data?.message ?? 'Could not suspend user'),
  });

  const activateMut = useMutation({
    mutationFn: (id: string) => userProfileService.activateUser(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
    onError:    (e: any) => Alert.alert('Error', e?.response?.data?.message ?? 'Could not activate user'),
  });

  const handleSuspend = (user: any) => {
    const isSuspended = user.status === 'suspended' || user.suspended;
    Alert.alert(
      isSuspended ? 'Activate User' : 'Suspend User',
      `${isSuspended ? 'Activate' : 'Suspend'} ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isSuspended ? 'Activate' : 'Suspend',
          style: isSuspended ? 'default' : 'destructive',
          onPress: () => isSuspended ? activateMut.mutate(user._id) : suspendMut.mutate(user._id),
        },
      ]
    );
  };

  const renderUser = ({ item }: { item: any }) => {
    const initials = item.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?';
    const isSuspended = item.status === 'suspended' || item.suspended;
    return (
      <View className="bg-white mx-4 mb-2 rounded-2xl border border-gray-100 p-4 flex-row items-center gap-3">
        <View className="w-11 h-11 bg-primary-600 rounded-full items-center justify-center">
          <Text style={{ fontFamily: 'Inter_700Bold', color: 'white' }}>{initials}</Text>
        </View>
        <View className="flex-1">
          <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900">{item.name}</Text>
          <Text className="text-gray-400 text-xs">{item.email}</Text>
          <View className="flex-row gap-2 mt-1">
            <Badge
              label={item.activeRole ?? item.role ?? 'consumer'}
              variant={item.activeRole === 'admin' ? 'error' : item.activeRole === 'business_owner' ? 'info' : 'neutral'}
            />
            {isSuspended && <Badge label="Suspended" variant="error" />}
          </View>
        </View>
        <Pressable onPress={() => handleSuspend(item)} className="p-2">
          <Ionicons
            name={isSuspended ? 'checkmark-circle-outline' : 'ban-outline'}
            size={22}
            color={isSuspended ? Colors.success : Colors.error}
          />
        </Pressable>
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
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">Users</Text>
        </View>
        {/* Search */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 mb-3">
          <Ionicons name="search-outline" size={18} color={Colors.gray[400]} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or email..."
            className="flex-1 py-2.5 px-2 text-gray-800"
          />
          {search ? <Pressable onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={Colors.gray[400]} /></Pressable> : null}
        </View>
        {/* Role filter */}
        <FlatList
          data={ROLES}
          horizontal showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setRole(item)}
              className={`mr-2 px-3 py-1.5 rounded-full border ${role === item ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-xs font-medium capitalize ${role === item ? 'text-white' : 'text-gray-600'}`}>{item}</Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(i) => i._id}
        renderItem={renderUser}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[600]} />}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20">
              <Ionicons name="people-outline" size={48} color={Colors.gray[300]} />
              <Text className="text-gray-400 mt-3">No users found</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
