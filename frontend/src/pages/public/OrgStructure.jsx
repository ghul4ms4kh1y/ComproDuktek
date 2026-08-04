import PageHeader from '../../components/public/PageHeader';

const struktur = [
  { jabatan: 'Kepala Satlak Dukteksi', level: 0 },
  { jabatan: 'Wakil Kepala', level: 1 },
  { jabatan: 'Unit Riset & Pengembangan', level: 2 },
  { jabatan: 'Unit Operasional Siber', level: 2 },
  { jabatan: 'Unit Administrasi & Umum', level: 2 },
];

export default function OrgStructure() {
  return (
    <div>
      <PageHeader title="Struktur Organisasi" subtitle="Bagan hierarki kepemimpinan dan unit di lingkungan Satlak Dukteksi." />
      <div className="max-w-3xl mx-auto px-4 py-14">
        <div className="space-y-3">
          {struktur.map((s, i) => (
            <div
              key={i}
              className="card"
              style={{ marginLeft: s.level * 32 }}
            >
              <p className="font-medium text-navy">{s.jabatan}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-inktext/50 mt-6">
          * Struktur di atas contoh awal — dapat dikelola melalui Dashboard Admin pada fase pengembangan lanjutan.
        </p>
      </div>
    </div>
  );
}
