import { useEffect, useState } from 'react';
import { Newspaper, Package, Images, Mail } from 'lucide-react';
import api from '../../services/api';

const widgets = [
  { key: 'totalNews', label: 'Total Berita', icon: Newspaper },
  { key: 'totalProducts', label: 'Total Produk', icon: Package },
  { key: 'totalGalleries', label: 'Total Foto Galeri', icon: Images },
  { key: 'unreadMessages', label: 'Pesan Belum Dibaca', icon: Mail, accent: true },
];

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setData(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="font-dash">
      <h1 className="text-2xl font-bold text-navy mb-6">Ringkasan Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets.map((w) => {
          const Icon = w.icon;
          const isAlert = w.accent && data?.[w.key] > 0;
          return (
            <div
              key={w.key}
              className={`bg-white rounded-xl border p-6 shadow-md hover:shadow-lg transition-all duration-300 ${
                isAlert ? 'border-gold' : 'border-gray-200'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                  isAlert ? 'bg-gold/20' : 'bg-navy/10'
                }`}
              >
                <Icon className={`w-5 h-5 ${isAlert ? 'text-gold' : 'text-navy'}`} />
              </div>
              <p className="text-3xl font-bold text-navy">{data ? data[w.key] : '—'}</p>
              <p className="text-sm text-navy/70 mt-2">{w.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
