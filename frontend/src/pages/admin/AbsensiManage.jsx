import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/admin/Toast";
import ConfirmModal from "../../components/admin/ConfirmModal";
import {
  CalendarCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Edit2,
} from "lucide-react";

// ── helpers ─────────────────────────────────────────────────────────────────
const toLocalDateString = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const STATUS_LABELS = {
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

const STATUS_BADGE = {
  hadir: "bg-green-100 text-green-700 border-green-200",
  sakit: "bg-yellow-100 text-yellow-700 border-yellow-200",
  izin: "bg-blue-100 text-blue-700 border-blue-200",
  dd: "bg-purple-100 text-purple-700 border-purple-200",
  bp: "bg-pink-100 text-pink-700 border-pink-200",
  dl: "bg-indigo-100 text-indigo-700 border-indigo-200",
  dik: "bg-teal-100 text-teal-700 border-teal-200",
  satgas: "bg-cyan-100 text-cyan-700 border-cyan-200",
  tk: "bg-red-100 text-red-700 border-red-200",
  belum_diisi: "bg-gray-100 text-gray-500 border-gray-200",
};

const SANGGAHAN_BADGE = {
  none: null,
  pending: "bg-orange-100 text-orange-700 border-orange-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const SANGGAHAN_LABELS = {
  none: "",
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
};

// ── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_BADGE[status] ?? STATUS_BADGE.belum_diisi}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ── EditModal ────────────────────────────────────────────────────────────────
function EditModal({ record, onClose, onSaved }) {
  const [status, setStatus] = useState(record?.status ?? "belum_diisi");
  const [keterangan, setKeterangan] = useState(record?.keterangan ?? "");
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (record) {
      setStatus(record.status);
      setKeterangan(record.keterangan ?? "");
    }
  }, [record]);

  if (!record) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put(`/absensi/${record.id}`, { status, keterangan });
      onSaved();
      onClose();
    } catch (e) {
      showToast("error", e.response?.data?.message ?? "Gagal menyimpan.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4 font-dash">
      <div className="bg-white rounded-lg shadow-dashCard border border-gray-200 w-full max-w-md p-6">
        <h3 className="text-[17px] font-semibold text-dashNavy mb-1">
          Edit Absensi
        </h3>
        <p className="text-sm text-dashNavy/60 mb-5">
          {record.Soldier?.full_name ?? record.Soldier?.username} —{" "}
          {record.tanggal}
        </p>

        <label className="block text-xs font-semibold text-dashNavy/70 uppercase mb-1">
          Status
        </label>
        <select
          id="edit-absensi-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-dashNavy mb-4 focus:outline-none focus:border-dashAccent"
        >
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>

        <label className="block text-xs font-semibold text-dashNavy/70 uppercase mb-1">
          Keterangan (opsional)
        </label>
        <textarea
          id="edit-absensi-keterangan"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-dashNavy mb-5 focus:outline-none focus:border-dashAccent resize-none"
          placeholder="Tambahkan keterangan..."
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-200 text-dashNavy hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            id="edit-absensi-save"
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-md bg-dashNavy text-white hover:bg-dashNavy/90 disabled:opacity-60 transition"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
        <Toast toast={toast} />
      </div>
    </div>
  );
}

