import { useAuth } from '../../context/AuthContext';

export default function AdminPiketDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-dash">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-dashCard border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-dashNavy">Dashboard Admin Piket</h1>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition text-sm font-medium"
          >
            Logout
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">Selamat datang, <span className="font-semibold text-dashNavy">{user?.full_name || 'Admin Piket'}</span>!</p>
          <p className="text-sm text-gray-500">Halaman ini akan memuat form untuk mengatur Timeline harian, memantau absensi piket prajurit, dan mengisi data proker.</p>
        </div>
      </div>
    </div>
  );
}
