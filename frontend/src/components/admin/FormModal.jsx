import { useEffect, useState } from 'react';

/**
 * fields: [{ name, label, type: 'text'|'textarea'|'select'|'date'|'file'|'number', options?: [] }]
 * options untuk type 'select' menerima 2 bentuk:
 *  - array string, mis. ['Aktif', 'Nonaktif']  -> value dan label sama
 *  - array objek,  mis. [{ value: 3, label: 'Budi - Kabagops' }] -> value (mis. ID)
 *    berbeda dari label yang ditampilkan. Dipakai untuk dropdown "Atasan Langsung".
 */
export default function FormModal({ open, title, fields, initialValues, onCancel, onSubmit, submitting }) {
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});

  useEffect(() => {
    if (open) {
      setValues(initialValues || {});
      setFiles({});
    }
  }, [open, initialValues]);

  if (!open) return null;

  const handleChange = (name, value) => setValues((v) => ({ ...v, [name]: value }));
  const handleFile = (name, file) => setFiles((f) => ({ ...f, [name]: file }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values, files);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto font-dash">
      <div className="bg-white rounded-lg shadow-dashCard border border-gray-200 w-full max-w-lg p-6">
        <h3 className="text-[18px] font-semibold text-dashNavy mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="text-sm font-medium text-dashNavy">{f.label}</label>

              {f.type === 'textarea' && (
                <textarea
                  rows={4}
                  value={values[f.name] || ''}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 mt-1 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
                  required={f.required}
                />
              )}

              {f.type === 'select' && (
                <select
                  value={values[f.name] || ''}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 mt-1 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
                  required={f.required}
                >
                  <option value="">Pilih...</option>
                  {f.options.map((o) => {
                    const optValue = typeof o === 'object' ? o.value : o;
                    const optLabel = typeof o === 'object' ? o.label : o;
                    return <option key={optValue} value={optValue}>{optLabel}</option>;
                  })}
                </select>
              )}

              {f.type === 'file' && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(f.name, e.target.files[0])}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 mt-1 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
                />
              )}

              {['text', 'date', 'number'].includes(f.type) && (
                <input
                  type={f.type}
                  value={values[f.name] || ''}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 mt-1 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
                  required={f.required}
                />
              )}
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-md border border-gray-200 text-dashNavy hover:bg-gray-50 transition">
              Batal
            </button>
            <button type="submit" disabled={submitting} className="bg-dashAccent text-white rounded-md px-4 py-2 text-sm font-semibold hover:brightness-95 disabled:opacity-60 transition">
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
