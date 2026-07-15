import { api } from '../client';
import type { CursorPage, Operation, Page, Publication, PublicationPreview, PublicLibraryItem, TopicNode } from '../types';

const idempotency = () => ({ 'Idempotency-Key': crypto.randomUUID() });

export const publishingApi = {
  preview: (treeId: string, body: { scope: 'TREE' | 'BRANCH'; root_node_id?: string | null; draft_revision?: number }) =>
    api.post<PublicationPreview>(`/topic-trees/${treeId}/publication-preview`, body).then((response) => response.data),
  publish: (
    treeId: string,
    body: {
      scope: 'TREE' | 'BRANCH';
      root_node_id?: string | null;
      draft_revision: number;
      display_name?: string | null;
      description?: string | null;
      audit_note?: string | null;
    }
  ) => api.post<Publication>(`/topic-trees/${treeId}/publish`, body, { headers: idempotency() }).then((response) => response.data),
  publications: (treeId: string, params?: Record<string, unknown>) =>
    api.get<Page<Publication>>(`/topic-trees/${treeId}/publications`, { params }).then((response) => response.data),
  unpublish: (publicationId: string, audit_note?: string | null) =>
    api.post<Publication>(`/publications/${publicationId}/unpublish`, { audit_note }, { headers: idempotency() }).then((response) => response.data),
  library: (params?: Record<string, unknown>) =>
    api.get<Page<PublicLibraryItem>>('/public-library', { params }).then((response) => response.data),
  libraryItem: (publicationId: string) =>
    api.get<PublicLibraryItem>(`/public-library/${publicationId}`).then((response) => response.data),
  publicNodes: (publicationId: string, params?: Record<string, unknown>) =>
    api.get<CursorPage<TopicNode>>(`/public-library/${publicationId}/nodes`, { params }).then((response) => response.data),
  clone: (publicationId: string, body: { display_name?: string | null; selected_root_node_id?: string | null; audit_note?: string | null }) =>
    api.post<Operation>(`/public-library/${publicationId}/clone`, body, { headers: idempotency() }).then((response) => response.data)
};
