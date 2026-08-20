import { useState, useRef, useCallback } from 'react';

/**
 * useToast — Custom hook untuk menampilkan notifikasi toast.
 *
 * Menggantikan pola `useState + setTimeout` yang tersebar di 5+ komponen.
 * Menggunakan `useRef` untuk menyimpan timer ID sehingga:
 *   1. Timer lama di-cancel jika toast baru dipanggil sebelum timer habis.
 *   2. Tidak terjadi memory leak saat komponen di-unmount sebelum timer habis.
 *
 * @param {number} [duration=3000] - Durasi toast dalam milidetik.
 * @returns {{ toast: {type: string, text: string}|null, showToast: Function }}
 *
 * @example
 * const { toast, showToast } = useToast();
 * showToast('success', 'Data berhasil disimpan!');
 * showToast('error', 'Gagal menyimpan data.');
 */
export function useToast(duration = 3000) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((type, text) => {
    // Batalkan timer lama jika ada
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ type, text });

    timerRef.current = setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, duration);
  }, [duration]);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}
