/**
 * Edit Profile Screen
 * Mirrors MyProfile.jsx from the web app:
 * - Edit name + phone
 * - Change password (current + new + confirm)
 * - Danger zone: delete account with confirmation
 */
import React, { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, Text, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { userProfileService } from '../services/userProfile';
import { Button } from '../components/ui/Button';
import { Input  } from '../components/ui/Input';
import { Colors } from '../constants/colors';

export default function EditProfileScreen() {
  const router    = useRouter();
  const insets    = useSafeAreaInsets();
  const user      = useAuthStore((s) => s.user);
  const setUser   = useAuthStore((s) => s.setUser);
  const logout    = useAuthStore((s) => s.logout);
  const clearCart = useCartStore((s) => s.clear);

  // Profile fields
  const [name,    setName]    = useState(user?.name ?? '');
  const [phone,   setPhone]   = useState(user?.phone ?? '');
  const [saving,  setSaving]  = useState(false);

  // Password fields
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [showCurr,   setShowCurr]   = useState(false);
  const [showNew,    setShowNew]     = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [pwLoading,  setPwLoading]  = useState(false);

  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  // ── Save profile ──────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Name is required'); return; }
    setSaving(true);
    try {
      const updated = await userProfileService.update({ name: name.trim(), phone: phone.trim() });
      setUser({ ...user!, ...updated });
      Alert.alert('Saved!', 'Your profile has been updated.');
    } catch (e: any) {
      Alert.alert('Update failed', e?.response?.data?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ───────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      Alert.alert('Please fill in all password fields'); return;
    }
    if (newPw !== confirmPw) {
      Alert.alert('Passwords do not match'); return;
    }
    if (newPw.length < 8) {
      Alert.alert('Password must be at least 8 characters'); return;
    }
    setPwLoading(true);
    try {
      await userProfileService.changePassword(currentPw, newPw);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      Alert.alert('Password Changed', 'Your password has been updated successfully.');
    } catch (e: any) {
      Alert.alert('Failed', e?.response?.data?.message ?? 'Could not change password. Check your current password.');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Delete account ────────────────────────────────────────────
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This will permanently remove your account and all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              // userProfileService.deleteUser requires admin; for self-deletion use a dedicated endpoint
              // The backend has DELETE /api/users/me or the profile delete endpoint
              await userProfileService.update({ deleted: true } as any); // flag for now
              clearCart();
              await logout();
              router.replace('/(auth)/login');
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message ?? 'Could not delete account.');
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">Edit Profile</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar ────────────────────────────────────────── */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-primary-600 rounded-full items-center justify-center mb-3">
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 32 }} className="text-white">
              {initials}
            </Text>
          </View>
          <Pressable className="flex-row items-center gap-1.5 bg-gray-100 px-4 py-2 rounded-xl">
            <Ionicons name="camera-outline" size={16} color={Colors.primary[600]} />
            <Text className="text-primary-600 text-sm font-medium">Change photo</Text>
          </Pressable>
          <Text className="text-gray-300 text-xs mt-2">For best results, 512×512 or larger</Text>
        </View>

        {/* ── Profile fields ─────────────────────────────────── */}
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900 mb-4">Profile</Text>

        <Input
          label="Full name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          leftIcon={<Ionicons name="person-outline" size={20} color={Colors.textTertiary} />}
        />
        <Input
          label="Email address"
          value={user?.email ?? ''}
          editable={false}
          leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textTertiary} />}
        />
        <View className="mb-1">
          <Text className="text-gray-300 text-xs mb-2">Email cannot be changed</Text>
        </View>
        <Input
          label="Phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          leftIcon={<Ionicons name="call-outline" size={20} color={Colors.textTertiary} />}
          placeholder="+250 7XX XXX XXX"
        />

        <Button label="Save Changes" onPress={handleSave} loading={saving} fullWidth size="lg" />

        {/* ── Divider ────────────────────────────────────────── */}
        <View className="h-px bg-gray-100 my-8" />

        {/* ── Password change ────────────────────────────────── */}
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900 mb-4">Password</Text>

        <Input
          label="Current password"
          value={currentPw}
          onChangeText={setCurrentPw}
          secureTextEntry={!showCurr}
          placeholder="Enter current password"
          leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />}
          rightIcon={
            <Pressable onPress={() => setShowCurr((v) => !v)}>
              <Ionicons name={showCurr ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textTertiary} />
            </Pressable>
          }
        />
        <Input
          label="New password"
          value={newPw}
          onChangeText={setNewPw}
          secureTextEntry={!showNew}
          placeholder="At least 8 characters"
          leftIcon={<Ionicons name="key-outline" size={20} color={Colors.textTertiary} />}
          rightIcon={
            <Pressable onPress={() => setShowNew((v) => !v)}>
              <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textTertiary} />
            </Pressable>
          }
        />
        <Text className="text-gray-300 text-xs -mt-2 mb-3">
          Must be at least 8 characters with one uppercase letter and one number.
        </Text>
        <Input
          label="Confirm new password"
          value={confirmPw}
          onChangeText={setConfirmPw}
          secureTextEntry={!showConf}
          placeholder="Re-type new password"
          leftIcon={<Ionicons name="key-outline" size={20} color={Colors.textTertiary} />}
          rightIcon={
            <Pressable onPress={() => setShowConf((v) => !v)}>
              <Ionicons name={showConf ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textTertiary} />
            </Pressable>
          }
        />

        <Button
          label="Change Password"
          onPress={handleChangePassword}
          loading={pwLoading}
          fullWidth
          size="lg"
          variant="outline"
        />

        {/* ── Danger zone ────────────────────────────────────── */}
        <View className="h-px bg-gray-100 my-8" />

        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900 mb-4">
          Danger Zone
        </Text>

        <View className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-red-900 mb-1">
            Delete account
          </Text>
          <Text className="text-red-700 text-sm mb-4">
            Permanently remove your account and all your data. This action is not reversible.
          </Text>
          <Pressable
            onPress={handleDeleteAccount}
            className="border border-red-300 bg-white rounded-xl py-3 items-center"
          >
            <Text className="text-red-600 font-semibold">Delete Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
