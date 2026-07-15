import { api } from '../client';
import type { User } from '../types';

export type AuthSession = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: User;
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthSession>('/auth/login', { email, password }).then((response) => response.data),
  register: (body: { email: string; password: string; display_name: string }) =>
    api.post<AuthSession>('/auth/register', body).then((response) => response.data),
  refresh: () => api.post<AuthSession>('/auth/refresh').then((response) => response.data),
  logout: () => api.post<void>('/auth/logout')
};
