import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import RevealSection from '../../components/common/RevealSection';
import {
  Newspaper,
  Calendar,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';

export default function News() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // State Pagination untuk Arsip Berita (Featured/Archive)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Maksimal 8 item per halaman (2 baris x 4 kolom)

  useEffect(() => {
    setLoading(true);
    // Kirim limit besar agar mengambil seluruh berita untuk dipaginate di client side
    api.get('/news', { params: { limit: 1000 } })
      .then((r) => {
        const rawData = r.data.data || [];
        setNewsList(rawData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal mengambil data berita:", err);
        setLoading(false);
      });
  }, []);

  // Ambil list Kategori Unik dari data berita
  const categories = useMemo(() => {
    const cats = new Set(
      newsList.map((n) => n.category || 'Kegiatan Siber').filter(Boolean)
    );
    return ['Semua', ...Array.from(cats)];
  }, [newsList]);

  // Filter Data berdasarkan Kategori dan Pencarian
  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      const matchCat = selectedCategory === 'Semua' || (item.category || 'Kegiatan Siber') === selectedCategory;
      const matchSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [newsList, selectedCategory, searchQuery]);

  // Split Data untuk Layout
  // 1. Recent Blogs (1 Utama Kiri + 3 Stack Kanan)
  const recentMain = filteredNews[0];
  const recentSub = filteredNews.slice(1, 4);

  // 2. Arsip Berita (Mengambil seluruh berita terfilter)
  const archiveNewsPool = filteredNews;

  // Hitung total halaman berdasarkan 8 item per halaman
  const totalPages = Math.ceil(archiveNewsPool.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedArchive = archiveNewsPool.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll halus ke section arsip saat ganti halaman
      window.scrollTo({ top: 800, behavior: 'smooth' });
    }
  };

  // Helper Estimasi Waktu Baca
  const getReadTime = (content) => {
    if (!content) return '3 min read';
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / 150);
    return `${time || 2} min read`;
  };

  return (
    <div className="bg-white text-inktext min-h-screen pb-20">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 -mt-2 py-10 space-y-16">
        {/* Section Header Judul */}
        <RevealSection className="text-center space-y-3">
          <h1 className="text-3xl md:text-5xl font-extrabold text-navy tracking-tight">
            Berita & Publikasi Kegiatan
          </h1>
          <p className="text-inktext/70 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
            Kumpulan warta terbaru, edukasi siber, publikasi kegiatan operasional, dan pengumuman resmi Satlak Dukteksi PUSSIBERAD.
          </p>

          {/* Search Bar Presisi */}
          <div className="pt-4 max-w-md mx-auto">
            <div className="relative flex items-center w-full h-11 bg-[#f8fafc] border border-gray-200 rounded-full shadow-sm focus-within:border-navy focus-within:bg-white focus-within:ring-1 focus-within:ring-navy transition-all">
              <div className="pl-4 pr-2 flex items-center justify-center text-inktext/40 pointer-events-none shrink-0">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Cari berita atau artikel..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-full bg-transparent pr-4 text-xs md:text-sm font-medium text-navy placeholder:text-inktext/40 focus:outline-none leading-none"
              />
            </div>
          </div>
        </RevealSection>

        {/* 1. Kategori Berita */}
        <RevealSection className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-navy tracking-tight">
              Kategori Berita
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-5 py-2 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-300 border cursor-pointer ${selectedCategory === cat
                    ? 'bg-navy text-white border-navy shadow-md scale-105'
                    : 'bg-[#f8fafc] text-inktext/70 border-gray-200/80 hover:bg-gray-100 hover:text-navy'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </RevealSection>

        {/* 2. Recent Blogs (Berita Utama & Terbaru) */}
        <RevealSection className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight">
              Berita Utama & Terbaru
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6 bg-gray-100 animate-pulse rounded-[2rem] h-[350px]" />
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-gray-100 animate-pulse rounded-2xl h-24" />
                <div className="bg-gray-100 animate-pulse rounded-2xl h-24" />
                <div className="bg-gray-100 animate-pulse rounded-2xl h-24" />
              </div>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="bg-[#f8fafc] border border-dashed border-gray-200 rounded-[2rem] p-12 text-center my-6">
              <Newspaper className="w-10 h-10 text-inktext/40 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-navy">Belum Ada Berita</h3>
              <p className="text-xs text-inktext/60 mt-1">
                Tidak ada publikasi yang cocok dengan kata kunci/kategori ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

              {/* Card Utama Kiri */}
              {recentMain && (
                <div className="lg:col-span-6 group bg-[#f8fafc] border border-gray-100 rounded-[2rem] p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                  <Link to={`/berita/${recentMain.id}`} className="space-y-4 block">
                    <div className="relative overflow-hidden rounded-2xl bg-slate-900 aspect-[16/9] max-h-72 border border-gray-100 shadow-sm">
                      {recentMain.thumbnail ? (
                        <img
                          src={recentMain.thumbnail}
                          alt={recentMain.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-navy flex items-center justify-center">
                          <Newspaper className="w-10 h-10 text-white/30" />
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        <span className="text-[11px] font-bold bg-white/95 text-navy px-3 py-1 rounded-xl uppercase tracking-wider shadow-sm">
                          {recentMain.category || 'Kegiatan Siber'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg md:text-xl font-bold text-navy group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                        {recentMain.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs font-medium text-inktext/60 pt-0.5">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-navy" />
                          {recentMain.news_date || 'Terbaru'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-navy" />
                          {getReadTime(recentMain.content)}
                        </span>
                      </div>

                      <p className="text-inktext/70 text-xs md:text-sm line-clamp-2 leading-relaxed pt-1">
                        {recentMain.content?.replace(/<[^>]*>?/gm, '') || 'Ulasan singkat informasi publikasi kegiatan operasional siber.'}
                      </p>
                    </div>
                  </Link>

                  <div className="pt-4 mt-2 border-t border-gray-200/60 flex items-center justify-between text-xs font-bold text-navy group-hover:text-blue-600">
                    <span>Baca Berita Utama</span>
                    <div className="w-7 h-7 rounded-full bg-white group-hover:bg-blue-50 flex items-center justify-center transition-colors shadow-sm">
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* 3 Sub-Cards Kanan */}
              <div className="lg:col-span-6 flex flex-col gap-4 justify-between">
                {recentSub.map((item) => (
                  <Link
                    key={item.id}
                    to={`/berita/${item.id}`}
                    className="group bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4 h-full"
                  >
                    <div className="w-28 sm:w-32 h-24 shrink-0 overflow-hidden rounded-xl bg-slate-900 relative">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-navy flex items-center justify-center">
                          <Newspaper className="w-6 h-6 text-white/30" />
                        </div>
                      )}

                      <div className="absolute top-1.5 left-1.5">
                        <span className="text-[9px] font-bold bg-white/90 text-navy px-2 py-0.5 rounded-md uppercase">
                          {item.category || 'Siber'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between h-full py-0.5 flex-1 min-w-0">
                      <div>
                        <h4 className="font-bold text-sm text-navy group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h4>

                        <div className="flex items-center gap-2.5 text-[11px] font-medium text-inktext/50 mt-1.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-navy" />
                            {item.news_date}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-navy" />
                            {getReadTime(item.content)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-navy group-hover:text-blue-600">
                        <span>Selengkapnya</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}

                {recentSub.length === 0 && (
                  <div className="bg-[#f8fafc] border border-dashed border-gray-200 rounded-2xl p-6 text-center flex items-center justify-center h-full">
                    <p className="text-xs text-inktext/60">Tidak ada berita tambahan di bagian ini.</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </RevealSection>

        {/* 3. Arsip Berita (Grid 4 Kolom dengan Pagination Maksimal 8 Item) */}
        <RevealSection className="space-y-8 pt-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight">
                Arsip Berita & Artikel
              </h2>
              <p className="text-inktext/60 text-xs md:text-sm mt-0.5">
                Menampilkan seluruh dokumentasi artikel dan kegiatan publikasi satuan.
              </p>
            </div>

            <div className="text-xs font-semibold text-navy bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl w-fit shrink-0">
              {archiveNewsPool.length} Total Berita
            </div>
          </div>

          {/* Grid 4 Kolom (Maksimal 8 Card Per Halaman) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedArchive.map((item) => (
              <Link
                key={item.id}
                to={`/berita/${item.id}`}
                className="group bg-[#f8fafc] border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative overflow-hidden rounded-xl mb-4 h-44 bg-slate-900">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 to-navy flex items-center justify-center">
                        <Newspaper className="w-8 h-8 text-white/30" />
                      </div>
                    )}

                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold bg-white/95 text-navy px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                        {item.category || 'Siber'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm md:text-base text-navy group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2.5 text-[11px] font-medium text-inktext/50 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-navy" />
                      {item.news_date || 'Terbaru'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-navy" />
                      {getReadTime(item.content)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs font-semibold text-navy group-hover:text-blue-600">
                  <span>Baca Selengkapnya</span>
                  <div className="w-6 h-6 rounded-full bg-white group-hover:bg-blue-50 flex items-center justify-center transition-colors shadow-sm">
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Kontrol Pagination (Muncul jika total data > 8 / totalPages > 1) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-gray-200 bg-white text-navy hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                aria-label="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === page
                        ? 'bg-navy text-white shadow-md scale-105'
                        : 'bg-gray-100 text-inktext/70 hover:bg-gray-200'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-gray-200 bg-white text-navy hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                aria-label="Halaman Selanjutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </RevealSection>

      </div>
    </div>
  );
}