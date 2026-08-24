import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { useToast } from "../../hooks/useToast";
import Toast from "../../components/admin/Toast";
import ConfirmModal from "../../components/admin/ConfirmModal";
import {
  FileText,
  Search,
  ChevronDown,
  ChevronRight,
  Trash2,
  Users,
  Calendar,
} from "lucide-react";

export default function LaporanManage() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [expanded, setExpanded] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast, showToast } = useToast();

  const fetchLaporan = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (tanggal) params.tanggal = tanggal;
      const res = await api.get("/laporan-harian", { params });
      setLaporan(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      showToast("error", "Gagal memuat laporan harian.");
    } finally {
      setLoading(false);
    }
  }, [tanggal]);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/laporan-harian/${deleteTarget.id}`);
      showToast("success", "Laporan berhasil dihapus.");
      setDeleteTarget(null);
      fetchLaporan();
    } catch (e) {
      showToast("error", e.response?.data?.message ?? "Gagal menghapus.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("hierarki");

  const filtered = laporan.filter((l) => {
    const name = (l.Soldier?.full_name ?? l.Soldier?.username ?? "").toLowerCase();
    const position = (l.Soldier?.OrgStructure?.position ?? "").toLowerCase();
    const lowerQ = q.toLowerCase();
    return name.includes(lowerQ) || position.includes(lowerQ);
  });

  const filteredAndSorted = [...filtered].sort((a, b) => {
    const nameA = (a.Soldier?.full_name ?? a.Soldier?.username ?? "").toLowerCase();
    const nameB = (b.Soldier?.full_name ?? b.Soldier?.username ?? "").toLowerCase();
    const dateA = a.tanggal || "";
    const dateB = b.tanggal || "";
    
    if (sortBy === "hierarki") {
      const orderA = a.Soldier?.OrgStructure?.display_order ?? 999999;
      const orderB = b.Soldier?.OrgStructure?.display_order ?? 999999;
      return orderA - orderB;
    }
    if (sortBy === "nama_asc") return nameA.localeCompare(nameB);
    if (sortBy === "nama_desc") return nameB.localeCompare(nameA);
    if (sortBy === "tanggal_asc") return dateA.localeCompare(dateB);
    if (sortBy === "tanggal_desc") return dateB.localeCompare(dateA);
    return 0;
  });

  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedData = filteredAndSorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page to 1 when search, sort, or date filter changes
  useEffect(() => {
    setPage(1);
  }, [q, tanggal, sortBy]);

  return (
    <div className="font-dash">
      <h1 className="text-[20px] font-semibold text-dashNavy mb-6">
        Laporan Aktivitas Harian
      </h1>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dashNavy/40" />
          <input
            id="search-laporan"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama atau jabatan..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-dashAccent"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 shadow-sm">
          <Calendar className="w-4 h-4 text-dashNavy/50" />
          <input
            id="tanggal-filter-laporan"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="text-sm text-dashNavy bg-transparent focus:outline-none"
          />
          {tanggal && (
            <button
              onClick={() => setTanggal("")}
              className="text-xs text-dashNavy/40 hover:text-red-500 transition"
            >
              ✕
            </button>
          )}
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
            <option value="tanggal_desc">Terbaru</option>
            <option value="tanggal_asc">Terlama</option>
          </select>
        </div>

        <button
          id="refresh-laporan"
          onClick={fetchLaporan}
          className="px-4 py-2 text-sm rounded-md bg-dashNavy text-white hover:bg-dashNavy/90 transition shadow-sm"
        >
          Muat Ulang
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="p-10 text-center text-sm text-dashNavy/50">
          Memuat data laporan...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center text-sm text-dashNavy/50">
          <FileText className="w-8 h-8 mx-auto mb-2 text-dashNavy/20" />
          Tidak ada laporan ditemukan.
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedData.map((l) => (
            <div
              key={l.id}
              className="bg-white border border-gray-200 rounded-lg shadow-dashCard overflow-hidden"
            >
              {/* Header row */}
              <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition">
                <button
                  id={`expand-laporan-${l.id}`}
                  className="flex items-center gap-3 flex-1 text-left"
                  onClick={() => toggleExpand(l.id)}
                >
                  <span className="text-dashNavy/30">
                    {expanded[l.id] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-dashNavy">
                      {l.Soldier?.full_name ?? l.Soldier?.username ?? "—"}
                    </p>
                    <p className="text-xs text-dashNavy/50 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {l.tanggal}
                      <span className="mx-1">·</span>
                      <Users className="w-3 h-3" />
                      {l.LaporanHarianSesis?.length ?? 0} sesi
                      {l.Soldier?.OrgStructure?.position && (
                        <>
                          <span className="mx-1">·</span>
                          <span>{l.Soldier.OrgStructure.position}</span>
                        </>
                      )}
                    </p>
                  </div>
                </button>
                <button
                  id={`delete-laporan-${l.id}`}
                  onClick={() => setDeleteTarget(l)}
                  className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition ml-3"
                  title="Hapus laporan ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Expanded detail */}
              {expanded[l.id] && (
                <div className="border-t border-gray-100 px-4 py-3">
                  {!l.LaporanHarianSesis || l.LaporanHarianSesis.length === 0 ? (
                    <p className="text-sm text-dashNavy/40">Tidak ada sesi.</p>
                  ) : (
                    <div className="space-y-3">
                      {l.LaporanHarianSesis.map((s) => (
                        <div
                          key={s.id}
                          className="flex gap-4 text-sm border-l-2 border-dashSky/40 pl-3"
                        >
                          <span className="text-dashNavy/40 font-semibold whitespace-nowrap w-14 shrink-0">
                            Sesi {s.urutan_sesi}
                          </span>
                          <div className="space-y-0.5 flex-1">
                            <p className="text-dashNavy font-medium">{s.aktivitas}</p>
                            <p className="text-dashNavy/60 text-xs">{s.output_hasil}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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

      <ConfirmModal
        open={!!deleteTarget}
        headerTitle="Hapus Laporan"
        title={`Hapus seluruh laporan milik "${deleteTarget?.Soldier?.full_name ?? deleteTarget?.Soldier?.username}" pada ${deleteTarget?.tanggal}? Semua sesi akan ikut terhapus.`}
        confirmText="Hapus Permanen"
        loading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <Toast toast={toast} />
    </div>
  );
}
