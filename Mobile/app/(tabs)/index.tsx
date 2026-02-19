/**
 * Home Screen
 * UX principles applied:
 * - Hero greeting personalised with user name (emotional connection)
 * - Impact stats above fold (mission reinforcement)
 * - Category horizontal scroll (progressive disclosure)
 * - Featured listings (social proof via discount %)
 * - Pull to refresh
 * - Skeleton loading (not spinners — faster perceived performance)
 * - Search bar prominent at top (mobile users search constantly)
 */
import React, { useCallback, useState } from 'react';
import {
  FlatList, Pressable, RefreshControl,
  ScrollView, Text, TextInput, View
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { listingService } from '../../services/listings';
import { ListingCard } from '../../components/listing/ListingCard';
import { ListingCardSkeleton } from '../../components/ui/SkeletonLoader';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { Colors } from '../../constants/colors';
import type { FoodCategory } from '../../types';

const CATEGORIES: { id: FoodCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all',       label: 'All',       emoji: '🍽️' },
  { id: 'meals',     label: 'Meals',     emoji: '🍱' },
  { id: 'bakery',    label: 'Bakery',    emoji: '🥐' },
  { id: 'produce',   label: 'Produce',   emoji: '🥦' },
  { id: 'beverages', label: 'Drinks',    emoji: '☕' },
  { id: 'dairy',     label: 'Dairy',     emoji: '🧀' },
  { id: 'snacks',    label: 'Snacks',    emoji: '🍿' },
];

export default function HomeScreen() {
  const router      = useRouter();
  const insets      = useSafeAreaInsets();
  const qc          = useQueryClient();
  const user        = useAuthStore((s) => s.user);
  const cartCount   = useCartStore((s) => s.totalItems());

  const [category, setCategory] = useState<FoodCategory | 'all'>('all');
  const [search,   setSearch]   = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['listings', category],
    queryFn:  () => listingService.getAll({
      category: category === 'all' ? undefined : category,
      status: 'active',
      limit: 30,
    }),
  });

  const listings = data?.listings ?? [];
  const filtered = search.trim()
    ? listings.filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.business?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : listings;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Fixed top bar */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="bg-white px-4 pb-4 border-b border-gray-100"
        // shadow
      >
        {/* Greeting + Cart */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-gray-400 text-sm">{greeting()},</Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20 }} className="text-gray-900">
              {user?.name?.split(' ')[0] ?? 'Friend'} 👋
            </Text>
          </View>
          {/* Cart FAB */}
          <Pressable
            onPress={() => router.push('/cart')}
            className="relative w-11 h-11 bg-primary-50 rounded-full items-center justify-center"
          >
            <Ionicons name="bag-outline" size={22} color={Colors.primary[600]} />
            {cartCount > 0 && (
              <View className="absolute top-0 right-0 bg-primary-600 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white font-bold" style={{ fontSize: 10 }}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Search bar */}
        <Pressable
          onPress={() => router.push('/explore')}
          className="flex-row items-center bg-gray-100 rounded-2xl px-4 h-12 gap-3"
        >
          <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
          <Text className="text-gray-400 text-base flex-1">Search food, restaurants...</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary[600]}
            colors={[Colors.primary[600]]}
          />
        }
      >
        {/* Impact teaser */}
        <Pressable
          onPress={() => router.push('/(tabs)/impact')}
          className="mx-4 mt-4 bg-primary-600 rounded-2xl p-4 flex-row items-center"
        >
          <View className="flex-1">
            <Text className="text-white font-semibold text-sm mb-0.5">Your Food Rescue Impact</Text>
            <Text className="text-primary-200 text-xs">See how much CO₂ you've saved →</Text>
          </View>
          <Text style={{ fontSize: 32 }}>🌍</Text>
        </Pressable>

        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-5"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                className={`flex-row items-center px-4 py-2.5 rounded-full border ${
                  active
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text style={{ fontSize: 14 }}>{cat.emoji}</Text>
                <Text className={`ml-2 text-sm font-medium ${active ? 'text-white' : 'text-gray-700'}`}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Section header */}
        <View className="flex-row items-center justify-between px-4 mt-6 mb-3">
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">
            {category === 'all' ? 'Available now' : `${CATEGORIES.find(c => c.id === category)?.label}`}
          </Text>
          <Text className="text-gray-400 text-sm">{filtered.length} items</Text>
        </View>

        {/* Listings */}
        <View className="px-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <View className="items-center py-16">
              <Text style={{ fontSize: 48 }}>🍽️</Text>
              <Text className="text-gray-900 font-semibold text-lg mt-4">Nothing here yet</Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                Check back soon — restaurants add new items daily
              </Text>
            </View>
          ) : (
            filtered.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}
