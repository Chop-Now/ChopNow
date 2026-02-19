/**
 * Vendor KYC / Business Setup Screen
 * Step 1: Basic business info → Step 2: KYC documents.
 * Also serves as "edit business" when business already exists.
 */
import React, { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { businessService } from '../../services/business';
import { Button } from '../../components/ui/Button';
import { Input  } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';

const CATEGORIES = [
  'Restaurant', 'Bakery', 'Café', 'Supermarket',
  'Hotel', 'Catering', 'Farm', 'Other',
];

export default function VendorKYC() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const qc       = useQueryClient();

  const [step, setStep] = useState<1 | 2>(1);

  // Form state
  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState(CATEGORIES[0]);
  const [address,     setAddress]     = useState('');
  const [phone,       setPhone]       = useState('');
  const [email,       setEmail]       = useState('');

  const { data: businesses } = useQuery({
    queryKey: ['my-businesses'],
    queryFn:  () => businessService.getMyList(),
  });
  const existing = businesses?.[0];

  const createMut = useMutation({
    mutationFn: () => businessService.create({ name, description, category, address, phone, email }),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ['my-businesses'] });
      Alert.alert(
        'Business Registered!',
        'Your business has been registered. Our team will review and approve it within 24 hours.',
        [{ text: 'Done', onPress: () => router.back() }]
      );
    },
    onError: (e: any) => Alert.alert('Error', e?.response?.data?.message ?? 'Please try again.'),
  });

  const updateMut = useMutation({
    mutationFn: () => businessService.update(existing!._id, { name, description, category, address, phone, email }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-businesses'] });
      Alert.alert('Updated!', 'Business details saved.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (e: any) => Alert.alert('Error', e?.response?.data?.message ?? 'Please try again.'),
  });

  const handleStep1 = () => {
    if (!name.trim() || !address.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Please fill in all required fields'); return;
    }
    if (existing) {
      updateMut.mutate();
    } else {
      createMut.mutate();
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

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
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">
            {existing ? 'Edit Business' : 'Register Business'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Status if already registered */}
        {existing && (
          <View className={`mb-5 rounded-2xl p-4 flex-row gap-3 ${
            existing.status === 'approved' ? 'bg-green-50 border border-green-200' :
            existing.status === 'pending'  ? 'bg-amber-50 border border-amber-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <Ionicons
              name={existing.status === 'approved' ? 'checkmark-circle' : 'information-circle-outline'}
              size={22}
              color={existing.status === 'approved' ? Colors.success : Colors.warning}
            />
            <View className="flex-1">
              <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-900">
                Status: {existing.status === 'approved' ? 'Approved ✓' :
                         existing.status === 'pending'  ? 'Pending Review' : existing.status}
              </Text>
              {existing.status === 'pending' && (
                <Text className="text-gray-500 text-sm mt-0.5">
                  Usually reviewed within 24 hours.
                </Text>
              )}
            </View>
          </View>
        )}

        <Input label="Business Name *" value={name} onChangeText={setName}
          placeholder="e.g. Green Café Kigali" />
        <Input label="Description" value={description} onChangeText={setDescription}
          placeholder="Tell customers about your business"
          multiline numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top' } as any} />

        {/* Category */}
        <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-gray-700 mb-2 mt-1">Category *</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              className={`px-3 py-2 rounded-full border ${category === c ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-sm font-medium ${category === c ? 'text-white' : 'text-gray-700'}`}>{c}</Text>
            </Pressable>
          ))}
        </View>

        <Input label="Business Address *" value={address} onChangeText={setAddress}
          placeholder="e.g. KG 7 Ave, Kigali, Rwanda" />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input label="Phone *" value={phone} onChangeText={setPhone}
              keyboardType="phone-pad" placeholder="+250 7XX XXX XXX" />
          </View>
          <View className="flex-1">
            <Input label="Email *" value={email} onChangeText={setEmail}
              keyboardType="email-address" placeholder="info@business.com" />
          </View>
        </View>

        {/* KYC note */}
        <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5">
          <View className="flex-row gap-2 items-start">
            <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
            <View className="flex-1">
              <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-blue-800 text-sm">Document Verification</Text>
              <Text className="text-blue-700 text-xs mt-0.5">
                After registration, our team may request business registration documents and food safety permits. You'll be notified via email.
              </Text>
            </View>
          </View>
        </View>

        <Button
          label={existing ? 'Save Changes' : 'Register Business'}
          onPress={handleStep1}
          loading={isPending}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
