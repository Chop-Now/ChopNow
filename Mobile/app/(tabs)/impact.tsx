/**
 * My Impact Screen
 * This is ChopNow's emotional differentiator vs Bolt Food / Glovo.
 * They sell convenience. We sell meaning.
 * UX: Make the stats feel BIG. Use large numbers. Connect to real-world equivalents.
 * - CO₂ saved = X trees planted
 * - Meals saved = X families fed for a day
 * - Money saved = show real amount
 */
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { useAuthStore } from '../../stores/authStore';
import { Colors } from '../../constants/colors';
import type { ImpactStats } from '../../types';

interface StatCardProps {
  emoji:    string;
  value:    string;
  label:    string;
  sub:      string;
  color:    string;
  bg:       string;
}

function StatCard({ emoji, value, label, sub, color, bg }: StatCardProps) {
  return (
    <View
      className="rounded-2xl p-5 mb-4"
      style={{ backgroundColor: bg, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12 }}
    >
      <Text style={{ fontSize: 40 }}>{emoji}</Text>
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 36, color, marginTop: 8 }}>{value}</Text>
      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16 }} className="text-gray-800 mt-1">{label}</Text>
      <Text className="text-gray-500 text-sm mt-1">{sub}</Text>
    </View>
  );
}

export default function ImpactScreen() {
  const insets = useSafeAreaInsets();
  const user   = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery<ImpactStats>({
    queryKey: ['impact'],
    queryFn:  () => api.get('/api/users/impact').then(r => r.data),
  });

  const treeEquivalent  = data ? (data.co2Saved / 21).toFixed(1) : '0';
  const mealEquivalent  = data?.mealsSaved ?? 0;

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-4 border-b border-gray-100">
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20 }} className="text-gray-900">
          My Impact
        </Text>
        <Text className="text-gray-400 text-sm mt-0.5">
          Your food rescue contribution
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Hero banner */}
        <View className="bg-primary-600 rounded-2xl p-5 mb-5 flex-row items-center">
          <View className="flex-1">
            <Text className="text-primary-200 text-sm font-medium mb-1">
              Welcome to the movement,
            </Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20 }} className="text-white">
              {user?.name?.split(' ')[0] ?? 'Champion'} 🌍
            </Text>
            <Text className="text-primary-200 text-sm mt-2 leading-5">
              Every order you place prevents good food from going to waste
            </Text>
          </View>
          <Text style={{ fontSize: 52 }}>♻️</Text>
        </View>

        {isLoading ? (
          <View className="gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={140} radius={16} />)}
          </View>
        ) : (
          <>
            <StatCard
              emoji="🍱"
              value={`${data?.mealsSaved ?? 0}`}
              label="Meals rescued"
              sub={`That's ${mealEquivalent} fewer meals wasted`}
              color={Colors.primary[600]}
              bg="#f0fdf4"
            />
            <StatCard
              emoji="🌿"
              value={`${data?.co2Saved?.toFixed(1) ?? '0'} kg`}
              label="CO₂ prevented"
              sub={`Equivalent to planting ${treeEquivalent} trees`}
              color="#15803d"
              bg="#dcfce7"
            />
            <StatCard
              emoji="💰"
              value={`RWF ${(data?.moneySaved ?? 0).toLocaleString()}`}
              label="Money saved"
              sub="Compared to regular prices"
              color="#d97706"
              bg="#fef9c3"
            />
            <StatCard
              emoji="📦"
              value={`${data?.ordersCount ?? 0}`}
              label="Orders placed"
              sub="Every order makes a difference"
              color={Colors.info}
              bg="#eff6ff"
            />

            {/* Motivational footer */}
            <View className="bg-gray-100 rounded-2xl p-4 mt-2 flex-row items-center gap-3">
              <Ionicons name="trophy-outline" size={24} color={Colors.warning} />
              <View className="flex-1">
                <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 text-sm">
                  Keep going!
                </Text>
                <Text className="text-gray-500 text-xs mt-0.5">
                  {(data?.ordersCount ?? 0) < 5
                    ? `${5 - (data?.ordersCount ?? 0)} more orders to reach Food Hero status`
                    : 'You\'re a Food Hero! Share your impact with friends.'}
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}
