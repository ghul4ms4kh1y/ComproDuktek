import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import InfoCardGrid from "../../components/admin/InfoCardGrid";
import PageHeader from "../../components/admin/PageHeader";
import FormModal from "../../components/admin/FormModal";
import Toast from "../../components/admin/Toast";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { useToast } from "../../hooks/useToast";
import { Search, ArrowUpDown, Filter } from "lucide-react";

const fields = [
  {
    name: "full_name",
    label: "Nama Lengkap",
    type: "text",
    required: true,
  },
  {
    name: "username",
    label: "Username",
    type: "text",
    required: true,
  },
  {
    name: "pangkat",
    label: "Pangkat",
    type: "text",
  },
  {
    name: "password",
    label: "Reset Password (Opsional)",
    type: "password",
    colSpan: 2,
    hint: "Kosongkan jika tidak ingin diubah. Mengisi kolom ini akan me-reset password anggota.",
  },
];

const sortOptions = [
  { value: "hierarki", label: "Urutan Jabatan (Hierarki)" },
  { value: "nama_asc", label: "Nama Lengkap (A - Z)" },
  { value: "nama_desc", label: "Nama Lengkap (Z - A)" },
  { value: "uname_asc", label: "Username (A - Z)" },
  { value: "uname_desc", label: "Username (Z - A)" },
  { value: "status_aktif_first", label: "Status (Aktif Dahulu)" },
  { value: "status_nonaktif_first", label: "Status (Nonaktif Dahulu)" },
];

const ITEMS_PER_PAGE = 12;