// ── ReviewModal ──────────────────────────────────────────────────────────────
function ReviewModal({ record, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  if (!record) return null;

  const doReview = async (action) => {
    try {
      setLoading(true);
      await api.put(`/absensi/${record.id}/review`, { action });
      onSaved();
      onClose();
    } catch (e) {
      showToast("error", e.response?.data?.message ?? "Gagal memproses.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4 font-dash">
      <div className="bg-white rounded-lg shadow-dashCard border border-gray-200 w-full max-w-md p-6">
        <div className="w-9 h-9 rounded-md bg-orange-50 flex items-center justify-center mb-3">
          <AlertCircle className="w-[18px] h-[18px] text-orange-500" />
        </div>
        <h3 className="text-[17px] font-semibold text-dashNavy mb-1">
          Tinjau Sanggahan
        </h3>
        <p className="text-sm text-dashNavy/60 mb-4">
          {record.Soldier?.full_name ?? record.Soldier?.username} —{" "}
          {record.tanggal}
        </p>

        <div className="bg-gray-50 border border-gray-100 rounded-md p-3 mb-2 text-sm space-y-1">
          <div>
            <span className="font-semibold text-dashNavy/60">Status saat ini: </span>
            <StatusBadge status={record.status} />
          </div>
          <div>
            <span className="font-semibold text-dashNavy/60">Usulan: </span>
            <StatusBadge status={record.status_usulan} />
          </div>
          {record.keterangan_sanggahan && (
            <div>
              <span className="font-semibold text-dashNavy/60">Alasan: </span>
              <span className="text-dashNavy">{record.keterangan_sanggahan}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-dashNavy/50 mb-5">
          Jika disetujui, status akan berubah sesuai usulan.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-200 text-dashNavy hover:bg-gray-50 transition"
          >
            Tutup
          </button>
          <button
            id="review-sanggahan-reject"
            onClick={() => doReview("reject")}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition"
          >
            {loading ? "..." : "Tolak"}
          </button>
          <button
            id="review-sanggahan-approve"
            onClick={() => doReview("approve")}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition"
          >
            {loading ? "..." : "Setujui"}
          </button>
        </div>
        <Toast toast={toast} />
      </div>
    </div>
  );
}

// ── main component ───────────────────────────────────────────────────────────
export default function AbsensiManage() {
  const today = toLocalDateString();
  const [tab, setTab] = useState("absensi"); // "absensi" | "sanggahan"
  const [tanggal, setTanggal] = useState(today);
  const [q, setQ] = useState("");
  const [absensiList, setAbsensiList] = useState([]);
  const [sanggahanList, setSanggahanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [reviewRecord, setReviewRecord] = useState(null);
  const { toast, showToast } = useToast();

  const fetchAbsensi = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/absensi", { params: { tanggal } });
      setAbsensiList(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      showToast("error", "Gagal memuat data absensi.");
    } finally {
      setLoading(false);
    }
  }, [tanggal]);

  const fetchSanggahan = useCallback(async () => {
    try {
      const res = await api.get("/absensi", {
        params: { sanggahan_status: "pending" },
      });
      setSanggahanList(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchAbsensi();
    fetchSanggahan();
  }, [fetchAbsensi, fetchSanggahan]);

  const handleSaved = () => {
    fetchAbsensi();
    fetchSanggahan();
    showToast("success", "Berhasil disimpan.");
  };

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("hierarki");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = absensiList.filter((a) => {
    const name = (a.Soldier?.full_name ?? a.Soldier?.username ?? "").toLowerCase();
    const position = (a.Soldier?.OrgStructure?.position ?? "").toLowerCase();
    const lowerQ = q.toLowerCase();
    
    const matchSearch = name.includes(lowerQ) || position.includes(lowerQ);
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    
    return matchSearch && matchStatus;
  });

  const filteredAndSorted = [...filtered].sort((a, b) => {
    const nameA = (a.Soldier?.full_name ?? a.Soldier?.username ?? "").toLowerCase();
    const nameB = (b.Soldier?.full_name ?? b.Soldier?.username ?? "").toLowerCase();
    const statusA = (a.status ?? "").toLowerCase();
    const statusB = (b.status ?? "").toLowerCase();

    if (sortBy === "hierarki") {
      const orderA = a.Soldier?.OrgStructure?.display_order ?? 999999;
      const orderB = b.Soldier?.OrgStructure?.display_order ?? 999999;
      return orderA - orderB;
    }
    if (sortBy === "nama_asc") return nameA.localeCompare(nameB);
    if (sortBy === "nama_desc") return nameB.localeCompare(nameA);
    if (sortBy === "status_asc") return statusA.localeCompare(statusB);
    if (sortBy === "status_desc") return statusB.localeCompare(statusA);
    return 0;
  });

  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedData = filteredAndSorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [q, tanggal, tab, sortBy, filterStatus]);

  const prevDay = () => {
    const d = new Date(tanggal);
    d.setDate(d.getDate() - 1);
    setTanggal(toLocalDateString(d));
  };
  const nextDay = () => {
    const d = new Date(tanggal);
    d.setDate(d.getDate() + 1);
    setTanggal(toLocalDateString(d));
  };

  const pendingCount = sanggahanList.length;

  return (
    <div className="font-dash">
      <h1 className="text-[20px] font-semibold text-dashNavy mb-6">
        Rekap Presensi
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          id="tab-absensi"
          onClick={() => setTab("absensi")}
          className={`px-4 py-2 text-sm font-semibold rounded-t transition ${
            tab === "absensi"
              ? "text-dashNavy border-b-2 border-dashNavy"
              : "text-dashNavy/50 hover:text-dashNavy"
          }`}
        >
          <span className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" />
            Daftar Absensi
          </span>
        </button>
        <button
          id="tab-sanggahan"
          onClick={() => setTab("sanggahan")}
          className={`px-4 py-2 text-sm font-semibold rounded-t transition relative ${
            tab === "sanggahan"
              ? "text-dashNavy border-b-2 border-dashNavy"
              : "text-dashNavy/50 hover:text-dashNavy"
          }`}
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Sanggahan Pending
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                {pendingCount}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* ── TAB: ABSENSI ── */}
      {tab === "absensi" && (
        <>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {/* Date navigator */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 shadow-sm">
              <button
                id="prev-day"
                onClick={prevDay}
                className="p-1 rounded hover:bg-gray-100 transition"
              >
                <ChevronLeft className="w-4 h-4 text-dashNavy" />
              </button>
              <input
                id="tanggal-picker"
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="text-sm text-dashNavy bg-transparent focus:outline-none"
              />
              <button
                id="next-day"
                onClick={nextDay}
                className="p-1 rounded hover:bg-gray-100 transition"
              >
                <ChevronRight className="w-4 h-4 text-dashNavy" />
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dashNavy/40" />
              <input
                id="search-absensi"
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama atau jabatan..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-dashAccent"
              />
            </div>

            {/* Filter Status */}
            <div className="relative shrink-0 w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-40 px-3 py-2 border border-gray-200 rounded-md text-sm text-dashNavy focus:outline-none focus:border-dashAccent appearance-none cursor-pointer bg-white shadow-sm"
              >
                <option value="all">Semua Status</option>
                <option value="hadir">Hadir</option>
                <option value="sakit">Sakit</option>
                <option value="izin">Izin</option>
                <option value="dd">Dinas Dalam</option>
                <option value="bp">Bawah Perintah</option>
                <option value="dl">Dinas Luar</option>
                <option value="dik">Pendidikan</option>
                <option value="satgas">Satgas</option>
                <option value="tk">Tanpa Keterangan</option>
                <option value="belum_diisi">Belum Diisi</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative shrink-0 w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 border border-gray-200 rounded-md text-sm text-dashNavy focus:outline-none focus:border-dashAccent appearance-none cursor-pointer bg-white shadow-sm"
              >
                <option value="hierarki">Urutan Jabatan (Hierarki)</option>
                <option value="nama_asc">Nama (A - Z)</option>
                <option value="nama_desc">Nama (Z - A)</option>
                <option value="status_asc">Status (A - Z)</option>
                <option value="status_desc">Status (Z - A)</option>
              </select>
            </div>

            <button
              id="refresh-absensi"
              onClick={fetchAbsensi}
              className="px-4 py-2 text-sm rounded-md bg-dashNavy text-white hover:bg-dashNavy/90 transition shadow-sm"
            >
              Muat Ulang
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-dashCard overflow-x-auto">
            {loading ? (
              <div className="p-10 text-center text-sm text-dashNavy/50">
                Memuat data absensi...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-sm text-dashNavy/50">
                Tidak ada data untuk tanggal ini.
              </div>
            ) : (
              <table className="w-full text-sm text-dashNavy">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-700">
                    <th className="text-left px-4 py-3 font-semibold">Nama Anggota</th>
                    <th className="text-left px-4 py-3 font-semibold">Jabatan</th>
                    <th className="text-center px-4 py-3 font-semibold">Status</th>
                    <th className="text-center px-4 py-3 font-semibold">Sanggahan</th>
                    <th className="text-left px-4 py-3 font-semibold">Keterangan</th>
                    <th className="text-center px-4 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                    >
                      <td className="px-4 py-3 font-medium">
                        {a.Soldier?.full_name ?? a.Soldier?.username ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-dashNavy/60">
                        {a.Soldier?.OrgStructure?.position ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {a.sanggahan_status !== "none" ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${SANGGAHAN_BADGE[a.sanggahan_status]}`}
                          >
                            {SANGGAHAN_LABELS[a.sanggahan_status]}
                          </span>
                        ) : (
                          <span className="text-dashNavy/30 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-dashNavy/70 max-w-[180px] truncate">
                        {a.keterangan || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`edit-absensi-${a.id}`}
                            onClick={() => setEditRecord(a)}
                            className="p-1.5 rounded-md hover:bg-dashNavy/10 text-dashNavy transition"
                            title="Edit status"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {a.sanggahan_status === "pending" && (
                            <button
                              id={`review-sanggahan-${a.id}`}
                              onClick={() => setReviewRecord(a)}
                              className="px-2 py-1 rounded-md text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 transition font-semibold"
                              title="Tinjau sanggahan"
                            >
                              Tinjau
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="flex gap-2 justify-center mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-md text-sm transition ${p === page ? "bg-dashNavy text-white" : "bg-white border border-gray-200 text-dashNavy hover:border-dashAccent"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TAB: SANGGAHAN ── */}
      {tab === "sanggahan" && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-dashCard overflow-x-auto">
          {sanggahanList.length === 0 ? (
            <div className="p-10 text-center text-sm text-dashNavy/50">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
              Tidak ada sanggahan pending saat ini.
            </div>
          ) : (
            <table className="w-full text-sm text-dashNavy">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-dashNavy/50">
                  <th className="text-left px-4 py-3 font-semibold">Anggota</th>
                  <th className="text-left px-4 py-3 font-semibold">Tanggal</th>
                  <th className="text-center px-4 py-3 font-semibold">Status Saat Ini</th>
                  <th className="text-center px-4 py-3 font-semibold">Usulan</th>
                  <th className="text-left px-4 py-3 font-semibold">Alasan</th>
                  <th className="text-center px-4 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sanggahanList.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition"
                  >
                    <td className="px-4 py-3 font-medium">
                      {a.Soldier?.full_name ?? a.Soldier?.username ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-dashNavy/70">{a.tanggal}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={a.status_usulan} />
                    </td>
                    <td className="px-4 py-3 text-dashNavy/70 max-w-[200px] truncate">
                      {a.keterangan_sanggahan || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        id={`review-pending-${a.id}`}
                        onClick={() => setReviewRecord(a)}
                        className="px-3 py-1 rounded-md text-xs bg-dashNavy text-white hover:bg-dashNavy/90 transition font-semibold"
                      >
                        Tinjau
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modals */}
      <EditModal
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onSaved={handleSaved}
      />
      <ReviewModal
        record={reviewRecord}
        onClose={() => setReviewRecord(null)}
        onSaved={handleSaved}
      />

      <Toast toast={toast} />
    </div>
  );
}
