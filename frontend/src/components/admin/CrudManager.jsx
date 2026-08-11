import { useEffect, useState } from 'react';
import api from '../../services/api';
import FormModal from './FormModal';
import ConfirmModal from './ConfirmModal';
import Toast from './Toast';

/**
 * columns: [{ key, label, render? }]
 * fields: field config for FormModal (used for both create & edit)
 */
export default function CrudManager({ title, endpoint, columns, fields }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

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
      .get(endpoint, { params: { page, limit: 8, q: q || undefined } })
      .then((r) => {
        setItems(r.data.data);
        setTotalPages(r.data.pagination.totalPages || 1);
      })
      .catch((err) => {
        console.error('Error loading data:', err);
        showToast(err.response?.data?.message || 'Gagal memuat data. Periksa koneksi jaringan.', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, q]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (item) => { setEditing(item); setFormOpen(true); };

  const handleSubmit = async (values, files) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => fd.append(k, v ?? ''));
      Object.entries(files).forEach(([k, f]) => { if (f) fd.append(k, f); });

      if (editing) {
        await api.put(`${endpoint}/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('Data berhasil diperbarui.');
      } else {
        await api.post(endpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
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
      await api.delete(`${endpoint}/${deleting.id}`);
      showToast('Data berhasil dihapus.');
      setDeleting(null);
      load();
    } catch (err) {
      console.error('Error deleting data:', err);
      showToast(err.response?.data?.message || 'Gagal menghapus data. Silakan coba lagi.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="font-dash">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="text-[20px] font-semibold text-dashNavy">{title}</h1>
        <button onClick={openCreate} className="bg-dashAccent text-white rounded-md px-4 py-2.5 text-sm font-semibold hover:brightness-95 transition">+ Tambah</button>
      </div>

      <input
        type="text"
        placeholder="Cari..."
        value={q}
        onChange={(e) => { setPage(1); setQ(e.target.value); }}
        className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full max-w-xs mb-4 text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
      />

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 shadow-dashCard overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-dashNavy text-left">
            <tr>
              {columns.map((c) => <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>)}
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={columns.length + 1} className="px-4 py-6 text-center text-dashNavy/40">Memuat...</td></tr>}
            {!loading && items.length === 0 && <tr><td colSpan={columns.length + 1} className="px-4 py-6 text-center text-dashNavy/40">Belum ada data.</td></tr>}
            {items.map((item) => (
              <tr key={item.id}>
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3">{c.render ? c.render(item) : item[c.key]}</td>
                ))}
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  <button onClick={() => openEdit(item)} className="text-dashNavy hover:text-dashAccent underline">Edit</button>
                  <button onClick={() => setDeleting(item)} className="text-red-600 hover:text-red-800 underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-dashCard p-4">
            {columns.map((c) => (
              <p key={c.key} className="text-sm mb-1">
                <span className="text-dashNavy/50">{c.label}: </span>
                {c.render ? c.render(item) : item[c.key]}
              </p>
            ))}
            <div className="flex gap-3 mt-2 text-sm">
              <button onClick={() => openEdit(item)} className="text-dashNavy underline">Edit</button>
              <button onClick={() => setDeleting(item)} className="text-red-600 underline">Hapus</button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-md text-sm transition ${p === page ? 'bg-dashNavy text-white' : 'bg-white border border-gray-200 text-dashNavy hover:border-dashAccent'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <FormModal
        open={formOpen}
        title={editing ? `Edit ${title}` : `Tambah ${title}`}
        fields={fields}
        initialValues={editing || {}}
        submitting={submitting}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={!!deleting}
        title={`Data "${deleting?.[columns[0]?.key] || ''}" akan dihapus permanen. Lanjutkan?`}
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />

      <Toast toast={toast} />
    </div>
  );
}
