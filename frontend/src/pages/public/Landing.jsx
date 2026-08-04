import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import FaqAccordion from '../../components/public/FaqAccordion';

const highlights = [
  { title: 'Pertahanan Siber', desc: 'Mendukung kesiapan pertahanan siber TNI AD secara profesional.' },
  { title: 'Inovasi Teknologi', desc: 'Mengembangkan produk dan riset teknologi siber terapan.' },
  { title: 'Layanan Terpadu', desc: 'Kanal informasi dan komunikasi resmi bagi publik dan instansi.' },
];

export default function Landing() {
  const [news, setNews] = useState([]);
  const [products, setProducts] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    api.get('/news', { params: { limit: 3 } }).then((r) => setNews(r.data.data)).catch(() => {});
    api.get('/products', { params: { limit: 3 } }).then((r) => setProducts(r.data.data)).catch(() => {});
    api.get('/faqs', { params: { limit: 10 } }).then((r) => setFaqs(r.data.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-gold font-semibold tracking-widest mb-3 text-sm">PUSSIBERAD TNI AD</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Satlak Dukungan Teknologi Siber</h1>
          <p className="max-w-2xl mx-auto text-white/80">
            Menghadirkan kredibilitas dan kesiapan pertahanan siber melalui inovasi, transparansi informasi,
            dan layanan yang profesional.
          </p>
        </div>
      </section>

      {/* Highlight */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="section-title">Sekilas Dukteksi</h2>
        <div className="section-divider" />
        <div className="grid md:grid-cols-3 gap-6">
          {highlights.map((h) => (
            <div key={h.title} className="card">
              <h3 className="font-semibold text-navy mb-1">{h.title}</h3>
              <p className="text-sm text-inktext/80">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preview Berita */}
      <section className="bg-panel">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="section-title mb-0">Berita Terbaru</h2>
              <div className="section-divider" />
            </div>
            <Link to="/berita" className="text-navy font-medium hover:text-gold text-sm">Lihat semua →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {news.length === 0 && <p className="text-sm text-inktext/60">Belum ada berita.</p>}
            {news.map((n) => (
              <Link to={`/berita/${n.id}`} key={n.id} className="card hover:shadow-md transition">
                {n.thumbnail && <img src={n.thumbnail} alt={n.title} className="rounded-md mb-3 h-40 w-full object-cover" />}
                <h3 className="font-semibold text-navy line-clamp-2">{n.title}</h3>
                <p className="text-xs text-inktext/60 mt-1">{n.news_date}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Produk */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="section-title mb-0">Produk Unggulan</h2>
            <div className="section-divider" />
          </div>
          <Link to="/produk" className="text-navy font-medium hover:text-gold text-sm">Lihat semua →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {products.length === 0 && <p className="text-sm text-inktext/60">Belum ada produk.</p>}
          {products.map((p) => (
            <div key={p.id} className="card">
              {p.image && <img src={p.image} alt={p.name} className="rounded-md mb-3 h-40 w-full object-cover" />}
              <h3 className="font-semibold text-navy">{p.name}</h3>
              <span className="inline-block text-xs bg-gold/20 text-navy px-2 py-0.5 rounded mt-1">{p.status}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ - sebelum footer */}
      <section className="bg-panel">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <h2 className="section-title">Pertanyaan Umum</h2>
          <div className="section-divider" />
          <div className="max-w-3xl">
            <FaqAccordion faqs={faqs} />
          </div>
        </div>
      </section>
    </div>
  );
}
