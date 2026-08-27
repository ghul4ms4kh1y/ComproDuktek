import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Edit2, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import api from "../../services/api";
import ConfirmModal from "../../components/admin/ConfirmModal";
import FormModal from "../../components/admin/FormModal";
import Toast from "../../components/admin/Toast";
import { useToast } from "../../hooks/useToast";

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const statusOptions = [
  { value: "scheduled", label: "Terjadwal" },
  { value: "completed", label: "Selesai" },
  { value: "absent", label: "Tidak Hadir" },
];

const getToday = () => {
  const today = new Date();
  return {
    bulan: today.getMonth() + 1,
    tahun: today.getFullYear(),
    tanggal: formatLocalDate(today),
  };
};

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getDayName = (date) => HARI[new Date(`${date}T00:00:00`).getDay()];

const getWorkdaysCount = (bulan, tahun) => {
  const totalDays = new Date(tahun, bulan, 0).getDate();
  let count = 0;

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(tahun, bulan - 1, day);
    const weekDay = date.getDay();
    if (weekDay !== 0 && weekDay !== 6) count++;
  }

  return count;
};

const StatusBadge = ({ status }) => {
  const map = {
    scheduled: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    absent: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
      {statusOptions.find((s) => s.value === status)?.label || status}
    </span>
  );
};

