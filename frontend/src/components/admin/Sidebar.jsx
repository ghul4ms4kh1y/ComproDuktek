import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, LogOut, Power } from 'lucide-react';
import { adminMenu as menu } from './adminMenu';
import { useAuth } from '../../context/AuthContext';

// Sidebar khusus layar >=lg (desktop/laptop). Di layar lebih kecil,
// komponen ini disembunyikan total lewat "hidden lg:flex" — navigasi
// mobile digantikan oleh <BottomNav /> yang menempel di bawah layar.
export default function Sidebar({ collapsed, setCollapsed, unread }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin-portal/login');
  };

  return (
    <aside
      className={`hidden lg:flex bg-navy text-white flex-col fixed inset-y-0 left-0 z-40 transition-all duration-200 font-dash ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/20">
        {!collapsed && <span className="font-semibold tracking-wide text-sm">DUKTEKSI ADMIN</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-white hover:bg-white/10 p-1.5 rounded transition-colors">
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
                  isActive ? 'bg-gray-600 text-white font-semibold border-r-4 border-blue-600' : 'text-white/90 hover:bg-white/10'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <span className="flex-1">
                  {m.label}
                  {m.to.includes('kotak-masuk') && unread > 0 && (
                    <span className="ml-2 bg-gold text-navy text-xs px-1.5 py-0.5 rounded-full font-semibold">{unread}</span>
                  )}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className={`flex items-center justify-center gap-2 text-sm rounded-md bg-white/10 border border-white/20 hover:bg-white/20 hover:border-blue-600 transition-colors font-medium ${
          collapsed ? 'mx-auto my-4 p-2.5' : 'm-4 px-4 py-2.5'
        }`}
      >
        {collapsed ? <Power className="w-4 h-4 shrink-0" /> : (<><LogOut className="w-4 h-4 shrink-0" /> Logout</>)}
      </button>
    </aside>
  );
}