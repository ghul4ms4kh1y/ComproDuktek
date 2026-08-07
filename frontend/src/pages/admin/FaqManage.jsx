import { useEffect, useState } from 'react';
import { GripVertical } from 'lucide-react';
import api from '../../services/api';
import FormModal from '../../components/admin/FormModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Toast from '../../components/admin/Toast';

const fields = [
  { name: 'question', label: 'Pertanyaan', type: 'text', required: true },
  { name: 'answer', label: 'Jawaban', type: 'textarea', required: true },
];

export default function FaqManage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = () => {
    setLoading(true);
    api
      .get('/faqs', { params: { limit: 100 } })
      .then((r) => setItems(r.data.data))
      .catch(() => showToast('Gagal memuat data FAQ.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (item) => { setEditing(item); setFormOpen(true); };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/faqs/${editing.id}`, values);
        showToast('FAQ berhasil diperbarui.');
      } else {
        // FAQ baru otomatis ditaruh di urutan paling akhir.
        await api.post('/faqs', { ...values, display_order: items.length + 1 });
        showToast('FAQ berhasil ditambahkan.');
      }
      setFormOpen(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan FAQ.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/faqs/${deleting.id}`);
      showToast('FAQ berhasil dihapus.');
      setDeleting(null);
      load();
    } catch {
      showToast('Gagal menghapus FAQ.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- Drag and drop reorder ---
  const handleDragOver = (e, overId) => {
    e.preventDefault();
    if (overId === dragId || dragId === null) return;

    const dragIndex = items.findIndex((i) => i.id === dragId);
    const overIndex = items.findIndex((i) => i.id === overId);
    if (dragIndex === -1 || overIndex === -1) return;

    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(overIndex, 0, moved);
    setItems(next);
  };

  const persistOrder = async (currentItems) => {
    setSaving(true);
    try {
      const order = currentItems.map((i) => i.id);
      const res = await api.put('/faqs/reorder', { order });
      setItems(res.data.data);
      showToast('Urutan FAQ berhasil disimpan.');
    } catch {
      showToast('Gagal menyimpan urutan FAQ.', 'error');
      load(); // urutan dikembalikan ke data tersimpan terakhir
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = () => {
    if (dragId !== null) persistOrder(items);
    setDragId(null);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="text-[20px] font-semibold text-dashNavy">FAQ</h1>
        <button onClick={openCreate} className="bg-dashAccent text-white rounded-md px-4 py-2.5 text-sm font-semibold hover:brightness-95 transition">+ Tambah</button>
      </div>

      <p className="text-sm text-dashNavy/60 mb-4">
        Seret ikon <GripVertical className="w-3.5 h-3.5 inline -mt-0.5" /> pada tiap baris untuk mengubah urutan tampil FAQ di halaman publik. Urutan tersimpan otomatis.
      </p>

      {/* Header list, konsisten dengan halaman Kelola lainnya */}
      <div className="hidden md:flex items-center gap-3 px-4 py-3 bg-gray-50 text-dashNavy text-sm font-semibold border border-b-0 border-gray-200 rounded-t-lg">
        <span className="w-5 shrink-0" />
        <span className="w-6 shrink-0">No</span>
        <span className="flex-1">Pertanyaan</span>
        <span className="shrink-0 w-24">Aksi</span>
      </div>

      <div className="bg-white rounded-lg rounded-t-none border border-gray-200 shadow-dashCard overflow-hidden">
        <div className="divide-y divide-offwhite">
          {loading && <div className="px-4 py-6 text-center text-dashNavy/40">Memuat...</div>}
          {!loading && items.length === 0 && <div className="px-4 py-6 text-center text-dashNavy/40">Belum ada data.</div>}

          {items.map((item, idx) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragId(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={handleDrop}
              onDragEnd={() => setDragId(null)}
              className={`flex items-center gap-3 px-4 py-3 bg-white transition-opacity ${dragId === item.id ? 'opacity-40' : 'opacity-100'
                }`}
            >
              <span
                className="w-5 shrink-0 cursor-grab active:cursor-grabbing text-dashNavy/40 flex items-center justify-center"
                title="Seret untuk mengubah urutan"
              >
                <GripVertical className="w-4 h-4" />
              </span>
              <span className="w-6 shrink-0 text-sm text-dashNavy/50 tabular-nums">{idx + 1}</span>
              <span className="flex-1 text-sm text-black truncate">{item.question}</span>
              <span className="shrink-0 w-24 space-x-2 whitespace-nowrap">
                <button onClick={() => openEdit(item)} className="text-dashNavy hover:text-dashAccent underline text-sm">Edit</button>
                <button onClick={() => setDeleting(item)} className="text-red-600 hover:text-red-800 underline text-sm">Hapus</button>
              </span>
            </div>
          ))}
        </div>
      </div>

      {saving && <p className="text-xs text-dashNavy/50 mt-2">Menyimpan urutan...</p>}

      <FormModal
        open={formOpen}
        title={editing ? 'Edit FAQ' : 'Tambah FAQ'}
        fields={fields}
        initialValues={editing || {}}
        submitting={submitting}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={!!deleting}
        title={`FAQ "${deleting?.question || ''}" akan dihapus permanen. Lanjutkan?`}
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />

      <Toast toast={toast} />
    </div>
  );
}
