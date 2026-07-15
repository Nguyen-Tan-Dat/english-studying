import { useMutation } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { collaborationApi } from '../../api/endpoints/collaboration.api';
import { problemMessage } from '../../api/client';
import { Button } from '../../components/common/Button';

export default function AcceptInvitation() {
  const { token = '' } = useParams();
  const accept = useMutation({ mutationFn: () => collaborationApi.accept(token) });
  return <div className="center-card"><div className="study-illustration">🤝</div><h1>Lời mời cộng tác</h1><p>Xác nhận tham gia Topic Tree bằng tài khoản hiện tại.</p>{accept.isError && <div className="notice error">{problemMessage(accept.error)}</div>}{accept.data ? <><div className="notice success">Đã tham gia với quyền {accept.data.role}.</div><Link className="button button-primary" to={`/trees/${accept.data.tree_id}`}>Mở Topic Tree</Link></> : <Button onClick={() => accept.mutate()} disabled={accept.isPending || !token}>{accept.isPending ? 'Đang xác nhận…' : 'Chấp nhận lời mời'}</Button>}</div>;
}
