export default function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-md shadow-lg text-sm text-white ${
        isError ? 'bg-red-600' : 'bg-navy'
      }`}
    >
      {toast.message}
    </div>
  );
}
