import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from './token-store';

type RetryRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };
type ProblemPayload = { title?: string; message?: string; detail?: string };

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  withCredentials: true,
  headers: { Accept: 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ProblemPayload>) => {
    const original = error.config as RetryRequestConfig | undefined;
    const isAuthRequest = original?.url?.includes('/auth/');

    if (error.response?.status !== 401 || !original || original._retry || isAuthRequest) {
      throw error;
    }

    original._retry = true;
    refreshing ??= api
      .post<{ access_token: string }>('/auth/refresh')
      .then((response) => {
        tokenStore.set(response.data.access_token);
        return response.data.access_token;
      })
      .finally(() => {
        refreshing = null;
      });

    const token = await refreshing;
    original.headers.set('Authorization', `Bearer ${token}`);
    return api(original);
  }
);

export function problemMessage(error: unknown): string {
  if (axios.isAxiosError<ProblemPayload>(error)) {
    return error.response?.data?.title
      ?? error.response?.data?.detail
      ?? error.response?.data?.message
      ?? error.message;
  }
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi';
}
