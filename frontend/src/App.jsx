import { Routes, Route } from 'react-router-dom';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Landing from './pages/public/Landing';
import About from './pages/public/About';
import OrgStructure from './pages/public/OrgStructure';
import Products from './pages/public/Products';
import Gallery from './pages/public/Gallery';
import News from './pages/public/News';
import NewsDetail from './pages/public/NewsDetail';
import Contact from './pages/public/Contact';

// Admin pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import NewsManage from './pages/admin/NewsManage';
import ProductManage from './pages/admin/ProductManage';
import GalleryManage from './pages/admin/GalleryManage';
import FaqManage from './pages/admin/FaqManage';
import Inbox from './pages/admin/Inbox';

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/tentang-kami" element={<About />} />
        <Route path="/struktur-organisasi" element={<OrgStructure />} />
        <Route path="/produk" element={<Products />} />
        <Route path="/galeri" element={<Gallery />} />
        <Route path="/berita" element={<News />} />
        <Route path="/berita/:id" element={<NewsDetail />} />
        <Route path="/kontak" element={<Contact />} />
      </Route>

      {/* Admin - URL khusus, tidak ditautkan di navigasi publik */}
      <Route path="/admin-portal/login" element={<Login />} />
      <Route
        path="/admin-portal"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="berita" element={<NewsManage />} />
        <Route path="produk" element={<ProductManage />} />
        <Route path="galeri" element={<GalleryManage />} />
        <Route path="faq" element={<FaqManage />} />
        <Route path="kotak-masuk" element={<Inbox />} />
      </Route>

      <Route path="*" element={<div className="p-20 text-center text-inktext/50">404 - Halaman tidak ditemukan</div>} />
    </Routes>
  );
}
