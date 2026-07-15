import { useState, type ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { treesApi } from '../../api/endpoints/topic-trees.api';
import { vocabularyApi } from '../../api/endpoints/vocabulary.api';
import { publishingApi } from '../../api/endpoints/publishing.api';
import { collaborationApi } from '../../api/endpoints/collaboration.api';
import { importsApi } from '../../api/endpoints/imports.api';
import type { Collaborator, ImportJob, Publication, TopicNode, Vocabulary, VocabularyWrite } from '../../api/types';
import { problemMessage } from '../../api/client';
import { Spinner } from '../../components/common/Spinner';
import { TreeRow } from '../../components/tree/TreeRow';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { InlineNotice, Select, Tabs, TextArea } from '../../components/common/FormControls';

const emptyVocabulary = (): VocabularyWrite => ({ english: '', vietnamese: '', pronunciation: null, part_of_speech: null, example: null, image_url: null });

export default function TreeWorkspace() {
  const { treeId = '' } = useParams();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('structure');
  const [selected, setSelected] = useState<TopicNode | null>(null);
  const [expanded, setExpanded] = useState(new Set<string>());
  const [children, setChildren] = useState<Record<string, TopicNode[]>>({});
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const workspace = useQuery({ queryKey: ['workspace', treeId], queryFn: () => treesApi.workspace(treeId) });
  const treeDetail = useQuery({ queryKey: ['tree-detail', treeId], queryFn: () => treesApi.get(treeId) });
  const rootNodes = useQuery({ queryKey: ['tree-root-nodes', treeId], queryFn: () => treesApi.nodes(treeId, { limit: 100 }) });
  const allNodes = useQuery({ queryKey: ['tree-all-nodes', treeId], queryFn: () => treesApi.search(treeId, { q: '', limit: 100 }) });
  const nodeDetail = useQuery({ queryKey: ['node', selected?.id], queryFn: () => treesApi.getNode(selected!.id), enabled: Boolean(selected?.id) });
  const activeNode = nodeDetail.data ?? selected;

  function resetNotice() { setMessage(''); setError(''); }
  function success(text: string) { setMessage(text); setError(''); }
  function fail(reason: unknown) { setError(problemMessage(reason)); setMessage(''); }
  async function refreshTree() {
    setChildren({}); setExpanded(new Set());
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['workspace', treeId] }),
      queryClient.invalidateQueries({ queryKey: ['tree-detail', treeId] }),
      queryClient.invalidateQueries({ queryKey: ['tree-root-nodes', treeId] }),
      queryClient.invalidateQueries({ queryKey: ['tree-all-nodes', treeId] }),
      queryClient.invalidateQueries({ queryKey: ['trees'] })
    ]);
  }

  async function toggle(node: TopicNode) {
    if (!node.has_children) return;
    const next = new Set(expanded);
    if (next.has(node.id)) next.delete(node.id);
    else {
      next.add(node.id);
      if (!children[node.id]) {
        const loaded = await treesApi.children(node.id, { limit: 100 });
        setChildren((current) => ({ ...current, [node.id]: loaded.items }));
      }
    }
    setExpanded(next);
  }

  function flatten(nodes: TopicNode[], level = 1): Array<{ node: TopicNode; level: number }> {
    const result: Array<{ node: TopicNode; level: number }> = [];
    for (const node of nodes) {
      result.push({ node, level });
      if (expanded.has(node.id) && children[node.id]) result.push(...flatten(children[node.id], level + 1));
    }
    return result;
  }

  const localRows = flatten(rootNodes.data?.items ?? workspace.data?.root_nodes ?? []);
  const rows = search.trim()
    ? (allNodes.data?.matches ?? []).filter((item) => `${item.display_name} ${item.description ?? ''}`.toLowerCase().includes(search.toLowerCase())).map((node) => ({ node, level: node.depth }))
    : localRows;

  if (workspace.isLoading) return <Spinner />;
  if (!workspace.data) return <InlineNotice tone="error">Không tải được Topic Tree.</InlineNotice>;
  const tree = treeDetail.data ?? workspace.data.tree;

  return <div><div className="page-title"><div><span className="breadcrumb"><Link to="/trees">Kho chủ đề</Link> / {tree.display_name}</span><h1>{tree.display_name}</h1><p>{tree.description || 'Chưa có mô tả.'}</p></div><div className="page-actions"><Badge tone={tree.revision.state === 'PUBLISHED' ? 'success' : 'warning'}>{tree.revision.state} · r{tree.revision.draft_revision}</Badge></div></div>{message && <InlineNotice tone="success">{message}</InlineNotice>}{error && <InlineNotice tone="error">{error}</InlineNotice>}<Tabs value={tab} onChange={(value) => { setTab(value); resetNotice(); }} items={[{ value: 'structure', label: 'Cấu trúc', badge: tree.node_count }, { value: 'vocabulary', label: 'Từ vựng', badge: tree.vocabulary_count }, { value: 'publishing', label: 'Xuất bản' }, { value: 'collaboration', label: 'Cộng tác' }, { value: 'import', label: 'Import Excel' }]} />{tab === 'structure' && <StructureTab treeId={treeId} treeCanEdit={tree.capabilities.can_edit} treeCanDelete={tree.capabilities.can_delete} selected={activeNode} onSelected={setSelected} rows={rows} expanded={expanded} onToggle={toggle} search={search} onSearch={setSearch} allNodes={allNodes.data?.matches ?? []} onRefresh={refreshTree} onSuccess={success} onError={fail} />}{tab === 'vocabulary' && <VocabularyTab selected={activeNode} allNodes={allNodes.data?.matches ?? []} onSelectNode={setSelected} onSuccess={success} onError={fail} />}{tab === 'publishing' && <PublishingTab treeId={treeId} treeName={tree.display_name} description={tree.description} draftRevision={tree.revision.draft_revision} canPublish={tree.capabilities.can_publish} nodes={allNodes.data?.matches ?? []} onSuccess={success} onError={fail} onRefresh={refreshTree} />}{tab === 'collaboration' && <CollaborationTab treeId={treeId} canManage={tree.capabilities.can_manage_collaborators} onSuccess={success} onError={fail} />}{tab === 'import' && <ImportTab selected={activeNode} vocabularyNodes={(allNodes.data?.matches ?? []).filter((node) => node.node_type === 'VOCABULARY')} onSelectNode={setSelected} onSuccess={success} onError={fail} />}</div>;
}

