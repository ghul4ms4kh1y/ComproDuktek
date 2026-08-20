import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import Sidebar from '../components/admin/Sidebar';
import BottomNav from '../components/admin/BottomNav';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [unread, setUnread] = useState(0);
  const { user } = useAuth();

  // Diangkat ke sini (bukan di dalam Sidebar) supaya Sidebar (desktop)
  // dan BottomNav (mobile/tablet) bisa berbagi data yang sama tanpa
  // masing-masing memanggil API secara terpisah.
  useEffect(() => {
    api.get('/messages', { params: { limit: 1 } }).then((r) => setUnread(r.data.unreadCount)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-panel font-dash">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} unread={unread} />
      <div className={`transition-all duration-200 min-h-screen flex flex-col ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-4 sm:px-6 gap-2 sticky top-0 z-30">
          <UserCircle className="w-5 h-5 text-navy/60 shrink-0" />
          <span className="text-sm text-navy/70 truncate">
            <strong className="text-navy font-semibold">{user?.full_name}</strong>
          </span>
        </header>
        {/* pb-20: beri jarak di bawah supaya konten tidak ketutup BottomNav di layar <lg */}
        <main className="p-4 sm:p-6 pb-20 lg:pb-6 flex-1">
          <Outlet />
        </main>
      </div>
      <BottomNav unread={unread} />
    </div>
  );
}