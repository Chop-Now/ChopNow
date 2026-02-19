import React from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../services/notifications';
import { Skeleton } from '../components/ui/SkeletonLoader';
import { Colors } from '../constants/colors';
import type { Notification } from '../types';

function NotifItem({ item, onRead }: { item: Notification; onRead: (id: string) => void }) {
  const iconMap: Record<string, string> = {
    order: 'receipt-outline', promotion: 'pricetag-outline', system: 'information-circle-outline',
  };
  return (
    <Pressable
      onPress={() => !item.read && onRead(item._id)}
      className={`flex-row items-start px-4 py-4 border-b border-gray-50 ${!item.read ? 'bg-primary-50' : 'bg-white'}`}
    >
      <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 mt-0.5 ${!item.read ? 'bg-primary-100' : 'bg-gray-100'}`}>
        <Ionicons name={iconMap[item.type] as any ?? 'notifications-outline'} size={18}
          color={!item.read ? Colors.primary[600] : Colors.textSecondary} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 text-sm flex-1 mr-2">{item.title}</Text>
          {!item.read && <View className="w-2 h-2 bg-primary-600 rounded-full" />}
        </View>
        <Text className="text-gray-500 text-sm mt-0.5 leading-5">{item.message}</Text>
        <Text className="text-gray-400 text-xs mt-1">
          {new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const qc      = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => notificationService.getAll(),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAll = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications: Notification[] = data?.notifications ?? [];
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <View className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </Pressable>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">
              Notifications {unread > 0 ? `(${unread})` : ''}
            </Text>
          </View>
          {unread > 0 && (
            <Pressable onPress={() => markAll.mutate()}>
              <Text className="text-primary-600 text-sm font-medium">Mark all read</Text>
            </Pressable>
          )}
        </View>
      </View>

      {isLoading ? (
        <View className="px-4 pt-4 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} className="flex-row gap-3">
              <Skeleton width={40} height={40} radius={20} />
              <View className="flex-1 gap-2">
                <Skeleton height={14} width="70%" />
                <Skeleton height={12} width="90%" />
              </View>
            </View>
          ))}
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text style={{ fontSize: 56 }}>🔔</Text>
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-gray-900 text-lg mt-4">All caught up!</Text>
          <Text className="text-gray-400 text-sm mt-2">No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n._id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[600]} />}
          renderItem={({ item }) => <NotifItem item={item} onRead={(id) => markRead.mutate(id)} />}
        />
      )}
    </View>
  );
}
