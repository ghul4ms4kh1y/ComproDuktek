import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-navy text-white/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold mb-2">Satlak Dukteksi</h3>
          <p className="text-sm">
            Satuan Pelaksana Dukungan Teknologi Siber, Pusat Siber Angkatan Darat (Pussiberad) TNI AD.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Navigasi</h4>
          <ul className="text-sm space-y-1">
            <li><Link to="/produk" className="hover:text-gold">Produk</Link></li>
            <li><Link to="/berita" className="hover:text-gold">Berita</Link></li>
            <li><Link to="/galeri" className="hover:text-gold">Galeri</Link></li>
            <li><Link to="/kontak" className="hover:text-gold">Kontak</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">Kontak Resmi</h4>
          <p className="text-sm">Alamat, telepon, dan email resmi ditampilkan di halaman Kontak.</p>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs py-4">
        © {new Date().getFullYear()} Satlak Dukteksi Pussiberad TNI AD. Hak cipta dilindungi.
      </div>
    </footer>
  );
}
