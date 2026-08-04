import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { admin } = useAuth();

  return (
    <div className="min-h-screen bg-panel">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`transition-all ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <header className="h-16 bg-white border-b border-panel flex items-center justify-end px-6">
          <span className="text-sm text-inktext/80">Masuk sebagai <strong>{admin?.full_name}</strong></span>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
