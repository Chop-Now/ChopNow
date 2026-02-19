/**
 * Secure storage wrapper using Expo SecureStore.
 * Replaces localStorage from the web app — tokens are stored
 * in the device's secure enclave (Keychain / Keystore).
 */
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  TOKEN:         'chopnow_token',
  REFRESH_TOKEN: 'chopnow_refresh_token',
  USER:          'chopnow_user',
  CART:          'chopnow_cart',
} as const;

const save = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value);
};

const get = async (key: string): Promise<string | null> => {
  return SecureStore.getItemAsync(key);
};

const remove = async (key: string) => {
  await SecureStore.deleteItemAsync(key);
};

export const storage = { save, get, remove, KEYS };
