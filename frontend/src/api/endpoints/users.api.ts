import { api } from '../client';
import type { LearnerStats, User } from '../types';

export const usersApi = {
  me: () => api.get<User>('/me').then((response) => response.data),
  update: (body: { display_name?: string; avatar_url?: string | null }) =>
    api.patch<User>('/me', body).then((response) => response.data),
  stats: () => api.get<LearnerStats>('/me/stats').then((response) => response.data)
};
