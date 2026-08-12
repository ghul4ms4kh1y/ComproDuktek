import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Marquee } from '../../components/ui/marquee';
import HeroSlider from '../../components/public/HeroSlider';
import {
  Terminal,
  Wrench,
  ShieldCheck,
  Server,
  ArrowUpRight,
  PackageSearch,
  Cpu,
  Newspaper,
  Calendar,
  Plus,
  Minus,
} from 'lucide-react';

const highlights = [
  {
    title: 'Pengembangan Teknologi',
    desc: 'Riset dan pembuatan solusi teknologi siber terapan untuk mendukung keandalan sistem informasi serta pertahanan digital TNI AD.',
    icon: Terminal,
    link: '/produk'
  },
  {
    title: 'Rekayasa Terbalik',
    desc: 'Analisis mendalam terhadap perangkat lunak dan sistem (Reverse Engineering) untuk mendeteksi celah keamanan serta ancaman siber.',
    icon: Wrench,
    link: '/produk'
  },
  {
    title: 'Pemeliharaan & Instalasi',
    desc: 'Layanan terpadu mencakup instalasi jaringan, perawatan infrastruktur siber, dan pengamanan sistem data secara berkelanjutan.',
    icon: Server,
    link: '/produk'
  },
  {
    title: 'Pengamanan Aset Informasi',
    desc: 'Penerapan prinsip kehati-hatian untuk menutup setiap titik lemah dan melindungi seluruh aset data penting instansi dari kebocoran.',
    icon: ShieldCheck,
    link: '/produk'
  },
];

const default_faqs = [
  {
    question: 'Apa arti dari semboyan "Krtrima Raksa Mandalam"?',
    answer: 'Semboyan ini berasal dari tiga kata: Krtrima (Tidak Tampak - merujuk pada ruang digital/siber yang tak kasat mata), Raksa (Mengamankan - tindakan mempertahankan kedaulatan), dan Mandalam (Ruang Sistem - ruang sistem yang menyeluruh dan menyelimuti).'
  },
  {
    question: 'Apa saja bidang dan pilar kemampuan utama Satlak Dukteksi?',
    answer: 'Satlak Dukungan Teknologi Siber berfokus pada 3 pilar utama: Pengembangan Teknologi, Rekayasa Terbalik (Reverse Engineering), serta Pemeliharaan, Perawatan, & Instalasi infrastruktur siber.'
  },
  {
    question: 'Apa makna simbol Perisai, Pedang & Sayap pada lambang Satlak?',
    answer: 'Melambangkan ksatria di medan perang siber. Pedang yang disarungkan menandakan serangan adalah upaya terakhir, sedangkan perlindungan adalah prioritas utama (Sapta Marga, Sumpah Prajurit, 8 Wajib TNI).'
  },
  {
    question: 'Apa filosofi simbol Otak Bercahaya pada lambang?',
    answer: 'Otak Bercahaya melambangkan logika, kreativitas, dan kecerdasan dalam "Perang Asimetris". Menunjukkan kesadaran situasional tinggi untuk pengambilan keputusan cepat.'
  },
  {
    question: 'Bagaimana prinsip pengamanan data menurut lambang Gembok & Roda Gigi?',
    answer: 'Gembok & Lingkaran Cahaya melambangkan prinsip kehati-hatian untuk menutup setiap titik lemah aset data. Sedangkan Roda Gigi melambangkan harmonisasi sistem dan efisiensi operasional melalui kolaborasi tim.'
  },
  {
    question: 'Siapa saja pihak yang didukung oleh Satlak Dukteksi Siber?',
    answer: 'Satlak Dukteksi Siber bertugas mendukung keandalan sistem pertahanan TNI AD, instansi pemerintah, serta perlindungan infrastruktur informasi vital nasional.'
  }
];

