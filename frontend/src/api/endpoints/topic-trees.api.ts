import { api } from '../client';
import type {
  CursorPage,
  MovePreview,
  Page,
  TopicNode,
  TopicTree,
  TreeSearchResult,
  TreeWorkspace
} from '../types';

const ifMatch = (version: number) => ({ 'If-Match': `"${version}"` });

export const treesApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Page<TopicTree>>('/topic-trees', { params }).then((response) => response.data),
  create: (body: { display_name: string; description?: string | null }) =>
    api.post<TopicTree>('/topic-trees', body).then((response) => response.data),
  get: (treeId: string) => api.get<TopicTree>(`/topic-trees/${treeId}`).then((response) => response.data),
  update: (treeId: string, version: number, body: { display_name?: string; description?: string | null }) =>
    api.patch<TopicTree>(`/topic-trees/${treeId}`, body, { headers: ifMatch(version) }).then((response) => response.data),
  remove: (treeId: string, version: number) =>
    api.delete(`/topic-trees/${treeId}`, { headers: ifMatch(version) }),
  workspace: (treeId: string) =>
    api.get<TreeWorkspace>(`/topic-trees/${treeId}/workspace`).then((response) => response.data),
  nodes: (treeId: string, params?: Record<string, unknown>) =>
    api.get<CursorPage<TopicNode>>(`/topic-trees/${treeId}/nodes`, { params }).then((response) => response.data),
  createNode: (
    treeId: string,
    body: {
      parent_id?: string | null;
      display_name: string;
      description?: string | null;
      node_type: 'GROUP' | 'VOCABULARY';
      position?: number | null;
    }
  ) => api.post<TopicNode>(`/topic-trees/${treeId}/nodes`, body).then((response) => response.data),
  search: (treeId: string, params: Record<string, unknown>) =>
    api.get<TreeSearchResult>(`/topic-trees/${treeId}/search`, { params }).then((response) => response.data),
  getNode: (nodeId: string) => api.get<TopicNode>(`/topic-nodes/${nodeId}`).then((response) => response.data),
  updateNode: (
    nodeId: string,
    version: number,
    body: { display_name?: string; description?: string | null; node_type?: 'GROUP' | 'VOCABULARY' }
  ) => api.patch<TopicNode>(`/topic-nodes/${nodeId}`, body, { headers: ifMatch(version) }).then((response) => response.data),
  deleteNode: (nodeId: string, version: number) =>
    api.delete(`/topic-nodes/${nodeId}`, { headers: ifMatch(version) }),
  children: (nodeId: string, params?: Record<string, unknown>) =>
    api.get<CursorPage<TopicNode>>(`/topic-nodes/${nodeId}/children`, { params }).then((response) => response.data),
  previewMove: (nodeId: string, body: { target_parent_id: string | null; before_node_id?: string | null; after_node_id?: string | null; audit_note?: string | null }) =>
    api.post<MovePreview>(`/topic-nodes/${nodeId}/move-preview`, body).then((response) => response.data),
  move: (nodeId: string, version: number, body: { target_parent_id: string | null; before_node_id?: string | null; after_node_id?: string | null; audit_note?: string | null }) =>
    api.post<TopicNode>(`/topic-nodes/${nodeId}/move`, body, { headers: ifMatch(version) }).then((response) => response.data)
};
