import { useEffect, useState } from 'react';
import api from '../../services/api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import Toast from '../../components/admin/Toast';

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [detail, setDetail] = useState(null);
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
      .get('/messages', { params: { page, limit: 8 } })
      .then((r) => {
        setMessages(r.data.data);
        setTotalPages(r.data.pagination.totalPages || 1);
      })
      .catch(() => showToast('Gagal memuat pesan.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const openDetail = async (msg) => {
    try {
      const r = await api.get(`/messages/${msg.id}`);
      setDetail(r.data.data);
      // status mungkin berubah otomatis jadi "Sudah Dibaca" -> refresh list
      load();
    } catch {
      showToast('Gagal membuka pesan.', 'error');
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/messages/${deleting.id}`);
      showToast('Pesan berhasil dihapus.');
      setDeleting(null);
      load();
    } catch {
      showToast('Gagal menghapus pesan.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-navy mb-6">Kotak Masuk</h1>

      <div className="bg-white rounded-lg border border-panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-panel text-navy text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Nama Pengirim</th>
              <th className="px-4 py-3 font-semibold">Subjek</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Tanggal</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel">
            {loading && <tr><td colSpan={5} className="px-4 py-6 text-center text-inktext/50">Memuat...</td></tr>}
            {!loading && messages.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-inktext/50">Belum ada pesan.</td></tr>}
            {messages.map((m) => {
              const unread = m.status === 'Belum Dibaca';
              return (
                <tr key={m.id} className={unread ? 'font-semibold' : ''}>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => openDetail(m)}>{m.sender_name}</td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => openDetail(m)}>{m.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${unread ? 'bg-gold/20 text-navy' : 'bg-panel text-inktext/60'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-normal text-inktext/70">{new Date(m.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3 font-normal">
                    <button onClick={() => setDeleting(m)} className="text-red-600 hover:text-red-800 underline text-sm">Hapus</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-md text-sm ${p === page ? 'bg-navy text-white' : 'bg-white border border-panel text-navy'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Modal detail pesan */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-navy mb-4">Detail Pesan</h3>
            <dl className="text-sm space-y-2">
              <div><dt className="text-inktext/50">Nama</dt><dd className="font-medium">{detail.sender_name}</dd></div>
              <div><dt className="text-inktext/50">Email</dt><dd className="font-medium">{detail.sender_email}</dd></div>
              <div><dt className="text-inktext/50">Subjek</dt><dd className="font-medium">{detail.subject}</dd></div>
              <div><dt className="text-inktext/50">Tanggal</dt><dd>{new Date(detail.created_at).toLocaleString('id-ID')}</dd></div>
              <div><dt className="text-inktext/50">Pesan</dt><dd className="whitespace-pre-line">{detail.message}</dd></div>
            </dl>
            <button onClick={() => setDetail(null)} className="btn-primary text-sm mt-6 w-full">Tutup</button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleting}
        title={`Pesan dari "${deleting?.sender_name || ''}" akan dihapus permanen. Lanjutkan?`}
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />

      <Toast toast={toast} />
    </div>
  );
}
