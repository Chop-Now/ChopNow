import api from './api';

export type FavoriteType = 'listing' | 'business';

export const favoriteService = {
  toggle: (favoriteType: FavoriteType, referenceId: string) =>
    api.post('/api/favorites/toggle', { favoriteType, referenceId }).then(r => r.data),

  getAll: (favoriteType?: FavoriteType) =>
    api.get('/api/favorites', { params: favoriteType ? { favoriteType } : {} }).then(r => r.data),

  check: (favoriteType: FavoriteType, referenceId: string) =>
    api.get(`/api/favorites/check/${favoriteType}/${referenceId}`).then(r => r.data),
};