type StructureProps = {
  treeId: string;
  treeCanEdit: boolean;
  treeCanDelete: boolean;
  selected: TopicNode | null;
  onSelected: (node: TopicNode | null) => void;
  rows: Array<{ node: TopicNode; level: number }>;
  expanded: Set<string>;
  onToggle: (node: TopicNode) => void;
  search: string;
  onSearch: (value: string) => void;
  allNodes: TopicNode[];
  onRefresh: () => Promise<void>;
  onSuccess: (message: string) => void;
  onError: (reason: unknown) => void;
};

function StructureTab(props: StructureProps) {
  const [nodeModal, setNodeModal] = useState<'create' | 'edit' | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nodeType, setNodeType] = useState<'GROUP' | 'VOCABULARY'>('VOCABULARY');
  const [targetParent, setTargetParent] = useState<string>('ROOT');
  const [movePreview, setMovePreview] = useState<Awaited<ReturnType<typeof treesApi.previewMove>> | null>(null);

  const saveNode = useMutation({
    mutationFn: () => nodeModal === 'edit' && props.selected
      ? treesApi.updateNode(props.selected.id, props.selected.version, { display_name: name, description: description || null, node_type: nodeType })
      : treesApi.createNode(props.treeId, { parent_id: props.selected?.node_type === 'GROUP' ? props.selected.id : null, display_name: name, description: description || null, node_type: nodeType }),
    onSuccess: async (node) => { setNodeModal(null); props.onSelected(node); await props.onRefresh(); props.onSuccess(nodeModal === 'edit' ? 'Đã cập nhật Topic Node.' : 'Đã tạo Topic Node.'); },
    onError: props.onError
  });
  const deleteNode = useMutation({ mutationFn: () => treesApi.deleteNode(props.selected!.id, props.selected!.version), onSuccess: async () => { props.onSelected(null); await props.onRefresh(); props.onSuccess('Đã xóa Topic Node.'); }, onError: props.onError });
  const previewMove = useMutation({ mutationFn: () => treesApi.previewMove(props.selected!.id, { target_parent_id: targetParent === 'ROOT' ? null : targetParent }), onSuccess: setMovePreview, onError: props.onError });
  const moveNode = useMutation({ mutationFn: () => treesApi.move(props.selected!.id, props.selected!.version, { target_parent_id: targetParent === 'ROOT' ? null : targetParent, audit_note: 'Moved from LexiGo UI' }), onSuccess: async (node) => { setMoveOpen(false); setMovePreview(null); props.onSelected(node); await props.onRefresh(); props.onSuccess('Đã di chuyển Topic Node.'); }, onError: props.onError });

  function openCreate() { setName(''); setDescription(''); setNodeType('VOCABULARY'); setNodeModal('create'); }
  function openEdit() { if (!props.selected) return; setName(props.selected.display_name); setDescription(props.selected.description ?? ''); setNodeType(props.selected.node_type); setNodeModal('edit'); }
  function openMove() { if (!props.selected) return; setTargetParent(props.selected.parent_id ?? 'ROOT'); setMovePreview(null); setMoveOpen(true); }

  return <div className="tree-workspace"><aside className="filter-rail"><h3>Thao tác</h3><Button onClick={openCreate} disabled={!props.treeCanEdit}>+ Thêm Topic</Button><Button variant="secondary" onClick={openEdit} disabled={!props.selected?.capabilities.can_edit}>Sửa Topic</Button><Button variant="secondary" onClick={openMove} disabled={!props.selected?.capabilities.can_move}>Di chuyển</Button><Button variant="danger" disabled={!props.selected?.capabilities.can_delete || deleteNode.isPending} onClick={() => { if (props.selected && window.confirm(`Xóa “${props.selected.display_name}” và dữ liệu con?`)) deleteNode.mutate(); }}>Xóa Topic</Button><hr /><strong>Quy tắc</strong><span>Group có thể chứa Topic con.</span><span>Vocabulary chứa các từ vựng.</span></aside><section className="tree-panel"><div className="tree-toolbar"><Input placeholder="Tìm trong toàn bộ cây…" value={props.search} onChange={(event) => props.onSearch(event.target.value)} /><span>{props.rows.length} kết quả</span></div><div role="tree" className="tree-table">{props.rows.map(({ node, level }) => <TreeRow key={node.id} node={node} level={level} selected={props.selected?.id === node.id} expanded={props.expanded.has(node.id)} onSelect={() => props.onSelected(node)} onExpand={() => props.onToggle(node)} />)}</div></section><aside className="inspector">{props.selected ? <><div className={`inspector-icon ${props.selected.node_type.toLowerCase()}`}>{props.selected.node_type === 'GROUP' ? '▰' : 'Aa'}</div><h2>{props.selected.display_name}</h2><p>{props.selected.path_text}</p><dl><div><dt>Loại</dt><dd>{props.selected.node_type}</dd></div><div><dt>Độ sâu</dt><dd>{props.selected.depth}</dd></div><div><dt>Chủ đề con</dt><dd>{props.selected.child_count}</dd></div><div><dt>Từ vựng</dt><dd>{props.selected.vocabulary_count}</dd></div><div><dt>Version</dt><dd>{props.selected.version}</dd></div></dl><p className="helper">{props.selected.description || 'Chưa có mô tả.'}</p></> : <div className="empty-inspector">Chọn một Topic để xem chi tiết.</div>}</aside><Modal title={nodeModal === 'edit' ? 'Chỉnh sửa Topic' : 'Thêm Topic'} open={Boolean(nodeModal)} onClose={() => setNodeModal(null)}><Input label="Tên Topic" value={name} onChange={(event) => setName(event.target.value)} /><TextArea label="Mô tả" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /><Select label="Loại Topic" value={nodeType} onChange={(event) => setNodeType(event.target.value as 'GROUP' | 'VOCABULARY')}><option value="GROUP">Group</option><option value="VOCABULARY">Vocabulary</option></Select><p className="helper">Parent: {nodeModal === 'create' && props.selected?.node_type === 'GROUP' ? props.selected.path_text : 'Root'}</p><div className="modal-actions"><Button variant="secondary" onClick={() => setNodeModal(null)}>Hủy</Button><Button disabled={!name.trim() || saveNode.isPending} onClick={() => saveNode.mutate()}>Lưu</Button></div></Modal><Modal title="Di chuyển Topic" open={moveOpen} onClose={() => setMoveOpen(false)}><Select label="Parent đích" value={targetParent} onChange={(event) => { setTargetParent(event.target.value); setMovePreview(null); }}><option value="ROOT">Root của cây</option>{props.allNodes.filter((node) => node.node_type === 'GROUP' && node.id !== props.selected?.id).map((node) => <option key={node.id} value={node.id}>{node.path_text}</option>)}</Select><Button variant="secondary" onClick={() => previewMove.mutate()}>Xem trước</Button>{movePreview && <div className="move-preview"><strong>{movePreview.valid === false ? 'Không hợp lệ' : 'Có thể di chuyển'}</strong><p>{movePreview.before_path?.map((item) => item.display_name).join(' / ')} → {movePreview.after_path?.map((item) => item.display_name).join(' / ') || 'Root'}</p><pre className="json-block">{JSON.stringify(movePreview.warnings ?? [], null, 2)}</pre></div>}<div className="modal-actions"><Button variant="secondary" onClick={() => setMoveOpen(false)}>Hủy</Button><Button disabled={!movePreview || moveNode.isPending} onClick={() => moveNode.mutate()}>Xác nhận di chuyển</Button></div></Modal></div>;
}

