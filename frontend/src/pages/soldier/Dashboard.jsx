import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Fragment,
} from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { formatDate } from "../../lib/dateUtils";
import MiniCalendar from "../../components/common/MiniCalendar";
import PiketUpdateModal from "../../components/soldier/PiketUpdateModal";
import {
  User,
  Lock,
  LogOut,
  CheckCircle2,
  Check,
  Camera,
  ChevronDown,
  ChevronLeft,
  XCircle,
  CalendarCheck,
  FileText,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  ChevronRight,
  Save,
  ShieldCheck,
  Building2,
  Plane,
  GraduationCap,
  Users,
  CornerDownRight,
} from "lucide-react";

const PROKER_PAGE_SIZE = 6;

const StatusBadge = ({ status }) => {
  switch (status) {
    case "hijau":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-500 border border-green-200">
          Beres
        </span>
      );
    case "merah":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-500 border border-cyan-200">
          Terlambat
        </span>
      );
    case "biru":
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-500 border border-blue-200">
          Dalam Pengerjaan
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-200">
          {status}
        </span>
      );
  }
};

// Komponen inline untuk tambah sesi baru ke laporan hari ini
function AddSesiInline({ laporanId, onAdded, showToast }) {
  const [open, setOpen] = useState(false);
  const [aktivitas, setAktivitas] = useState("");
  const [outputHasil, setOutputHasil] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!aktivitas.trim() || !outputHasil.trim()) {
      showToast("error", "Aktivitas dan output harus diisi.");
      return;
    }
    try {
      setLoading(true);
      await api.post("/laporan-harian/sesi", {
        laporan_id: laporanId,
        aktivitas,
        output_hasil: outputHasil,
      });
      showToast("success", "Sesi ditambahkan.");
      setAktivitas("");
      setOutputHasil("");
      setOpen(false);
      onAdded();
    } catch (e) {
      showToast("error", e.response?.data?.message ?? "Gagal menambah sesi.");
    } finally {
      setLoading(false);
    }
  };

  if (!open)
    return (
      <button
        id="inline-add-sesi"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs font-semibold text-dashNavy/60 hover:text-dashNavy transition mt-1"
      >
        <Plus className="w-3 h-3" /> Tambah Sesi Baru
      </button>
    );

  return (
    <div className="border border-dashNavy/20 rounded-lg p-3 space-y-2 bg-dashNavy/5 mt-1">
      <p className="text-xs font-semibold text-dashNavy">Tambah Sesi Baru</p>
      <textarea
        id="inline-aktivitas"
        value={aktivitas}
        onChange={(e) => setAktivitas(e.target.value)}
        rows={2}
        placeholder="Aktivitas..."
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none"
      />
      <textarea
        id="inline-output"
        value={outputHasil}
        onChange={(e) => setOutputHasil(e.target.value)}
        rows={2}
        placeholder="Output/Hasil..."
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-gray-400 hover:text-gray-500"
        >
          Batal
        </button>
        <button
          id="inline-save-sesi"
          onClick={handleSubmit}
          disabled={loading}
          className="text-xs font-semibold text-dashNavy hover:underline disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan Sesi"}
        </button>
      </div>
    </div>
  );
}

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
  const [prokerPage, setProkerPage] = useState(1);

  // State Piket Calendar
  const [piketRefreshTrigger, setPiketRefreshTrigger] = useState(0);
  const [piketModalSchedule, setPiketModalSchedule] = useState(null);

  // ── STATE ABSENSI ────────────────────────────────────────────────────────
  const toLocalToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const [absensiList, setAbsensiList] = useState([]);
  const [absensiStats, setAbsensiStats] = useState({
    hadir: 0,
    sakit: 0,
    izin: 0,
    dd: 0,
    bp: 0,
    dl: 0,
    dik: 0,
    satgas: 0,
    tk: 0,
    belum_diisi: 0,
  });
  const [absensiLoading, setAbsensiLoading] = useState(false);
  const [sanggahanForm, setSanggahanForm] = useState(null); // { id, status_usulan, keterangan_sanggahan }
  const [sanggahanLoading, setSanggahanLoading] = useState(false);

  const fetchAbsensi = useCallback(async () => {
    try {
      setAbsensiLoading(true);
      const today = toLocalToday();
      const [listRes, statsRes] = await Promise.all([
        api.get("/absensi", { params: { tanggal: today } }),
        api.get("/absensi/stats"),
      ]);
      setAbsensiList(Array.isArray(listRes.data) ? listRes.data : []);
      setAbsensiStats(statsRes.data);
    } catch (e) {
      /* silent */
    } finally {
      setAbsensiLoading(false);
    }
  }, []);

  const submitSanggahan = async () => {
    if (!sanggahanForm) return;
    try {
      setSanggahanLoading(true);
      await api.put(`/absensi/${sanggahanForm.id}/sanggahan`, {
        status_usulan: sanggahanForm.status_usulan,
        keterangan_sanggahan: sanggahanForm.keterangan_sanggahan,
      });
      showToast("success", "Sanggahan berhasil diajukan.");
      setSanggahanForm(null);
      fetchAbsensi();
    } catch (e) {
      showToast(
        "error",
        e.response?.data?.message ?? "Gagal mengajukan sanggahan.",
      );
    } finally {
      setSanggahanLoading(false);
    }
  };

  // ── STATE LAPORAN HARIAN ─────────────────────────────────────────────────
  const [laporanList, setLaporanList] = useState([]);
  const [laporanLoading, setLaporanLoading] = useState(false);
  const [laporanExpandedId, setLaporanExpandedId] = useState(null);
  // Form tambah laporan hari ini
  const [showLaporanForm, setShowLaporanForm] = useState(false);
  const [laporanSesiRows, setLaporanSesiRows] = useState([
    { aktivitas: "", output_hasil: "" },
  ]);
  const [laporanSubmitting, setLaporanSubmitting] = useState(false);
  // today's laporan header id (for add/edit sesi on existing)
  const [todayLaporanId, setTodayLaporanId] = useState(null);
  // Edit sesi mode
  const [editSesi, setEditSesi] = useState(null); // { id, aktivitas, output_hasil }
  const [editSesiLoading, setEditSesiLoading] = useState(false);

  const fetchLaporan = useCallback(async () => {
    try {
      setLaporanLoading(true);
      const res = await api.get("/laporan-harian/mine");
      const data = Array.isArray(res.data) ? res.data : [];
      setLaporanList(data);
      const today = toLocalToday();
      const todayEntry = data.find((l) => l.tanggal === today);
      setTodayLaporanId(todayEntry ? todayEntry.id : null);
    } catch (e) {
      /* silent */
    } finally {
      setLaporanLoading(false);
    }
  }, []);

  const submitLaporan = async () => {
    const valid = laporanSesiRows.every(
      (r) => r.aktivitas.trim() && r.output_hasil.trim(),
    );
    if (!valid) {
      showToast("error", "Semua baris sesi harus diisi.");
      return;
    }
    try {
      setLaporanSubmitting(true);
      await api.post("/laporan-harian", { sesi: laporanSesiRows });
      showToast("success", "Laporan berhasil disimpan.");
      setShowLaporanForm(false);
      setLaporanSesiRows([{ aktivitas: "", output_hasil: "" }]);
      fetchLaporan();
    } catch (e) {
      showToast(
        "error",
        e.response?.data?.message ?? "Gagal menyimpan laporan.",
      );
    } finally {
      setLaporanSubmitting(false);
    }
  };

  const addSesiToToday = async () => {
    if (!todayLaporanId) return;
    const row = { aktivitas: "", output_hasil: "" };
    setLaporanSesiRows((prev) => [...prev, row]);
  };

  const submitAddSesi = async (laporan_id, aktivitas, output_hasil) => {
    try {
      await api.post("/laporan-harian/sesi", {
        laporan_id,
        aktivitas,
        output_hasil,
      });
      showToast("success", "Sesi ditambahkan.");
      fetchLaporan();
    } catch (e) {
      showToast("error", e.response?.data?.message ?? "Gagal menambah sesi.");
    }
  };

  const submitEditSesi = async () => {
    if (!editSesi) return;
    try {
      setEditSesiLoading(true);
      await api.put(`/laporan-harian/sesi/${editSesi.id}`, {
        aktivitas: editSesi.aktivitas,
        output_hasil: editSesi.output_hasil,
      });
      showToast("success", "Sesi diperbarui.");
      setEditSesi(null);
      fetchLaporan();
    } catch (e) {
      showToast(
        "error",
        e.response?.data?.message ?? "Gagal memperbarui sesi.",
      );
    } finally {
      setEditSesiLoading(false);
    }
  };

  const deleteSesi = async (sesiId) => {
    if (!window.confirm("Hapus sesi ini?")) return;
    try {
      await api.delete(`/laporan-harian/sesi/${sesiId}`);
      showToast("success", "Sesi dihapus.");
      fetchLaporan();
    } catch (e) {
      showToast("error", e.response?.data?.message ?? "Gagal menghapus sesi.");
    }
  };
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
      .get("/program-kerja", { params: { limit: 50 } })
      .then((res) => setProkers(res.data.data || []))
      .catch((err) => console.error("Gagal memuat program kerja:", err))
      .finally(() => setProkerLoading(false));
  };

  useEffect(() => {
    loadProkers();
    fetchAbsensi();
    fetchLaporan();
  }, [fetchAbsensi, fetchLaporan]);

  // Reset halaman pagination program kerja saat data berubah
  useEffect(() => {
    setProkerPage(1);
  }, [prokers.length]);

  const totalProkerPages = Math.ceil(prokers.length / PROKER_PAGE_SIZE);
  const prokerPageStart = (prokerPage - 1) * PROKER_PAGE_SIZE + 1;
  const prokerPageEnd = Math.min(prokerPage * PROKER_PAGE_SIZE, prokers.length);
  const visibleProkers = prokers.slice(
    (prokerPage - 1) * PROKER_PAGE_SIZE,
    prokerPage * PROKER_PAGE_SIZE,
  );

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
          className={`fixed top-5 right-5 z-[50] flex items-start gap-3 px-5 py-4 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in slide-in-from-top-2 duration-300 ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-cyan-50 border-cyan-200 text-cyan-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
          )}
          <span>{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>
      )}

      {/* 1. NAVBAR / HEADER ATAS DENGAN DROPDOWN PROFIL */}
      <div className="bg-white px-4 md:px-6 lg:px-8 py-2.5 flex justify-between items-center sticky top-0 z-30 lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:z-40 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-dashAccent/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-[18px] h-[18px] text-dashAccent" />
          </div>
          <span className="text-sm font-medium text-dashNavy">
            Satlak Dukteksi PUSSIBERAD
          </span>
        </div>

        {/* Dropdown Profil Kanan Atas */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-dashNavy transition py-1 px-2 rounded-lg hover:bg-gray-50"
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
                <User className="w-4 h-4 text-gray-500" />
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Menu Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-50 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setEditFullName(user?.full_name || "");
                  setEditUsername(user?.username || "");
                  setActiveModal("profile");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition"
              >
                <User className="w-4 h-4 text-gray-500" /> Edit Profil
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setActiveModal("photo");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition"
              >
                <Camera className="w-4 h-4 text-gray-500" /> Ganti Foto Profil
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setActiveModal("password");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition"
              >
                <Lock className="w-4 h-4 text-gray-500" /> Ganti Password
              </button>
              <div className="border-t border-gray-50 my-1"></div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full">
        {/* ── SIDEBAR KIRI — FIXED PANEL (desktop) ── */}
        <aside className="mt-5 flex flex-col gap-4 w-full px-4 md:px-6 lg:mt-0 lg:fixed lg:top-[53px] lg:left-0 lg:z-20 lg:h-[calc(100vh-53px)] lg:w-[380px] lg:overflow-y-auto lg:border-r lg:border-gray-100 lg:bg-gray-50/50 lg:px-6 lg:pt-6 lg:pb-5">
          {/* 2a. Card Profil Ringkas */}
          <div className="w-full shrink-0 bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                {user?.photo ? (
                  <img
                    src={getPhotoUrl(user.photo)}
                    alt="Avatar"
                    className="w-full h-full object-cover object-[50%_10%]"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-800 uppercase truncate">
                  {user?.full_name || user?.username}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  {user?.OrgStructure?.rank || user?.OrgStructure?.position
                    ? `${user?.OrgStructure?.rank || "Pangkat"} | ${user?.OrgStructure?.position || "Jabatan"}`
                    : "Pangkat belum diisi"}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Sat. Dukungan Teknologi Siber
            </p>
          </div>

          {/* 2b. Card Rekap Absensi Ringkas */}
          <div className="w-full shrink-0 bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500 font-medium mb-3">
              Rekap Absensi —{" "}
              {new Date().toLocaleDateString("id-ID", { month: "long" })}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Hadir",
                  value: absensiStats.hadir,
                  bg: "bg-green-50",
                  text: "text-green-600",
                },
                {
                  label: "Sakit",
                  value: absensiStats.sakit,
                  bg: "bg-yellow-50",
                  text: "text-yellow-600",
                },
                {
                  label: "Izin",
                  value: absensiStats.izin,
                  bg: "bg-blue-50",
                  text: "text-blue-600",
                },
                {
                  label: "Alpa",
                  value: absensiStats.tk,
                  bg: "bg-red-50",
                  text: "text-red-600",
                },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-lg p-3 text-center`}>
                  <div className={`text-xl font-bold leading-none ${s.text}`}>
                    {s.value ?? 0}
                  </div>
                  <div className={`text-xs mt-1 ${s.text}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 2c. Card Kategori Penugasan Lain */}
          <div className="w-full flex-1 bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500 font-medium mb-2.5">
              Kategori Penugasan Lain
            </p>
            <div className="space-y-2">
              {[
                { label: "Dinas Dalam", key: "dd", icon: Building2 },
                { label: "Dinas Luar", key: "dl", icon: Plane },
                { label: "Pendidikan", key: "dik", icon: GraduationCap },
                { label: "Satgas", key: "satgas", icon: Users },
                { label: "Bawah Perintah", key: "bp", icon: CornerDownRight },
              ].map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between gap-2 py-1"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <s.icon className="w-5 h-5 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-500 truncate">
                      {s.label}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {absensiStats[s.key] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── KONTEN UTAMA (KOLOM KANAN) ── */}
        <main className="mt-4 lg:mt-[53px] lg:pt-6 space-y-6 min-w-0 px-4 md:px-6 lg:ml-[380px] lg:px-6 lg:max-w-[1400px]">
        {/* 3. BAGIAN UTAMA: PROGRAM KERJA SAYA (JURNAL SAYA) */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Daftar Program Kerja
            </h2>
            <span className="text-xs text-gray-400">
              — {prokers.length} total
            </span>
          </div>

          {prokerLoading ? (
            <p className="text-gray-400 py-10">Memuat program kerja...</p>
          ) : prokers.length === 0 ? (
            <div className="py-8">
              <p className="text-sm text-gray-500">Belum ada program kerja.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibleProkers.map((proker) => (
                <div
                  key={proker.id}
                  className="bg-white border border-gray-200 rounded-[12px] p-5 shadow-sm flex flex-col"
                >
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 text-[15px] mb-1">
                      {proker.program}
                    </h3>
                    <div className="w-full h-px bg-gray-50 my-3"></div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div>
                      <p className="text-sm text-gray-500">
                        {proker.keterangan}
                      </p>
                    </div>

                    <div className="text-[13px] text-gray-500 space-y-1 mt-auto pt-2">
                      <div className="flex justify-between">
                        <span>Penanggung Jawab:</span>
                        <span className="text-gray-500 font-medium">
                          {proker.pic?.position || "Belum ditentukan"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mulai:</span>
                        <span className="text-gray-500">
                          {formatDate(proker.tanggal_mulai)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deadline:</span>
                        <span className="text-gray-500">
                          {formatDate(proker.deadline)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-gray-50 my-4"></div>

                  <div className="flex justify-between items-center mt-auto">
                    <StatusBadge status={proker.status} />
                    {user?.org_structure_id === proker.pic_org_structure_id && (
                      <button
                        onClick={() => handleToggleSelesai(proker)}
                        className="text-xs text-dashNavy font-medium hover:underline flex items-center gap-1"
                      >
                        {proker.is_selesai ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />{" "}
                            Selesai
                          </>
                        ) : (
                          "Tandai Selesai"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              </div>

              {totalProkerPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-400">
                    Menampilkan {prokerPageStart}–{prokerPageEnd} dari{" "}
                    {prokers.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setProkerPage((p) => Math.max(1, p - 1))}
                      disabled={prokerPage === 1}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalProkerPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setProkerPage(p)}
                          className={`w-7 h-7 text-xs font-semibold rounded-lg transition ${
                            p === prokerPage
                              ? "bg-dashNavy text-white"
                              : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                    <button
                      onClick={() =>
                        setProkerPage((p) => Math.min(totalProkerPages, p + 1))
                      }
                      disabled={prokerPage === totalProkerPages}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── 4. KALENDER PIKET SAYA ── */}
        <div>
          <div className="mb-4">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Kalender Piket Saya
            </h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-[12px] p-5 shadow-sm">
            <MiniCalendar
              isSoldier={true}
              currentUser={user}
              onUpdateClick={(schedule) => setPiketModalSchedule(schedule)}
              refreshTrigger={piketRefreshTrigger}
            />
          </div>
        </div>

        {/* ── 5. REKAP ABSENSI — DETAIL ── */}
        <div>
          <div className="flex items-center justify-between mb-[14px]">
            <h2 className="text-[14.5px] font-bold tracking-[0.02em] uppercase text-[#3C4453] flex items-center gap-2">
              <CalendarCheck className="w-4 h-4" /> Rekap Absensi — Detail
            </h2>
            <span className="text-[12px] text-[#767E8C] border border-[#E5E8EF] px-[10px] py-[4px] rounded-full">
              {new Date().toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Table */}
          {absensiLoading ? (
            <p className="text-gray-400 py-4 text-sm">Memuat absensi...</p>
          ) : absensiList.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada data absensi.</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-sm text-gray-500">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-400 uppercase border-b border-gray-50">
                    <th className="text-left px-4 py-3 font-semibold">
                      Tanggal
                    </th>
                    <th className="text-center px-4 py-3 font-semibold">
                      Status
                    </th>
                    <th className="text-center px-4 py-3 font-semibold">
                      Sanggahan
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">
                      Keterangan
                    </th>
                    <th className="text-center px-4 py-3 font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {absensiList.map((a) => {
                    const statusColors = {
                      hadir: "bg-green-50 text-green-500",
                      sakit: "bg-yellow-50 text-yellow-500",
                      izin: "bg-blue-50 text-blue-500",
                      dd: "bg-purple-50 text-purple-500",
                      bp: "bg-pink-50 text-pink-500",
                      dl: "bg-indigo-50 text-indigo-500",
                      dik: "bg-teal-50 text-teal-500",
                      satgas: "bg-cyan-50 text-cyan-500",
                      tk: "bg-red-50 text-red-500",
                      belum_diisi: "bg-gray-50 text-gray-500",
                    };
                    const statusLabels = {
                      hadir: "Hadir",
                      sakit: "Sakit",
                      izin: "Izin",
                      dd: "Dinas Dalam",
                      bp: "Bawah Perintah",
                      dl: "Dinas Luar",
                      dik: "Pendidikan",
                      satgas: "Satgas",
                      tk: "Tanpa Keterangan",
                      belum_diisi: "Belum Diisi",
                    };
                    const sanggahanColors = {
                      none: "",
                      pending: "bg-orange-50 text-orange-500",
                      approved: "bg-green-50 text-green-500",
                      rejected: "bg-cyan-50 text-cyan-500",
                    };
                    const sanggahanLabels = {
                      none: "—",
                      pending: "Menunggu",
                      approved: "Disetujui",
                      rejected: "Ditolak",
                    };
                    const isPending = a.sanggahan_status === "pending";
                    const isFormOpen = sanggahanForm?.id === a.id;
                    return (
                      <Fragment key={a.id}>
                        <tr
                          key={a.id}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                        >
                          <td className="px-4 py-3 font-medium font-mono text-xs text-dashNavy">
                            {a.tanggal}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusColors[a.status] ?? "bg-gray-50 text-gray-500"}`}
                            >
                              {statusLabels[a.status] ?? a.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {a.sanggahan_status !== "none" ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${sanggahanColors[a.sanggahan_status]}`}
                              >
                                {sanggahanLabels[a.sanggahan_status]}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">
                            {a.keterangan || "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {!isPending && (
                              <button
                                id={`sanggahan-btn-${a.id}`}
                                onClick={() =>
                                  setSanggahanForm(
                                    isFormOpen
                                      ? null
                                      : {
                                          id: a.id,
                                          status_usulan: a.status,
                                          keterangan_sanggahan: "",
                                        },
                                  )
                                }
                                className="px-2 py-1 text-xs rounded-lg bg-dashNavy/10 text-dashNavy hover:bg-dashNavy/20 transition font-semibold"
                              >
                                {isFormOpen ? "Batal" : "Sanggah"}
                              </button>
                            )}
                            {isPending && (
                              <span className="text-xs text-orange-500 font-semibold flex items-center gap-1 justify-center">
                                <AlertCircle className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                        {isFormOpen && (
                          <tr key={`form-${a.id}`}>
                            <td
                              colSpan={5}
                              className="px-4 pb-3 pt-0 bg-orange-50/50"
                            >
                              <div className="border border-orange-200 rounded-xl p-4 space-y-3">
                                <p className="text-xs font-semibold text-orange-500">
                                  Ajukan Sanggahan
                                </p>
                                <div>
                                  <label className="text-xs text-gray-500 mb-1 block">
                                    Status Usulan
                                  </label>
                                  <select
                                    id="sanggahan-status-usulan"
                                    value={sanggahanForm.status_usulan}
                                    onChange={(e) =>
                                      setSanggahanForm((prev) => ({
                                        ...prev,
                                        status_usulan: e.target.value,
                                      }))
                                    }
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-dashAccent"
                                  >
                                    {[
                                      { value: "hadir", label: "Hadir" },
                                      { value: "sakit", label: "Sakit" },
                                      { value: "izin", label: "Izin" },
                                      { value: "dd", label: "Dinas Dalam" },
                                      { value: "bp", label: "Bawah Perintah" },
                                      { value: "dl", label: "Dinas Luar" },
                                      { value: "dik", label: "Pendidikan" },
                                      { value: "satgas", label: "Satgas" },
                                      {
                                        value: "tk",
                                        label: "Tanpa Keterangan",
                                      },
                                    ].map((s) => (
                                      <option key={s.value} value={s.value}>
                                        {s.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500 mb-1 block">
                                    Alasan
                                  </label>
                                  <textarea
                                    id="sanggahan-keterangan"
                                    value={sanggahanForm.keterangan_sanggahan}
                                    onChange={(e) =>
                                      setSanggahanForm((prev) => ({
                                        ...prev,
                                        keterangan_sanggahan: e.target.value,
                                      }))
                                    }
                                    rows={2}
                                    placeholder="Jelaskan alasan sanggahan..."
                                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-dashAccent resize-none"
                                  />
                                </div>
                                <button
                                  id="sanggahan-submit"
                                  onClick={submitSanggahan}
                                  disabled={sanggahanLoading}
                                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-500 disabled:opacity-60 transition"
                                >
                                  {sanggahanLoading
                                    ? "Mengajukan..."
                                    : "Kirim Sanggahan"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── 6. LAPORAN AKTIVITAS HARIAN ── */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4" /> Laporan Aktivitas Harian
            </h2>
            {!todayLaporanId && !showLaporanForm && (
              <button
                id="buat-laporan-hari-ini"
                onClick={() => setShowLaporanForm(true)}
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold rounded-lg bg-dashNavy text-white hover:bg-dashNavy/90 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Buat Laporan Hari Ini
              </button>
            )}
          </div>

          {/* Form buat laporan baru (hari ini) */}
          {showLaporanForm && !todayLaporanId && (
            <div className="bg-white border border-dashNavy/20 rounded-xl p-5 mb-5 shadow-sm">
              <p className="text-sm font-semibold text-dashNavy mb-3">
                Laporan Hari Ini
              </p>
              <div className="space-y-3">
                {laporanSesiRows.map((row, i) => (
                  <div
                    key={i}
                    className="border border-gray-50 rounded-lg p-3 space-y-2"
                  >
                    <p className="text-xs font-semibold text-gray-400">
                      Sesi {i + 1}
                    </p>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Aktivitas
                      </label>
                      <textarea
                        id={`sesi-aktivitas-${i}`}
                        value={row.aktivitas}
                        onChange={(e) =>
                          setLaporanSesiRows((prev) =>
                            prev.map((r, idx) =>
                              idx === i
                                ? { ...r, aktivitas: e.target.value }
                                : r,
                            ),
                          )
                        }
                        rows={2}
                        placeholder="Uraikan aktivitas yang dilakukan..."
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-dashAccent resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">
                        Output / Hasil
                      </label>
                      <textarea
                        id={`sesi-output-${i}`}
                        value={row.output_hasil}
                        onChange={(e) =>
                          setLaporanSesiRows((prev) =>
                            prev.map((r, idx) =>
                              idx === i
                                ? { ...r, output_hasil: e.target.value }
                                : r,
                            ),
                          )
                        }
                        rows={2}
                        placeholder="Hasil yang dicapai..."
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-dashAccent resize-none"
                      />
                    </div>
                    {laporanSesiRows.length > 1 && (
                      <button
                        onClick={() =>
                          setLaporanSesiRows((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          )
                        }
                        className="text-xs text-cyan-400 hover:text-cyan-500"
                      >
                        Hapus sesi ini
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button
                  id="tambah-sesi-baru"
                  onClick={() =>
                    setLaporanSesiRows((prev) => [
                      ...prev,
                      { aktivitas: "", output_hasil: "" },
                    ])
                  }
                  className="flex items-center gap-1 text-xs font-semibold text-dashNavy hover:underline"
                >
                  <Plus className="w-3 h-3" /> Tambah Sesi
                </button>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => {
                      setShowLaporanForm(false);
                      setLaporanSesiRows([{ aktivitas: "", output_hasil: "" }]);
                    }}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    id="simpan-laporan"
                    onClick={submitLaporan}
                    disabled={laporanSubmitting}
                    className="px-4 py-1.5 text-xs font-semibold bg-dashNavy text-white rounded-lg hover:bg-dashNavy/90 disabled:opacity-60 transition flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {laporanSubmitting ? "Menyimpan..." : "Simpan Laporan"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Daftar laporan */}
          {laporanLoading ? (
            <p className="text-gray-400 py-4 text-sm">Memuat laporan...</p>
          ) : laporanList.length === 0 ? (
            <p className="text-sm text-gray-400">
              Belum ada laporan aktivitas.
            </p>
          ) : (
            <div className="space-y-3">
              {laporanList.map((l) => {
                const isToday = l.tanggal === toLocalToday();
                const isExpanded = laporanExpandedId === l.id;
                return (
                  <div
                    key={l.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                  >
                    <button
                      id={`expand-laporan-${l.id}`}
                      onClick={() =>
                        setLaporanExpandedId(isExpanded ? null : l.id)
                      }
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 text-left transition"
                    >
                      <span className="text-sm font-semibold text-dashNavy">
                        {l.tanggal}{" "}
                        {isToday && (
                          <span className="ml-2 text-xs text-dashAccent font-normal">
                            (Hari Ini)
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{l.LaporanHarianSesis?.length ?? 0} sesi</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-gray-50 px-4 py-3 space-y-3">
                        {l.LaporanHarianSesis?.map((s) => (
                          <div key={s.id}>
                            {editSesi?.id === s.id ? (
                              <div className="border border-dashNavy/20 rounded-lg p-3 space-y-2">
                                <textarea
                                  id={`edit-aktivitas-${s.id}`}
                                  value={editSesi.aktivitas}
                                  onChange={(e) =>
                                    setEditSesi((prev) => ({
                                      ...prev,
                                      aktivitas: e.target.value,
                                    }))
                                  }
                                  rows={2}
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none"
                                />
                                <textarea
                                  id={`edit-output-${s.id}`}
                                  value={editSesi.output_hasil}
                                  onChange={(e) =>
                                    setEditSesi((prev) => ({
                                      ...prev,
                                      output_hasil: e.target.value,
                                    }))
                                  }
                                  rows={2}
                                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none resize-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditSesi(null)}
                                    className="text-xs text-gray-400 hover:text-gray-500"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    id={`save-edit-sesi-${s.id}`}
                                    onClick={submitEditSesi}
                                    disabled={editSesiLoading}
                                    className="text-xs font-semibold text-dashNavy hover:underline"
                                  >
                                    {editSesiLoading
                                      ? "Menyimpan..."
                                      : "Simpan"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-3 border-l-2 border-dashSky/40 pl-3">
                                <div className="flex-1">
                                  <p className="text-xs text-gray-400 font-semibold">
                                    Sesi {s.urutan_sesi}
                                  </p>
                                  <p className="text-sm text-dashNavy font-medium mt-0.5">
                                    {s.aktivitas}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {s.output_hasil}
                                  </p>
                                </div>
                                {isToday && (
                                  <div className="flex gap-1.5 mt-1 shrink-0">
                                    <button
                                      id={`edit-sesi-${s.id}`}
                                      onClick={() =>
                                        setEditSesi({
                                          id: s.id,
                                          aktivitas: s.aktivitas,
                                          output_hasil: s.output_hasil,
                                        })
                                      }
                                      className="p-1 rounded hover:bg-gray-50 text-dashNavy/60 hover:text-dashNavy transition"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      id={`delete-sesi-${s.id}`}
                                      onClick={() => deleteSesi(s.id)}
                                      className="p-1 rounded hover:bg-cyan-50 text-cyan-400 hover:text-cyan-500 transition"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {/* Add sesi on today's laporan */}
                        {isToday && (
                          <AddSesiInline
                            laporanId={l.id}
                            onAdded={fetchLaporan}
                            showToast={showToast}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </main>
      </div>

      {/* PIKET UPDATE MODAL */}
      {piketModalSchedule && (
        <PiketUpdateModal
          schedule={piketModalSchedule}
          onClose={() => setPiketModalSchedule(null)}
          onSuccess={() => setPiketRefreshTrigger((prev) => prev + 1)}
          showToast={showToast}
        />
      )}

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
                <div className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-3">
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

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
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
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
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
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
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
                  className={`p-3 rounded-lg text-xs ${messageEdit.type === "error" ? "bg-cyan-50 text-cyan-500" : "bg-green-50 text-green-500"}`}
                >
                  {messageEdit.text}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
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
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
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
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
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
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
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
                  className={`p-3 rounded-lg text-xs ${messagePass.type === "error" ? "bg-cyan-50 text-cyan-500" : "bg-green-50 text-green-500"}`}
                >
                  {messagePass.text}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
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
