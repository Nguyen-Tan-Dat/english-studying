import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { operationsApi } from '../../api/endpoints/operations.api';
import { problemMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { InlineNotice } from '../../components/common/FormControls';

export default function Operations() {
  const [input, setInput] = useState(() => localStorage.getItem('lexigo:last-operation') ?? '');
  const [operationId, setOperationId] = useState(input);
  const query = useQuery({ queryKey: ['operation', operationId], queryFn: () => operationsApi.get(operationId), enabled: Boolean(operationId), refetchInterval: (current) => ['QUEUED', 'RUNNING'].includes(current.state.data?.status ?? '') ? 1000 : false, retry: false });
  function submit(event: FormEvent) { event.preventDefault(); localStorage.setItem('lexigo:last-operation', input); setOperationId(input.trim()); }
  const operation = query.data;
  return <div><div className="page-title"><div><h1>Tác vụ bất đồng bộ</h1><p>Theo dõi clone, import và pronunciation operation bằng Operation ID.</p></div></div><form className="toolbar operation-search" onSubmit={submit}><Input placeholder="Nhập Operation ID" value={input} onChange={(event) => setInput(event.target.value)} /><Button type="submit" disabled={!input.trim()}>Kiểm tra</Button></form>{query.error && <InlineNotice tone="error">{problemMessage(query.error)}</InlineNotice>}{operation && <section className="panel operation-card"><div className="operation-head"><div><span className="eyebrow">{operation.type}</span><h2>{operation.id}</h2></div><Badge tone={operation.status === 'SUCCEEDED' ? 'success' : operation.status === 'FAILED' ? 'danger' : 'warning'}>{operation.status}</Badge></div><div className="progress-track"><span style={{ width: `${operation.progress_percent}%` }} /></div><dl className="detail-list"><div><dt>Tiến độ</dt><dd>{operation.progress_percent}%</dd></div><div><dt>Tạo lúc</dt><dd>{new Date(operation.created_at).toLocaleString('vi-VN')}</dd></div><div><dt>Hoàn tất</dt><dd>{operation.completed_at ? new Date(operation.completed_at).toLocaleString('vi-VN') : 'Chưa hoàn tất'}</dd></div></dl><h3>Kết quả</h3><pre className="json-block">{JSON.stringify(operation.result ?? operation.error, null, 2)}</pre></section>}</div>;
}
