import PageHeader from '../../components/public/PageHeader';

export default function About() {
  return (
    <div>
      <PageHeader
        title="Tentang Kami"
        subtitle="Profil, kedudukan, serta peran dan fungsi Satlak Dukteksi dalam struktur Pussiberad TNI AD."
      />
      <div className="max-w-4xl mx-auto px-4 py-14 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-navy mb-2">Profil Institusi</h2>
          <p className="text-inktext/90 leading-relaxed">
            Satlak Dukungan Teknologi Siber (Dukteksi) merupakan satuan pelaksana di bawah Pusat Siber
            Angkatan Darat (Pussiberad) TNI AD yang berperan dalam mendukung kesiapan, ketahanan, dan
            inovasi teknologi siber bagi kepentingan pertahanan negara.
            {/* Konten ini dapat diperbarui melalui Dashboard Admin pada fase pengembangan lanjutan (CMS page). */}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-navy mb-2">Peran & Fungsi</h2>
          <p className="text-inktext/90 leading-relaxed">
            Menjalankan dukungan teknologi siber meliputi riset, pengembangan produk, serta pengelolaan
            kapabilitas siber guna mendukung tugas pokok satuan induk.
          </p>
        </div>
      </div>
    </div>
  );
}
