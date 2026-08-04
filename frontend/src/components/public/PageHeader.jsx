export default function PageHeader({ title, subtitle }) {
  return (
    <section className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-white/70 mt-2 max-w-2xl">{subtitle}</p>}
        <div className="w-16 h-1 bg-gold rounded mt-4" />
      </div>
    </section>
  );
}
