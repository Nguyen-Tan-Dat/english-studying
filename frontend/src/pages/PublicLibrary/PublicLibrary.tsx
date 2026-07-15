import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { publishingApi } from '../../api/endpoints/publishing.api';
import type { PublicLibraryItem, TopicNode } from '../../api/types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { InlineNotice, Select } from '../../components/common/FormControls';
import { EmptyState } from '../../components/common/EmptyState';
import { problemMessage } from '../../api/client';
import { useDebounce } from '../../hooks/useDebounce';

export default function PublicLibrary() {
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState('');
  const [level, setLevel] = useState('');
  const [wordMin, setWordMin] = useState('');
  const [wordMax, setWordMax] = useState('');
  const [selected, setSelected] = useState<PublicLibraryItem | null>(null);
  const [cloneName, setCloneName] = useState('');
  const [message, setMessage] = useState('');
  const query = useDebounce(search, 250);
  const list = useQuery({ queryKey: ['public-library', query, scope, level, wordMin, wordMax], queryFn: () => publishingApi.library({ q: query || undefined, scope: scope || undefined, level: level || undefined, word_min: wordMin || undefined, word_max: wordMax || undefined, page_size: 100 }) });
  const detail = useQuery({ queryKey: ['public-library-item', selected?.id], queryFn: () => publishingApi.libraryItem(selected!.id), enabled: Boolean(selected) });
  const nodes = useQuery({ queryKey: ['public-library-nodes', selected?.id], queryFn: () => publishingApi.publicNodes(selected!.id, { limit: 100 }), enabled: Boolean(selected) });
  const clone = useMutation({ mutationFn: () => publishingApi.clone(selected!.id, { display_name: cloneName || null, audit_note: 'Cloned from public library UI' }), onSuccess: (operation) => { localStorage.setItem('lexigo:last-operation', operation.id); setMessage(`Đã bắt đầu clone. Operation ID: ${operation.id}`); setSelected(null); }, onError: (reason) => setMessage(problemMessage(reason)) });

  return <div><div className="page-title"><div><h1>Thư viện công khai</h1><p>Xem chi tiết publication, cấu trúc node và clone vào kho cá nhân.</p></div></div>{message && <InlineNotice tone={message.startsWith('Đã') ? 'success' : 'error'}>{message}</InlineNotice>}<div className="toolbar library-filters"><Input placeholder="Tìm nội dung công khai…" value={search} onChange={(event) => setSearch(event.target.value)} /><Select value={scope} onChange={(event) => setScope(event.target.value)}><option value="">Mọi phạm vi</option><option value="TREE">TREE</option><option value="BRANCH">BRANCH</option></Select><Input placeholder="Level, ví dụ A1" value={level} onChange={(event) => setLevel(event.target.value)} /><Input type="number" min={0} placeholder="Từ tối thiểu" value={wordMin} onChange={(event) => setWordMin(event.target.value)} /><Input type="number" min={0} placeholder="Từ tối đa" value={wordMax} onChange={(event) => setWordMax(event.target.value)} /></div>{list.data?.items.length ? <div className="library-grid">{list.data.items.map((item) => <article className="library-card" key={item.id}><div className="library-cover"><span>{item.scope === 'TREE' ? '🌍' : '🌿'}</span><Badge tone="success">{item.scope}</Badge></div><div className="library-tags">{item.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}{item.level && <Badge tone="info">{item.level}</Badge>}</div><h3>{item.display_name}</h3><p>{item.description || 'Không có mô tả.'}</p><div className="tree-meta"><span>{item.node_count} Topic</span><span>{item.vocabulary_count} từ</span><span>{item.clone_count} clone</span></div><Button onClick={() => { setSelected(item); setCloneName(`${item.display_name} (Copy)`); }}>Xem & Clone</Button></article>)}</div> : <EmptyState title="Chưa có nội dung công khai" description="Hãy xuất bản một Topic Tree hoặc thay đổi bộ lọc." />}<Modal title={detail.data?.display_name ?? selected?.display_name ?? 'Publication'} open={Boolean(selected)} onClose={() => setSelected(null)}>{detail.data && <><p>{detail.data.description}</p><dl className="detail-list"><div><dt>Phạm vi</dt><dd>{detail.data.scope}</dd></div><div><dt>Revision</dt><dd>{detail.data.published_revision}</dd></div><div><dt>Topic</dt><dd>{detail.data.node_count}</dd></div><div><dt>Từ vựng</dt><dd>{detail.data.vocabulary_count}</dd></div><div><dt>Slug</dt><dd>{detail.data.slug}</dd></div></dl><h3>Cấu trúc công khai</h3><div className="public-node-list">{nodes.data?.items.map((node: TopicNode) => <div key={node.id} style={{ paddingLeft: `${Math.max(node.depth - 1, 0) * 14}px` }}><Badge tone={node.node_type === 'GROUP' ? 'warning' : 'info'}>{node.node_type}</Badge><strong>{node.display_name}</strong><small>{node.vocabulary_count} từ</small></div>)}</div><Input label="Tên cây sau khi clone" value={cloneName} onChange={(event) => setCloneName(event.target.value)} /><div className="modal-actions"><Button variant="secondary" onClick={() => setSelected(null)}>Đóng</Button><Button disabled={clone.isPending} onClick={() => clone.mutate()}>{clone.isPending ? 'Đang clone…' : 'Clone vào kho'}</Button></div></>}</Modal></div>;
}
