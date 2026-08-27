import { useEffect, useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import api from "../../services/api";
import FormModal from "./FormModal";
import ConfirmModal from "./ConfirmModal";
import Toast from "./Toast";
import { useToast } from "../../hooks/useToast";

/**
 * columns: [{ key, label, render? }]
 * fields: field config for FormModal (used for both create & edit)
 * sortOptions: [{ value, label, sortKey? }] - optional sorting configuration
 */
export default function CrudManager({
  title,
  endpoint,
  columns,
  fields,
  sortOptions = [],
  onDataChange,
}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState(
    sortOptions.length > 0 ? sortOptions[0].value : "default",
  );
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { toast, showToast } = useToast();

  const load = () => {
    setLoading(true);
    let sortKeyParam = undefined;
    let sortOrderParam = undefined;

    if (sortBy !== "default") {
      const sortOption = sortOptions.find((opt) => opt.value === sortBy);
      if (sortOption && sortOption.sortKey) {
        sortKeyParam = sortOption.sortKey;
        sortOrderParam = sortBy.includes("_asc") ? "ASC" : "DESC";
      }
    }

    api
      .get(endpoint, {
        params: {
          page,
          limit: 12,
          q: q || undefined,
          sortBy: sortKeyParam,
          sortOrder: sortOrderParam,
        },
      })
      .then((r) => {
        setItems(r.data.data);
        setTotalPages(r.data.pagination.totalPages || 1);
      })
      .catch((err) => {
        console.error("Error loading data:", err);
        showToast(
          err.response?.data?.message ||
            "Gagal memuat data. Periksa koneksi jaringan.",
          "error",
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, q]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (sortBy === "default") return result;

    const sortOption = sortOptions.find((opt) => opt.value === sortBy);
    if (!sortOption || !sortOption.sortKey) return result;

    const sortKey = sortOption.sortKey;
    const isAscending = sortBy.includes("_asc");

    result.sort((a, b) => {
      const valA = (a[sortKey] || "").toString().toLowerCase();
      const valB = (b[sortKey] || "").toString().toLowerCase();

      const comparison = valA.localeCompare(valB);
      return isAscending ? comparison : -comparison;
    });

    return result;
  }, [items, sortBy, sortOptions]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleSubmit = async (values, files) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => fd.append(k, v ?? ""));
      Object.entries(files).forEach(([k, f]) => {
        if (f) fd.append(k, f);
      });

      if (editing) {
        await api.put(`${endpoint}/${editing.id}`, fd);
        showToast("Data berhasil diperbarui.");
      } else {
        await api.post(endpoint, fd);
        showToast("Data berhasil ditambahkan.");
      }
      setFormOpen(false);
      load();
      onDataChange?.();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gagal menyimpan data.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`${endpoint}/${deleting.id}`);
      showToast("Data berhasil dihapus.");
      setDeleting(null);
      load();
      onDataChange?.();
    } catch (err) {
      console.error("Error deleting data:", err);
      showToast(
        err.response?.data?.message ||
          "Gagal menghapus data. Silakan coba lagi.",
        "error",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="font-dash">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="text-[20px] font-semibold text-dashNavy">{title}</h1>
        <button
          onClick={openCreate}
          className="bg-dashAccent text-white rounded-md px-4 py-2.5 text-sm font-semibold hover:brightness-95 transition"
        >
          + Tambah
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari..."
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
          />
        </div>

        {sortOptions.length > 0 && (
          <div className="relative shrink-0 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition appearance-none cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 shadow-dashCard overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-dashNavy text-left">
            <tr>
              {columns.map((c) => (
                <th scope="col" key={c.key} className="px-4 py-3 font-semibold">
                  {c.label}
                </th>
              ))}
              <th scope="col" className="px-4 py-3 font-semibold">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-6 text-center text-dashNavy/40"
                >
                  Memuat...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-6 text-center text-dashNavy/40"
                >
                  Belum ada data.
                </td>
              </tr>
            )}
            {(sortOptions.length > 0 && sortBy !== "default"
              ? filteredAndSortedItems
              : items
            ).map((item) => {
              const baseBtnClass =
                "flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition whitespace-nowrap";

              return (
                <tr key={item.id}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      {c.render ? c.render(item) : item[c.key]}
                    </td>
                  ))}

                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className={`${baseBtnClass} bg-dashAccent/10 text-dashAccent hover:bg-dashAccent hover:text-white`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleting(item)}
                        className={`${baseBtnClass} bg-red-100 text-red-600 hover:bg-red-600 hover:text-white`}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 shadow-dashCard p-4"
          >
            {columns.map((c) => (
              <p key={c.key} className="text-sm mb-1">
                <span className="text-dashNavy/50">{c.label}: </span>
                {c.render ? c.render(item) : item[c.key]}
              </p>
            ))}
            <div className="flex gap-3 mt-2 text-sm">
              <button
                onClick={() => openEdit(item)}
                className="text-dashNavy underline"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleting(item)}
                className="text-red-600 underline"
              >
                Hapus
              </button>
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
              className={`w-8 h-8 rounded-md text-sm transition ${p === page ? "bg-dashNavy text-white" : "bg-white border border-gray-200 text-dashNavy hover:border-dashAccent"}`}
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
        title={`Data "${deleting?.[columns[0]?.key] || ""}" akan dihapus permanen. Lanjutkan?`}
        loading={deleteLoading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />

      <Toast toast={toast} />
    </div>
  );
}
