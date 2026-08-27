import { useEffect, useState } from 'react';
import api from '../../services/api';

const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export default function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const cells = buildMonthGrid(year, month);
  const [schedules, setSchedules] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);

  useEffect(() => {
    const fetchJadwalPiket = async () => {
      try {
        const res = await api.get('/jadwal-piket', {
          params: { bulan: month + 1, tahun: year, limit: 100 },
        });
        const scheduleMap = {};
        res.data.data?.forEach((item) => {
          scheduleMap[item.tanggal_piket] = item;
        });
        setSchedules(scheduleMap);
      } catch (error) {
        console.log('Gagal fetch jadwal piket');
      }
    };

    fetchJadwalPiket();
  }, [month, year]);

  const handleDateClick = (day) => {
    if (!day) return;

    const date = new Date(year, month, day);
    const dateStr = formatLocalDate(date);
    const weekend = isWeekend(date);
    const schedule = schedules[dateStr];

    setSelectedDate(dateStr);
    if (weekend) {
      setSelectedInfo({ type: 'weekend', message: 'Weekend - Tidak Ada Piket' });
    } else if (schedule) {
      setSelectedInfo({
        type: 'scheduled',
        soldier: schedule.Soldier?.full_name || schedule.Soldier?.username || 'Tidak diketahui',
        status: schedule.status,
      });
    } else {
      setSelectedInfo({ type: 'empty', message: 'Belum ada jadwal piket' });
    }
  };

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
          const dayOfWeek = i % 7;
          const isWeekendDay = dayOfWeek >= 5;

          let dateStr = '';
          if (d) {
            const date = new Date(year, month, d);
            dateStr = formatLocalDate(date);
          }

          const hasSchedule = d && schedules[dateStr];
          const isSelected = d && selectedDate === dateStr;

          return (
            <div key={i} className="flex items-center justify-center py-1">
              {d && (
                <button
                  onClick={() => handleDateClick(d)}
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-[13px] transition-colors relative ${
                    isToday
                      ? 'bg-dashAccent text-white font-semibold'
                      : isSelected
                      ? 'ring-2 ring-dashAccent bg-dashAccent/20'
                      : isWeekendDay
                      ? 'text-dashAccent/70 hover:bg-dashAccent/10'
                      : 'text-dashNavy/75 hover:bg-dashNavy/5'
                  }`}
                >
                  {d}
                  {hasSchedule && !isToday && (
                    <span className="absolute bottom-0.5 w-1 h-1 bg-dashAccent rounded-full"></span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {selectedInfo && (
        <div className="mt-4 p-3 bg-dashAccent/5 border border-dashAccent/20 rounded-lg text-sm">
          {selectedInfo.type === 'weekend' && (
            <p className="text-dashNavy/70 font-medium">{selectedInfo.message}</p>
          )}
          {selectedInfo.type === 'scheduled' && (
            <div>
              <p className="font-semibold text-dashNavy">Piket: {selectedInfo.soldier}</p>
              <p className="text-xs text-dashNavy/60 mt-1">
                Status: {selectedInfo.status === 'scheduled' ? 'Terjadwal' : selectedInfo.status === 'completed' ? 'Selesai' : 'Tidak Hadir'}
              </p>
            </div>
          )}
          {selectedInfo.type === 'empty' && (
            <p className="text-dashNavy/70 font-medium">{selectedInfo.message}</p>
          )}
        </div>
      )}
    </div>
  );
}
