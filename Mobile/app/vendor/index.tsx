/**
 * Vendor Dashboard Home
 * Key metrics at a glance: revenue, orders, listings, ratings.
 * Quick actions: Add listing, View orders, Request payout.
 */
import React from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { businessService } from '../../services/business';
import { analyticsService } from '../../services/analytics';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../stores/authStore';
import { Colors } from '../../constants/colors';

interface QuickActionProps { icon: string; label: string; onPress: () => void; badge?: number }
function QuickAction({ icon, label, onPress, badge }: QuickActionProps) {
  return (
    <Pressable onPress={onPress} className="flex-1 bg-white rounded-2xl p-4 items-center border border-gray-100">
      <View className="relative">
        <Ionicons name={icon as any} size={28} color={Colors.primary[600]} />
        {badge ? (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
            <Text className="text-white font-bold" style={{ fontSize: 9 }}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text className="text-gray-700 text-xs font-medium mt-2 text-center">{label}</Text>
    </Pressable>
  );
}

export default function VendorDashboard() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const user    = useAuthStore((s) => s.user);

  const { data: businesses, isLoading: bizLoading } = useQuery({
    queryKey: ['my-businesses'],
    queryFn:  () => businessService.getMyList(),
  });

  const business = businesses?.[0];

  const { data: stats, isLoading: statsLoading, refetch, isRefetching } = useQuery({
    queryKey: ['business-stats', business?._id],
    queryFn:  () => business ? businessService.getStats(business._id) : null,
    enabled:  !!business?._id,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['business-analytics'],
    queryFn:  () => analyticsService.getBusinessOverview(),
    enabled:  !!business?._id,
  });

  const pendingOrders = stats?.pendingOrders ?? 0;

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-400 text-sm">Vendor Dashboard</Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20 }} className="text-gray-900">
              {business?.name ?? 'My Business'}
            </Text>
          </View>
          {business && (
            <Badge
              label={business.status === 'approved' ? 'Approved' : business.status === 'pending' ? 'Pending Review' : business.status}
              variant={business.status === 'approved' ? 'success' : business.status === 'pending' ? 'warning' : 'error'}
              dot
            />
          )}
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[600]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* No business yet */}
        {!bizLoading && !business && (
          <View className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <Ionicons name="storefront-outline" size={32} color={Colors.warning} />
            <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-gray-900 text-lg mt-3">Set up your business</Text>
            <Text className="text-gray-500 text-sm mt-1 mb-4">Register your business to start selling surplus food.</Text>
            <Pressable onPress={() => router.push('/vendor/kyc')}
              className="bg-primary-600 rounded-xl py-3 items-center">
              <Text className="text-white font-semibold">Get Started</Text>
            </Pressable>
          </View>
        )}

        {/* Stats grid */}
        {business && (
          <>
            <View className="flex-row gap-3 px-4 mt-4">
              {[
                { label: 'Total Revenue', value: `RWF ${(analytics?.revenue ?? 0).toLocaleString()}`, icon: 'cash-outline', color: '#16a34a' },
                { label: 'This Month',    value: `RWF ${(analytics?.monthRevenue ?? 0).toLocaleString()}`, icon: 'trending-up-outline', color: '#3b82f6' },
              ].map((s) => (
                <View key={s.label} className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
                  <Ionicons name={s.icon as any} size={22} color={s.color} />
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color: s.color }} className="mt-2">{statsLoading ? '…' : s.value}</Text>
                  <Text className="text-gray-400 text-xs mt-0.5">{s.label}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row gap-3 px-4 mt-3">
              {[
                { label: 'Total Orders',   value: stats?.totalOrders ?? 0,   icon: 'receipt-outline',   color: Colors.primary[600] },
                { label: 'Active Listings', value: stats?.activeListings ?? 0, icon: 'list-outline',      color: Colors.info },
                { label: 'Avg Rating',     value: stats?.avgRating ? stats.avgRating.toFixed(1) : 'N/A', icon: 'star-outline', color: Colors.warning },
              ].map((s) => (
                <View key={s.label} className="flex-1 bg-white rounded-2xl p-3 border border-gray-100 items-center">
                  <Ionicons name={s.icon as any} size={20} color={s.color} />
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: s.color }} className="mt-1">
                    {statsLoading ? '…' : s.value}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-0.5 text-center">{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Quick actions */}
            <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-700 px-4 mt-5 mb-3">Quick Actions</Text>
            <View className="flex-row gap-3 px-4">
              <QuickAction icon="add-circle-outline"   label="Add Listing"   onPress={() => router.push('/vendor/add-listing')} />
              <QuickAction icon="receipt-outline"      label="Orders"        onPress={() => router.push('/vendor/orders')} badge={pendingOrders} />
              <QuickAction icon="bar-chart-outline"    label="Analytics"     onPress={() => router.push('/vendor/analytics')} />
              <QuickAction icon="wallet-outline"       label="Payouts"       onPress={() => router.push('/vendor/payouts')} />
            </View>

            {/* KYC warning */}
            {business.status === 'pending' && (
              <View className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex-row gap-3">
                <Ionicons name="information-circle-outline" size={22} color={Colors.warning} />
                <View className="flex-1">
                  <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-amber-800">Verification Pending</Text>
                  <Text className="text-amber-700 text-sm mt-0.5">Your business is under review. You'll be notified once approved.</Text>
                </View>
              </View>
            )}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}