// Helper Component untuk Animasi Scroll Smooth Reveal
function RevealSection({ children, className = '' }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Hanya animasi 1x saat muncul
        }
      },
      { threshold: 0.15 } // Muncul saat 15% bagian section masuk viewport
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${isVisible
        ? 'opacity-100 translate-y-0 scale-100'
        : 'opacity-0 translate-y-10 scale-[0.98]'
        } ${className}`}
    >
      {children}
    </div>
  );
}

export default function Landing() {
  const [news, setNews] = useState([]);
  const [products, setProducts] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    api.get('/news', { params: { limit: 3 } }).then((r) => setNews(r.data.data)).catch(() => { });
    api.get('/products', { params: { limit: 4 } }).then((r) => setProducts(r.data.data)).catch(() => { });
    api.get('/faqs', { params: { limit: 10 } }).then((r) => setFaqs(r.data.data)).catch(() => { });
  }, []);

  const displayFaqs = faqs && faqs.length > 0
    ? faqs.map(f => ({ question: f.question, answer: f.answer }))
    : default_faqs;

  return (
    <div className="bg-white text-inktext min-h-screen space-y-16 py-4">

      {/* Hero Section */}
      <section className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="relative rounded-[2.5rem] overflow-hidden flex items-center min-h-[75vh] shadow-xl shadow-navy/10 border border-gray-100">
          <HeroSlider />
          <div className="absolute inset-0 bg-[#0c1839]/40 bg-gradient-to-r from-[#0c1839]/80 via-[#0c1839]/60 to-transparent" />

          <div className="relative z-10 px-8 md:px-16 lg:px-24 py-20 max-w-5xl animate-fade-in-up text-left">
            <span className="text-xs font-bold tracking-widest text-blue-400 uppercase bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 inline-block mb-6 shadow-inner">
              PUSSIBERAD TNI AD
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-6xl font-semibold text-white mb-6 leading-tight tracking-tight">
              Satuan Pelaksana Dukungan Teknologi Siber TNI AD
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-light mb-10 leading-relaxed max-w-2xl">
              Dengan semangat Krtrima Raksa Mandalam (mengamankan ruang digital), Satlak Dukungan Teknologi Siber bekerja di balik layar untuk menjaga aset informasi dan infrastruktur sistem agar tetap aman.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/kontak"
                className="bg-[#4361EE]/80 hover:bg-blue-600 text-white px-7 py-3 rounded-xl font-medium transition-all duration-300 text-center shadow-lg hover:shadow-blue-500/25 inline-flex items-center justify-center gap-2 group shrink-0"
              >
                Hubungi Kami <span className="text-sm transition-transform group-hover:translate-x-1">›</span>
              </Link>
              <Link
                to="/produk"
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-7 py-3 rounded-xl font-medium transition-all duration-300 text-center inline-flex items-center justify-center border border-white/15"
              >
                Layanan & Produk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <RevealSection className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="w-full overflow-hidden rounded-2xl py-4">
          <Marquee pauseOnHover className="bg-transparent text-navy flex items-center">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 mx-6 whitespace-nowrap">
                <img
                  src="/logo.png"
                  alt="Logo Satlak"
                  width="40"
                  height="40"
                  className="h-8 md:h-10 w-auto object-contain"
                />
                <span className="text-2xl md:text-3xl font-extrabold tracking-[0.2em] uppercase text-navy">
                  KRTRIMA RAKSA MANDALAM
                </span>
                <img
                  src="/pussiberad_logo.png"
                  alt="Logo Pussiberad"
                  width="40"
                  height="40"
                  className="h-8 md:h-10 w-auto object-contain"
                />
              </div>
            ))}
          </Marquee>
        </div>
      </RevealSection>

      {/* Pilar Kemampuan */}
      <RevealSection className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="bg-[#f8fafc] py-16 px-8 md:px-12 rounded-[2.5rem] relative overflow-hidden border border-gray-100 shadow-sm">
          <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-navy/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start relative z-10">
            <div className="lg:col-span-6">
              <span className="text-xs font-bold tracking-widest text-navy uppercase bg-white px-3 py-1.5 rounded-md border border-navy/20 inline-block mb-4 shadow-sm">
                PILAR KEMAMPUAN
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-navy leading-tight tracking-tight">
                Dukungan Teknologi & Pengamanan Ruang Siber
              </h2>
            </div>

            <div className="lg:col-span-6 text-inktext/70 text-base md:text-lg leading-relaxed space-y-4 pt-2">
              <p>
                Ancaman siber yang kian kompleks membutuhkan sistem pertahanan yang tangguh. Satlak Dukungan Teknologi Siber mengintegrasikan riset terapan, analisis mendalam, dan pemeliharaan sistem dalam satu kesatuan tim.
              </p>
              <p>
                Setiap elemen teknologi dikembangkan dan dijaga dengan tingkat ketelitian tinggi demi memastikan kedaulatan informasi serta ruang digital tetap terlindungi.
              </p>
            </div>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {highlights.map((h) => {
              const IconComponent = h.icon;
              return (
                <div
                  key={h.title}
                  className="group/card bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-navy group-hover/card:bg-blue-600 flex items-center justify-center text-white mb-6 shadow-md shadow-blue-500/20 transition-colors duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-navy group-hover/card:text-blue-600 transition-colors duration-300 text-xl mb-3 leading-snug">
                      {h.title}
                    </h3>
                    <p className="text-inktext/70 text-sm leading-relaxed mb-8">
                      {h.desc}
                    </p>
                  </div>

                  <Link
                    to={h.link}
                    aria-label={`Selengkapnya tentang ${h.title}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-4 py-2.5 rounded-lg w-fit transition-colors"
                  >
                    Selengkapnya <span className="text-xs">›</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </RevealSection>

      {/* Produk & Layanan */}
      <RevealSection className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-sm">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6 relative z-10">
            <div>
              <span className="text-xs font-bold tracking-widest text-navy uppercase bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 inline-block mb-3">
                INOVASI & RISET
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy leading-tight tracking-tight">
                Produk & Solusi Unggulan
              </h2>
              <p className="text-inktext/70 text-sm md:text-base mt-2 max-w-xl">
                Hasil pengembangan teknologi siber terapan dan sistem perangkat keras/lunak mandiri Satlak Dukteksi PUSSIBERAD.
              </p>
            </div>

            <Link
              to="/produk"
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-blue-600 bg-gray-50 hover:bg-blue-50 border border-gray-200 px-5 py-3 rounded-xl transition-all shrink-0 w-fit"
            >
              Lihat Semua Produk <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Body Content */}
          {products.length === 0 ? (
            <div className="bg-[#f8fafc] border border-dashed border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center text-white mb-4 shadow-inner">
                <PackageSearch className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-1">
                Belum Ada Produk Dipublikasikan
              </h3>
              <p className="text-inktext/60 text-sm max-w-md mb-6 leading-relaxed">
                Katalog produk siber terapan dan sistem inovasi saat ini sedang dalam tahap dokumentasi atau riset internal.
              </p>
              <Link
                to="/kontak"
                className="text-xs font-semibold text-navy hover:text-white bg-white hover:bg-blue-600 border border-gray-200 px-4 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Ajukan Informasi / Konsultasi
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {products.map((p) => (
                <Link
                  to={`/produk/${p.id || '#'}`}
                  key={p.id}
                  className="group bg-[#f8fafc] border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative overflow-hidden rounded-xl mb-5 h-52 bg-slate-900">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          width="277"
                          height="208"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-navy flex flex-col items-center justify-center text-white/40 p-4">
                          <Cpu className="w-10 h-10 mb-2 opacity-50" />
                          <span className="text-xs font-medium tracking-wider uppercase">Sistem Siber</span>
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        <span className="text-[11px] font-bold bg-white/90 backdrop-blur-md text-navy px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/20">
                          {p.status || 'Aktif'}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-xl text-navy mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-inktext/70 text-sm leading-relaxed line-clamp-2 mb-6">
                      {p.description || 'Solusi teknologi siber terapan yang dikembangkan khusus untuk mendukung keandalan sistem pertahanan.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200/60 flex items-center justify-between text-xs font-semibold text-navy group-hover:text-blue-600">
                    <span>Detail Produk</span>
                    <div className="w-7 h-7 rounded-full bg-white group-hover:bg-blue-50 flex items-center justify-center transition-colors shadow-sm">
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </RevealSection>

      {/* Berita & Kegiatan */}
      <RevealSection className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="bg-[#f8fafc] rounded-[2.5rem] p-8 md:p-14 border border-gray-100 relative overflow-hidden shadow-sm">

          <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6 relative z-10">
            <div>
              <span className="text-xs font-bold tracking-widest text-navy uppercase bg-white px-3 py-1.5 rounded-md border border-navy/20 inline-block mb-3 shadow-sm">
                PUSAT INFORMASI
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy leading-tight tracking-tight">
                Berita & Kegiatan Terkini
              </h2>
              <p className="text-inktext/70 text-sm md:text-base mt-2 max-w-xl">
                Publikasi resmi mengenai operasional, edukasi siber, dan kabar terbaru dari Satlak Dukteksi PUSSIBERAD.
              </p>
            </div>

            <Link
              to="/berita"
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-blue-600 bg-white hover:bg-blue-50 border border-gray-200 px-5 py-3 rounded-xl transition-all shadow-sm shrink-0 w-fit"
            >
              Lihat Semua Berita <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Content */}
          {news.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center relative z-10 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center text-white mb-4 shadow-inner">
                <Newspaper className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-1">
                Belum Ada Berita Terbaru
              </h3>
              <p className="text-inktext/60 text-sm max-w-md mb-6 leading-relaxed">
                Kabar kegiatan dan pembaruan informasi siber saat ini belum dipublikasikan.
              </p>
              <Link
                to="/kontak"
                className="text-xs font-semibold text-navy hover:text-white bg-gray-100 hover:bg-blue-600 px-4 py-2.5 rounded-lg transition-colors"
              >
                Hubungi Pusat Informasi
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

              {/* Card Kiri (Big Featured Card) */}
              {news[0] && (
                <div className="lg:col-span-6 flex">
                  <Link
                    to={`/berita/${news[0].id}`}
                    aria-label={`Baca berita selengkapnya: ${news[0].title}`}
                    className="group relative w-full min-h-[420px] md:min-h-[460px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200/80 flex flex-col justify-end p-6 md:p-8"
                  >
                    {news[0].thumbnail ? (
                      <img
                        src={news[0].thumbnail}
                        alt={news[0].title}
                        width="613"
                        height="460"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-navy to-slate-800" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

                    <div className="relative z-10 text-white">
                      <div className="flex items-center gap-3 mb-3 text-xs font-semibold">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-wider text-[11px]">
                          Kegiatan Siber
                        </span>
                        <span className="text-white/70 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {news[0].news_date || 'Terbaru'}
                        </span>
                      </div>

                      <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
                        {news[0].title}
                      </h3>

                      <p className="text-white/80 text-sm line-clamp-2 leading-relaxed mb-4">
                        {news[0].content || news[0].excerpt || 'Informasi dan dokumentasi kegiatan resmi Satlak Dukungan Teknologi Siber PUSSIBERAD.'}
                      </p>

                      <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 group-hover:text-blue-300">
                        Selengkapnya <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Card Kanan (2 Horizontal Stacked) */}
              <div className="lg:col-span-6 flex flex-col gap-6 justify-between">
                {news.slice(1, 3).map((n) => (
                  <Link
                    to={`/berita/${n.id}`}
                    key={n.id}
                    aria-label={`Baca berita selengkapnya: ${n.title}`}
                    className="group bg-white border border-gray-100 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-center h-full"
                  >
                    <div className="w-full sm:w-48 h-40 sm:h-full shrink-0 overflow-hidden rounded-xl bg-slate-900 relative">
                      {n.thumbnail ? (
                        <img
                          src={n.thumbnail}
                          alt={n.title}
                          width="192"
                          height="160"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-navy flex items-center justify-center">
                          <Newspaper className="w-8 h-8 text-white/40" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between h-full py-1 w-full">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                          <span className="font-bold text-blue-600 uppercase tracking-wider text-[11px]">
                            Berita
                          </span>
                          <span className="text-inktext/50 text-[11px]">
                            {n.news_date || 'Terbaru'}
                          </span>
                        </div>

                        <h4 className="font-bold text-lg text-navy group-hover:text-blue-600 transition-colors mb-2 line-clamp-2 leading-snug">
                          {n.title}
                        </h4>

                        <p className="text-inktext/70 text-xs line-clamp-2 leading-relaxed">
                          {n.content || n.excerpt || 'Ulasan singkat berita dan publikasi kegiatan operasional siber.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-navy group-hover:text-blue-600">
                        <span>Selengkapnya</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </Link>
                ))}

                {news.length === 1 && (
                  <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full">
                    <p className="text-inktext/60 text-sm">Belum ada berita tambahan lainnya.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </RevealSection>

      {/* FAQ Section */}
      <RevealSection className="max-w-screen-2xl mx-auto px-6 md:px-12 pb-12">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden shadow-sm">

          {/* Watermark Glow Effect */}
          <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6 relative z-10">
            <div>
              <span className="text-xs font-bold tracking-widest text-navy uppercase bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 inline-block mb-3">
                Pertanyaan Umum
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy leading-tight tracking-tight">
                Ada Pertanyaan ?
              </h2>
              <p className="text-inktext/70 text-sm md:text-base mt-2 max-w-xl">
                Informasi penting mengenai tugas, semboyan, filosofi logo, dan kapabilitas teknis Satlak Dukteksi PUSSIBERAD.
              </p>
            </div>
          </div>

          {/* Grid FAQ 2 Kolom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start relative z-10">
            {displayFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`transition-all duration-300 rounded-2xl p-6 border ${isOpen
                    ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-500/10'
                    : 'bg-[#f8fafc] border-gray-100 hover:border-gray-200 hover:bg-gray-50/80'
                    }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-start justify-between gap-4 text-left group"
                  >
                    <h3 className={`font-bold text-md leading-snug transition-colors ${isOpen ? 'text-blue-600' : 'text-navy group-hover:text-blue-600'
                      }`}>
                      {faq.question}
                    </h3>

                    {/* Icon Toggle Box (+ / -) */}
                    <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isOpen
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-gray-200/70 text-navy group-hover:bg-blue-600 group-hover:text-white'
                      }`}>
                      {isOpen ? (
                        <Minus className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </div>
                  </button>

                  {/* Answer Content */}
                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                      <p className="text-inktext/90 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </RevealSection>

    </div>
  );
}