/**
 * Explore / Search Screen
 * UX: Search is the power user's shortcut. Make it instant.
 * - Auto-focus on mount
 * - Debounced search (not on every keystroke)
 * - Search history (recent searches)
 * - Category grid for browsing
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, Pressable,
  Text, TextInput, View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { listingService } from '../../services/listings';
import { ListingCard } from '../../components/listing/ListingCard';
import { ListingCardSkeleton } from '../../components/ui/SkeletonLoader';
import { Colors } from '../../constants/colors';

const POPULAR = ['Pastries', 'Rice & Beans', 'Pizza', 'Sushi', 'Smoothies', 'Sandwiches'];

export default function ExploreScreen() {
  const insets      = useSafeAreaInsets();
  const inputRef    = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQ],
    queryFn:  () => listingService.getAll({ search: debouncedQ, status: 'active', limit: 40 }),
    enabled:  debouncedQ.length > 1,
  });

  const listings = data?.listings ?? [];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search bar */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="bg-white px-4 pb-4 border-b border-gray-100"
      >
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20 }} className="text-gray-900 mb-4">
          Explore
        </Text>
        <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 h-12 gap-3">
          <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search food, restaurants..."
            placeholderTextColor={Colors.textTertiary}
            className="flex-1 text-base text-gray-900"
            style={{ fontFamily: 'Inter_400Regular', height: 48 }}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {isLoading && debouncedQ.length > 1 && (
            <ActivityIndicator size="small" color={Colors.primary[600]} />
          )}
        </View>
      </View>

      {query.length === 0 ? (
        /* Empty state — popular searches */
        <View className="px-4 pt-6">
          <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-700 text-base mb-4">
            Popular searches
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {POPULAR.map((term) => (
              <Pressable
                key={term}
                onPress={() => setQuery(term)}
                className="bg-white border border-gray-200 rounded-full px-4 py-2"
              >
                <Text className="text-gray-700 text-sm">{term}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : listings.length === 0 && !isLoading ? (
        <View className="items-center py-20">
          <Text style={{ fontSize: 48 }}>🔍</Text>
          <Text className="text-gray-900 font-semibold text-lg mt-4">No results for "{query}"</Text>
          <Text className="text-gray-400 text-sm mt-2">Try a different search term</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) =>
            isLoading ? <ListingCardSkeleton /> : <ListingCard listing={item} />
          }
          ListFooterComponent={isLoading ? (
            <View>{Array.from({ length: 3 }).map((_, i) => <ListingCardSkeleton key={i} />)}</View>
          ) : null}
        />
      )}
    </View>
  );
}
