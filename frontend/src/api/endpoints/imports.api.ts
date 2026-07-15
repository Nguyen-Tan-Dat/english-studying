import { api } from '../client';
import type { ImportJob, ImportPolicy, ImportRow, Operation, Page } from '../types';

const idempotency = () => ({ 'Idempotency-Key': crypto.randomUUID() });

export const importsApi = {
  policy: () => api.get<ImportPolicy>('/imports/vocabulary/policy').then((response) => response.data),
  upload: (topicNodeId: string, file: File) => {
    const body = new FormData();
    body.append('topic_node_id', topicNodeId);
    body.append('file', file);
    return api.post<ImportJob>('/imports/vocabulary', body).then((response) => response.data);
  },
  get: (jobId: string) => api.get<ImportJob>(`/imports/${jobId}`).then((response) => response.data),
  preview: (jobId: string, params?: Record<string, unknown>) =>
    api.get<Page<ImportRow>>(`/imports/${jobId}/preview`, { params }).then((response) => response.data),
  commit: (jobId: string, body: { strategy: 'VALID_ONLY' | 'ALL_OR_NOTHING'; duplicate_strategy: 'SKIP' | 'UPDATE_EXISTING' }) =>
    api.post<Operation>(`/imports/${jobId}/commit`, body, { headers: idempotency() }).then((response) => response.data)
};
