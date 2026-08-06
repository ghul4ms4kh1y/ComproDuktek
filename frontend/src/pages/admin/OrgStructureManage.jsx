import { useEffect, useMemo, useState } from 'react';
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
  const [q, setQ] = useState('');

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

  // Dropdown "Atasan Langsung": daftar semua orang KECUALI diri sendiri.
  const parentOptions = useMemo(
    () =>
      items
        .filter((i) => i.id !== editing?.id)
        .map((i) => ({ value: i.id, label: `${i.name} — ${i.position}` })),
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
    { name: 'box_color', label: 'Warna kotak di bagan', type: 'select', options: COLOR_OPTIONS },
    { name: 'parent_id', label: 'Atasan Langsung (kosongkan jika posisi tertinggi)', type: 'select', options: parentOptions },
  ];

  const filtered = items.filter(
    (i) =>
      !q ||
      i.name.toLowerCase().includes(q.toLowerCase()) ||
      i.position.toLowerCase().includes(q.toLowerCase())
  );

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
        // Anggota baru otomatis ditaruh di urutan paling akhir di antara saudara-nya.
        const parentIdRaw = values.parent_id || null;
        const siblingCount = items.filter((i) => (i.parent_id || null) === (parentIdRaw ? Number(parentIdRaw) : null)).length;
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

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-navy">Struktur Organisasi</h1>
        <button onClick={openCreate} className="btn-primary text-sm">+ Tambah</button>
      </div>

      <input
        type="text"
        placeholder="Cari nama atau jabatan..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full max-w-xs mb-4 border border-panel rounded-md px-3 py-2.5 text-sm"
      />

      <div className="bg-white rounded-xl border border-panel overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-panel text-navy text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Foto</th>
              <th className="px-4 py-3 font-semibold">Nama</th>
              <th className="px-4 py-3 font-semibold">Jabatan</th>
              <th className="px-4 py-3 font-semibold">Pangkat</th>
              <th className="px-4 py-3 font-semibold">Atasan Langsung</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel">
            {loading && <tr><td colSpan={6} className="px-4 py-6 text-center text-inktext/50">Memuat...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-inktext/50">Belum ada data.</td></tr>}
            {filtered.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  {item.photo
                    ? <img src={item.photo} alt={item.name} className="w-9 h-9 rounded-full object-cover" />
                    : <span className="w-9 h-9 rounded-full bg-panel flex items-center justify-center text-inktext/40 text-xs">?</span>}
                </td>
                <td className="px-4 py-3 text-navy font-medium">{item.name}</td>
                <td className="px-4 py-3">{item.position}</td>
                <td className="px-4 py-3">{item.rank || '—'}</td>
                <td className="px-4 py-3 text-inktext/70">{parentLabel(item.parent_id)}</td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  <button onClick={() => openEdit(item)} className="text-navy hover:text-gold underline">Edit</button>
                  <button onClick={() => setDeleting(item)} className="text-red-600 hover:text-red-800 underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormModal
        open={formOpen}
        title={editing ? 'Edit Anggota Struktur' : 'Tambah Anggota Struktur'}
        fields={fields}
        initialValues={editing || { box_color: 'teal' }}
        submitting={submitting}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={!!deleting}
        title={`Data "${deleting?.name || ''}" akan dihapus permanen. Anak buah langsungnya (jika ada) TIDAK ikut terhapus, tapi jadi tanpa atasan. Lanjutkan?`}
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />

      <Toast toast={toast} />
    </div>
  );
}
