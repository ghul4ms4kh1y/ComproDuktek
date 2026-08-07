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
      <h1 className="text-[20px] font-semibold text-dashNavy mb-6">Ringkasan Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {widgets.map((w) => {
          const Icon = w.icon;
          const isAlert = w.accent && data?.[w.key] > 0;
          return (
            <div
              key={w.key}
              className={`bg-white rounded-lg border p-5 shadow-dashCard transition ${
                isAlert ? 'border-dashAccent' : 'border-gray-200'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-md flex items-center justify-center mb-3 ${
                  isAlert ? 'bg-dashAccent/10' : 'bg-dashNavy/5'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${isAlert ? 'text-dashAccent' : 'text-dashNavy'}`} />
              </div>
              <p className="text-3xl font-semibold text-dashNavy">{data ? data[w.key] : '—'}</p>
              <p className="text-sm text-dashNavy/60 mt-1">{w.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
