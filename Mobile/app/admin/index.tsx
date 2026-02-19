/**
 * Admin Dashboard Overview
 * Platform-wide metrics: users, vendors, orders, revenue, disputes.
 * Quick navigation to each admin section.
 */
import React from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService } from '../../services/analytics';
import { Colors } from '../../constants/colors';

interface NavCardProps {
  icon:    string;
  label:   string;
  sub:     string;
  color:   string;
  onPress: () => void;
  badge?:  number;
}
function NavCard({ icon, label, sub, color, onPress, badge }: NavCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 active:opacity-80"
    >
      <View className="relative w-10 h-10 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: color + '20' }}>
        <Ionicons name={icon as any} size={22} color={color} />
        {badge ? (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-white font-bold" style={{ fontSize: 9 }}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-gray-900">{label}</Text>
      <Text className="text-gray-400 text-xs mt-0.5">{sub}</Text>
    </Pressable>
  );
}

export default function AdminDashboard() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const { data: platform, refetch, isRefetching } = useQuery({
    queryKey: ['admin-platform-overview'],
    queryFn:  () => analyticsService.getPlatformOverview(),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn:  () => analyticsService.getAdminStats(),
  });

  const p: any = platform ?? {};
  const s: any = stats ?? {};

  const metrics = [
    { label: 'Total Users',    value: p.totalUsers    ?? s.totalUsers    ?? 0, icon: 'people-outline',      color: Colors.info          },
    { label: 'Total Vendors',  value: p.totalVendors  ?? s.totalVendors  ?? 0, icon: 'storefront-outline',  color: Colors.primary[600]  },
    { label: 'Orders Today',   value: p.ordersToday   ?? s.ordersToday   ?? 0, icon: 'receipt-outline',     color: Colors.success       },
    { label: 'Revenue Today',  value: `RWF ${(p.revenueToday ?? s.revenueToday ?? 0).toLocaleString()}`, icon: 'cash-outline', color: '#16a34a' },
    { label: 'Open Disputes',  value: p.openDisputes  ?? s.openDisputes  ?? 0, icon: 'alert-circle-outline',color: Colors.warning       },
    { label: 'Pending Payouts',value: p.pendingPayouts?? s.pendingPayouts?? 0, icon: 'wallet-outline',      color: Colors.error         },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-400 text-sm">Admin Panel</Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20 }} className="text-gray-900">Dashboard</Text>
          </View>
          <View className="w-10 h-10 bg-red-500 rounded-full items-center justify-center">
            <Ionicons name="shield-checkmark" size={20} color="white" />
          </View>
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[600]} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Metrics grid */}
        <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-700 mb-3">Platform Overview</Text>
        <View className="flex-row flex-wrap gap-3 mb-5">
          {metrics.map((m) => (
            <View key={m.label} style={{ width: '47%' }} className="bg-white rounded-2xl p-4 border border-gray-100">
              <Ionicons name={m.icon as any} size={20} color={m.color} />
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color: m.color }} className="mt-2">
                {typeof m.value === 'number' ? m.value.toLocaleString() : m.value}
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5">{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Navigation grid */}
        <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-700 mb-3">Manage</Text>
        <View className="flex-row gap-3 mb-3">
          <NavCard icon="people-outline"    label="Users"    sub="Manage accounts"   color={Colors.info}         onPress={() => router.push('/admin/users')}    />
          <NavCard icon="storefront-outline" label="Vendors" sub="Approve & review"  color={Colors.primary[600]} onPress={() => router.push('/admin/vendors')}  badge={p.pendingVendors ?? s.pendingVendors ?? 0} />
        </View>
        <View className="flex-row gap-3 mb-3">
          <NavCard icon="receipt-outline"   label="Orders"   sub="All orders"        color={Colors.success}      onPress={() => router.push('/admin/orders')}   />
          <NavCard icon="alert-circle-outline" label="Disputes" sub="Resolve issues" color={Colors.warning}      onPress={() => router.push('/admin/disputes')} badge={p.openDisputes ?? s.openDisputes ?? 0} />
        </View>
        <View className="flex-row gap-3 mb-3">
          <NavCard icon="wallet-outline"    label="Payouts"  sub="Process payments"  color={Colors.error}        onPress={() => router.push('/admin/payouts')}  badge={p.pendingPayouts ?? s.pendingPayouts ?? 0} />
          <NavCard icon="bar-chart-outline" label="Analytics" sub="Platform stats"   color="#8b5cf6"             onPress={() => router.push('/admin/analytics')} />
        </View>
        <View className="flex-row gap-3">
          <NavCard icon="settings-outline"  label="Settings" sub="Platform config"   color={Colors.textSecondary} onPress={() => router.push('/admin/settings')} />
          <View className="flex-1" />
        </View>
      </ScrollView>
    </View>
  );
}
