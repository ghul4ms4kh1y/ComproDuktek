import PageHeader from '../../components/public/PageHeader';

const misi = [
  'Menyelenggarakan dukungan teknologi siber yang profesional dan andal.',
  'Mengembangkan inovasi produk siber untuk kepentingan pertahanan.',
  'Membangun transparansi informasi kepada publik dan instansi terkait.',
];

export default function VisionMission() {
  return (
    <div>
      <PageHeader title="Visi & Misi" subtitle="Arah dan komitmen strategis Satlak Dukteksi." />
      <div className="max-w-4xl mx-auto px-4 py-14 space-y-10">
        <div className="card border-l-4 border-gold">
          <h2 className="text-lg font-semibold text-navy mb-2">Visi</h2>
          <p className="text-inktext/90 leading-relaxed">
            Menjadi satuan pendukung teknologi siber TNI AD yang unggul, kredibel, dan terdepan dalam
            inovasi pertahanan siber.
          </p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-navy mb-3">Misi</h2>
          <ul className="space-y-2">
            {misi.map((m, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-gold font-bold">{i + 1}.</span>
                <span className="text-inktext/90">{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
