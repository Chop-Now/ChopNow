import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"     />
      <Stack.Screen name="users"     />
      <Stack.Screen name="vendors"   />
      <Stack.Screen name="orders"    />
      <Stack.Screen name="disputes"  />
      <Stack.Screen name="payouts"   />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="settings"  />
    </Stack>
  );
}
