import { useEffect, useState, useMemo } from "react";
import { formatDate } from "../../lib/dateUtils";
import {
  Search,
  ArrowUpDown,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import api from "../../services/api";
import FormModal from "../../components/admin/FormModal";
import ConfirmModal from "../../components/admin/ConfirmModal";
import Toast from "../../components/admin/Toast";
import InfoCardGrid from "../../components/admin/InfoCardGrid";
import PageHeader from "../../components/admin/PageHeader";
import { HIDDEN_NODES, isHiddenNode } from "../../constants/appConstants";
import { useToast } from "../../hooks/useToast";

// Helper untuk format YYYY-MM ke "NamaBulan Tahun"
const formatMonthYear = (yyyy_mm) => {
  if (!yyyy_mm) return "Tanpa Tanggal";
  const [year, month] = yyyy_mm.split("-");
  const date = new Date(year, parseInt(month) - 1);
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};

// Ambil bulan real-time saat komponen dimuat (Format Lokal)
const getRealtimeMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const StatusBadge = ({ status }) => {
  switch (status?.toLowerCase()) {
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
          {status || "Unknown"}
        </span>
      );
  }
};

const ProgramCard = ({ item, onEdit, onDelete }) => (
  <div
    className={`flex flex-col md:flex-row md:items-center justify-between bg-white border ${item.is_selesai ? "border-green-200 bg-green-50/30" : "border-gray-200"} rounded-lg p-4 shadow-sm hover:border-dashAccent/40 transition gap-4`}
  >
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-[16px] font-bold text-dashNavy uppercase flex items-center gap-2">
          {item.program}
          {item.is_selesai && (
            <CheckCircle2
              className="w-4 h-4 text-green-600"
              title="Telah Dikonfirmasi Selesai"
            />
          )}
        </h3>
        <StatusBadge status={item.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mt-2">
        <div>
          <p className="font-semibold text-gray-700">Penanggung Jawab:</p>
          {item.pic ? (
            <div>
              <div className="font-medium">{item.pic.position}</div>
              <div className="text-xs text-gray-500">
                {item.pic.name || "Belum ada nama"}
              </div>
            </div>
          ) : (
            <span className="text-gray-400 italic">Belum ditentukan</span>
          )}
        </div>

        <div>
          <p className="font-semibold text-gray-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" /> Timeline Pengerjaan:
          </p>
          <div className="text-xs space-y-1 mt-1.5">
            <div className="flex justify-between max-w-[200px]">
              <span className="text-gray-500">Mulai:</span>
              <span className="font-medium">{formatDate(item.tanggal_mulai)}</span>
            </div>
            <div className="flex justify-between max-w-[200px]">
              <span className="text-gray-500">Deadline:</span>
              <span className="font-medium text-red-600">
                {formatDate(item.deadline)}
              </span>
            </div>
            <div className="flex justify-between max-w-[200px] pt-1 border-t border-gray-100">
              <span className="text-gray-500">Selesai:</span>
              {item.tanggal_selesai ? (
                <span className="font-bold text-green-600">
                  {formatDate(item.tanggal_selesai)}
                </span>
              ) : (
                <span className="italic text-blue-500 font-medium">
                  Menunggu realisasi...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2 md:flex-col lg:flex-row shrink-0">
      <button
        onClick={() => onEdit(item)}
        className="flex items-center gap-1.5 bg-dashAccent/10 text-dashAccent hover:bg-dashAccent hover:text-white rounded-md px-4 py-2 text-sm font-semibold transition w-full justify-center whitespace-nowrap"
      >
        <Edit2 className="w-4 h-4" />{" "}
        {item.is_selesai ? "Detail / Edit" : "Update & Verifikasi"}
      </button>
      <button
        onClick={() => onDelete(item)}
        className="flex items-center gap-1.5 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-md px-4 py-2 text-sm font-semibold transition w-full justify-center"
      >
        <Trash2 className="w-4 h-4" /> Hapus
      </button>
    </div>
  </div>
);

export default function ProgramKerjaManage() {
  const [rawItems, setRawItems] = useState([]);
  const [orgStructures, setOrgStructures] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("deadline_asc");
  const [selectedMonth, setSelectedMonth] = useState(getRealtimeMonth());

  // State Modal Form
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // State Modal Confirm Delete
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { toast, showToast } = useToast();

  const loadData = () => {
    setLoading(true);
    api
      .get("/program-kerja")
      .then((r) => setRawItems(r.data.data || r.data))
      .catch(() => showToast("Gagal memuat data program kerja.", "error"))
      .finally(() => setLoading(false));
  };

  const loadOrgStructures = () => {
    api
      .get("/org-structures", { params: { limit: 100 } })
      .then((res) => {
        const options = res.data.data
          .filter(
            (item) =>
              !isHiddenNode(item.position),
          )
          .map((item) => ({
            value: item.id,
            label: `${item.position} — ${item.name || "Belum ada nama"}`,
          }));
        setOrgStructures(options);
      })
      .catch((err) =>
        console.error(
          "Gagal memuat struktur organisasi untuk dropdown PIC",
          err,
        ),
      );
  };

  useEffect(() => {
    loadData();
    loadOrgStructures();
  }, []);

  const fields = useMemo(() => [
    {
      name: "program",
      label: "Nama Program / Tugas",
      type: "text",
      required: true,
      colSpan: 2,
    },
    {
      name: "pic_org_structure_id",
      label: "Penanggung Jawab (PIC)",
      type: "select",
      options: orgStructures,
      colSpan: 2,
    },
    {
      name: "keterangan",
      label: "Keterangan",
      type: "textarea",
      required: true,
      colSpan: 2,
    },
    {
      name: "tanggal_mulai",
      label: "Tanggal Mulai",
      type: "date",
      required: true,
      colSpan: 1,
    },
    {
      name: "deadline",
      label: "Deadline Target",
      type: "date",
      required: true,
      colSpan: 1,
    },
    {
      name: "tanggal_selesai",
      label: "Tanggal Selesai Aktual (Opsional)",
      type: "date",
      required: false,
      colSpan: 1,
    },
    {
      name: "is_selesai",
      label: "Konfirmasi Telah Selesai",
      type: "checkbox",
      colSpan: 1,
    },
    {
      name: "alasan_keterlambatan",
      label: "Alasan Keterlambatan (Wajib jika Terlambat)",
      type: "textarea",
      colSpan: 2,
      required: true, // Pastikan ada koma di sini
      showIf: (values) => {
        // Jika sudah selesai, tidak perlu alasan
        if (values.is_selesai) return false;
        // Jika belum ada deadline (baru buat), tidak perlu alasan
        if (!values.deadline) return false;

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const deadlineDate = new Date(values.deadline);
        deadlineDate.setHours(0, 0, 0, 0);

        // Munculkan form jika hari ini sudah melewati deadline
        return now > deadlineDate;
      },
    },
  ], [orgStructures]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Normalisasi payload dengan mengirim null secara eksplisit
      const payload = {
        ...values,
        is_selesai: !!values.is_selesai,
        tanggal_selesai: values.tanggal_selesai || null,
        alasan_keterlambatan: values.alasan_keterlambatan || null,
        pic_org_structure_id: values.pic_org_structure_id || null,
      };

      if (editing && editing.id) {
        await api.put(`/program-kerja/${editing.id}`, payload);
        showToast("Program kerja berhasil diperbarui / diverifikasi.");
      } else {
        await api.post("/program-kerja", payload);
        showToast("Program kerja baru berhasil ditambahkan.");
      }

      setFormOpen(false);
      loadData();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Gagal menyimpan ke database.";
      showToast(errorMessage, "error");

      console.error("Detail Error Backend:", err.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteConfirm = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/program-kerja/${itemToDelete.id}`);
      showToast(`Program kerja "${itemToDelete.program}" berhasil dihapus.`);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gagal menghapus data.",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  const availableMonths = useMemo(() => {
    const months = new Set();
    months.add(getRealtimeMonth());

    rawItems.forEach((item) => {
      if (item.tanggal_mulai) {
        months.add(item.tanggal_mulai.slice(0, 7));
      }
    });

    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [rawItems]);

  const metrics = useMemo(() => {
    if (!rawItems || rawItems.length === 0) return null;
    
    const selesai = rawItems.filter(p => p.is_selesai).length;
    const belum = rawItems.filter(p => !p.is_selesai).length;
    const terlambat = rawItems.filter(p => {
      if (p.is_selesai) return false;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const deadline = new Date(p.deadline);
      deadline.setHours(0, 0, 0, 0);
      return now > deadline;
    }).length;

    return {
      total: rawItems.length,
      selesai,
      belum,
      terlambat
    };
  }, [rawItems]);

  const infoCards = [
    { label: 'Total Program', value: metrics?.total || 0, loading },
    { label: 'Selesai', value: metrics?.selesai || 0, loading },
    { label: 'Dalam Pengerjaan', value: metrics?.belum || 0, loading },
    { label: 'Terlambat', value: metrics?.terlambat || 0, loading },
  ];

  const filteredAndSortedItems = useMemo(() => {
    let result = [...rawItems];

    result = result.filter((item) => {
      if (selectedMonth === "all") return true;
      if (!item.tanggal_mulai) return false;
      return item.tanggal_mulai.startsWith(selectedMonth);
    });

    if (q.trim()) {
      const lowerQ = q.toLowerCase();
      result = result.filter(
        (item) =>
          (item.program || "").toLowerCase().includes(lowerQ) ||
          (item.pic?.name || "").toLowerCase().includes(lowerQ) ||
          (item.pic?.position || "").toLowerCase().includes(lowerQ),
      );
    }

    result.sort((a, b) => {
      const progA = (a.program || "").toLowerCase();
      const progB = (b.program || "").toLowerCase();
      const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
      const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;

      switch (sortBy) {
        case "nama_asc":
          return progA.localeCompare(progB);
        case "nama_desc":
          return progB.localeCompare(progA);
        case "deadline_asc":
          return dateA - dateB;
        case "deadline_desc":
          return dateB - dateA;
        default:
          return 0;
      }
    });

    return result;
  }, [rawItems, q, sortBy, selectedMonth]);

  return (
    <div className="font-dash">
      <PageHeader
        title="Manajemen Program Kerja"
        subtitle="Buat program kerja baru, serahkan eksekusi ke PIC, dan verifikasi penyelesaiannya di sini."
      />

      <div className="mb-5">
        <InfoCardGrid cards={infoCards} />
      </div>

      <div className="flex flex-col xl:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama program atau PIC..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="relative w-full sm:w-auto">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition appearance-none cursor-pointer"
            >
              <option value="all">Semua Waktu</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthYear(m)}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition appearance-none cursor-pointer"
            >
              <option value="deadline_asc">Deadline Terdekat</option>
              <option value="deadline_desc">Deadline Terjauh</option>
              <option value="nama_asc">Nama Program (A - Z)</option>
              <option value="nama_desc">Nama Program (Z - A)</option>
            </select>
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 bg-dashAccent text-white hover:bg-dashAccent/90 rounded-md px-4 py-2.5 text-sm font-semibold transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Buat Proker
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 shadow-dashCard border border-gray-200">
        {loading && (
          <p className="text-center text-dashNavy/40 py-10">
            Memuat data program kerja...
          </p>
        )}

        {!loading && rawItems.length === 0 && (
          <div className="text-center py-10">
            <p className="text-dashNavy/60 mb-3">
              Belum ada data program kerja sama sekali.
            </p>
            <button
              onClick={openAdd}
              className="text-dashAccent hover:underline text-sm font-medium"
            >
              + Buat Program Kerja Pertama
            </button>
          </div>
        )}

        {!loading &&
          filteredAndSortedItems.length === 0 &&
          rawItems.length > 0 && (
            <p className="text-center text-dashNavy/40 py-10">
              {selectedMonth !== "all"
                ? `Tidak ada program kerja untuk bulan ${formatMonthYear(selectedMonth)}.`
                : "Program kerja tidak ditemukan untuk kata kunci pencarian ini."}
            </p>
          )}

        {!loading && filteredAndSortedItems.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 mb-4 px-2 uppercase tracking-wide flex justify-between">
              <span>
                {selectedMonth === "all"
                  ? "Semua Bulan"
                  : formatMonthYear(selectedMonth)}
              </span>
              <span>{filteredAndSortedItems.length} program</span>
            </p>
            {filteredAndSortedItems.map((item) => (
              <ProgramCard
                key={item.id}
                item={item}
                onEdit={openEdit}
                onDelete={openDeleteConfirm}
              />
            ))}
          </div>
        )}
      </div>

      <FormModal
        open={formOpen}
        title={
          editing
            ? "Verifikasi / Edit Program Kerja"
            : "Buat Program Kerja Baru"
        }
        fields={fields}
        initialValues={editing || {}}
        submitting={submitting}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={deleteConfirmOpen}
        headerTitle="Hapus Program Kerja"
        title={`Yakin ingin menghapus program kerja "${itemToDelete?.program}"? Data yang sudah dihapus tidak dapat dikembalikan.`}
        confirmText="Hapus"
        loading={deleting}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={executeDelete}
      />

      <Toast toast={toast} />
    </div>
  );
}
