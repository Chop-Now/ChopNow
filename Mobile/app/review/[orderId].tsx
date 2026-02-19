import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { reviewService } from '../../services/reviews';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orders';
import { Button } from '../../components/ui/Button';
import { Input  } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';

export default function ReviewScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router      = useRouter();
  const insets      = useSafeAreaInsets();

  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn:  () => orderService.getById(orderId),
    enabled:  !!orderId,
  });

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Please select a rating'); return; }
    if (!comment.trim()) { Alert.alert('Please add a comment'); return; }
    setLoading(true);
    try {
      await reviewService.create({
        businessId: order?.business?._id ?? '',
        orderId,
        rating,
        comment: comment.trim(),
      });
      Alert.alert('Thank you!', 'Your review helps the community.', [
        { text: 'Done', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      Alert.alert('Failed', e?.response?.data?.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={Colors.textPrimary} /></Pressable>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18 }} className="text-gray-900">Leave a Review</Text>
        </View>
      </View>
      <View className="flex-1 px-6 pt-8">
        <Text className="text-gray-500 text-base text-center mb-2">How was your experience at</Text>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20 }} className="text-gray-900 text-center mb-8">
          {order?.business?.name ?? '…'}
        </Text>

        {/* Star rating */}
        <View className="flex-row justify-center gap-3 mb-8">
          {[1,2,3,4,5].map((star) => (
            <Pressable key={star} onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setRating(star);
            }}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? Colors.warmYellow : Colors.gray[300]}
              />
            </Pressable>
          ))}
        </View>

        <Input label="Your review" value={comment} onChangeText={setComment}
          placeholder="Tell others about your experience..."
          multiline numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top' } as any} />

        <Button label="Submit Review" onPress={handleSubmit} loading={loading} fullWidth size="lg" />
      </View>
    </KeyboardAvoidingView>
  );
}
