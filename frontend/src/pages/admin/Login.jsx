import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
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
      const data = await login(identifier, password);
      if (data.user.role === 'admin') {
        navigate('/admin-portal/dashboard');
      } else {
        navigate('/soldier/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa kembali kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-dash flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-dashCard border border-gray-200 w-full max-w-sm p-8">
        <div className="w-11 h-11 rounded-lg bg-dashNavy flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-[20px] font-semibold text-dashNavy text-center mb-1">Login Portal</h1>
        <p className="text-xs text-dashNavy/60 text-center mb-6">Satlak Dukteksi Pussiberad TNI AD</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-dashNavy">Username / Email</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 mt-1 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-dashNavy">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 mt-1 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
            />
          </div>

          {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy text-white rounded-md py-2.5 text-sm font-semibold hover:brightness-95 disabled:opacity-60 transition"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
