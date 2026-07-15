import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { user, logout } = useAuth();
  return <header className="app-header"><div><strong>Xin chào, {user?.display_name}</strong><span>Frontend demo đang sử dụng API backend thật.</span></div><div className="header-actions"><Link className="icon-button profile-link" to="/system" aria-label="Trạng thái backend">◉</Link><Link className="avatar" to="/profile" aria-label="Hồ sơ">{user?.display_name?.slice(0, 1).toUpperCase()}</Link><button className="logout" onClick={() => logout()}>Đăng xuất</button></div></header>;
}
