/**
 * Add / Edit Listing Screen
 * Handles both create (no id param) and update (id param).
 * Fields mirror backend: name, description, category, originalPrice, discountedPrice,
 * quantity, pickupFrom, pickupUntil, allergens.
 */
import React, { useEffect, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, Text, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { listingService } from '../../services/listings';
import { businessService } from '../../services/business';
import { Button } from '../../components/ui/Button';
import { Input  } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';

const CATEGORIES = [
  'Meals', 'Bakery', 'Produce', 'Dairy', 'Beverages',
  'Snacks', 'Desserts', 'Groceries', 'Other',
];

export default function AddListing() {
  const { id }  = useLocalSearchParams<{ id?: string }>();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const qc      = useQueryClient();
  const isEdit  = !!id;

  const { data: businesses } = useQuery({
    queryKey: ['my-businesses'],
    queryFn:  () => businessService.getMyList(),
  });
  const business = businesses?.[0];

  // Prefill form when editing
  const { data: existing } = useQuery({
    queryKey: ['listing', id],
    queryFn:  () => listingService.getById(id!),
    enabled:  !!id,
  });

  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState(CATEGORIES[0]);
  const [origPrice,   setOrigPrice]   = useState('');
  const [discPrice,   setDiscPrice]   = useState('');
  const [quantity,    setQuantity]    = useState('1');
  const [pickupFrom,  setPickupFrom]  = useState('');
  const [pickupUntil, setPickupUntil] = useState('');
  const [allergens,   setAllergens]   = useState('');

  useEffect(() => {
    if (existing) {
      setName(existing.name ?? '');
      setDescription(existing.description ?? '');
      setCategory(existing.category ?? CATEGORIES[0]);
      setOrigPrice(String(existing.price ?? ''));
      setDiscPrice(String(existing.discountedPrice ?? ''));
      setQuantity(String(existing.quantity ?? 1));
      setPickupFrom((existing as any).pickupWindow?.from ?? '');
      setPickupUntil((existing as any).pickupWindow?.until ?? '');
      setAllergens(((existing as any).allergens ?? []).join(', '));
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: (payload: object) =>
      isEdit
        ? listingService.update(id!, payload)
        : listingService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-listings'] });
      Alert.alert('Success', isEdit ? 'Listing updated!' : 'Listing created!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (e: any) => Alert.alert('Error', e?.response?.data?.message ?? 'Please try again.'),
  });

  const handleSubmit = () => {
    if (!name.trim() || !origPrice || !discPrice || !quantity) {
      Alert.alert('Please fill in all required fields'); return;
    }
    if (!business?._id) {
      Alert.alert('No business found'); return;
    }
    mutation.mutate({
      business: business._id,
      name: name.trim(),
      description: description.trim(),
      category,
      price: parseFloat(origPrice),
      discountedPrice: parseFloat(discPrice),
      quantity: parseInt(quantity),
      pickupWindow: pickupFrom && pickupUntil ? { from: pickupFrom, until: pickupUntil } : undefined,
      allergens: allergens ? allergens.split(',').map((a) => a.trim()).filter(Boolean) : [],
    });
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
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">
            {isEdit ? 'Edit Listing' : 'New Listing'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input label="Name *" value={name} onChangeText={setName} placeholder="e.g. Surplus Bread Box" />
        <Input label="Description" value={description} onChangeText={setDescription}
          placeholder="What's in this bag?" multiline numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top' } as any} />

        {/* Category picker */}
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

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input label="Original Price (RWF) *" value={origPrice} onChangeText={setOrigPrice}
              keyboardType="numeric" placeholder="5000" />
          </View>
          <View className="flex-1">
            <Input label="Sale Price (RWF) *" value={discPrice} onChangeText={setDiscPrice}
              keyboardType="numeric" placeholder="2500" />
          </View>
        </View>

        <Input label="Quantity Available *" value={quantity} onChangeText={setQuantity}
          keyboardType="numeric" placeholder="1" />

        <Text style={{ fontFamily: 'Inter_600SemiBold' }} className="text-gray-700 mb-2 mt-2">
          Pickup Window
        </Text>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input label="From (e.g. 14:00)" value={pickupFrom} onChangeText={setPickupFrom}
              placeholder="14:00" />
          </View>
          <View className="flex-1">
            <Input label="Until (e.g. 18:00)" value={pickupUntil} onChangeText={setPickupUntil}
              placeholder="18:00" />
          </View>
        </View>

        <Input label="Allergens (comma-separated)" value={allergens} onChangeText={setAllergens}
          placeholder="gluten, dairy, nuts" />

        <Button
          label={isEdit ? 'Update Listing' : 'Create Listing'}
          onPress={handleSubmit}
          loading={mutation.isPending}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
