import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queriesApi, type QueryWrite } from '../../api/endpoints/queries.api';
import { treesApi } from '../../api/endpoints/topic-trees.api';
import type { SavedQuery } from '../../api/types';
import { problemMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { InlineNotice, Select, TextArea } from '../../components/common/FormControls';

const blankWrite = (): QueryWrite => ({ display_name: '', mode: 'DYNAMIC', visibility: 'PRIVATE', expression: 'A AND B', aliases: [], universe: 'ALIASES_UNION' });

export default function QueryBuilder() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<QueryWrite>(blankWrite);
  const [selectedTree, setSelectedTree] = useState('');
  const [selectedNode, setSelectedNode] = useState('');
  const [aliasName, setAliasName] = useState('A');
  const [editing, setEditing] = useState<SavedQuery | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const trees = useQuery({ queryKey: ['trees', 'query-builder'], queryFn: () => treesApi.list({ page_size: 100 }) });
  const nodes = useQuery({ queryKey: ['tree-search-all', selectedTree], queryFn: () => treesApi.search(selectedTree, { q: '', limit: 100 }), enabled: Boolean(selectedTree) });
  const saved = useQuery({ queryKey: ['saved-queries'], queryFn: () => queriesApi.list({ page_size: 100 }) });

  const parse = useMutation({ mutationFn: () => queriesApi.parse({ expression: form.expression, aliases: form.aliases, universe: form.universe, implicit_and: false }), onError: (reason) => setError(problemMessage(reason)) });
  const preview = useMutation({ mutationFn: () => queriesApi.preview({ expression: form.expression, aliases: form.aliases, universe: form.universe, page: 1, page_size: 50, sort: 'english_asc' }), onError: (reason) => setError(problemMessage(reason)) });
  const saveMutation = useMutation({
    mutationFn: () => editing ? queriesApi.update(editing.id, editing.version, form) : queriesApi.create(form),
    onSuccess: (result) => { setEditing(result); setMessage('Đã lưu Boolean Query.'); setError(''); queryClient.invalidateQueries({ queryKey: ['saved-queries'] }); },
    onError: (reason) => setError(problemMessage(reason))
  });
  const deleteMutation = useMutation({
    mutationFn: (item: SavedQuery) => queriesApi.remove(item.id, item.version),
    onSuccess: () => { if (editing) { setEditing(null); setForm(blankWrite()); } queryClient.invalidateQueries({ queryKey: ['saved-queries'] }); },
    onError: (reason) => setError(problemMessage(reason))
  });

  const currentNode = useMemo(() => nodes.data?.matches.find((node) => node.id === selectedNode), [nodes.data, selectedNode]);

  function addAlias() {
    if (!currentNode || !aliasName.trim()) return;
    const alias = aliasName.trim().toUpperCase();
    if (form.aliases.some((item) => item.alias.toUpperCase() === alias)) { setError(`Alias ${alias} đã tồn tại.`); return; }
    setForm((value) => ({ ...value, aliases: [...value.aliases, { alias, topic_node_id: currentNode.id, topic_display_name: currentNode.path_text }] }));
    setAliasName(String.fromCharCode(65 + Math.min(form.aliases.length + 1, 25)));
    setError('');
  }

  async function editSaved(item: SavedQuery) {
    try {
      const loaded = await queriesApi.get(item.id);
      setEditing(loaded);
      setForm({ display_name: loaded.display_name, mode: loaded.mode, visibility: loaded.visibility, expression: loaded.expression, aliases: loaded.aliases, universe: loaded.universe });
      setMessage(''); setError('');
    } catch (reason) {
      setError(problemMessage(reason));
    }
  }

  return <div><div className="page-title"><div><h1>Boolean Query Builder</h1><p>Kết hợp nhiều Topic Node bằng AND, OR, NOT và lưu thành nguồn học.</p></div><Button variant="secondary" onClick={() => { setEditing(null); setForm(blankWrite()); }}>Query mới</Button></div>{message && <InlineNotice tone="success">{message}</InlineNotice>}{error && <InlineNotice tone="error">{error}</InlineNotice>}<div className="query-layout"><section className="panel query-editor"><div className="section-head"><div><h2>{editing ? `Chỉnh sửa: ${editing.display_name}` : 'Tạo Query'}</h2><p>Alias phải bắt đầu bằng chữ hoặc dấu gạch dưới.</p></div></div><div className="form-grid"><Input label="Tên Query" value={form.display_name} onChange={(event) => setForm({ ...form, display_name: event.target.value })} /><Select label="Chế độ" value={form.mode} onChange={(event) => setForm({ ...form, mode: event.target.value as QueryWrite['mode'] })}><option value="DYNAMIC">Dynamic</option><option value="SNAPSHOT">Snapshot</option></Select><Select label="Hiển thị" value={form.visibility} onChange={(event) => setForm({ ...form, visibility: event.target.value as QueryWrite['visibility'] })}><option value="PRIVATE">Private</option><option value="PUBLISHED">Published</option></Select><Select label="Universe" value={form.universe} onChange={(event) => setForm({ ...form, universe: event.target.value as QueryWrite['universe'] })}><option value="ALIASES_UNION">Aliases union</option><option value="ALL_ACCESSIBLE">All accessible</option></Select></div><TextArea label="Biểu thức" rows={4} value={form.expression} onChange={(event) => setForm({ ...form, expression: event.target.value })} /><div className="alias-builder"><Select label="Topic Tree" value={selectedTree} onChange={(event) => { setSelectedTree(event.target.value); setSelectedNode(''); }}><option value="">Chọn cây</option>{trees.data?.items.map((tree) => <option key={tree.id} value={tree.id}>{tree.display_name}</option>)}</Select><Select label="Topic Node" value={selectedNode} onChange={(event) => setSelectedNode(event.target.value)} disabled={!selectedTree}><option value="">Chọn node</option>{nodes.data?.matches.map((node) => <option key={node.id} value={node.id}>{node.path_text} ({node.node_type})</option>)}</Select><Input label="Alias" value={aliasName} maxLength={20} onChange={(event) => setAliasName(event.target.value)} /><Button type="button" onClick={addAlias} disabled={!currentNode}>Thêm alias</Button></div><div className="alias-list">{form.aliases.map((alias) => <article key={alias.alias}><Badge tone="info">{alias.alias}</Badge><div><strong>{alias.topic_display_name}</strong><small>{alias.topic_node_id}</small></div><button type="button" className="icon-button" onClick={() => setForm({ ...form, aliases: form.aliases.filter((item) => item.alias !== alias.alias) })}>×</button></article>)}</div><div className="modal-actions query-actions"><Button variant="secondary" onClick={() => parse.mutate()} disabled={!form.expression || !form.aliases.length}>Parse</Button><Button variant="secondary" onClick={() => preview.mutate()} disabled={!form.expression || !form.aliases.length}>Preview</Button><Button onClick={() => saveMutation.mutate()} disabled={!form.display_name || !form.aliases.length || saveMutation.isPending}>Lưu Query</Button></div>{parse.data && <section className="query-result"><h3>Parse result <Badge tone={parse.data.valid ? 'success' : 'danger'}>{parse.data.valid ? 'VALID' : 'INVALID'}</Badge></h3><p>{parse.data.normalized_expression}</p>{parse.data.errors.map((item) => <div className="notice error" key={`${item.code}-${item.message}`}>{item.code}: {item.message}</div>)}<pre className="json-block">{JSON.stringify(parse.data.ast, null, 2)}</pre></section>}{preview.data && <section className="query-result"><h3>Preview: {preview.data.result_count} từ</h3><div className="compact-vocab-list">{preview.data.items.map((item) => <div key={item.id}><strong>{item.english}</strong><span>{item.vietnamese}</span><small>{item.part_of_speech}</small></div>)}</div></section>}</section><aside className="panel saved-panel"><h2>Query đã lưu</h2>{saved.data?.items.length ? <div className="saved-list">{saved.data.items.map((item) => <article key={item.id} className={editing?.id === item.id ? 'active' : ''}><button type="button" onClick={() => void editSaved(item)}><strong>{item.display_name}</strong><span>{item.expression}</span><small>{item.result_count} từ · v{item.version}</small></button><button type="button" className="danger-link" onClick={() => { if (window.confirm(`Xóa ${item.display_name}?`)) deleteMutation.mutate(item); }}>Xóa</button></article>)}</div> : <EmptyState title="Chưa có Saved Query" description="Tạo query đầu tiên ở bảng bên trái." />}</aside></div></div>;
}
