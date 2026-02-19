/**
 * Cart Store (Zustand)
 * Optimistic UI: updates instantly, syncs to backend in background.
 * Persisted to SecureStore for offline resilience.
 */
import { create } from 'zustand';
import { storage } from '../services/storage';
import api from '../services/api';
import type { CartItems, Listing } from '../types';

interface CartState {
  items: CartItems;
  listings: Record<string, Listing>; // cached listing data for cart display

  // Actions
  hydrate:       () => Promise<void>;
  add:           (listingId: string) => void;
  remove:        (listingId: string) => void;
  removeAll:     (listingId: string) => void;
  update:        (listingId: string, qty: number) => void;
  clear:         () => void;
  cacheListing:  (listing: Listing) => void;
  totalItems:    () => number;
  totalAmount:   () => number;
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

const persist = (items: CartItems) => {
  storage.save(storage.KEYS.CART, JSON.stringify(items));
};

const syncToBackend = (items: CartItems) => {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    api.put('/api/cart', { cart: items }).catch(() => {});
  }, 1200);
};

export const useCartStore = create<CartState>((set, get) => ({
  items:    {},
  listings: {},

  hydrate: async () => {
    const raw = await storage.get(storage.KEYS.CART);
    if (raw) {
      try {
        set({ items: JSON.parse(raw) });
      } catch {}
    }
  },

  add: (listingId) => {
    const items = { ...get().items };
    items[listingId] = (items[listingId] ?? 0) + 1;
    set({ items });
    persist(items);
    syncToBackend(items);
  },

  remove: (listingId) => {
    const items = { ...get().items };
    if (!items[listingId]) return;
    items[listingId] -= 1;
    if (items[listingId] <= 0) delete items[listingId];
    set({ items });
    persist(items);
    syncToBackend(items);
  },

  removeAll: (listingId) => {
    const items = { ...get().items };
    delete items[listingId];
    set({ items });
    persist(items);
    syncToBackend(items);
  },

  update: (listingId, qty) => {
    const items = { ...get().items };
    if (qty <= 0) delete items[listingId];
    else items[listingId] = qty;
    set({ items });
    persist(items);
    syncToBackend(items);
  },

  clear: () => {
    set({ items: {} });
    storage.remove(storage.KEYS.CART);
    api.delete('/api/cart').catch(() => {});
  },

  cacheListing: (listing) => {
    set((s) => ({ listings: { ...s.listings, [listing._id]: listing } }));
  },

  totalItems: () => Object.values(get().items).reduce((s, q) => s + q, 0),

  totalAmount: () => {
    const { items, listings } = get();
    return Object.entries(items).reduce((sum, [id, qty]) => {
      const price = listings[id]?.discountedPrice ?? 0;
      return sum + price * qty;
    }, 0);
  },
}));