export default function SoldierManage() {
  const [soldiers, setSoldiers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("hierarki");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusToggleTarget, setStatusToggleTarget] = useState(null);
  const [statusToggleLoading, setStatusToggleLoading] = useState(false);

  const { toast, showToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/soldiers");
      setSoldiers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat data personel.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAndSortedSoldiers = useMemo(() => {
    let result = [...soldiers];

    if (statusFilter !== "all") {
      result = result.filter(
        (s) => (s.status || "aktif") === statusFilter,
      );
    }

    if (q.trim()) {
      const lowerQ = q.toLowerCase();
      result = result.filter(
        (s) =>
          (s.full_name || "").toLowerCase().includes(lowerQ) ||
          (s.username || "").toLowerCase().includes(lowerQ) ||
          (s.pangkat || "").toLowerCase().includes(lowerQ) ||
          (s.OrgStructure?.position || "").toLowerCase().includes(lowerQ),
      );
    }

    result.sort((a, b) => {
      const nameA = (a.full_name || "").toLowerCase();
      const nameB = (b.full_name || "").toLowerCase();
      const unameA = (a.username || "").toLowerCase();
      const unameB = (b.username || "").toLowerCase();
      const statusA = a.status || "aktif";
      const statusB = b.status || "aktif";

      switch (sortBy) {
        case "nama_asc":
          return nameA.localeCompare(nameB);
        case "nama_desc":
          return nameB.localeCompare(nameA);
        case "uname_asc":
          return unameA.localeCompare(unameB);
        case "uname_desc":
          return unameB.localeCompare(unameA);
        case "status_aktif_first":
          if (statusA === statusB) return nameA.localeCompare(nameB);
          return statusA === "aktif" ? -1 : 1;
        case "status_nonaktif_first":
          if (statusA === statusB) return nameA.localeCompare(nameB);
          return statusA === "nonaktif" ? -1 : 1;
        case "hierarki":
        default: {
          const orderA = a.OrgStructure?.display_order ?? 999999;
          const orderB = b.OrgStructure?.display_order ?? 999999;
          return orderA - orderB;
        }
      }
    });

    return result;
  }, [soldiers, q, sortBy, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [q, sortBy, statusFilter]);

  const totalPages = Math.ceil(
    filteredAndSortedSoldiers.length / ITEMS_PER_PAGE,
  );
  const paginatedData = filteredAndSortedSoldiers.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const metrics = useMemo(() => {
    const withFullName = soldiers.filter(
      (s) => s.full_name && s.full_name.trim(),
    ).length;
    const active = soldiers.filter(
      (s) => (s.status || "aktif") === "aktif",
    ).length;

    return {
      total: soldiers.length,
      withFullName,
      withoutFullName: soldiers.length - withFullName,
      active,
    };
  }, [soldiers]);

  const infoCards = [
    { label: "Total Personel", value: metrics.total, loading },
    { label: "Nama Lengkap", value: metrics.withFullName, loading },
    { label: "Tanpa Nama", value: metrics.withoutFullName, loading },
    { label: "Aktif", value: metrics.active, loading },
  ];

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = { ...values };
      if (!payload.password) delete payload.password;
      await api.put(`/soldiers/${editing.id}`, payload);
      showToast("Data anggota berhasil diperbarui.");
      setEditing(null);
      fetchData();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gagal memperbarui data anggota.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (soldier) => {
    if ((soldier.status || "aktif") === "aktif") {
      setStatusToggleTarget(soldier);
      return;
    }
    try {
      await api.put(`/soldiers/${soldier.id}`, { status: "aktif" });
      showToast(
        `Akun ${soldier.full_name || soldier.username} berhasil diaktifkan.`,
      );
      fetchData();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gagal mengubah status akun.",
        "error",
      );
    }
  };

  const confirmDeactivate = async () => {
    if (!statusToggleTarget) return;
    setStatusToggleLoading(true);
    try {
      await api.put(`/soldiers/${statusToggleTarget.id}`, {
        status: "nonaktif",
      });
      showToast(
        `Akun ${statusToggleTarget.full_name || statusToggleTarget.username} berhasil dinonaktifkan.`,
      );
      setStatusToggleTarget(null);
      fetchData();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gagal menonaktifkan akun.",
        "error",
      );
    } finally {
      setStatusToggleLoading(false);
    }
  };

  return (
    <div className="font-dash">
      <PageHeader
        title="Kelola Personel Struktur Organisasi"
        subtitle="Kelola nama akun, profil, dan reset kata sandi anggota."
      />

      <div className="mb-5">
        <InfoCardGrid cards={infoCards} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama lengkap, username, pangkat, atau jabatan..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
          />
        </div>

        <div className="relative shrink-0 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 h-[42px] pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm leading-normal bg-white focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition appearance-none cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Status: Aktif</option>
            <option value="nonaktif">Status: Nonaktif</option>
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative shrink-0 w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-64 h-[42px] pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm leading-normal bg-white focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition appearance-none cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-dashCard overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-dashNavy text-left">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Nama Lengkap
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Username
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Pangkat
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Jabatan
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-dashNavy/50"
                >
                  Memuat data...
                </td>
              </tr>
            )}
            {!loading && paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-dashNavy/50"
                >
                  {q.trim() !== ""
                    ? "Pencarian tidak menemukan hasil."
                    : "Belum ada data anggota."}
                </td>
              </tr>
            )}
            {!loading &&
              paginatedData.map((soldier) => (
                <tr key={soldier.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3 font-medium text-dashNavy">
                    {soldier.full_name || "-"}
                  </td>
                  <td className="px-4 py-3">{soldier.username}</td>
                  <td className="px-4 py-3 text-dashNavy/80 font-medium">
                    {soldier.pangkat || "-"}
                  </td>
                  <td className="px-4 py-3 text-dashNavy/60">
                    {soldier.OrgStructure?.position || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const isActive = (soldier.status || "aktif") === "aktif";
                      return (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isActive}
                          aria-label={
                            isActive
                              ? "Nonaktifkan akun"
                              : "Aktifkan akun"
                          }
                          onClick={() => handleToggleStatus(soldier)}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-dashAccent/40 ${isActive ? "bg-green-500" : "bg-gray-100 border border-gray-300"}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`}
                          />
                        </button>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button
                      onClick={() => setEditing(soldier)}
                      className="flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition whitespace-nowrap bg-dashAccent/10 text-dashAccent hover:bg-dashAccent hover:text-white"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
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
        open={!!editing}
        title={`Edit Akun: ${editing?.username || ""}`}
        fields={fields}
        initialValues={
          editing
            ? {
                full_name: editing.full_name || "",
                username: editing.username || "",
                pangkat: editing.pangkat || "",
                password: "",
              }
            : {}
        }
        submitting={submitting}
        onCancel={() => setEditing(null)}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={!!statusToggleTarget}
        headerTitle="Nonaktifkan Akun Anggota?"
        title={`Apakah Anda yakin ingin menonaktifkan akun anggota ${statusToggleTarget?.full_name || statusToggleTarget?.username || ""}? Akun yang nonaktif tidak akan bisa login ke sistem.`}
        confirmText="Ya, Nonaktifkan"
        loading={statusToggleLoading}
        onCancel={() => setStatusToggleTarget(null)}
        onConfirm={confirmDeactivate}
      />

      <Toast toast={toast} />
    </div>
  );
}
