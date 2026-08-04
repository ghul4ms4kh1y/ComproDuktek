import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/public/PageHeader';
import api from '../../services/api';

export default function News() {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');

  useEffect(() => {
    api
      .get('/news', { params: { page, limit: 6, q: q || undefined } })
      .then((r) => {
        setNews(r.data.data);
        setTotalPages(r.data.pagination.totalPages || 1);
      })
      .catch(() => {});
  }, [page, q]);

  return (
    <div>
      <PageHeader title="Berita" subtitle="Berita dan pengumuman resmi Satlak Dukteksi." />
      <div className="max-w-7xl mx-auto px-4 py-14">
        <input
          type="text"
          placeholder="Cari berita berdasarkan judul..."
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
          className="border border-panel rounded-md px-3 py-2 text-sm w-full max-w-sm mb-8"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.length === 0 && <p className="text-sm text-inktext/60 col-span-full">Tidak ada berita ditemukan.</p>}
          {news.map((n) => (
            <Link to={`/berita/${n.id}`} key={n.id} className="card hover:shadow-md transition">
              {n.thumbnail && <img src={n.thumbnail} alt={n.title} className="rounded-md mb-3 h-40 w-full object-cover" />}
              <h3 className="font-semibold text-navy line-clamp-2">{n.title}</h3>
              <p className="text-xs text-inktext/60 mt-1">{n.news_date}</p>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex gap-2 justify-center mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-md text-sm ${p === page ? 'bg-navy text-white' : 'bg-panel text-navy'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
