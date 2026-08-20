import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { formatDate } from "../../lib/dateUtils";
import {
  User,
  Lock,
  LogOut,
  CheckCircle2,
  Check,
  Camera,
  ChevronDown,
  XCircle,
} from "lucide-react";

const StatusBadge = ({ status }) => {
  switch (status) {
    case "hijau":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
          Beres
        </span>
      );
    case "merah":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
          Terlambat
        </span>
      );
    case "biru":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
          Dalam Pengerjaan
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
          {status}
        </span>
      );
  }
};

export default function SoldierDashboard() {
  const { user, logout, refreshUser } = useAuth();

  // State Toast Notifikasi
  const [toast, setToast] = useState(null); // { type: 'success'|'error', text: '' }
  const toastTimer = useRef(null);
  const showToast = (type, text) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  // State Dropdown Header
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // State Modal (Ganti Foto & Ganti Password)
  const [activeModal, setActiveModal] = useState(null); // 'photo' | 'password' | null

  // State Form Ganti Foto
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  useEffect(() => {
    if (!selectedPhoto) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedPhoto);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedPhoto]);

  // State Form Ganti Password
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);
  const [messagePass, setMessagePass] = useState({ type: "", text: "" });

  // State Form Edit Profil
  const [editFullName, setEditFullName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [messageEdit, setMessageEdit] = useState({ type: "", text: "" });

  // State Program Kerja
  const [prokers, setProkers] = useState([]);
  const [prokerLoading, setProkerLoading] = useState(false);
  // Helper untuk mendapatkan URL gambar dari Backend
  // Menggunakan path relatif (/uploads/...) agar melewati Vite proxy
  // saat development dan tetap berfungsi di production.
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    // Jika sudah berupa URL lengkap (http/https), kembalikan apa adanya
    if (photoPath.startsWith("http")) return photoPath;

    // Bersihkan awalan duplikat "/uploads/" jika terlanjur tersimpan di DB
    let cleanPath = photoPath;
    if (cleanPath.startsWith("/uploads/")) {
      cleanPath = cleanPath.replace("/uploads/", "");
    }
    if (cleanPath.startsWith("/")) {
      cleanPath = cleanPath.substring(1);
    }

    // Gunakan path relatif — Vite proxy akan meneruskan ke backend:5000
    return `/uploads/${cleanPath}`;
  };
  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadProkers = () => {
    setProkerLoading(true);
    api
      .get("/program-kerja", { params: { limit: 100 } })
      .then((res) => setProkers(res.data.data || []))
      .catch((err) => console.error("Gagal memuat program kerja:", err))
      .finally(() => setProkerLoading(false));
  };

  useEffect(() => {
    loadProkers();
  }, []);

  // Handle Toggle Selesai Proker oleh Soldier
  const handleToggleSelesai = async (proker) => {
    try {
      const newStatus = !proker.is_selesai;
      await api.put(`/program-kerja/${proker.id}/soldier-update`, {
        is_selesai: newStatus,
      });
      loadProkers();
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || "Gagal memperbarui status tugas.",
      );
    }
  };

  // Handle Upload Foto
  // Handle Upload Foto
  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPhoto) return;

    const formData = new FormData();
    formData.append("photo", selectedPhoto);
    formData.append("full_name", user?.full_name || "");

    setLoadingPhoto(true);
    try {
      // HAPUS konfigurasi headers manual di sini.
      // Cukup kirimkan formData langsung agar browser otomatis mengatur boundary-nya.
      await api.put("/soldiers/profile", formData);

      setActiveModal(null);
      setSelectedPhoto(null);
      await refreshUser(); // Update foto di context tanpa reload halaman
      showToast("success", "Foto profil berhasil diperbarui!");
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || "Gagal mengupload foto.",
      );
    } finally {
      setLoadingPhoto(false);
    }
  };

  // Handle Edit Profil
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoadingEdit(true);
    setMessageEdit({ type: "", text: "" });
    try {
      await api.put("/soldiers/profile", {
        full_name: editFullName,
        username: editUsername,
      });
      setActiveModal(null);
      await refreshUser();
      showToast("success", "Profil berhasil diperbarui.");
    } catch (err) {
      setMessageEdit({
        type: "error",
        text: err.response?.data?.message || "Gagal memperbarui profil.",
      });
    } finally {
      setLoadingEdit(false);
    }
  };

  // Handle Ganti Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessagePass({
        type: "error",
        text: "Konfirmasi password baru tidak cocok.",
      });
      return;
    }

    setLoadingPass(true);
    setMessagePass({ type: "", text: "" });
    try {
      await api.put("/soldiers/profile", { oldPassword, password });
      setMessagePass({
        type: "success",
        text: "Password berhasil diperbarui.",
      });
      setOldPassword("");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => setActiveModal(null), 1500);
    } catch (err) {
      setMessagePass({
        type: "error",
        text: err.response?.data?.message || "Gagal memperbarui password.",
      });
    } finally {
      setLoadingPass(false);
    }
  };

  // Format Tanggal Hari Ini (Realtime)
  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 font-dash pb-12">
      {/* TOAST NOTIFIKASI CUSTOM */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-start gap-3 px-5 py-4 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in slide-in-from-top-2 duration-300 ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          )}
          <span>{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}

      {/* 1. NAVBAR / HEADER ATAS DENGAN DROPDOWN PROFIL */}
      <div className="bg-white px-8 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
          {/* Bagian kiri kosong atau logo kecil jika diperlukan, di gambar tidak ada logo di kiri, tapi biarkan kosong atau sama */}
        </div>

        {/* Dropdown Profil Kanan Atas */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-dashNavy transition py-1 px-2 rounded-lg hover:bg-gray-100"
          >
            <span>{user?.full_name || user?.username || "Prajurit"}</span>
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
              {user?.photo ? (
                <img
                  src={getPhotoUrl(user.photo)}
                  alt="Profile"
                  className="w-full h-full object-cover object-[50%_10%]"
                />
              ) : (
                <User className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Menu Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setEditFullName(user?.full_name || "");
                  setEditUsername(user?.username || "");
                  setActiveModal("profile");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <User className="w-4 h-4 text-gray-500" /> Edit Profil
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setActiveModal("photo");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <Camera className="w-4 h-4 text-gray-500" /> Ganti Foto Profil
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setActiveModal("password");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <Lock className="w-4 h-4 text-gray-500" /> Ganti Password
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-6 space-y-6">
        {/* 2. BANNER UTAMA (LOGO TENGAH) */}
        <div className="bg-[#f4f5fa] rounded-[20px] p-10 text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-20 h-20 object-contain mb-4"
            />
            <h2 className="text-3xl font-bold text-[#353460] tracking-tight mb-2">
              Satuan Pelaksana Dukungan Teknik
            </h2>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 mb-2">
              <span>Portal Manajemen & Penugasan Personel</span>
            </div>
            <div className="text-[13px] text-gray-400">
              {todayFormatted} | Sistem Informasi Satlak Dukteksi PUSSIBERAD
            </div>
          </div>
        </div>

        {/* 3. KARTU PROFIL RINGKAS DI BAWAH BANNER */}
        <div className="flex flex-row items-center gap-5 pt-4 pb-2 px-2">
          <div className="w-[72px] h-[72px] rounded-full border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
            {user?.photo ? (
              <img
                src={getPhotoUrl(user.photo)}
                alt="Avatar"
                className="w-full h-full object-cover object-[50%_10%]"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-1 uppercase">
              {user?.full_name || user?.username}
            </h3>
            <p className="text-[13px] text-gray-500 mb-0.5">
              {user?.OrgStructure?.rank || "Pangkat"} |{" "}
              {user?.OrgStructure?.position || "Jabatan"}
            </p>
            <p className="text-[13px] text-gray-500">
              Satuan Pelaksana Dukungan Teknologi Siber
            </p>
          </div>
          <button
            onClick={() => setActiveModal("photo")}
            className="text-xs font-semibold text-gray-500 hover:text-dashNavy transition border border-gray-300 px-3 py-1.5 rounded-md"
          >
            Ubah Foto
          </button>
        </div>

        {/* 4. BAGIAN UTAMA: PROGRAM KERJA SAYA (JURNAL SAYA) */}
        <div className="px-2 pt-6">
          <div className="mb-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Program Kerja Saya
            </h2>
          </div>

          {prokerLoading ? (
            <p className="text-gray-400 py-10">Memuat program kerja...</p>
          ) : prokers.length === 0 ? (
            <div className="py-8">
              <p className="text-sm text-gray-500">
                Belum ada program kerja yang ditugaskan kepada Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {prokers.map((proker) => (
                <div
                  key={proker.id}
                  className="bg-white border border-gray-200 rounded-[12px] p-5 shadow-sm"
                >
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 text-[15px] mb-1">
                      {proker.program}
                    </h3>
                    <div className="w-full h-px bg-gray-100 my-3"></div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-700">
                        {proker.keterangan}
                      </p>
                    </div>

                    <div className="text-[13px] text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Mulai:</span>
                        <span className="text-gray-700">
                          {formatDate(proker.tanggal_mulai)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deadline:</span>
                        <span className="text-gray-700">
                          {formatDate(proker.deadline)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-gray-100 my-4"></div>

                  <div className="flex justify-between items-center mt-auto">
                    <StatusBadge status={proker.status} />
                    <button
                      onClick={() => handleToggleSelesai(proker)}
                      className="text-xs text-dashNavy font-medium hover:underline flex items-center gap-1"
                    >
                      {proker.is_selesai ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />{" "}
                          Selesai
                        </>
                      ) : (
                        "Tandai Selesai"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL POP-UP GANTI FOTO PROFIL --- */}
      {activeModal === "photo" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-modal-title"
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <h3
              id="photo-modal-title"
              className="text-lg font-bold text-dashNavy mb-4"
            >
              Ganti Foto Profil
            </h3>
            <form onSubmit={handlePhotoSubmit} className="space-y-4">
              <div className="flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-3">
                  {selectedPhoto ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user?.photo ? (
                    <img
                      src={getPhotoUrl(user.photo)}
                      alt="Current"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedPhoto(e.target.files[0])}
                  className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-dashAccent/10 file:text-dashAccent hover:file:bg-dashAccent/20 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingPhoto || !selectedPhoto}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-dashAccent text-white hover:brightness-95 disabled:opacity-50"
                >
                  {loadingPhoto ? "Mengupload..." : "Simpan Foto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL POP-UP EDIT PROFIL --- */}
      {activeModal === "profile" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <h3
              id="profile-modal-title"
              className="text-lg font-bold text-dashNavy mb-4"
            >
              Edit Profil
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent"
                />
              </div>

              {messageEdit.text && (
                <div
                  className={`p-3 rounded-lg text-xs ${messageEdit.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
                >
                  {messageEdit.text}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingEdit}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-dashNavy text-white hover:bg-dashNavy/90 disabled:opacity-50"
                >
                  {loadingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL POP-UP GANTI PASSWORD --- */}
      {activeModal === "password" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-modal-title"
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <h3
              id="password-modal-title"
              className="text-lg font-bold text-dashNavy mb-4"
            >
              Ganti Password
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Password Lama
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent"
                />
              </div>

              {messagePass.text && (
                <div
                  className={`p-3 rounded-lg text-xs ${messagePass.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
                >
                  {messagePass.text}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingPass}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-dashNavy text-white hover:bg-dashNavy/90 disabled:opacity-50"
                >
                  {loadingPass ? "Menyimpan..." : "Perbarui Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
