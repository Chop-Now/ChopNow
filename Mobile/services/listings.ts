import api from './api';
import type { Listing, PaginatedResponse } from '../types';

export interface ListingFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
}

export const listingService = {
  getAll: (filters: ListingFilters = {}) =>
    api.get<{ listings: Listing[]; total: number; pages: number }>('/api/listings', { params: { status: 'active', ...filters } }).then(r => r.data),

  getById: (id: string) =>
    api.get<Listing>(`/api/listings/${id}`).then(r => r.data),

  getByCategory: (category: string) =>
    api.get<{ listings: Listing[] }>('/api/listings', { params: { category, status: 'active' } }).then(r => r.data),
};
