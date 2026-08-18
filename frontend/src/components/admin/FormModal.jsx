import { useEffect, useState } from "react";

/**
 * fields: [{ name, label, type: 'text'|'textarea'|'select'|'date'|'file'|'number', options?: [], colSpan?: 1 | 2 }]
 * options untuk type 'select' menerima 2 bentuk:
 *  - array string, mis. ['Aktif', 'Nonaktif']  -> value dan label sama
 *  - array objek,  mis. [{ value: 3, label: 'Budi - Kabagops' }] -> value (mis. ID)
 *    berbeda dari label yang ditampilkan. Dipakai untuk dropdown "Atasan Langsung".
 */
export default function FormModal({
  open,
  title,
  fields,
  initialValues,
  onCancel,
  onSubmit,
  submitting,
}) {
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});

  useEffect(() => {
    if (open) {
      setValues(initialValues || {});
      setFiles({});
    }
  }, [open, initialValues]);

  if (!open) return null;

  const handleChange = (name, value) =>
    setValues((v) => ({ ...v, [name]: value }));
  const handleFile = (name, file) => setFiles((f) => ({ ...f, [name]: file }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values, files);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto font-dash">
      {/* max-w-lg diubah menjadi max-w-3xl agar layout grid 2 kolom lebih leluasa */}
      <div className="bg-white rounded-lg shadow-dashCard border border-gray-200 w-full max-w-3xl p-6">
        <h3 className="text-[18px] font-semibold text-dashNavy mb-5">
          {title}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Kontainer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div
                key={f.name}
                // Logika pembacaan colSpan (jika 2 maka ambil full width, jika tidak maka setengah)
                className={f.colSpan === 2 ? "md:col-span-2" : "md:col-span-1"}
              >
                <label className="text-sm font-medium text-dashNavy block mb-1">
                  {f.label}
                </label>

                {f.type === "textarea" && (
                  <textarea
                    rows={4}
                    value={values[f.name] || ""}
                    onChange={(e) => handleChange(f.name, e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
                    required={f.required}
                  />
                )}

                {f.type === "select" && (
                  <select
                    value={values[f.name] || ""}
                    onChange={(e) => handleChange(f.name, e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
                    required={f.required}
                  >
                    <option value="">Pilih...</option>
                    {f.options.map((o) => {
                      const optValue = typeof o === "object" ? o.value : o;
                      const optLabel = typeof o === "object" ? o.label : o;
                      return (
                        <option key={optValue} value={optValue}>
                          {optLabel}
                        </option>
                      );
                    })}
                  </select>
                )}

                {f.type === "file" && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFile(f.name, e.target.files[0])}
                    className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-dashNavy hover:file:bg-gray-200 cursor-pointer"
                  />
                )}

                {["text", "date", "number"].includes(f.type) && (
                  <input
                    type={f.type}
                    value={values[f.name] || ""}
                    onChange={(e) => handleChange(f.name, e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
                    required={f.required}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded-md border border-gray-200 text-dashNavy hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-dashAccent text-white rounded-md px-4 py-2 text-sm font-semibold hover:brightness-95 disabled:opacity-60 transition"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