type VocabularyTabProps = { selected: TopicNode | null; allNodes: TopicNode[]; onSelectNode: (node: TopicNode | null) => void; onSuccess: (message: string) => void; onError: (reason: unknown) => void };
function VocabularyTab({ selected, allNodes, onSelectNode, onSuccess, onError }: VocabularyTabProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Vocabulary | null>(null);
  const [form, setForm] = useState<VocabularyWrite>(emptyVocabulary);
  const vocabularyNodes = allNodes.filter((node) => node.node_type === 'VOCABULARY');
  const active = selected?.node_type === 'VOCABULARY' ? selected : vocabularyNodes[0] ?? null;
  const list = useQuery({ queryKey: ['vocabularies', active?.id, search], queryFn: () => vocabularyApi.list(active!.id, { q: search || undefined, page_size: 100 }), enabled: Boolean(active) });
  const save = useMutation({ mutationFn: () => editing ? vocabularyApi.update(editing.id, editing.version, form) : vocabularyApi.create(active!.id, form), onSuccess: () => { setModal(false); setEditing(null); setForm(emptyVocabulary()); queryClient.invalidateQueries({ queryKey: ['vocabularies', active?.id] }); onSuccess(editing ? 'Đã cập nhật từ vựng.' : 'Đã thêm từ vựng.'); }, onError });
  const remove = useMutation({ mutationFn: (item: Vocabulary) => vocabularyApi.remove(item.id, item.version), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vocabularies', active?.id] }); onSuccess('Đã xóa từ vựng.'); }, onError });
  function openEdit(item: Vocabulary) { setEditing(item); setForm({ english: item.english, vietnamese: item.vietnamese, pronunciation: item.pronunciation, part_of_speech: (item.part_of_speech as VocabularyWrite['part_of_speech']) ?? null, example: item.example, image_url: item.image_url }); setModal(true); }
  return <div><div className="toolbar vocab-toolbar"><Select value={active?.id ?? ''} onChange={(event) => onSelectNode(vocabularyNodes.find((node) => node.id === event.target.value) ?? null)}><option value="">Chọn Vocabulary Topic</option>{vocabularyNodes.map((node) => <option key={node.id} value={node.id}>{node.path_text}</option>)}</Select><Input placeholder="Tìm trong Topic…" value={search} onChange={(event) => setSearch(event.target.value)} /><Button onClick={() => { setEditing(null); setForm(emptyVocabulary()); setModal(true); }} disabled={!active?.capabilities.can_manage_vocabulary}>+ Thêm từ</Button></div>{active ? <div className="data-table"><div className="data-row data-head vocab-data"><span>English</span><span>Vietnamese</span><span>Phát âm</span><span>Loại từ</span><span>Thao tác</span></div>{list.data?.items.map((item) => <div className="data-row vocab-data" key={item.id}><div><strong>{item.english}</strong><small>{item.example}</small></div><span>{item.vietnamese}</span><span>{item.pronunciation || '—'}</span><Badge tone="info">{item.part_of_speech || 'OTHER'}</Badge><div className="row-actions"><Button variant="ghost" onClick={() => openEdit(item)}>Sửa</Button><Button variant="danger" onClick={() => { if (window.confirm(`Xóa “${item.english}”?`)) remove.mutate(item); }}>Xóa</Button></div></div>)}</div> : <InlineNotice tone="warning">Cây chưa có Vocabulary Topic. Hãy tạo một Topic loại VOCABULARY trước.</InlineNotice>}<Modal title={editing ? 'Sửa từ vựng' : 'Thêm từ vựng'} open={modal} onClose={() => setModal(false)}><div className="form-grid"><Input label="English" value={form.english} onChange={(event) => setForm({ ...form, english: event.target.value })} /><Input label="Tiếng Việt" value={form.vietnamese} onChange={(event) => setForm({ ...form, vietnamese: event.target.value })} /><Input label="Phát âm" value={form.pronunciation ?? ''} onChange={(event) => setForm({ ...form, pronunciation: event.target.value || null })} /><Select label="Loại từ" value={form.part_of_speech ?? ''} onChange={(event) => setForm({ ...form, part_of_speech: (event.target.value || null) as VocabularyWrite['part_of_speech'] })}><option value="">Không xác định</option>{['NOUN', 'VERB', 'ADJECTIVE', 'ADVERB', 'PHRASE', 'OTHER'].map((value) => <option key={value}>{value}</option>)}</Select></div><TextArea label="Ví dụ" rows={3} value={form.example ?? ''} onChange={(event) => setForm({ ...form, example: event.target.value || null })} /><Input label="Image URL" type="url" value={form.image_url ?? ''} onChange={(event) => setForm({ ...form, image_url: event.target.value || null })} /><div className="modal-actions"><Button variant="secondary" onClick={() => setModal(false)}>Hủy</Button><Button disabled={!form.english || !form.vietnamese || save.isPending} onClick={() => save.mutate()}>Lưu</Button></div></Modal></div>;
}

type PublishingProps = { treeId: string; treeName: string; description: string | null; draftRevision: number; canPublish: boolean; nodes: TopicNode[]; onSuccess: (message: string) => void; onError: (reason: unknown) => void; onRefresh: () => Promise<void> };
function PublishingTab({ treeId, treeName, description, draftRevision, canPublish, nodes, onSuccess, onError, onRefresh }: PublishingProps) {
  const queryClient = useQueryClient();
  const [scope, setScope] = useState<'TREE' | 'BRANCH'>('TREE');
  const [rootNodeId, setRootNodeId] = useState('');
  const [displayName, setDisplayName] = useState(treeName);
  const [publicationDescription, setPublicationDescription] = useState(description ?? '');
  const preview = useMutation({ mutationFn: () => publishingApi.preview(treeId, { scope, root_node_id: scope === 'BRANCH' ? rootNodeId : null, draft_revision: draftRevision }), onError });
  const publish = useMutation({ mutationFn: () => publishingApi.publish(treeId, { scope, root_node_id: scope === 'BRANCH' ? rootNodeId : null, draft_revision: draftRevision, display_name: displayName, description: publicationDescription || null, audit_note: 'Published from LexiGo UI' }), onSuccess: async () => { queryClient.invalidateQueries({ queryKey: ['publications', treeId] }); await onRefresh(); onSuccess('Đã xuất bản nội dung.'); }, onError });
  const publications = useQuery({ queryKey: ['publications', treeId], queryFn: () => publishingApi.publications(treeId, { page_size: 100 }) });
  const unpublish = useMutation({ mutationFn: (item: Publication) => publishingApi.unpublish(item.id, 'Unpublished from LexiGo UI'), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['publications', treeId] }); onSuccess('Đã gỡ xuất bản.'); }, onError });
  return <div className="publishing-layout"><section className="panel"><h2>Tạo Publication</h2><div className="form-grid"><Select label="Phạm vi" value={scope} onChange={(event) => setScope(event.target.value as 'TREE' | 'BRANCH')}><option value="TREE">Toàn bộ cây</option><option value="BRANCH">Một nhánh</option></Select>{scope === 'BRANCH' && <Select label="Root node" value={rootNodeId} onChange={(event) => setRootNodeId(event.target.value)}><option value="">Chọn root của nhánh</option>{nodes.map((node) => <option key={node.id} value={node.id}>{node.path_text}</option>)}</Select>}<Input label="Tên công khai" value={displayName} onChange={(event) => setDisplayName(event.target.value)} /><Input label="Draft revision" value={draftRevision} readOnly /></div><TextArea label="Mô tả" rows={4} value={publicationDescription} onChange={(event) => setPublicationDescription(event.target.value)} /><div className="modal-actions"><Button variant="secondary" onClick={() => preview.mutate()} disabled={scope === 'BRANCH' && !rootNodeId}>Xem trước</Button><Button onClick={() => publish.mutate()} disabled={!canPublish || !displayName || (scope === 'BRANCH' && !rootNodeId) || publish.isPending}>Xuất bản</Button></div>{preview.data && <div className="preview-card"><h3>Publication preview</h3><div className="stats-grid mini"><article><strong>{preview.data.node_count}</strong><small>Topic</small></article><article><strong>{preview.data.vocabulary_count}</strong><small>Từ</small></article><article><strong>{preview.data.estimated_index_seconds ?? 0}s</strong><small>Ước tính</small></article></div>{preview.data.warnings?.map((warning, index) => <InlineNotice tone="warning" key={index}>{typeof warning === 'string' ? warning : warning.message}</InlineNotice>)}</div>}</section><section className="panel"><h2>Lịch sử Publication</h2><div className="publication-list">{publications.data?.items.map((item) => <article key={item.id}><div><strong>{item.display_name}</strong><p>{item.scope} · revision {item.published_revision} · {item.node_count} Topic · {item.vocabulary_count} từ</p></div><div><Badge tone={item.status === 'PUBLISHED' ? 'success' : 'neutral'}>{item.status}</Badge>{item.status === 'PUBLISHED' && <Button variant="danger" onClick={() => unpublish.mutate(item)}>Gỡ</Button>}</div></article>)}</div></section></div>;
}

