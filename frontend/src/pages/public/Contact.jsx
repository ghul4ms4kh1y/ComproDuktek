import { useState } from 'react';
import api from '../../services/api';

const initial = { sender_name: '', sender_email: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.sender_name.trim()) e.sender_name = 'Nama wajib diisi.';
    if (!/^\S+@\S+\.\S+$/.test(form.sender_email)) e.sender_email = 'Format email tidak valid.';
    if (!form.subject.trim()) e.subject = 'Subjek wajib diisi.';
    if (!form.message.trim()) e.message = 'Pesan wajib diisi.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    setStatus(null);
    try {
      await api.post('/messages', form);
      setStatus('success');
      setForm(initial);
    } catch (err) {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="max-w-5xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="text-sm font-medium text-navy">Nama</label>
            <input
              type="text"
              value={form.sender_name}
              onChange={(e) => setForm({ ...form, sender_name: e.target.value })}
              className="w-full border border-panel rounded-md px-3 py-2 mt-1 text-sm"
            />
            {errors.sender_name && <p className="text-red-600 text-xs mt-1">{errors.sender_name}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-navy">Email</label>
            <input
              type="email"
              value={form.sender_email}
              onChange={(e) => setForm({ ...form, sender_email: e.target.value })}
              className="w-full border border-panel rounded-md px-3 py-2 mt-1 text-sm"
            />
            {errors.sender_email && <p className="text-red-600 text-xs mt-1">{errors.sender_email}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-navy">Subjek</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full border border-panel rounded-md px-3 py-2 mt-1 text-sm"
            />
            {errors.subject && <p className="text-red-600 text-xs mt-1">{errors.subject}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-navy">Pesan</label>
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border border-panel rounded-md px-3 py-2 mt-1 text-sm"
            />
            {errors.message && <p className="text-red-600 text-xs mt-1">{errors.message}</p>}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
            {submitting ? 'Mengirim...' : 'Kirim Pesan'}
          </button>

          {status === 'success' && (
            <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-md px-3 py-2">
              Pesan berhasil dikirim. Terima kasih telah menghubungi kami.
            </p>
          )}
          {status === 'error' && (
            <p className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
              Gagal mengirim pesan. Silakan coba lagi.
            </p>
          )}
        </form>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-navy mb-3">Informasi Kontak Resmi</h3>
            <ul className="text-sm space-y-2 text-inktext/90">
              <li><strong>Alamat:</strong> Isi alamat kantor/markas Satlak Dukteksi.</li>
              <li><strong>Telepon:</strong> Isi nomor telepon resmi.</li>
              <li><strong>Email:</strong> Isi email resmi.</li>
              <li><strong>Jam Layanan:</strong> Senin–Jumat, 08.00–16.00 WIB.</li>
            </ul>
          </div>
          <div className="rounded-lg overflow-hidden border border-panel h-48 flex items-center justify-center bg-panel text-inktext/50 text-sm">
            Peta lokasi (embed opsional)
          </div>
        </div>
      </div>
    </div>
  );
}
