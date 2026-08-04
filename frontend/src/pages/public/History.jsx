import PageHeader from '../../components/public/PageHeader';

const timeline = [
  { year: '—', text: 'Tambahkan tonggak sejarah pembentukan satuan di sini.' },
];

export default function History() {
  return (
    <div>
      <PageHeader title="Sejarah" subtitle="Riwayat dan latar belakang pembentukan Satlak Dukteksi." />
      <div className="max-w-4xl mx-auto px-4 py-14">
        <div className="relative border-l-2 border-gold pl-6 space-y-8">
          {timeline.map((t, i) => (
            <div key={i} className="relative">
              <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-navy" />
              <p className="text-gold font-semibold text-sm">{t.year}</p>
              <p className="text-inktext/90">{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