export default function JadwalPiketManage() {
  const today = useMemo(getToday, []);
  const [bulan, setBulan] = useState(today.bulan);
  const [tahun, setTahun] = useState(today.tahun);
  const [items, setItems] = useState([]);
  const [soldiers, setSoldiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const workdaysCount = useMemo(() => getWorkdaysCount(bulan, tahun), [bulan, tahun]);
  const remainingSoldiers = Math.max(soldiers.length - workdaysCount, 0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jadwalRes, soldierRes] = await Promise.all([
        api.get("/jadwal-piket", { params: { bulan, tahun, limit: 100 } }),
        api.get("/soldiers", { params: { limit: 1000 } }),
      ]);
      const soldierData = Array.isArray(soldierRes.data) ? soldierRes.data : soldierRes.data.data || [];
      setItems(jadwalRes.data.data || []);
      setSoldiers(soldierData);
    } catch (error) {
      console.error("Fetch error:", error);
      showToast(error.response?.data?.message || "Gagal memuat data jadwal piket.", "error");
      setSoldiers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [bulan, tahun]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/jadwal-piket/generate", { bulan, tahun });
      showToast(`${res.data.message} Total: ${res.data.meta.total_generated} hari kerja.`, "success");
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || "Gagal generate jadwal piket.", "error");
      setLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await api.put(`/jadwal-piket/${editingItem.id}`, formData);
      setEditingItem(null);
      showToast("Jadwal piket berhasil diperbarui.", "success");
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || "Gagal memperbarui jadwal piket.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/jadwal-piket/${deleteItem.id}`);
      setDeleteItem(null);
      showToast("Jadwal piket berhasil dihapus.", "success");
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || "Gagal menghapus jadwal piket.", "error");
    }
  };

  const handleReset = async () => {
    try {
      await api.delete("/jadwal-piket/reset", { params: { bulan, tahun } });
      setResetOpen(false);
      showToast("Jadwal piket bulan ini berhasil direset.", "success");
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || "Gagal reset jadwal piket.", "error");
    }
  };

  const fields = [
    {
      name: "soldier_id",
      label: "Anggota Piket",
      type: "select",
      required: true,
      options: soldiers.length > 0
        ? soldiers.map((soldier) => ({
            value: String(soldier.id),
            label: soldier.full_name || soldier.username,
          }))
        : [{ value: "", label: "Memuat data anggota..." }],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: statusOptions,
    },
    {
      name: "keterangan",
      label: "Keterangan",
      type: "textarea",
      required: false,
    },
  ];

  return (
    <div className="font-dash space-y-5">
      <Toast toast={toast} onClose={hideToast} />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold text-dashNavy">Jadwal Piket</h1>
          <p className="text-sm text-dashNavy/60 mt-1">Kelola jadwal piket hari kerja Satlak Duktek.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/30">
            {BULAN.map((label, index) => (
              <option key={label} value={index + 1}>{label}</option>
            ))}
          </select>
          <input type="number" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/30" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-dashCard">
          <p className="text-xs text-dashNavy/50">Hari Kerja</p>
          <p className="text-2xl font-semibold text-dashNavy">{workdaysCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-dashCard">
          <p className="text-xs text-dashNavy/50">Jadwal Terisi</p>
          <p className="text-2xl font-semibold text-dashNavy">{items.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-dashCard">
          <p className="text-xs text-dashNavy/50">Total Anggota</p>
          <p className="text-2xl font-semibold text-dashNavy">
            {loading ? "..." : (soldiers.length > 0 ? soldiers.length : "—")}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-dashCard">
          <p className="text-xs text-dashNavy/50">Lanjut Bulan Depan</p>
          <p className="text-2xl font-semibold text-dashNavy">
            {loading ? "..." : (soldiers.length > 0 ? remainingSoldiers : "—")}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-dashCard flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <p className="text-sm text-dashNavy/70">
          {BULAN[bulan - 1]} {tahun} · Weekend otomatis tidak dijadwalkan.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={handleGenerate} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-dashAccent px-4 py-2 text-sm font-semibold text-white hover:bg-dashAccent/90 disabled:opacity-60">
            <RefreshCw className="w-4 h-4" /> Generate Jadwal
          </button>
          <button onClick={() => setResetOpen(true)} disabled={loading || items.length === 0} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
            <RotateCcw className="w-4 h-4" /> Reset Bulan Ini
          </button>
        </div>
      </div>

      <div className="hidden lg:block bg-white border border-gray-200 rounded-lg shadow-dashCard overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-dashNavy/5 text-dashNavy">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Tanggal</th>
              <th className="text-left px-4 py-3 font-semibold">Hari</th>
              <th className="text-left px-4 py-3 font-semibold">Anggota</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-left px-4 py-3 font-semibold">Keterangan</th>
              <th className="text-right px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className={`border-t border-gray-100 ${item.tanggal_piket === today.tanggal ? "bg-dashMint/30" : ""}`}>
                <td className="px-4 py-3 text-dashNavy font-medium">{formatDate(item.tanggal_piket)}</td>
                <td className="px-4 py-3 text-dashNavy/70">{getDayName(item.tanggal_piket)}</td>
                <td className="px-4 py-3 text-dashNavy">{item.Soldier?.full_name || item.Soldier?.username || "-"}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3 text-dashNavy/70">{item.keterangan || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingItem(item)} className="p-2 rounded-md text-dashNavy hover:bg-dashSky/30"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteItem(item)} className="p-2 rounded-md text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && items.length === 0 && (
          <div className="py-12 text-center text-dashNavy/50">
            <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
            Belum ada jadwal piket untuk bulan ini.
          </div>
        )}
      </div>

      <div className="lg:hidden space-y-3">
        {items.map((item) => (
          <div key={item.id} className={`bg-white border ${item.tanggal_piket === today.tanggal ? "border-dashAccent" : "border-gray-200"} rounded-lg p-4 shadow-dashCard`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-dashNavy">{formatDate(item.tanggal_piket)}</p>
                <p className="text-xs text-dashNavy/50 mt-1">{getDayName(item.tanggal_piket)}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-3 text-sm font-medium text-dashNavy">{item.Soldier?.full_name || item.Soldier?.username || "-"}</p>
            <p className="text-sm text-dashNavy/60 mt-1">{item.keterangan || "Tidak ada keterangan"}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditingItem(item)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-dashNavy hover:bg-dashSky/20"><Edit2 className="w-4 h-4" /> Edit</button>
              <button onClick={() => setDeleteItem(item)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /> Hapus</button>
            </div>
          </div>
        ))}

        {!loading && items.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg py-12 text-center text-dashNavy/50 shadow-dashCard">
            <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
            Belum ada jadwal piket untuk bulan ini.
          </div>
        )}
      </div>

      {editingItem && (
        <FormModal
          open={!!editingItem}
          title={`Edit Jadwal ${formatDate(editingItem.tanggal_piket)}`}
          fields={fields}
          initialValues={{
            soldier_id: String(editingItem.soldier_id),
            status: editingItem.status,
            keterangan: editingItem.keterangan || "",
          }}
          onCancel={() => setEditingItem(null)}
          onSubmit={handleUpdate}
        />
      )}

      <ConfirmModal
        open={!!deleteItem}
        title={`Yakin ingin menghapus jadwal piket tanggal ${deleteItem ? formatDate(deleteItem.tanggal_piket) : ""}?`}
        onCancel={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        headerTitle="Hapus Jadwal Piket"
      />

      <ConfirmModal
        open={resetOpen}
        title={`Yakin ingin menghapus semua jadwal piket ${BULAN[bulan - 1]} ${tahun}?`}
        onCancel={() => setResetOpen(false)}
        onConfirm={handleReset}
        headerTitle="Reset Jadwal Bulan Ini"
      />
    </div>
  );
}
