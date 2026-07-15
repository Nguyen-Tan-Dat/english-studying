import { api } from '../client';
import type { ClientPolicy } from '../types';

export const systemApi = {
  health: () => api.get<{ status: string; version: string }>('/health').then((response) => response.data),
  policy: () => api.get<ClientPolicy>('/client-policy').then((response) => response.data)
};
