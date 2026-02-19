/**
 * Auth Store (Zustand)
 * Manages authentication state across the entire app.
 * Uses SecureStore for persistence.
 */
import { create } from 'zustand';
import { storage } from '../services/storage';
import { authService } from '../services/auth';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: UserRole | null;

  // Actions
  initialize:   () => Promise<void>;
  login:        (email: string, password: string) => Promise<void>;
  register:     (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout:       () => Promise<void>;
  setUser:      (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:            null,
  isAuthenticated: false,
  isLoading:       true,
  activeRole:      null,

  initialize: async () => {
    try {
      const token      = await storage.get(storage.KEYS.TOKEN);
      const storedUser = await storage.get(storage.KEYS.USER);

      if (!token || !storedUser) {
        set({ isLoading: false });
        return;
      }

      const user: User = JSON.parse(storedUser);
      set({
        user,
        isAuthenticated: true,
        activeRole: user.activeRole,
        isLoading: false,
      });

      // Silently refresh profile in background
      authService.getProfile().then((fresh) => {
        const updated = { ...user, ...fresh };
        storage.save(storage.KEYS.USER, JSON.stringify(updated));
        set({ user: updated, activeRole: updated.activeRole });
      }).catch(() => {});

    } catch {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const data = await authService.login({ email, password });
    const { token, refreshToken, ...userData } = data as any;

    await storage.save(storage.KEYS.TOKEN, token);
    if (refreshToken) await storage.save(storage.KEYS.REFRESH_TOKEN, refreshToken);
    await storage.save(storage.KEYS.USER, JSON.stringify(userData));

    set({
      user:            userData as User,
      isAuthenticated: true,
      activeRole:      (userData as User).activeRole,
    });
  },

  register: async (name, email, password, phone) => {
    const data = await authService.register({ name, email, password, phone });
    const { token, refreshToken, message, ...userData } = data as any;

    await storage.save(storage.KEYS.TOKEN, token);
    if (refreshToken) await storage.save(storage.KEYS.REFRESH_TOKEN, refreshToken);
    await storage.save(storage.KEYS.USER, JSON.stringify(userData));

    set({
      user:            userData as User,
      isAuthenticated: true,
      activeRole:      (userData as User).activeRole,
    });
  },

  logout: async () => {
    await storage.remove(storage.KEYS.TOKEN);
    await storage.remove(storage.KEYS.REFRESH_TOKEN);
    await storage.remove(storage.KEYS.USER);
    await storage.remove(storage.KEYS.CART);
    set({ user: null, isAuthenticated: false, activeRole: null });
  },

  setUser: (user) => {
    storage.save(storage.KEYS.USER, JSON.stringify(user));
    set({ user, activeRole: user.activeRole });
  },
}));
