import { useEffect, useState } from 'react';
import PageHeader from '../../components/public/PageHeader';
import api from '../../services/api';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api.get('/galleries', { params: { limit: 100 } }).then((r) => setPhotos(r.data.data)).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Galeri" subtitle="Dokumentasi kegiatan Satlak Dukteksi." />
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.length === 0 && <p className="text-sm text-inktext/60 col-span-full">Belum ada foto.</p>}
          {photos.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              className="group relative rounded-md overflow-hidden aspect-square"
            >
              <img src={p.image} alt={p.description} className="w-full h-full object-cover group-hover:scale-105 transition" />
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setActive(null)}
        >
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={active.image} alt={active.description} className="w-full rounded-md max-h-[75vh] object-contain bg-black" />
            <div className="bg-white rounded-b-md p-4">
              <p className="text-inktext font-medium">{active.description}</p>
              <p className="text-xs text-inktext/60">{active.gallery_date}</p>
            </div>
            <button
              className="mt-3 text-white/80 text-sm underline"
              onClick={() => setActive(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
