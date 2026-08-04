import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const menu = [
  { label: 'Beranda', to: '/' },
  { label: 'Tentang Kami', to: '/tentang-kami' },
  { label: 'Sejarah', to: '/sejarah' },
  { label: 'Visi & Misi', to: '/visi-misi' },
  { label: 'Struktur Organisasi', to: '/struktur-organisasi' },
  { label: 'Produk', to: '/produk' },
  { label: 'Galeri', to: '/galeri' },
  { label: 'Berita', to: '/berita' },
  { label: 'Kontak', to: '/kontak' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navy shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <NavLink to="/" className="text-white font-bold tracking-wide">
          SATLAK DUKTEKSI
        </NavLink>

        <nav className="hidden lg:flex gap-1">
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive ? 'text-gold font-semibold' : 'text-white/85 hover:text-gold'
                }`
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="lg:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Buka menu navigasi"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <nav className="lg:hidden bg-steel px-4 pb-4 flex flex-col gap-1">
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-2 py-2 text-sm rounded-md ${isActive ? 'text-gold font-semibold' : 'text-white/90'}`
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
