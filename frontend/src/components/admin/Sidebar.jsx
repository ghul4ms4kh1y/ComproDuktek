import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Newspaper,
  Package,
  Images,
  Network,
  HelpCircle,
  Mail,
  Menu,
  LogOut,
  Power,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const menu = [
  { label: 'Dashboard', to: '/admin-portal/dashboard', icon: LayoutDashboard },
  { label: 'Berita', to: '/admin-portal/berita', icon: Newspaper },
  { label: 'Produk', to: '/admin-portal/produk', icon: Package },
  { label: 'Galeri', to: '/admin-portal/galeri', icon: Images },
  { label: 'Struktur Organisasi', to: '/admin-portal/struktur-organisasi', icon: Network },
  { label: 'FAQ', to: '/admin-portal/faq', icon: HelpCircle },
  { label: 'Kotak Masuk', to: '/admin-portal/kotak-masuk', icon: Mail },
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
    <aside
      className={`bg-dashNavy text-white flex flex-col fixed inset-y-0 left-0 z-40 transition-all duration-200 font-dash ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!collapsed && <span className="font-semibold tracking-wide text-sm">DUKTEKSI ADMIN</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-white/70 hover:text-dashAccent transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {menu.map((m) => {
          const Icon = m.icon;
          return (
            <NavLink
              key={m.to}
              to={m.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-dashAccent/15 text-white font-semibold border-r-2 border-dashAccent' : 'text-white/75 hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <span className="flex-1">
                  {m.label}
                  {m.to.includes('kotak-masuk') && unread > 0 && (
                    <span className="ml-2 bg-dashAccent text-white text-xs px-1.5 py-0.5 rounded-full">{unread}</span>
                  )}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="m-3 flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-md bg-white/5 border border-white/10 hover:bg-white/10 hover:border-dashAccent/50 transition-colors"
      >
        {collapsed ? <Power className="w-4 h-4" /> : (<><LogOut className="w-4 h-4" /> Logout</>)}
      </button>
    </aside>
  );
}
