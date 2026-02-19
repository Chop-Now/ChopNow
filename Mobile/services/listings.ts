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

  getByBusiness: (businessId: string, params?: object) =>
    api.get<{ listings: Listing[] }>(`/api/listings/business/${businessId}`, { params }).then(r => r.data),

  create: (data: object) =>
    api.post<{ listing: Listing }>('/api/listings', data).then(r => r.data),

  update: (id: string, data: object) =>
    api.put<{ listing: Listing }>(`/api/listings/${id}`, data).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/api/listings/${id}`).then(r => r.data),

  uploadPhotos: (id: string, formData: FormData) =>
    api.post(`/api/listings/${id}/photos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
};
