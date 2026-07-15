import { api } from '../client';
import type { Page, QueryAlias, QueryParseResponse, QueryPreviewResponse, SavedQuery } from '../types';

const ifMatch = (version: number) => ({ 'If-Match': `"${version}"` });

export type QueryWrite = {
  display_name: string;
  mode: 'DYNAMIC' | 'SNAPSHOT';
  visibility: 'PRIVATE' | 'PUBLISHED';
  expression: string;
  aliases: QueryAlias[];
  universe: 'ALIASES_UNION' | 'ALL_ACCESSIBLE';
};

export const queriesApi = {
  parse: (body: { expression: string; aliases: QueryAlias[]; universe: 'ALIASES_UNION' | 'ALL_ACCESSIBLE'; implicit_and?: boolean }) =>
    api.post<QueryParseResponse>('/query-engine/parse', body).then((response) => response.data),
  preview: (body: { expression: string; aliases: QueryAlias[]; universe: 'ALIASES_UNION' | 'ALL_ACCESSIBLE'; implicit_and?: boolean; page?: number; page_size?: number; sort?: string }) =>
    api.post<QueryPreviewResponse>('/query-engine/preview', body).then((response) => response.data),
  list: (params?: Record<string, unknown>) =>
    api.get<Page<SavedQuery>>('/saved-queries', { params }).then((response) => response.data),
  create: (body: QueryWrite) => api.post<SavedQuery>('/saved-queries', body).then((response) => response.data),
  get: (queryId: string) => api.get<SavedQuery>(`/saved-queries/${queryId}`).then((response) => response.data),
  update: (queryId: string, version: number, body: QueryWrite) =>
    api.patch<SavedQuery>(`/saved-queries/${queryId}`, body, { headers: ifMatch(version) }).then((response) => response.data),
  remove: (queryId: string, version: number) => api.delete(`/saved-queries/${queryId}`, { headers: ifMatch(version) })
};
