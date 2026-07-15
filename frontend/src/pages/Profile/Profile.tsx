import { useState, type FormEvent } from 'react';
import { problemMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { InlineNotice } from '../../components/common/FormControls';
import { useAuth } from '../../hooks/useAuth';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault(); setMessage(''); setError('');
    try { await updateProfile({ display_name: displayName, avatar_url: avatarUrl || null }); setMessage('Đã cập nhật hồ sơ.'); }
    catch (reason) { setError(problemMessage(reason)); }
  }

  return <div><div className="page-title"><div><h1>Hồ sơ</h1><p>Quản lý thông tin tài khoản và vai trò hệ thống.</p></div></div><div className="settings-grid"><form className="panel" onSubmit={submit}><h2>Thông tin cá nhân</h2>{message && <InlineNotice tone="success">{message}</InlineNotice>}{error && <InlineNotice tone="error">{error}</InlineNotice>}<Input label="Tên hiển thị" value={displayName} onChange={(event) => setDisplayName(event.target.value)} /><Input label="Avatar URL" type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} /><Button type="submit">Lưu thay đổi</Button></form><section className="panel"><h2>Tài khoản</h2><dl className="detail-list"><div><dt>Email</dt><dd>{user?.email}</dd></div><div><dt>Vai trò</dt><dd>{user?.roles.join(', ')}</dd></div><div><dt>Xác minh email</dt><dd>{user?.email_verified ? 'Đã xác minh' : 'Chưa xác minh'}</dd></div><div><dt>Ngày tạo</dt><dd>{user?.created_at ? new Date(user.created_at).toLocaleString('vi-VN') : ''}</dd></div></dl></section></div></div>;
}
