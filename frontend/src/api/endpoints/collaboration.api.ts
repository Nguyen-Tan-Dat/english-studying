import { api } from '../client';
import type { Collaborator, Page } from '../types';

const versions = new Map<string, number>();
const idempotency = () => ({ 'Idempotency-Key': crypto.randomUUID() });
const ifMatch = (version: number) => ({ 'If-Match': `"${version}"` });

function versionFromEtag(etag: unknown, fallback: number): number {
  const parsed = Number(String(etag ?? '').replace(/[^0-9]/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function withVersion(item: Collaborator): Collaborator {
  const version = versions.get(item.id) ?? item.version ?? 1;
  versions.set(item.id, version);
  return { ...item, version };
}

export const collaborationApi = {
  async list(treeId: string, params?: Record<string, unknown>): Promise<Page<Collaborator>> {
    const response = await api.get<Page<Collaborator>>(`/topic-trees/${treeId}/collaborators`, { params });
    return { ...response.data, items: response.data.items.map(withVersion) };
  },

  async invite(
    treeId: string,
    body: { email: string; role: 'EDITOR' | 'VIEWER'; message?: string | null }
  ): Promise<Collaborator> {
    const response = await api.post<Collaborator>(`/topic-trees/${treeId}/collaborators`, body, {
      headers: idempotency()
    });
    const item = withVersion(response.data);
    versions.set(item.id, versionFromEtag(response.headers.etag, item.version ?? 1));
    return withVersion(item);
  },

  async updateRole(
    collaboratorId: string,
    version: number,
    role: 'EDITOR' | 'VIEWER'
  ): Promise<Collaborator> {
    const response = await api.patch<Collaborator>(
      `/collaborators/${collaboratorId}`,
      { role },
      { headers: ifMatch(version) }
    );
    versions.set(collaboratorId, versionFromEtag(response.headers.etag, version + 1));
    return withVersion(response.data);
  },

  async revoke(collaboratorId: string, version: number): Promise<void> {
    await api.delete(`/collaborators/${collaboratorId}`, { headers: ifMatch(version) });
    versions.delete(collaboratorId);
  },

  async accept(token: string): Promise<Collaborator> {
    const response = await api.post<Collaborator>(`/invitations/${token}/accept`, undefined, {
      headers: idempotency()
    });
    return withVersion(response.data);
  }
};
