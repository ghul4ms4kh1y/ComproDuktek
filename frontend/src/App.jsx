import { Routes, Route, Outlet } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Landing from "./pages/public/Landing";
import About from "./pages/public/About";
import OrgStructure from "./pages/public/OrgStructure";
import Products from "./pages/public/Products";
import ProductDetail from "./pages/public/ProductDetail";
import Gallery from "./pages/public/Gallery";
import News from "./pages/public/News";
import NewsDetail from "./pages/public/NewsDetail";
import Contact from "./pages/public/Contact";

// Admin pages
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import NewsManage from "./pages/admin/NewsManage";
import ProductManage from "./pages/admin/ProductManage";
import GalleryManage from "./pages/admin/GalleryManage";
import OrgStructureManage from "./pages/admin/OrgStructureManage";
import SoldierManage from "./pages/admin/SoldierManage";
import JadwalPiketManage from "./pages/admin/JadwalPiketManage";
import ProgramKerjaManage from "./pages/admin/ProgramKerjaManage";
import AbsensiManage from "./pages/admin/AbsensiManage";
import LaporanManage from "./pages/admin/LaporanManage";
import Inbox from "./pages/admin/Inbox";

import SoldierDashboard from "./pages/soldier/Dashboard";

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/tentang-kami" element={<About />} />
        <Route path="/struktur-organisasi" element={<OrgStructure />} />
        <Route path="/produk" element={<Products />} />
        <Route path="/produk/:id" element={<ProductDetail />} />
        <Route path="/galeri" element={<Gallery />} />
        <Route path="/berita" element={<News />} />
        <Route path="/berita/:id" element={<NewsDetail />} />
        <Route path="/kontak" element={<Contact />} />
      </Route>

      {/* Admin / Login */}
      <Route path="/admin-portal/login" element={<Login />} />
      <Route
        path="/admin-portal"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="berita" element={<NewsManage />} />
        <Route path="produk" element={<ProductManage />} />
        <Route path="galeri" element={<GalleryManage />} />
        <Route path="struktur-organisasi" element={<OrgStructureManage />} />
        <Route path="anggota" element={<SoldierManage />} />
        <Route path="jadwal-piket" element={<JadwalPiketManage />} />
        <Route path="program-kerja" element={<ProgramKerjaManage />} />
        <Route path="rekap-presensi" element={<AbsensiManage />} />
        <Route path="laporan-harian" element={<LaporanManage />} />
        <Route path="kotak-masuk" element={<Inbox />} />
      </Route>

      {/* Soldier / Prajurit */}
      <Route
        path="/soldier"
        element={
          <ProtectedRoute allowedRoles={["soldier"]}>
            {/* Nantinya di sini bisa pakai <SoldierLayout /> */}
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<SoldierDashboard />} />
        {/* Tambahkan rute soldier lainnya di sini nanti */}
      </Route>

      <Route
        path="*"
        element={
          <div className="p-20 text-center text-inktext/50">
            404 - Halaman tidak ditemukan
          </div>
        }
      />
    </Routes>
  );
}
