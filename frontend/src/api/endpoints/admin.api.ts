import { api } from '../client';
import type { AdminDashboard, AuditLog, Page, TopicTree } from '../types';

export const adminApi = {
  dashboard: () => api.get<AdminDashboard>('/admin/dashboard').then((response) => response.data),
  trees: (params?: Record<string, unknown>) =>
    api.get<Page<TopicTree>>('/admin/topic-trees', { params }).then((response) => response.data),
  createTree: (body: { display_name: string; description?: string | null }) =>
    api.post<TopicTree>('/admin/topic-trees', body).then((response) => response.data),
  health: (params?: Record<string, unknown>) =>
    api.get<Record<string, unknown>>('/admin/content-health', { params }).then((response) => response.data),
  audit: (params?: Record<string, unknown>) =>
    api.get<Page<AuditLog>>('/admin/audit-logs', { params }).then((response) => response.data)
};
