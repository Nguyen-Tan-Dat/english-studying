import { api } from '../client';
import type { Page, Vocabulary, VocabularyWrite } from '../types';

const ifMatch = (version: number) => ({ 'If-Match': `"${version}"` });

export const vocabularyApi = {
  list: (nodeId: string, params?: Record<string, unknown>) =>
    api.get<Page<Vocabulary>>(`/topic-nodes/${nodeId}/vocabularies`, { params }).then((response) => response.data),
  create: (nodeId: string, body: VocabularyWrite) =>
    api.post<Vocabulary>(`/topic-nodes/${nodeId}/vocabularies`, body).then((response) => response.data),
  get: (vocabularyId: string) =>
    api.get<Vocabulary>(`/vocabularies/${vocabularyId}`).then((response) => response.data),
  update: (vocabularyId: string, version: number, body: VocabularyWrite) =>
    api.patch<Vocabulary>(`/vocabularies/${vocabularyId}`, body, { headers: ifMatch(version) }).then((response) => response.data),
  remove: (vocabularyId: string, version: number) =>
    api.delete(`/vocabularies/${vocabularyId}`, { headers: ifMatch(version) }),
  search: (params?: Record<string, unknown>) =>
    api.get<Page<Vocabulary>>('/search/vocabularies', { params }).then((response) => response.data)
};
