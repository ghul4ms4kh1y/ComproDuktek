import { useState, useEffect } from 'react';

// Daftar gambar untuk hero slide. Tinggal tambah/kurangi/ganti path di sini —
// taruh file gambarnya di folder frontend/public/ (contoh: '/bg_logo2.jpg').
// Kalau cuma 1 gambar, slider otomatis tidak berjalan (berperilaku seperti background statis biasa).
const heroImages = [
  '/bg1.jpg',
  '/bg2.jpg',
  '/bg3.jpg',
];

const SLIDE_DURATION = 5000; // 5 detik per slide

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0">
      {heroImages.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url('${src}')` }}
        />
      ))}
    </div>
  );
}