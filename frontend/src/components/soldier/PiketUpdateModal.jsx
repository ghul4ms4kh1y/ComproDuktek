import { useState } from 'react';
import api from '../../services/api';

const formatDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

export default function PiketUpdateModal({ schedule, onClose, onSuccess, showToast }) {
  const [status, setStatus] = useState('completed');
  const [keterangan, setKeterangan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'absent' && !keterangan.trim()) {
      showToast('error', 'Keterangan wajib diisi jika tidak hadir.');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/jadwal-piket/${schedule.id}/usulan`, { status, keterangan });
      showToast('success', 'Usulan status piket berhasil diajukan.');
      onSuccess();
      onClose();
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Gagal mengajukan usulan status piket.');
    } finally {
      setLoading(false);
    }
  };

  if (!schedule) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div role="dialog" aria-modal="true" className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-bold text-dashNavy mb-1">Update Status Piket</h3>
        <p className="text-sm text-gray-500 mb-4">Tanggal piket: {formatDate(schedule.tanggal_piket)}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent">
              <option value="completed">Selesai</option>
              <option value="absent">Tidak Hadir</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Keterangan</label>
            <textarea value={keterangan} onChange={(e) => setKeterangan(e.target.value)} rows={3} required={status === 'absent'} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent resize-none" placeholder="Isi alasan jika tidak hadir..." />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-50">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold rounded-lg bg-dashNavy text-white hover:bg-dashNavy/90 disabled:opacity-50">
              {loading ? 'Mengirim...' : 'Kirim Usulan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
