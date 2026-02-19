// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  roles: UserRole[];
  activeRole: UserRole;
  status: 'active' | 'suspended';
  createdAt: string;
}

export type UserRole = 'consumer' | 'business_owner' | 'admin';

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

// ─── Listing / Product ───────────────────────────────────────────────────────
export interface Listing {
  _id: string;
  name: string;
  description: string;
  category: FoodCategory;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  quantity: number;
  images: string[];
  pickupFrom: string;
  pickupTo: string;
  status: 'active' | 'sold_out' | 'expired';
  business: Business;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
}

export type FoodCategory =
  | 'bakery'
  | 'meals'
  | 'produce'
  | 'dairy'
  | 'beverages'
  | 'snacks'
  | 'other';

// ─── Business ────────────────────────────────────────────────────────────────
export interface Business {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  address: string;
  location?: { lat: number; lng: number };
  category: string;
  rating?: number;
  reviewCount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export type CartItems = Record<string, number>; // { listingId: quantity }

export interface CartSummary {
  items: CartItems;
  total: number;
  count: number;
}

// ─── Order ────────────────────────────────────────────────────────────────────
export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  pickupCode?: string;
  createdAt: string;
  business: Pick<Business, '_id' | 'name' | 'address'>;
}

export interface OrderItem {
  listing: Pick<Listing, '_id' | 'name' | 'images' | 'discountedPrice'>;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'ready'
  | 'completed'
  | 'cancelled';

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system';
  read: boolean;
  createdAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface ApiError {
  message: string;
  code?: string;
}

// ─── Impact ──────────────────────────────────────────────────────────────────
export interface ImpactStats {
  mealsSaved: number;
  co2Saved: number;
  moneySaved: number;
  ordersCount: number;
}
