import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, RefreshCw, RotateCcw } from "lucide-react";
import api from "../../services/api";
import { formatDate } from "../../lib/dateUtils";
import ConfirmModal from "../../components/admin/ConfirmModal";
import FormModal from "../../components/admin/FormModal";
import Toast from "../../components/admin/Toast";
import InfoCardGrid from "../../components/admin/InfoCardGrid";
import PageHeader from "../../components/admin/PageHeader";
import { useToast } from "../../hooks/useToast";

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const statusOptions = [
  { value: "scheduled", label: "Terjadwal" },
  { value: "completed", label: "Selesai" },
  { value: "absent", label: "Tidak Hadir" },
];

const formatLocalDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const getToday = () => {
  const today = new Date();
  return { bulan: today.getMonth() + 1, tahun: today.getFullYear(), tanggal: formatLocalDate(today) };
};
const getDayName = (date) => HARI[new Date(`${date}T00:00:00`).getDay()];
const getWorkdaysCount = (bulan, tahun) => {
  const totalDays = new Date(tahun, bulan, 0).getDate();
  let count = 0;
  for (let day = 1; day <= totalDays; day++) {
    const weekDay = new Date(tahun, bulan - 1, day).getDay();
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
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>{statusOptions.find((s) => s.value === status)?.label || status}</span>;
};

export default function JadwalPiketManage() {
  const today = useMemo(getToday, []);
  const [bulan, setBulan] = useState(today.bulan);
  const [tahun, setTahun] = useState(today.tahun);
  const [items, setItems] = useState([]);
  const [soldiers, setSoldiers] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("jadwal");
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const { toast, showToast } = useToast();

  const workdaysCount = useMemo(() => getWorkdaysCount(bulan, tahun), [bulan, tahun]);
  const remainingSoldiers = Math.max(soldiers.length - workdaysCount, 0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jadwalRes, soldierRes] = await Promise.all([
        api.get("/jadwal-piket", { params: { bulan, tahun, limit: 100 } }),
        api.get("/soldiers", { params: { limit: 1000 } }),
      ]);
      setItems(jadwalRes.data.data || []);
      setSoldiers(Array.isArray(soldierRes.data) ? soldierRes.data : soldierRes.data.data || []);
    } catch (error) {
      showToast(error.response?.data?.message || "Gagal memuat data jadwal piket.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/jadwal-piket", { params: { approval_status: "pending", limit: 100 } });
      setPendingItems(res.data.data || []);
    } catch (error) {
      showToast(error.response?.data?.message || "Gagal memuat usulan pending.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    activeTab === "jadwal" ? fetchData() : fetchPendingItems();
  }, [bulan, tahun, activeTab]);

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

  const handleReview = async () => {
    try {
      setReviewLoading(true);
      await api.put(`/jadwal-piket/${reviewingItem.id}/review-usulan`, { action: reviewAction });
      showToast(`Usulan berhasil di${reviewAction === "approve" ? "setujui" : "tolak"}.`, "success");
      setReviewingItem(null);
      setReviewAction(null);
      fetchPendingItems();
    } catch (error) {
      showToast(error.response?.data?.message || "Gagal mereview usulan.", "error");
    } finally {
      setReviewLoading(false);
    }
  };

  const fields = [
    { name: "soldier_id", label: "Anggota Piket", type: "select", required: true, options: soldiers.map((soldier) => ({ value: String(soldier.id), label: soldier.full_name || soldier.username })) },
    { name: "status", label: "Status", type: "select", required: true, options: statusOptions },
    { name: "keterangan", label: "Keterangan", type: "textarea", required: false },
  ];

  return (
    <div className="font-dash">
      <PageHeader
        title="Jadwal Piket"
        subtitle="Kelola jadwal piket hari kerja Satlak Duktek."
      />

      <div className="flex gap-2 border-b border-gray-200">
        {[{ key: "jadwal", label: "Jadwal Piket" }, { key: "usulan", label: "Usulan Piket Pending" }].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${activeTab === tab.key ? "border-dashAccent text-dashAccent" : "border-transparent text-dashNavy/50 hover:text-dashNavy"}`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === "jadwal" ? (
        <>
          <div className="mb-5 mt-5">
            <InfoCardGrid cards={[
              { label: "Hari Kerja", value: workdaysCount, loading },
              { label: "Jadwal Terisi", value: items.length, loading },
              { label: "Total Anggota", value: soldiers.length || "—", loading },
              { label: "Lanjut Bulan Depan", value: soldiers.length ? remainingSoldiers : "—", loading },
            ]} />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="w-full sm:w-44 pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition appearance-none cursor-pointer">
              {BULAN.map((label, index) => <option key={label} value={index + 1}>{label}</option>)}
            </select>
            <input type="number" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="w-full sm:w-28 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition" />
            <button onClick={handleGenerate} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-md bg-dashAccent px-4 py-2.5 text-sm font-semibold text-white hover:bg-dashAccent/90 disabled:opacity-60 transition"><RefreshCw className="w-4 h-4" /> Generate Jadwal</button>
            <button onClick={() => setResetOpen(true)} disabled={loading || items.length === 0} className="inline-flex items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 transition"><RotateCcw className="w-4 h-4" /> Reset Bulan Ini</button>
          </div>
          <JadwalTable items={items} today={today} loading={loading} onEdit={setEditingItem} onDelete={setDeleteItem} />
        </>
      ) : (
        <PendingTable items={pendingItems} loading={loading} onReview={(item, action) => { setReviewingItem(item); setReviewAction(action); }} />
      )}

      {editingItem && <FormModal open={!!editingItem} title={`Edit Jadwal ${formatDate(editingItem.tanggal_piket)}`} fields={fields} initialValues={{ soldier_id: String(editingItem.soldier_id), status: editingItem.status, keterangan: editingItem.keterangan || "" }} onCancel={() => setEditingItem(null)} onSubmit={handleUpdate} />}
      <ConfirmModal open={!!deleteItem} title={`Yakin ingin menghapus jadwal piket tanggal ${deleteItem ? formatDate(deleteItem.tanggal_piket) : ""}?`} onCancel={() => setDeleteItem(null)} onConfirm={handleDelete} headerTitle="Hapus Jadwal Piket" />
      <ConfirmModal open={resetOpen} title={`Yakin ingin menghapus semua jadwal piket ${BULAN[bulan - 1]} ${tahun}?`} onCancel={() => setResetOpen(false)} onConfirm={handleReset} headerTitle="Reset Jadwal Bulan Ini" />
      <ConfirmModal open={!!reviewingItem} title={`Yakin ingin ${reviewAction === "approve" ? "menyetujui" : "menolak"} usulan ${reviewingItem ? formatDate(reviewingItem.tanggal_piket) : ""}?`} onCancel={() => { setReviewingItem(null); setReviewAction(null); }} onConfirm={handleReview} loading={reviewLoading} headerTitle="Review Usulan Piket" />

      <Toast toast={toast} />
    </div>
  );
}

function JadwalTable({ items, today, loading, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-dashCard overflow-hidden">
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-dashNavy text-left"><tr><th className="text-left px-4 py-3 font-semibold">Tanggal</th><th className="text-left px-4 py-3 font-semibold">Hari</th><th className="text-left px-4 py-3 font-semibold">Anggota</th><th className="text-left px-4 py-3 font-semibold">Status</th><th className="text-left px-4 py-3 font-semibold">Keterangan</th><th className="text-right px-4 py-3 font-semibold">Aksi</th></tr></thead>
          <tbody>{items.map((item) => <tr key={item.id} className={`border-t border-gray-100 hover:bg-gray-50/50 transition ${item.tanggal_piket === today.tanggal ? "bg-dashMint/30" : ""}`}><td className="px-4 py-3 text-dashNavy font-medium">{formatDate(item.tanggal_piket)}</td><td className="px-4 py-3 text-dashNavy/70">{getDayName(item.tanggal_piket)}</td><td className="px-4 py-3 text-dashNavy">{item.Soldier?.full_name || item.Soldier?.username || "-"}</td><td className="px-4 py-3"><StatusBadge status={item.status} /></td><td className="px-4 py-3 text-dashNavy/70">{item.keterangan || "-"}</td><td className="px-4 py-2"><div className="flex justify-end gap-2"><button onClick={() => onEdit(item)} className="rounded-md px-3 py-1.5 text-sm font-semibold transition whitespace-nowrap bg-dashAccent/10 text-dashAccent hover:bg-dashAccent hover:text-white">Edit</button><button onClick={() => onDelete(item)} className="rounded-md px-3 py-1.5 text-sm font-semibold transition whitespace-nowrap bg-red-100 text-red-600 hover:bg-red-600 hover:text-white">Hapus</button></div></td></tr>)}</tbody>
        </table>
      </div>
      <div className="lg:hidden space-y-3 p-3">{items.map((item) => <div key={item.id} className={`bg-white border ${item.tanggal_piket === today.tanggal ? "border-dashAccent" : "border-gray-200"} rounded-lg p-4 shadow-dashCard`}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-dashNavy">{formatDate(item.tanggal_piket)}</p><p className="text-xs text-dashNavy/50 mt-1">{getDayName(item.tanggal_piket)}</p></div><StatusBadge status={item.status} /></div><p className="mt-3 text-sm font-medium text-dashNavy">{item.Soldier?.full_name || item.Soldier?.username || "-"}</p><p className="text-sm text-dashNavy/60 mt-1">{item.keterangan || "Tidak ada keterangan"}</p><div className="flex gap-2 mt-4"><button onClick={() => onEdit(item)} className="flex-1 inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-dashNavy hover:bg-dashSky/20">Edit</button><button onClick={() => onDelete(item)} className="flex-1 inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Hapus</button></div></div>)}</div>
      {!loading && items.length === 0 && <div className="py-12 text-center text-dashNavy/50"><CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />Belum ada jadwal piket untuk bulan ini.</div>}
    </div>
  );
}

function PendingTable({ items, loading, onReview }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-dashCard overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-dashNavy text-left"><tr><th className="text-left px-4 py-3 font-semibold">Tanggal</th><th className="text-left px-4 py-3 font-semibold">Anggota</th><th className="text-left px-4 py-3 font-semibold">Status Saat Ini</th><th className="text-left px-4 py-3 font-semibold">Usulan</th><th className="text-left px-4 py-3 font-semibold">Keterangan</th><th className="text-right px-4 py-3 font-semibold">Aksi</th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition"><td className="px-4 py-3 text-dashNavy font-medium">{formatDate(item.tanggal_piket)}</td><td className="px-4 py-3 text-dashNavy">{item.Soldier?.full_name || item.Soldier?.username || "-"}</td><td className="px-4 py-3"><StatusBadge status={item.status} /></td><td className="px-4 py-3"><StatusBadge status={item.status_usulan} /></td><td className="px-4 py-3 text-dashNavy/70">{item.keterangan_usulan || "-"}</td><td className="px-4 py-2"><div className="flex justify-end gap-2"><button onClick={() => onReview(item, "approve")} className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition">Setujui</button><button onClick={() => onReview(item, "reject")} className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">Tolak</button></div></td></tr>)}</tbody>
      </table>
      {!loading && items.length === 0 && <div className="py-12 text-center text-dashNavy/50"><CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />Tidak ada usulan pending.</div>}
    </div>
  );
}
