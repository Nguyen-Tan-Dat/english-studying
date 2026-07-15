import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { treesApi } from '../../api/endpoints/topic-trees.api';
import type { TopicTree } from '../../api/types';
import { problemMessage } from '../../api/client';
import { WordlistCard } from '../../components/cards/WordlistCard';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Spinner } from '../../components/common/Spinner';
import { InlineNotice, Select, TextArea } from '../../components/common/FormControls';
import { useDebounce } from '../../hooks/useDebounce';

export default function TopicTreeList() {
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('');
  const [access, setAccess] = useState('ALL');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<TopicTree | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const debounced = useDebounce(search, 250);
  const client = useQueryClient();
  const trees = useQuery({ queryKey: ['trees', debounced, kind, access, status], queryFn: () => treesApi.list({ q: debounced || undefined, kind: kind || undefined, access, status: status || undefined, page_size: 100 }) });

  const save = useMutation({
    mutationFn: () => editing ? treesApi.update(editing.id, editing.version, { display_name: name, description: description || null }) : treesApi.create({ display_name: name, description: description || null }),
    onSuccess: () => { setModal(null); setEditing(null); setName(''); setDescription(''); setError(''); client.invalidateQueries({ queryKey: ['trees'] }); },
    onError: (reason) => setError(problemMessage(reason))
  });
  const remove = useMutation({
    mutationFn: (tree: TopicTree) => treesApi.remove(tree.id, tree.version),
    onSuccess: () => client.invalidateQueries({ queryKey: ['trees'] }),
    onError: (reason) => setError(problemMessage(reason))
  });

  function openCreate() { setEditing(null); setName(''); setDescription(''); setModal('create'); setError(''); }
  function openEdit(tree: TopicTree) { setEditing(tree); setName(tree.display_name); setDescription(tree.description ?? ''); setModal('edit'); setError(''); }

  return <div><div className="page-title"><div><h1>Kho chủ đề</h1><p>CRUD Topic Tree, quyền truy cập, revision và trạng thái publish.</p></div><Button onClick={openCreate}>+ Tạo cây mới</Button></div>{error && <InlineNotice tone="error">{error}</InlineNotice>}<div className="toolbar tree-filters"><Input aria-label="Tìm cây chủ đề" placeholder="Tìm theo tên hoặc mô tả…" value={search} onChange={(event) => setSearch(event.target.value)} /><Select aria-label="Loại cây" value={kind} onChange={(event) => setKind(event.target.value)}><option value="">Mọi loại</option><option value="USER">Cây người dùng</option><option value="DEFAULT">Cây hệ thống</option></Select><Select aria-label="Quyền truy cập" value={access} onChange={(event) => setAccess(event.target.value)}><option value="ALL">Tất cả quyền</option><option value="OWNED">Tôi sở hữu</option><option value="SHARED">Được chia sẻ</option></Select><Select aria-label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Mọi trạng thái</option><option value="PRIVATE">Private</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></Select></div>{trees.isLoading ? <Spinner /> : trees.data?.items.length ? <div className="card-grid">{trees.data.items.map((tree) => <div className="tree-card-shell" key={tree.id}><WordlistCard tree={tree} /><div className="card-actions"><Button variant="ghost" onClick={() => openEdit(tree)} disabled={!tree.capabilities.can_edit}>Sửa</Button><Button variant="danger" onClick={() => { if (window.confirm(`Xóa cây “${tree.display_name}”?`)) remove.mutate(tree); }} disabled={!tree.capabilities.can_delete}>Xóa</Button></div></div>)}</div> : <EmptyState title="Chưa có cây chủ đề" description="Tạo cây đầu tiên để bắt đầu xây kho từ vựng." />}<Modal title={modal === 'edit' ? 'Chỉnh sửa Topic Tree' : 'Tạo Topic Tree'} open={Boolean(modal)} onClose={() => setModal(null)}>{error && <InlineNotice tone="error">{error}</InlineNotice>}<Input label="Tên cây" value={name} onChange={(event) => setName(event.target.value)} autoFocus /><TextArea label="Mô tả" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} /><div className="modal-actions"><Button variant="secondary" onClick={() => setModal(null)}>Hủy</Button><Button disabled={!name.trim() || save.isPending} onClick={() => save.mutate()}>{save.isPending ? 'Đang lưu…' : 'Lưu'}</Button></div></Modal></div>;
}
