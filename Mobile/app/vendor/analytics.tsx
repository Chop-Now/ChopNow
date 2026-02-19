/**
 * Vendor Analytics Screen
 * Revenue overview, top listings, order trends.
 */
import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService } from '../../services/analytics';
import { businessService } from '../../services/business';
import { Colors } from '../../constants/colors';

const PERIODS = ['7d', '30d', '90d'];

function StatCard({ label, value, icon, color, sub }: {
  label: string; value: string; icon: string; color: string; sub?: string;
}) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
      <Ionicons name={icon as any} size={22} color={color} />
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color }} className="mt-2">{value}</Text>
      <Text className="text-gray-400 text-xs mt-0.5">{label}</Text>
      {sub ? <Text className="text-gray-300 text-xs mt-0.5">{sub}</Text> : null}
    </View>
  );
}

function BarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View className="flex-row items-end gap-1 h-24">
      {data.map((d, i) => (
        <View key={i} className="flex-1 items-center">
          <View
            style={{
              height: Math.max((d.value / max) * 80, 2),
              backgroundColor: Colors.primary[600],
              borderRadius: 4,
              width: '80%',
              opacity: 0.85,
            }}
          />
          <Text className="text-gray-400 mt-1" style={{ fontSize: 9 }} numberOfLines={1}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function VendorAnalytics() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const [period, setPeriod] = useState('30d');

  const { data: businesses } = useQuery({
    queryKey: ['my-businesses'],
    queryFn:  () => businessService.getMyList(),
  });
  const business = businesses?.[0];

  const { data: analytics, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['business-analytics-detail', business?._id, period],
    queryFn:  () => analyticsService.getBusinessOverview(business!._id),
    enabled:  !!business?._id,
  });

  const { data: stats } = useQuery({
    queryKey: ['business-stats', business?._id],
    queryFn:  () => business ? businessService.getStats(business._id) : null,
    enabled:  !!business?._id,
  });

  const a: any = analytics ?? {};
  const s: any = stats ?? {};

  // Build simple 7-day bar chart from recentOrders if available
  const chartData: Array<{ label: string; value: number }> =
    a.dailyRevenue ?? Array.from({ length: 7 }, (_, i) => ({
      label: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
      value: Math.floor(Math.random() * 0), // placeholder until API provides it
    }));

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">Analytics</Text>
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[600]} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Period selector */}
        <View className="flex-row gap-2 mb-5">
          {PERIODS.map((p) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              className={`px-4 py-2 rounded-full border ${period === p ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-sm font-medium ${period === p ? 'text-white' : 'text-gray-600'}`}>{p}</Text>
            </Pressable>
          ))}
        </View>

        {/* Revenue row */}
        <View className="flex-row gap-3 mb-3">
          <StatCard
            label="Total Revenue"
            value={`RWF ${(a.revenue ?? 0).toLocaleString()}`}
            icon="cash-outline"
            color="#16a34a"
          />
          <StatCard
            label="This Month"
            value={`RWF ${(a.monthRevenue ?? 0).toLocaleString()}`}
            icon="trending-up-outline"
            color="#3b82f6"
          />
        </View>

        {/* Order stats row */}
        <View className="flex-row gap-3 mb-5">
          <StatCard
            label="Total Orders"
            value={String(s.totalOrders ?? 0)}
            icon="receipt-outline"
            color={Colors.primary[600]}
          />
          <StatCard
            label="Completed"
            value={String(s.completedOrders ?? 0)}
            icon="checkmark-circle-outline"
            color={Colors.success}
          />
          <StatCard
            label="Avg Rating"
            value={s.avgRating ? s.avgRating.toFixed(1) : 'N/A'}
            icon="star-outline"
            color={Colors.warmYellow}
          />
        </View>

        {/* Revenue chart */}
        {chartData.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 mb-4">Revenue Trend</Text>
            <BarChart data={chartData} />
          </View>
        )}

        {/* Top listings */}
        {(a.topListings ?? []).length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 mb-3">Top Listings</Text>
            {(a.topListings as any[]).slice(0, 5).map((item: any, i: number) => (
              <View key={i} className={`flex-row items-center justify-between ${i < 4 ? 'mb-3' : ''}`}>
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="w-7 h-7 bg-primary-50 rounded-full items-center justify-center">
                    <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: Colors.primary[600] }}>
                      #{i + 1}
                    </Text>
                  </View>
                  <Text className="text-gray-800 text-sm flex-1" numberOfLines={1}>{item.name ?? item.listing?.name}</Text>
                </View>
                <Text style={{ fontFamily: 'Inter_600SemiBold', color: Colors.primary[600] }} className="text-sm">
                  {item.count ?? item.orders} orders
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Impact summary */}
        <View className="bg-primary-600 rounded-2xl p-5">
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-white text-lg mb-1">Your Impact</Text>
          <Text className="text-primary-200 text-sm mb-4">You're making a real difference!</Text>
          <View className="flex-row gap-4">
            <View className="flex-1 items-center">
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22 }} className="text-white">
                {s.totalOrders ?? 0}
              </Text>
              <Text className="text-primary-200 text-xs text-center">Meals Saved</Text>
            </View>
            <View className="flex-1 items-center">
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22 }} className="text-white">
                {((s.totalOrders ?? 0) * 2.5).toFixed(0)}kg
              </Text>
              <Text className="text-primary-200 text-xs text-center">CO₂ Prevented</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
