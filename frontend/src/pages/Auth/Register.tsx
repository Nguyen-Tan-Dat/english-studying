import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { problemMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { await register(email, password, displayName); navigate('/dashboard', { replace: true }); }
    catch (reason) { setError(problemMessage(reason)); }
    finally { setBusy(false); }
  }

  return <div className="auth-page"><section className="auth-brand"><div className="brand"><span className="brand-mark">L</span><span>LexiGo</span></div><div><span className="eyebrow">Bắt đầu miễn phí</span><h1>Tạo kho từ vựng theo cách bạn suy nghĩ.</h1><p>Tạo cây chủ đề, cộng tác, nhập Excel, xuất bản và luyện tập trong cùng một hệ thống.</p></div><div className="auth-visual"><span>🌳</span><strong>Topic Tree</strong><small>Tổ chức · Học · Chia sẻ</small></div></section><section className="auth-form"><form onSubmit={submit}><h2>Tạo tài khoản</h2><p>Điền thông tin để bắt đầu.</p>{error && <div className="notice error">⚠ {error}</div>}<Input label="Tên hiển thị" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /><Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /><Input label="Mật khẩu" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /><Button disabled={busy} type="submit">{busy ? 'Đang tạo…' : 'Đăng ký'}</Button><p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p></form></section></div>;
}
