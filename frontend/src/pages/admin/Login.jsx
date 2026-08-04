import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/admin-portal/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa kembali kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-8">
        <h1 className="text-xl font-bold text-navy text-center mb-1">Dashboard Admin</h1>
        <p className="text-xs text-inktext/60 text-center mb-6">Satlak Dukteksi Pussiberad TNI AD</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-navy">Username / Email</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border border-panel rounded-md px-3 py-2 mt-1 text-sm"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-navy">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-panel rounded-md px-3 py-2 mt-1 text-sm"
            />
          </div>

          {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
