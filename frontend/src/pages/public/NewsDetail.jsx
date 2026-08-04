import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

export default function NewsDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get(`/news/${id}`)
      .then((r) => setItem(r.data.data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-inktext/70">Berita tidak ditemukan.</p>
        <Link to="/berita" className="text-navy underline text-sm">Kembali ke daftar berita</Link>
      </div>
    );
  }

  if (!item) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-inktext/50">Memuat...</div>;

  return (
    <article className="max-w-3xl mx-auto px-4 py-14">
      <Link to="/berita" className="text-sm text-navy hover:text-gold">← Kembali ke Berita</Link>
      <h1 className="text-2xl md:text-3xl font-bold text-navy mt-4 mb-2">{item.title}</h1>
      <p className="text-sm text-inktext/60 mb-6">{item.news_date}</p>
      {item.thumbnail && <img src={item.thumbnail} alt={item.title} className="rounded-lg w-full max-h-96 object-cover mb-6" />}
      <div className="prose prose-sm max-w-none text-inktext/90 whitespace-pre-line leading-relaxed">
        {item.content}
      </div>
    </article>
  );
}
