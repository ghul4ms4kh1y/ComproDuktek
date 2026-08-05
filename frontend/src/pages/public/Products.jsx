import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('Semua');
  const [status, setStatus] = useState('Semua');

  useEffect(() => {
    api.get('/products', { params: { limit: 100 } }).then((r) => setProducts(r.data.data)).catch(() => {});
  }, []);

  const categories = useMemo(
    () => ['Semua', ...new Set(products.map((p) => p.category))],
    [products]
  );
  const statuses = ['Semua', 'Aktif', 'Dalam Pengembangan', 'Nonaktif'];

  const filtered = products.filter(
    (p) => (category === 'Semua' || p.category === category) && (status === 'Semua' || p.status === status)
  );

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex flex-wrap gap-3 mb-8">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-panel rounded-md px-3 py-2 text-sm">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-panel rounded-md px-3 py-2 text-sm">
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 && <p className="text-sm text-inktext/60">Belum ada produk yang sesuai.</p>}
          {filtered.map((p) => (
            <div key={p.id} className="card">
              {p.image && <img src={p.image} alt={p.name} className="rounded-md mb-3 h-40 w-full object-cover" />}
              <h3 className="font-semibold text-navy">{p.name}</h3>
              <p className="text-xs text-inktext/60 mb-2">{p.category} • {p.unit_pengampu}</p>
              <span className="inline-block text-xs bg-gold/20 text-navy px-2 py-0.5 rounded">{p.status}</span>
              {p.description && <p className="text-sm text-inktext/80 mt-3">{p.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
