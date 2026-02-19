import api from './api';
import type { Order, CartItems } from '../types';

export interface PlaceOrderPayload {
  items: CartItems;
  paymentMethod: string;
  notes?: string;
}

export const orderService = {
  place: (payload: PlaceOrderPayload) =>
    api.post<Order>('/api/orders', payload).then(r => r.data),

  getMyOrders: (page = 1) =>
    api.get<{ orders: Order[]; total: number; pages: number }>('/api/orders/my-orders', { params: { page } }).then(r => r.data),

  getById: (id: string) =>
    api.get<Order>(`/api/orders/${id}`).then(r => r.data),

  cancel: (id: string, reason: string) =>
    api.put(`/api/orders/${id}/cancel`, { reason }).then(r => r.data),
};
