/**
 * Admin Settings Screen
 * Platform configuration: commission rate, maintenance mode, feature flags.
 */
import React, { useEffect, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { settingsService } from '../../services/settings';
import { Button } from '../../components/ui/Button';
import { Input  } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';

export default function AdminSettings() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const qc      = useQueryClient();

  const { data: rawSettings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn:  () => settingsService.getAll(),
  });

  const settings: any = (rawSettings as any)?.settings ?? rawSettings ?? {};

  // Local form state
  const [commission,      setCommission]      = useState('');
  const [maintenance,     setMaintenance]     = useState(false);
  const [maintenanceMsg,  setMaintenanceMsg]  = useState('');
  const [maxListings,     setMaxListings]     = useState('');
  const [minOrderAmount,  setMinOrderAmount]  = useState('');
  const [features,        setFeatures]        = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setCommission(String(settings.platformFeePercent ?? settings.commission ?? 10));
      setMaintenance(settings.maintenanceMode ?? false);
      setMaintenanceMsg(settings.maintenanceMessage ?? '');
      setMaxListings(String(settings.maxListingsPerVendor ?? ''));
      setMinOrderAmount(String(settings.minOrderAmount ?? ''));
      setFeatures(settings.features ?? {});
    }
  }, [rawSettings]);

  const updateMut = useMutation({
    mutationFn: (data: object) => settingsService.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      Alert.alert('Saved!', 'Platform settings updated.');
    },
    onError: (e: any) => Alert.alert('Error', e?.response?.data?.message ?? 'Could not save settings'),
  });

  const handleSave = () => {
    const commPct = parseFloat(commission);
    if (isNaN(commPct) || commPct < 0 || commPct > 100) {
      Alert.alert('Invalid commission rate (0–100%)'); return;
    }
    updateMut.mutate({
      platformFeePercent:   commPct,
      maintenanceMode:      maintenance,
      maintenanceMessage:   maintenanceMsg.trim(),
      maxListingsPerVendor: maxListings ? parseInt(maxListings) : undefined,
      minOrderAmount:       minOrderAmount ? parseFloat(minOrderAmount) : undefined,
      features,
    });
  };

  const toggleFeature = (key: string) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const featureKeys = Object.keys(features);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top + 8 }} className="bg-white px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">Platform Settings</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Financials */}
        <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-500 text-xs uppercase mb-3 tracking-wider">
          Financials
        </Text>
        <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <Input
            label="Platform Commission (%)"
            value={commission}
            onChangeText={setCommission}
            keyboardType="numeric"
            placeholder="e.g. 10"
          />
          <Input
            label="Minimum Order Amount (RWF)"
            value={minOrderAmount}
            onChangeText={setMinOrderAmount}
            keyboardType="numeric"
            placeholder="e.g. 1000"
          />
        </View>

        {/* Limits */}
        <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-500 text-xs uppercase mb-3 tracking-wider">
          Limits
        </Text>
        <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <Input
            label="Max Listings per Vendor"
            value={maxListings}
            onChangeText={setMaxListings}
            keyboardType="numeric"
            placeholder="e.g. 20"
          />
        </View>

        {/* Maintenance Mode */}
        <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-500 text-xs uppercase mb-3 tracking-wider">
          Maintenance
        </Text>
        <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-gray-900">Maintenance Mode</Text>
              <Text className="text-gray-400 text-xs mt-0.5">Show maintenance banner to all users</Text>
            </View>
            <Switch
              value={maintenance}
              onValueChange={setMaintenance}
              trackColor={{ true: Colors.primary[600] }}
            />
          </View>
          {maintenance && (
            <Input
              label="Maintenance Message"
              value={maintenanceMsg}
              onChangeText={setMaintenanceMsg}
              placeholder="We'll be back shortly..."
              multiline numberOfLines={2}
            />
          )}
        </View>

        {/* Feature Flags */}
        {featureKeys.length > 0 && (
          <>
            <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-500 text-xs uppercase mb-3 tracking-wider">
              Feature Flags
            </Text>
            <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
              {featureKeys.map((key, i) => (
                <View
                  key={key}
                  className={`flex-row items-center justify-between px-4 py-4 ${i < featureKeys.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <Text className="text-gray-800 capitalize">{key.replace(/_/g, ' ')}</Text>
                  <Switch
                    value={!!features[key]}
                    onValueChange={() => toggleFeature(key)}
                    trackColor={{ true: Colors.primary[600] }}
                  />
                </View>
              ))}
            </View>
          </>
        )}

        <Button
          label="Save Settings"
          onPress={handleSave}
          loading={updateMut.isPending}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
