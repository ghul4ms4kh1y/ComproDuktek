import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function SoldierDashboard() {
  const { user, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await axios.put(
        `/api/soldiers/profile`,
        { oldPassword, password },
        { withCredentials: true }
      );
      setMessage({ type: 'success', text: 'Password berhasil diperbarui.' });
      setOldPassword('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Gagal memperbarui password.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-dash">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-dashCard border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-dashNavy">Dashboard Prajurit</h1>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition text-sm font-medium"
          >
            Logout
          </button>
        </div>
        
        <div className="space-y-4 mb-8">
          <p className="text-gray-600">Selamat datang, <span className="font-semibold text-dashNavy">{user?.full_name || user?.username}</span>!</p>
          <p className="text-sm text-gray-500">Halaman ini sedang dalam tahap pengembangan (Phase 1). Fitur Profile, Timeline, Attendance, dan Proker akan segera hadir.</p>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-lg font-semibold text-dashNavy mb-4">Ganti Password</h2>
          <form onSubmit={handleUpdatePassword} className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent transition"
              />
            </div>

            {message.text && (
              <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-dashNavy text-white px-4 py-2 rounded-lg hover:bg-dashNavy/90 transition disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Menyimpan...' : 'Simpan Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
