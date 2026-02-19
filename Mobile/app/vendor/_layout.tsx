import { Stack } from 'expo-router';

export default function VendorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"       />
      <Stack.Screen name="listings"    />
      <Stack.Screen name="add-listing" />
      <Stack.Screen name="orders"      />
      <Stack.Screen name="analytics"   />
      <Stack.Screen name="payouts"     />
      <Stack.Screen name="kyc"         />
    </Stack>
  );
}
