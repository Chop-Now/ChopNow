/**
 * Admin Analytics Screen
 * Platform-wide stats: revenue, users growth, order trends, impact.
 */
import React from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService } from '../../services/analytics';
import { Colors } from '../../constants/colors';

function StatBox({ label, value, icon, color, sub }: {
  label: string; value: string | number; icon: string; color: string; sub?: string;
}) {
  return (
    <View style={{ width: '47%' }} className="bg-white rounded-2xl p-4 border border-gray-100 mb-3">
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color }} className="mt-2">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <Text className="text-gray-400 text-xs mt-0.5">{label}</Text>
      {sub ? <Text className="text-green-500 text-xs mt-0.5">{sub}</Text> : null}
    </View>
  );
}

function ProgressBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text className="text-gray-600 text-sm">{label}</Text>
        <Text style={{ fontFamily: 'Inter_600SemiBold', color }} className="text-sm">{value.toLocaleString()}</Text>
      </View>
      <View className="h-2 bg-gray-100 rounded-full">
        <View style={{ width: `${pct}%`, backgroundColor: color }} className="h-2 rounded-full" />
      </View>
    </View>
  );
}

export default function AdminAnalytics() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const { data: platform, refetch, isRefetching } = useQuery({
    queryKey: ['admin-platform-overview'],
    queryFn:  () => analyticsService.getPlatformOverview(),
  });

  const { data: activity } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn:  () => analyticsService.getRecentActivity(),
  });

  const p: any = platform ?? {};
  const a: any = activity ?? {};

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">Platform Analytics</Text>
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[600]} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Revenue */}
        <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-700 mb-3">Revenue</Text>
        <View className="flex-row flex-wrap gap-3 mb-4 justify-between">
          <StatBox label="Total Revenue"    value={`RWF ${(p.totalRevenue ?? 0).toLocaleString()}`}    icon="cash-outline"         color="#16a34a" />
          <StatBox label="This Month"       value={`RWF ${(p.monthRevenue ?? 0).toLocaleString()}`}    icon="trending-up-outline"   color="#3b82f6" />
          <StatBox label="Platform Fees"    value={`RWF ${(p.platformFees ?? 0).toLocaleString()}`}   icon="wallet-outline"        color="#8b5cf6" />
          <StatBox label="Payouts Sent"     value={`RWF ${(p.payoutsSent ?? 0).toLocaleString()}`}    icon="arrow-up-circle-outline" color={Colors.warning} />
        </View>

        {/* Users */}
        <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-700 mb-3">Users</Text>
        <View className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
          <ProgressBar label="Consumers"      value={p.consumers      ?? 0} max={p.totalUsers ?? 1} color={Colors.info}         />
          <ProgressBar label="Business Owners" value={p.businessOwners ?? 0} max={p.totalUsers ?? 1} color={Colors.primary[600]} />
          <ProgressBar label="Admins"          value={p.admins         ?? 1} max={p.totalUsers ?? 1} color={Colors.error}        />
          <View className="border-t border-gray-100 pt-3 mt-1 flex-row justify-between">
            <Text className="text-gray-400 text-sm">Total Users</Text>
            <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-gray-900">
              {(p.totalUsers ?? 0).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Orders */}
        <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-700 mb-3">Orders</Text>
        <View className="flex-row flex-wrap gap-3 mb-4 justify-between">
          <StatBox label="Total Orders"     value={p.totalOrders     ?? 0} icon="receipt-outline"         color={Colors.primary[600]} />
          <StatBox label="Completed"        value={p.completedOrders ?? 0} icon="checkmark-circle-outline" color={Colors.success}     />
          <StatBox label="Cancelled"        value={p.cancelledOrders ?? 0} icon="close-circle-outline"     color={Colors.error}       />
          <StatBox label="Active Listings"  value={p.activeListings  ?? 0} icon="list-outline"             color="#f59e0b"            />
        </View>

        {/* Environmental Impact */}
        <View className="bg-primary-600 rounded-2xl p-5 mb-4">
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-white text-lg mb-1">Platform Impact</Text>
          <Text className="text-primary-200 text-sm mb-4">Total food waste prevented</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 24 }} className="text-white">
                {(p.mealsSaved ?? p.completedOrders ?? 0).toLocaleString()}
              </Text>
              <Text className="text-primary-200 text-xs">Meals Saved</Text>
            </View>
            <View className="items-center">
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 24 }} className="text-white">
                {((p.mealsSaved ?? p.completedOrders ?? 0) * 2.5).toFixed(0)}kg
              </Text>
              <Text className="text-primary-200 text-xs">CO₂ Prevented</Text>
            </View>
            <View className="items-center">
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 24 }} className="text-white">
                {(p.totalVendors ?? 0)}
              </Text>
              <Text className="text-primary-200 text-xs">Active Vendors</Text>
            </View>
          </View>
        </View>

        {/* Recent activity */}
        {(a.recent ?? []).length > 0 && (
          <View className="bg-white rounded-2xl p-4 border border-gray-100">
            <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900 mb-3">Recent Activity</Text>
            {(a.recent as any[]).slice(0, 10).map((item: any, i: number) => (
              <View key={i} className={`flex-row items-center gap-3 ${i < 9 ? 'mb-3' : ''}`}>
                <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                  <Ionicons
                    name={item.type === 'order' ? 'receipt-outline' : item.type === 'user' ? 'person-outline' : 'storefront-outline'}
                    size={16}
                    color={Colors.textSecondary}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 text-sm" numberOfLines={1}>{item.message ?? item.description}</Text>
                  <Text className="text-gray-300 text-xs">{new Date(item.createdAt ?? item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
