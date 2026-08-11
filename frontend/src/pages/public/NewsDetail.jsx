import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import RevealSection from '../../components/common/RevealSection';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  Share2,
  Newspaper,
  Check,
  ChevronRight
} from 'lucide-react';

export default function NewsDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    // Fetch detail berita berdasarkan ID
    api
      .get(`/news/${id}`)
      .then((r) => {
        const newsData = r.data.data;
        setItem(newsData);
        setLoading(false);

        // Fetch berita lainnya untuk rekomendasi di bagian bawah
        api.get('/news', { params: { limit: 4 } }).then((res) => {
          const list = res.data.data || [];
          setRelatedNews(list.filter((n) => n.id !== newsData.id).slice(0, 3));
        }).catch(() => { });
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });

    // Reset scroll ke paling atas saat ID berita berubah
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Helper Estimasi Waktu Baca
  const getReadTime = (content) => {
    if (!content) return null;
    const words = content.trim().split(/\s+/).length;
    const time = Math.ceil(words / 150);
    return `${time || 2} min read`;
  };

  // Handler Copy Link Berita
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-6 space-y-6 animate-pulse">
          <div className="w-32 h-6 bg-gray-100 rounded-lg" />
          <div className="w-24 h-5 bg-blue-50 rounded-full" />
          <div className="w-full h-12 bg-gray-100 rounded-2xl" />
          <div className="w-48 h-5 bg-gray-100 rounded-lg" />
          <div className="w-full h-96 bg-gray-100 rounded-[2rem]" />
          <div className="space-y-3 pt-4">
            <div className="w-full h-4 bg-gray-100 rounded" />
            <div className="w-full h-4 bg-gray-100 rounded" />
            <div className="w-3/4 h-4 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="bg-white text-inktext min-h-[70vh] flex items-center justify-center px-6 py-20">
        <div className="bg-[#f8fafc] border border-dashed border-gray-200 rounded-[2.5rem] p-10 md:p-16 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner border border-blue-100">
            <Newspaper className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-navy">Berita Tidak Ditemukan</h2>
          <p className="text-inktext/60 text-xs md:text-sm leading-relaxed">
            Artikel atau publikasi berita yang Anda cari mungkin telah dipindahkan atau tidak lagi tersedia dalam basis data.
          </p>
          <div className="pt-2">
            <Link
              to="/berita"
              className="inline-flex items-center gap-2 bg-navy hover:bg-blue-600 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Pusat Berita</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-inktext min-h-screen pb-20">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-8 space-y-10">

        {/* Breadcrumb Navigation */}
        <RevealSection>
          <div className="flex items-center gap-2 text-xs font-semibold text-inktext/60">
            <Link to="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <Link to="/berita" className="hover:text-blue-600 transition-colors">Berita</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-navy font-bold truncate max-w-[200px] md:max-w-xs">{item.title}</span>
          </div>
        </RevealSection>

        {/* Konten Utama Artikel */}
        <RevealSection className="max-w-4xl mx-auto space-y-8">

          {/* Header Berita */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <Link
                to="/berita"
                className="inline-flex items-center gap-2 text-xs font-bold text-navy hover:text-blue-600 bg-[#f8fafc] hover:bg-blue-50 border border-gray-200/80 px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Berita</span>
              </Link>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
                <Tag className="w-3 h-3" />
                <span>{item.category || 'Kegiatan Siber'}</span>
              </div>
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-navy leading-tight tracking-tight pt-2">
              {item.title}
            </h1>

            {/* Meta Informasi (Tanggal, Waktu Baca, Tombol Bagikan) */}
            <div className="flex items-center justify-between border-y border-gray-100 py-3 text-xs md:text-sm font-medium text-inktext/60 gap-4 flex-wrap">
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-1.5 text-navy font-semibold">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  {item.news_date || 'Terbaru'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-navy" />
                  {getReadTime(item.content)}
                </span>
              </div>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-blue-600 bg-gray-50 hover:bg-gray-100 px-3.5 py-1.5 rounded-lg border border-gray-200 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-600">Tautan Tersalin</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan Artikel</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Gambar Utama (Thumbnail) */}
          <div className="relative rounded-[2rem] overflow-hidden bg-slate-900 border border-gray-100 shadow-md">
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={item.title}
                width="896"
                height="480"
                loading="lazy"
                className="w-full max-h-[480px] object-cover"
              />
            ) : (
              <div className="w-full h-80 bg-gradient-to-br from-slate-900 to-navy flex items-center justify-center text-white/30">
                <Newspaper className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Body Isu & Teks Artikel */}
          <div className="bg-[#f8fafc] border border-gray-100/80 rounded-[2.5rem] p-6 md:p-12 shadow-sm">
            <div className="prose prose-navy max-w-none text-inktext/90 text-sm md:text-base leading-relaxed whitespace-pre-line font-normal space-y-4">
              {item.content}
            </div>
          </div>

        </RevealSection>

        {/* Section Rekomendasi Berita Terkait */}
        {relatedNews.length > 0 && (
          <RevealSection className="max-w-screen-2xl mx-auto pt-10 border-t border-gray-100 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-navy tracking-tight">
                  Berita Terkait Lainnya
                </h2>
                <p className="text-xs md:text-sm text-inktext/60 mt-0.5">
                  Publikasi informasi dan warta operasional siber terkini dari PUSSIBERAD.
                </p>
              </div>

              <Link
                to="/berita"
                className="text-xs font-bold text-navy hover:text-blue-600 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl transition-all hidden sm:inline-flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedNews.map((news) => (
                <Link
                  key={news.id}
                  to={`/berita/${news.id}`}
                  className="group bg-[#f8fafc] border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative overflow-hidden rounded-xl mb-4 h-44 bg-slate-900">
                      {news.thumbnail ? (
                        <img
                          src={news.thumbnail}
                          alt={news.title}
                          width="384"
                          height="176"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-navy flex items-center justify-center">
                          <Newspaper className="w-8 h-8 text-white/30" />
                        </div>
                      )}

                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[10px] font-bold bg-white/95 text-navy px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                          {news.category || 'Siber'}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm md:text-base text-navy group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
                      {news.title}
                    </h3>

                    <div className="flex items-center gap-2.5 text-[11px] font-medium text-inktext/50 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-navy" />
                        {news.news_date || 'Terbaru'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs font-semibold text-navy group-hover:text-blue-600">
                    <span>Baca Artikel</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </RevealSection>
        )}

      </div>
    </div>
  );
}