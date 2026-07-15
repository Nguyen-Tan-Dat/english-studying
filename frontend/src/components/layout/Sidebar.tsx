import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const links = [
  ['/dashboard', '⌂', 'Hôm nay'],
  ['/trees', '🌳', 'Kho chủ đề'],
  ['/vocabulary', 'Aa', 'Từ vựng'],
  ['/queries', '⌘', 'Boolean Query'],
  ['/library', '⌕', 'Thư viện'],
  ['/study', '▶', 'Luyện tập'],
  ['/operations', '↻', 'Tác vụ'],
  ['/system', '◉', 'Hệ thống']
] as const;

const activeClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '');

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">L</span>
        <span>LexiGo</span>
      </div>
      <nav>
        {links.map(([to, icon, label]) => (
          <NavLink key={to} to={to} className={activeClass}>
            <span>{icon}</span>
            <b>{label}</b>
          </NavLink>
        ))}
        {user?.roles.includes('ADMIN') && (
          <NavLink to="/admin" className={activeClass}>
            <span>⚙</span>
            <b>Quản trị</b>
          </NavLink>
        )}
      </nav>
      <div className="sidebar-note">
        <strong>Full API Demo</strong>
        <span>Frontend đang kết nối trực tiếp backend.</span>
      </div>
    </aside>
  );
}