type CollaborationProps = { treeId: string; canManage: boolean; onSuccess: (message: string) => void; onError: (reason: unknown) => void };
function CollaborationTab({ treeId, canManage, onSuccess, onError }: CollaborationProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'EDITOR' | 'VIEWER'>('VIEWER');
  const collaborators = useQuery({ queryKey: ['collaborators', treeId], queryFn: () => collaborationApi.list(treeId, { page_size: 100 }) });
  const invite = useMutation({ mutationFn: () => collaborationApi.invite(treeId, { email, role, message: 'Mời cộng tác trên LexiGo' }), onSuccess: () => { setEmail(''); queryClient.invalidateQueries({ queryKey: ['collaborators', treeId] }); onSuccess('Đã gửi lời mời cộng tác.'); }, onError });
  const update = useMutation({ mutationFn: ({ item, nextRole }: { item: Collaborator; nextRole: 'EDITOR' | 'VIEWER' }) => collaborationApi.updateRole(item.id, item.version ?? 1, nextRole), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['collaborators', treeId] }); onSuccess('Đã cập nhật quyền cộng tác.'); }, onError });
  const revoke = useMutation({ mutationFn: (item: Collaborator) => collaborationApi.revoke(item.id, item.version ?? 1), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['collaborators', treeId] }); onSuccess('Đã thu hồi quyền cộng tác.'); }, onError });
  return <div><section className="panel invite-panel"><h2>Mời cộng tác</h2><div className="inline-form"><Input type="email" placeholder="collaborator@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /><Select value={role} onChange={(event) => setRole(event.target.value as 'EDITOR' | 'VIEWER')}><option value="VIEWER">Viewer</option><option value="EDITOR">Editor</option></Select><Button onClick={() => invite.mutate()} disabled={!canManage || !email || invite.isPending}>Gửi lời mời</Button></div></section><div className="data-table"><div className="data-row data-head collaborators-data"><span>Thành viên</span><span>Vai trò</span><span>Trạng thái</span><span>Ngày tham gia</span><span>Thao tác</span></div>{collaborators.data?.items.map((item) => <div className="data-row collaborators-data" key={item.id}><div><strong>{item.user?.display_name ?? item.email}</strong><small>{item.email}</small></div><Select value={item.role} disabled={!canManage} onChange={(event) => update.mutate({ item, nextRole: event.target.value as 'EDITOR' | 'VIEWER' })}><option value="VIEWER">VIEWER</option><option value="EDITOR">EDITOR</option></Select><Badge tone={item.status === 'ACCEPTED' ? 'success' : 'warning'}>{item.status}</Badge><span>{item.accepted_at ? new Date(item.accepted_at).toLocaleDateString('vi-VN') : 'Chờ xác nhận'}</span><Button variant="danger" disabled={!canManage} onClick={() => { if (window.confirm(`Thu hồi quyền của ${item.email}?`)) revoke.mutate(item); }}>Thu hồi</Button></div>)}</div></div>;
}

