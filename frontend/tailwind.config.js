/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0B2545',        // Utama - header, sidebar, tombol utama
        steel: '#13315C',       // Sekunder - aksen section, hover state
        gold: '#C9A227',        // Aksen - highlight, garis pembatas, badge
        panel: '#EEF2F6',       // Latar area konten
        inktext: '#3A3A3A',     // Warna teks isi
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
