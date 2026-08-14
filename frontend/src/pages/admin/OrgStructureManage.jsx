import { useEffect, useMemo, useState } from 'react';
import { GripVertical } from 'lucide-react';
import api from '../../services/api';
import FormModal from '../../components/admin/FormModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Toast from '../../components/admin/Toast';

const COLOR_OPTIONS = [
  { value: 'merah', label: 'Merah (pucuk pimpinan)' },
  { value: 'oranye', label: 'Emas (pemimpin unit)' },
  { value: 'teal', label: 'Biru (staf)' },
];

export default function OrgStructureManage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState('');
  const [dragId, setDragId] = useState(null);
  const [dragLevel, setDragLevel] = useState(null);

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
      .get('/org-structures', { params: { limit: 200 } })
      .then((r) => setItems(r.data.data))
      .catch(() => showToast('Gagal memuat data struktur organisasi.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Dropdown "Terhubung garis dari (atasan)": daftar semua orang KECUALI diri sendiri.
  const parentOptions = useMemo(
    () =>
      items
        .filter((i) => i.id !== editing?.id)
        .map((i) => ({ value: i.id, label: `Level ${i.level} — ${i.name} (${i.position})` })),
    [items, editing]
  );

  const parentLabel = (parentId) => {
    if (!parentId) return '—';
    const p = items.find((i) => i.id === parentId);
    return p ? `${p.name} — ${p.position}` : '—';
  };

  const fields = [
    { name: 'photo', label: 'Foto', type: 'file' },
    { name: 'name', label: 'Nama', type: 'text', required: true },
    { name: 'position', label: 'Jabatan', type: 'text', required: true },
    { name: 'rank', label: 'Pangkat', type: 'text' },
    { name: 'level', label: 'Level / Baris (1 = paling atas)', type: 'number', required: true },
    { name: 'box_color', label: 'Warna kotak di bagan', type: 'select', options: COLOR_OPTIONS },
    { name: 'parent_id', label: 'Terhubung garis dari (atasan, opsional)', type: 'select', options: parentOptions },
  ];

  const filtered = q
    ? items.filter(
        (i) =>
          i.name.toLowerCase().includes(q.toLowerCase()) ||
          i.position.toLowerCase().includes(q.toLowerCase())
      )
    : items;

  // Kelompokkan per level (baris), urutkan level ascending & tiap grup diurutkan display_order.
  // Dinamis: jumlah level mengikuti data yang ada, tidak dibatasi angka tertentu.
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((item) => {
      const lvl = item.level ?? 1;
      if (!map.has(lvl)) map.set(lvl, []);
      map.get(lvl).push(item);
    });
    map.forEach((arr) => arr.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (item) => { setEditing(item); setFormOpen(true); };

  const handleSubmit = async (values, files) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => fd.append(k, v ?? ''));
      Object.entries(files).forEach(([k, f]) => { if (f) fd.append(k, f); });

      if (editing) {
        await api.put(`/org-structures/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('Data berhasil diperbarui.');
      } else {
        // Anggota baru otomatis ditaruh di urutan paling akhir dalam levelnya.
        const lvl = Number(values.level) || 1;
        const siblingCount = items.filter((i) => (i.level ?? 1) === lvl).length;
        fd.set('display_order', String(siblingCount + 1));

        await api.post('/org-structures', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('Data berhasil ditambahkan.');
      }
      setFormOpen(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan data.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/org-structures/${deleting.id}`);
      showToast('Data berhasil dihapus.');
      setDeleting(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus data.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- Drag and drop reorder, dibatasi HANYA sesama anggota dalam 1 level yang sama ---
  const handleDragOver = (e, level, overId) => {
    e.preventDefault();
    if (level !== dragLevel || overId === dragId || dragId === null) return;

    setItems((prev) => {
      const levelItems = prev.filter((i) => (i.level ?? 1) === level);
      const others = prev.filter((i) => (i.level ?? 1) !== level);
      const dragIndex = levelItems.findIndex((i) => i.id === dragId);
      const overIndex = levelItems.findIndex((i) => i.id === overId);
      if (dragIndex === -1 || overIndex === -1) return prev;
      const next = [...levelItems];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(overIndex, 0, moved);
      return [...others, ...next];
    });
  };

  const persistOrder = async (level) => {
    setSaving(true);
    try {
      const order = items.filter((i) => (i.level ?? 1) === level).map((i) => i.id);
      const res = await api.put('/org-structures/reorder', { level, order });
      setItems(res.data.data);
      showToast('Urutan berhasil disimpan.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan urutan.', 'error');
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = (level) => {
    if (dragId !== null) persistOrder(level);
    setDragId(null);
    setDragLevel(null);
  };

  return (
    <div className="font-dash">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="text-[20px] font-semibold text-dashNavy">Struktur Organisasi</h1>
        <button onClick={openCreate} className="bg-dashAccent text-white rounded-md px-4 py-2.5 text-sm font-semibold hover:brightness-95 transition">+ Tambah</button>
      </div>

      <p className="text-sm text-dashNavy/60 mb-4">
        Data dikelompokkan per <strong>Level/baris</strong>. Seret ikon <GripVertical className="w-3.5 h-3.5 inline -mt-0.5" /> untuk mengubah urutan tampil di dalam level yang sama (urutan tersimpan otomatis). Untuk memindahkan seseorang ke level lain, gunakan tombol Edit.
      </p>

      <input
        type="text"
        placeholder="Cari nama atau jabatan..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full max-w-xs mb-6 border border-gray-200 rounded-md px-3 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
      />

      {loading && <p className="text-center text-dashNavy/40 py-6">Memuat...</p>}
      {!loading && grouped.length === 0 && <p className="text-center text-dashNavy/40 py-6">Belum ada data.</p>}

      <div className="space-y-6">
        {grouped.map(([level, levelItems]) => (
          <div key={level}>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-dashNavy text-white text-xs font-bold px-2.5 py-1 rounded-md">Level {level}</span>
              <span className="text-xs text-dashNavy/50">{levelItems.length} anggota</span>
            </div>

            <div className="hidden md:flex items-center gap-3 px-4 py-3 bg-gray-50 text-dashNavy text-sm font-semibold border border-b-0 border-gray-200 rounded-t-lg">
              <span className="w-5 shrink-0" />
              <span className="w-14 shrink-0">Foto</span>
              <span className="flex-1">Nama</span>
              <span className="flex-1">Jabatan</span>
              <span className="flex-1">Terhubung dari</span>
              <span className="shrink-0 w-24">Aksi</span>
            </div>

            <div className="bg-white rounded-lg rounded-t-none md:rounded-t-none border border-gray-200 shadow-dashCard overflow-hidden">
              <div className="divide-y divide-offwhite">
                {levelItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => { setDragId(item.id); setDragLevel(level); }}
                    onDragOver={(e) => handleDragOver(e, level, item.id)}
                    onDrop={() => handleDrop(level)}
                    onDragEnd={() => { setDragId(null); setDragLevel(null); }}
                    className={`flex flex-wrap md:flex-nowrap items-center gap-3 px-4 py-3 bg-white transition-opacity ${dragId === item.id ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <span className="cursor-grab active:cursor-grabbing text-dashNavy/30 shrink-0">
                      <GripVertical className="w-4 h-4" />
                    </span>
                    <span className="w-14 shrink-0">
                      {item.photo
                        ? <img src={item.photo} alt={item.name} className="w-9 h-9 rounded-full object-cover" />
                        : <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-dashNavy/40 text-xs">?</span>}
                    </span>
                    <span className="flex-1 min-w-[140px] text-dashNavy font-medium">{item.name}</span>
                    <span className="flex-1 min-w-[140px] text-black">{item.position}</span>
                    <span className="flex-1 min-w-[140px] text-dashNavy/70">{parentLabel(item.parent_id)}</span>
                    <span className="shrink-0 w-24 space-x-2 whitespace-nowrap">
                      <button onClick={() => openEdit(item)} className="text-dashNavy hover:text-dashAccent underline text-sm">Edit</button>
                      <button onClick={() => setDeleting(item)} className="text-red-600 hover:text-red-800 underline text-sm">Hapus</button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <FormModal
        open={formOpen}
        title={editing ? 'Edit Anggota Struktur' : 'Tambah Anggota Struktur'}
        fields={fields}
        initialValues={editing || { box_color: 'teal', level: 1 }}
        submitting={submitting}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={!!deleting}
        title={`Data "${deleting?.name || ''}" akan dihapus permanen. Anak buah langsungnya (jika ada) TIDAK ikut terhapus, tapi garis penghubungnya jadi hilang. Lanjutkan?`}
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />

      <Toast toast={toast} />
    </div>
  );
}