type ImportProps = { selected: TopicNode | null; vocabularyNodes: TopicNode[]; onSelectNode: (node: TopicNode | null) => void; onSuccess: (message: string) => void; onError: (reason: unknown) => void };
function ImportTab({ selected, vocabularyNodes, onSelectNode, onSuccess, onError }: ImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState('');
  const [strategy, setStrategy] = useState<'VALID_ONLY' | 'ALL_OR_NOTHING'>('VALID_ONLY');
  const [duplicateStrategy, setDuplicateStrategy] = useState<'SKIP' | 'UPDATE_EXISTING'>('SKIP');
  const active = selected?.node_type === 'VOCABULARY' ? selected : vocabularyNodes[0] ?? null;
  const policy = useQuery({ queryKey: ['import-policy'], queryFn: importsApi.policy });
  const job = useQuery({ queryKey: ['import-job', jobId], queryFn: () => importsApi.get(jobId), enabled: Boolean(jobId), refetchInterval: (query) => ['UPLOADED', 'SCANNING', 'VALIDATING', 'COMMITTING'].includes(query.state.data?.status ?? '') ? 1200 : false });
  const preview = useQuery({ queryKey: ['import-preview', jobId], queryFn: () => importsApi.preview(jobId, { page_size: 100 }), enabled: Boolean(jobId) });
  const upload = useMutation({ mutationFn: () => importsApi.upload(active!.id, file!), onSuccess: (created) => { setJobId(created.id); localStorage.setItem('lexigo:last-operation', created.operation_id ?? ''); onSuccess('Đã tải file và hoàn tất validation.'); }, onError });
  const commit = useMutation({ mutationFn: () => importsApi.commit(jobId, { strategy, duplicate_strategy: duplicateStrategy }), onSuccess: (operation) => { localStorage.setItem('lexigo:last-operation', operation.id); onSuccess(`Import đã commit. Operation: ${operation.id}`); }, onError });
  const currentJob: ImportJob | undefined = job.data;
  return <div className="import-layout"><section className="panel"><h2>1. Chọn file Excel</h2><Select label="Vocabulary Topic đích" value={active?.id ?? ''} onChange={(event) => onSelectNode(vocabularyNodes.find((node) => node.id === event.target.value) ?? null)}><option value="">Chọn Topic</option>{vocabularyNodes.map((node) => <option key={node.id} value={node.id}>{node.path_text}</option>)}</Select><label className="file-drop"><input type="file" accept=".xlsx,.xls" onChange={(event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] ?? null)} /><span>📄</span><strong>{file?.name ?? 'Chọn hoặc kéo file Excel'}</strong><small>Tối đa {Math.round((policy.data?.max_file_size_bytes ?? 0) / 1024 / 1024)} MB · {policy.data?.max_rows ?? 0} dòng</small></label><p className="helper">Cột bắt buộc: {policy.data?.required_columns.join(', ')}. Cột tùy chọn: {policy.data?.optional_columns.join(', ')}.</p><Button disabled={!active || !file || upload.isPending} onClick={() => upload.mutate()}>{upload.isPending ? 'Đang tải…' : 'Upload & Validate'}</Button></section><section className="panel"><h2>2. Preview & Commit</h2>{currentJob ? <><div className="operation-head"><Badge tone={currentJob.status === 'READY' || currentJob.status === 'COMPLETED' ? 'success' : 'warning'}>{currentJob.status}</Badge><small>{currentJob.id}</small></div><div className="stats-grid mini"><article><strong>{currentJob.summary.total_rows}</strong><small>Tổng</small></article><article><strong>{currentJob.summary.valid_rows}</strong><small>Hợp lệ</small></article><article><strong>{currentJob.summary.error_rows}</strong><small>Lỗi</small></article><article><strong>{currentJob.summary.created_count}</strong><small>Đã tạo</small></article></div><div className="import-preview-table">{preview.data?.items.slice(0, 20).map((row) => <div key={row.row_number}><span>#{row.row_number}</span><Badge tone={row.status === 'VALID' ? 'success' : row.status === 'ERROR' ? 'danger' : 'warning'}>{row.status}</Badge><strong>{String(row.normalized?.english ?? row.raw.English ?? '')}</strong><span>{String(row.normalized?.vietnamese ?? row.raw.Vietnamese ?? '')}</span><small>{row.errors.map((item) => item.message).join('; ')}</small></div>)}</div><div className="form-grid"><Select label="Commit strategy" value={strategy} onChange={(event) => setStrategy(event.target.value as 'VALID_ONLY' | 'ALL_OR_NOTHING')}><option value="VALID_ONLY">Valid rows only</option><option value="ALL_OR_NOTHING">All or nothing</option></Select><Select label="Duplicate strategy" value={duplicateStrategy} onChange={(event) => setDuplicateStrategy(event.target.value as 'SKIP' | 'UPDATE_EXISTING')}><option value="SKIP">Skip</option><option value="UPDATE_EXISTING">Update existing</option></Select></div><Button onClick={() => commit.mutate()} disabled={!['READY', 'COMPLETED'].includes(currentJob.status) || commit.isPending}>Commit Import</Button></> : <p className="helper">Upload file để xem các dòng hợp lệ, cảnh báo và lỗi trước khi commit.</p>}</section></div>;
}
