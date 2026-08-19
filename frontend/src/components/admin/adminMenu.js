import {
  LayoutDashboard,
  Newspaper,
  Package,
  Images,
  Network,
  Mail,
  Users,
} from 'lucide-react';

// Dipakai bersama oleh Sidebar (desktop, >=lg) dan BottomNav (mobile/tablet, <lg)
// supaya daftar menu tidak perlu didefinisikan dua kali.
// shortLabel dipakai khusus di BottomNav karena ruang horizontalnya sempit.
export const adminMenu = [
  { label: 'Dashboard', to: '/admin-portal/dashboard', icon: LayoutDashboard },
  { label: 'Berita', to: '/admin-portal/berita', icon: Newspaper },
  { label: 'Produk', to: '/admin-portal/produk', icon: Package },
  { label: 'Galeri', to: '/admin-portal/galeri', icon: Images },
  { label: 'Struktur Organisasi', shortLabel: 'Struktur', to: '/admin-portal/struktur-organisasi', icon: Network },
  { label: 'Anggota', to: '/admin-portal/anggota', icon: Users },
  { label: 'Kotak Masuk', shortLabel: 'Pesan', to: '/admin-portal/kotak-masuk', icon: Mail },
];