/**
 * Profile Screen
 * Clean, minimal settings experience.
 * - Avatar with initials fallback
 * - Role badge (Consumer / Business Owner)
 * - Settings grouped logically (account, support, legal)
 * - Logout with confirmation (prevent accidental signout)
 */
import React, { useState } from 'react';
import {
  Alert, Pressable, ScrollView, Text, View
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { Badge } from '../../components/ui/Badge';
import { Colors } from '../../constants/colors';

interface SettingsRowProps {
  icon:     string;
  label:    string;
  onPress?: () => void;
  value?:   string;
  danger?:  boolean;
}

function SettingsRow({ icon, label, onPress, value, danger }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-4 border-b border-gray-50 active:bg-gray-50"
    >
      <View className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${danger ? 'bg-red-50' : 'bg-gray-100'}`}>
        <Ionicons name={icon as any} size={18} color={danger ? Colors.error : Colors.textSecondary} />
      </View>
      <Text className={`flex-1 text-base ${danger ? 'text-red-500' : 'text-gray-800'}`} style={{ fontFamily: 'Inter_400Regular' }}>
        {label}
      </Text>
      {value ? (
        <Text className="text-gray-400 text-sm mr-2">{value}</Text>
      ) : null}
      {!danger && <Ionicons name="chevron-forward" size={16} color={Colors.gray[300]} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const user     = useAuthStore((s) => s.user);
  const logout   = useAuthStore((s) => s.logout);
  const clearCart= useCartStore((s) => s.clear);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          clearCart();
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-4 border-b border-gray-100">
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20 }} className="text-gray-900">
          Profile
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar + user info */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-5 items-center border border-gray-100">
          <View className="w-20 h-20 bg-primary-600 rounded-full items-center justify-center mb-3">
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 28 }} className="text-white">
              {initials}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900 mb-1">
            {user?.name}
          </Text>
          <Text className="text-gray-400 text-sm mb-3">{user?.email}</Text>
          <Badge
            label={user?.activeRole === 'business_owner' ? 'Business Owner' : 'Food Saver'}
            variant={user?.activeRole === 'business_owner' ? 'info' : 'success'}
            dot
          />
        </View>

        {/* Account settings */}
        <View className="bg-white mx-4 mt-4 rounded-2xl overflow-hidden border border-gray-100">
          <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-400 text-xs uppercase px-4 pt-4 pb-2 tracking-wider">
            Account
          </Text>
          <SettingsRow icon="person-outline"        label="Edit Profile"     onPress={() => {}} />
          <SettingsRow icon="notifications-outline" label="Notifications"    onPress={() => router.push('/notifications')} />
          <SettingsRow icon="card-outline"          label="Payment Methods"  onPress={() => {}} />
          <SettingsRow icon="location-outline"      label="Saved Addresses"  onPress={() => {}} />
        </View>

        {/* Business */}
        {user?.roles?.includes('business_owner') && (
          <View className="bg-white mx-4 mt-4 rounded-2xl overflow-hidden border border-gray-100">
            <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-400 text-xs uppercase px-4 pt-4 pb-2 tracking-wider">
              Business
            </Text>
            <SettingsRow icon="storefront-outline"  label="My Business"     onPress={() => {}} />
            <SettingsRow icon="bar-chart-outline"   label="Analytics"        onPress={() => {}} />
          </View>
        )}

        {/* Support */}
        <View className="bg-white mx-4 mt-4 rounded-2xl overflow-hidden border border-gray-100">
          <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-400 text-xs uppercase px-4 pt-4 pb-2 tracking-wider">
            Support
          </Text>
          <SettingsRow icon="help-circle-outline"   label="Help & FAQ"      onPress={() => {}} />
          <SettingsRow icon="chatbubble-outline"    label="Contact Us"       onPress={() => {}} />
          <SettingsRow icon="star-outline"          label="Rate the App"     onPress={() => {}} />
        </View>

        {/* Legal */}
        <View className="bg-white mx-4 mt-4 rounded-2xl overflow-hidden border border-gray-100">
          <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-400 text-xs uppercase px-4 pt-4 pb-2 tracking-wider">
            Legal
          </Text>
          <SettingsRow icon="document-text-outline" label="Terms of Service" onPress={() => {}} />
          <SettingsRow icon="shield-outline"        label="Privacy Policy"   onPress={() => {}} />
          <SettingsRow icon="information-circle-outline" label="App Version" value="1.0.0" />
        </View>

        {/* Logout */}
        <View className="bg-white mx-4 mt-4 mb-6 rounded-2xl overflow-hidden border border-gray-100">
          <SettingsRow icon="log-out-outline" label="Sign Out" onPress={handleLogout} danger />
        </View>
      </ScrollView>
    </View>
  );
}
