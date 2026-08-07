const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  // Senin = 0 ... Minggu = 6
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const cells = buildMonthGrid(year, month);

  return (
    <div>
      <p className="text-sm font-semibold text-dashNavy mb-4">
        {BULAN[month]} {year}
      </p>

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {HARI.map((h, i) => (
          <span
            key={h}
            className={`text-[11px] font-semibold ${i >= 5 ? 'text-dashAccent/70' : 'text-dashNavy/40'}`}
          >
            {h}
          </span>
        ))}

        {cells.map((d, i) => {
          const isToday = d === today.getDate();
          const isWeekend = i % 7 >= 5;
          return (
            <div key={i} className="flex items-center justify-center py-1">
              {d && (
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-[13px] transition-colors ${
                    isToday
                      ? 'bg-dashAccent text-white font-semibold'
                      : isWeekend
                        ? 'text-dashAccent/70'
                        : 'text-dashNavy/75'
                  }`}
                >
                  {d}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
