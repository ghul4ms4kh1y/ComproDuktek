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
        darkbg: '#051221',      // Background yang lebih gelap (Soteria style)
        // --- Token khusus Dashboard Admin (palette: navy/blue/sky/mint) ---
        // Terpisah dari token di atas supaya reskin dashboard TIDAK
        // memengaruhi tampilan halaman publik yang masih pakai navy/gold.
        // 4 warna ini SATU-SATUNYA warna berwarna yang dipakai di admin;
        // sisanya (putih, abu-abu) hanya netral latar/border.
        dashNavy: '#293681',    // Primary - sidebar, heading, teks utama admin
        dashAccent: '#4274D9',  // Accent - tombol utama, state aktif, fokus
        dashSky: '#95CCDD',     // Sekunder - badge, ikon, segmen chart ke-2
        dashMint: '#D0E7E6',    // Tersier - tint kartu, hover, segmen chart ke-3
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        // Font khusus Dashboard Admin (design.md pakai Inter)
        dash: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        // Shadow khusus Dashboard Admin, nilai persis dari design.md
        dashCard: '0px 1px 1px 0px rgba(118, 135, 154, 0.24), 0px 3px 8px 0px rgba(118, 135, 154, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
