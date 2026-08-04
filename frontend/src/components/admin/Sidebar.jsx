import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const menu = [
  { label: 'Dashboard', to: '/admin-portal/dashboard', icon: '📊' },
  { label: 'Berita', to: '/admin-portal/berita', icon: '📰' },
  { label: 'Produk', to: '/admin-portal/produk', icon: '📦' },
  { label: 'Galeri', to: '/admin-portal/galeri', icon: '🖼️' },
  { label: 'FAQ', to: '/admin-portal/faq', icon: '❓' },
  { label: 'Kotak Masuk', to: '/admin-portal/kotak-masuk', icon: '✉️' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.get('/messages', { params: { limit: 1 } }).then((r) => setUnread(r.data.unreadCount)).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin-portal/login');
  };

  return (
    <aside className={`bg-navy text-white flex flex-col fixed inset-y-0 left-0 z-40 transition-all ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!collapsed && <span className="font-bold tracking-wide text-sm">DUKTEKSI ADMIN</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-white/70 hover:text-gold">☰</button>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {menu.map((m) => (
          <NavLink
            key={m.to}
            to={m.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm ${
                isActive ? 'bg-steel text-gold font-semibold' : 'text-white/80 hover:bg-steel/50'
              }`
            }
          >
            <span>{m.icon}</span>
            {!collapsed && (
              <span className="flex-1">
                {m.label}
                {m.to.includes('kotak-masuk') && unread > 0 && (
                  <span className="ml-2 bg-gold text-navy text-xs px-1.5 py-0.5 rounded-full">{unread}</span>
                )}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <button onClick={handleLogout} className="m-3 px-4 py-2 text-sm bg-steel rounded-md hover:bg-steel/70">
        {collapsed ? '⏻' : 'Logout'}
      </button>
    </aside>
  );
}
