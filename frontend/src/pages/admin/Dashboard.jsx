import { useEffect, useState } from 'react';
import api from '../../services/api';

const widgets = [
  { key: 'totalNews', label: 'Total Berita', icon: '📰' },
  { key: 'totalProducts', label: 'Total Produk', icon: '📦' },
  { key: 'totalGalleries', label: 'Total Foto Galeri', icon: '🖼️' },
  { key: 'unreadMessages', label: 'Pesan Belum Dibaca', icon: '✉️', accent: true },
];

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/summary').then((r) => setData(r.data.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-6">Ringkasan Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {widgets.map((w) => (
          <div
            key={w.key}
            className={`card ${w.accent && data?.[w.key] > 0 ? 'border-gold border-2' : ''}`}
          >
            <div className="text-2xl mb-2">{w.icon}</div>
            <p className="text-3xl font-bold text-navy">{data ? data[w.key] : '—'}</p>
            <p className="text-sm text-inktext/70">{w.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
