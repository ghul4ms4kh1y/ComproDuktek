import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import Sidebar from '../components/admin/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { admin } = useAuth();

  return (
    <div className="min-h-screen bg-panel font-dash">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`transition-all duration-200 min-h-screen flex flex-col ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-2 sticky top-0 z-30">
          <UserCircle className="w-5 h-5 text-navy/60" />
          <span className="text-sm text-navy/70">
            <strong className="text-navy font-semibold">{admin?.full_name}</strong>
          </span>
        </header>
        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
