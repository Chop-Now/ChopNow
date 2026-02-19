import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { favoriteService } from '../services/favorites';
import { ListingCard } from '../components/listing/ListingCard';
import { ListingCardSkeleton } from '../components/ui/SkeletonLoader';
import { Colors } from '../constants/colors';

export default function FavoritesScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [tab, setTab] = useState<'listing' | 'business'>('listing');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['favorites', tab],
    queryFn:  () => favoriteService.getAll(tab),
  });

  const items = data?.favorites ?? [];

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-0 border-b border-gray-100">
        <View className="flex-row items-center gap-3 pb-4">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">Favourites</Text>
        </View>
        {/* Tabs */}
        <View className="flex-row">
          {(['listing', 'business'] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)}
              className={`flex-1 py-3 border-b-2 items-center ${tab === t ? 'border-primary-600' : 'border-transparent'}`}>
              <Text className={`text-sm font-medium ${tab === t ? 'text-primary-600' : 'text-gray-500'}`}>
                {t === 'listing' ? 'Food Items' : 'Restaurants'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View className="px-4 pt-4">{Array.from({ length: 3 }).map((_, i) => <ListingCardSkeleton key={i} />)}</View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text style={{ fontSize: 56 }}>❤️</Text>
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-gray-900 text-lg mt-4 text-center">No favourites yet</Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">Tap the heart on any listing to save it here</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[600]} />}
          renderItem={({ item }: any) => <ListingCard listing={item.reference ?? item} />}
        />
      )}
    </View>
  );
}
