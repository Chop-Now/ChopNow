import api from './api';
import type { User, AuthTokens } from '../types';

export interface LoginPayload  { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string; phone?: string }

export type LoginResponse = AuthTokens & User;

export const authService = {
  login:     (payload: LoginPayload)    => api.post<LoginResponse>('/api/users/login', payload).then(r => r.data),
  register:  (payload: RegisterPayload) => api.post<LoginResponse & { message: string }>('/api/users/register', payload).then(r => r.data),
  getProfile:()                          => api.get<User>('/api/users/profile').then(r => r.data),
  googleAuth:(accessToken: string)      => api.post<LoginResponse>('/api/users/google-login', { accessToken }).then(r => r.data),
};
