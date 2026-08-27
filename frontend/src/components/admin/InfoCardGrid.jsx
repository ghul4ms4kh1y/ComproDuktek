export default function InfoCardGrid({ cards }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-dashCard"
        >
          <p className="text-xs text-dashNavy/50">{card.label}</p>
          <p className="text-2xl font-semibold text-dashNavy mt-1">
            {card.loading ? "..." : card.value}
          </p>
          {card.subtitle && (
            <p className="text-xs text-dashNavy/40 mt-1">{card.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
}
