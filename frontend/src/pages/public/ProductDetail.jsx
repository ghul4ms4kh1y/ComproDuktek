import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import RevealSection from '../../components/common/RevealSection';
import {
    ArrowLeft,
    Cpu,
    ShieldCheck,
    Building2,
    Tag,
    CheckCircle2,
    Send,
    Loader2
} from 'lucide-react';

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        api
            .get(`/products/${id}`)
            .then((r) => {
                setProduct(r.data.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('Produk tidak ditemukan atau terjadi kesalahan.');
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="bg-white min-h-screen flex flex-col items-center justify-center gap-3 text-navy">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-sm font-semibold">Memuat detail produk...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="bg-white min-h-screen py-20 px-6 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-navy mb-2">Produk Tidak Ditemukan</h2>
                <p className="text-inktext/60 text-sm max-w-md mb-6">{error}</p>
                <Link
                    to="/produk"
                    className="inline-flex items-center gap-2 bg-navy hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog Produk
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white text-inktext min-h-screen pb-20">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 space-y-12">

                {/* Tombol Kembali */}
                <RevealSection>
                    <Link
                        to="/produk"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-blue-600 transition-colors bg-[#f8fafc] border border-gray-100 px-4 py-2.5 rounded-xl w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Semua Produk
                    </Link>
                </RevealSection>

                {/* Layout Utama Detail Produk */}
                <RevealSection className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* Kolom Kiri: Gambar Produk / Visual Showcase */}
                    <div className="lg:col-span-5 bg-white border border-gray-200 rounded-[2.5rem] p-6 relative overflow-hidden shadow-sm">
                        <div className="relative overflow-hidden rounded-2xl h-80 sm:h-96 bg-slate-900 border border-gray-200/50">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                width="448"
                                height="576"
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-navy to-slate-900 flex flex-col items-center justify-center text-white/40 p-6 text-center">
                                    <Cpu className="w-16 h-16 mb-3 opacity-50" />
                                    <span className="text-xs font-semibold tracking-wider uppercase">
                                        Visual Inovasi Siber
                                    </span>
                                </div>
                            )}

                            <div className="absolute top-4 left-4">
                                <span className="text-xs font-bold bg-white/95 backdrop-blur-md text-navy px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm border border-white/20">
                                    {product.status || 'Aktif'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                                <Tag className="w-5 h-5 text-blue-600 shrink-0" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-inktext/50">Kategori</p>
                                    <p className="text-xs font-bold text-navy">{product.category}</p>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-inktext/50">Unit Pengampu</p>
                                    <p className="text-xs font-bold text-navy">{product.unit_pengampu}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan: Deskripsi & Fitur */}
                    <div className="lg:col-span-7 space-y-8">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-navy uppercase bg-[#f8fafc] px-3.5 py-1.5 rounded-md border border-gray-200 inline-block mb-3">
                                SPESIFIKASI & METADATA
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-4">
                                {product.name}
                            </h1>
                            <p className="text-inktext/80 text-base leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>

                        {product.features && product.features.length > 0 && (
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-navy">Fitur & Keunggulan Utama:</h3>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {product.features.map((feat, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-sm text-inktext/80">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="bg-[#f8fafc] border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                            <div>
                                <h4 className="font-bold text-navy text-base">Tertarik dengan Solusi Ini?</h4>
                                <p className="text-xs text-inktext/70 mt-1">
                                    Hubungi tim Satlak Dukteksi PUSSIBERAD untuk konsultasi teknis lebih lanjut.
                                </p>
                            </div>
                            <Link
                                to="/kontak"
                                className="bg-navy hover:bg-blue-600 text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0"
                            >
                                <Send className="w-4 h-4" /> Ajukan Konsultasi
                            </Link>
                        </div>
                    </div>

                </RevealSection>
            </div>
        </div>
    );
}