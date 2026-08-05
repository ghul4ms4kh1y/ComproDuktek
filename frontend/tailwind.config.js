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
      },
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'],
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
