import { useEffect, useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import api from "../../services/api";
import FormModal from "../../components/admin/FormModal";
import Toast from "../../components/admin/Toast";
import { buildTree } from "../../components/public/orgTreeUtils";

const HIDDEN_NODES = [
  "_TRUNK_",
  "_EMPTY_",
  "_SPACER_BATIMIN_",
  "_SPACER_PENATA_",
];

// Komponen Rekursif untuk Tampilan Hierarki (Standar)
const AdminOrgNode = ({ node, onEdit }) => {
  const sortedChildren = node.children
    ? [...node.children].sort((a, b) => {
        if (a.position === "_TRUNK_" && b.position !== "_TRUNK_") return 1;
        if (a.position !== "_TRUNK_" && b.position === "_TRUNK_") return -1;
        return 0;
      })
    : [];

  if (HIDDEN_NODES.includes(node.position)) {
    return (
      <>
        {sortedChildren.map((child) => (
          <AdminOrgNode key={child.id} node={child} onEdit={onEdit} />
        ))}
      </>
    );
  }

  return (
    <div className="mb-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-dashAccent/40 transition">
        <div className="flex items-center gap-4 mb-3 sm:mb-0">
          {node.photo ? (
            <img
              src={node.photo}
              alt={node.name}
              loading="lazy"
              className="w-12 h-12 rounded-full object-cover border border-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-dashNavy/40 text-sm font-semibold">
              ?
            </div>
          )}
          <div>
            <h3 className="text-[15px] font-bold text-dashNavy uppercase">
              {node.position}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {node.name ? (
                node.name
              ) : (
                <span className="italic text-gray-400">Belum ada nama</span>
              )}
              {node.rank && (
                <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs">
                  {node.rank}
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => onEdit(node)}
          className="bg-dashAccent/10 text-dashAccent hover:bg-dashAccent hover:text-white rounded-md px-4 py-2 text-sm font-semibold transition"
        >
          Edit Personel
        </button>
      </div>

      {sortedChildren.length > 0 && (
        <div className="pl-6 md:pl-10 mt-3 border-l-2 border-dashed border-gray-200 space-y-3">
          {sortedChildren.map((child) => (
            <AdminOrgNode key={child.id} node={child} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
};

// Komponen Card Datar Khusus untuk Tampilan Searching & Sorting
const FlatAdminCard = ({ node, onEdit }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-dashAccent/40 transition">
    <div className="flex items-center gap-4 mb-3 sm:mb-0">
      {node.photo ? (
        <img
          src={node.photo}
          alt={node.name}
          loading="lazy"
          className="w-12 h-12 rounded-full object-cover border border-gray-100"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-dashNavy/40 text-sm font-semibold">
          ?
        </div>
      )}
      <div>
        <h3 className="text-[15px] font-bold text-dashNavy uppercase">
          {node.position}
        </h3>
        <p className="text-sm text-gray-600 mt-0.5">
          {node.name ? (
            node.name
          ) : (
            <span className="italic text-gray-400">Belum ada nama</span>
          )}
          {node.rank && (
            <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs">
              {node.rank}
            </span>
          )}
        </p>
      </div>
    </div>
    <button
      onClick={() => onEdit(node)}
      className="bg-dashAccent/10 text-dashAccent hover:bg-dashAccent hover:text-white rounded-md px-4 py-2 text-sm font-semibold transition"
    >
      Edit Personel
    </button>
  </div>
);

export default function OrgStructureManage() {
  const [rawItems, setRawItems] = useState([]);
  const [roots, setRoots] = useState([]);
  const [loading, setLoading] = useState(false);

  // State untuk Fitur Searching & Sorting
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("hierarki");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = () => {
    setLoading(true);
    api
      .get("/org-structures", { params: { limit: 200 } })
      .then((r) => {
        setRawItems(r.data.data);
        setRoots(buildTree(r.data.data));
      })
      .catch(() => showToast("Gagal memuat data struktur organisasi.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const fields = [
    { name: "photo", label: "Foto Profil", type: "file" },
    { name: "name", label: "Nama Lengkap", type: "text", required: true },
    { name: "rank", label: "Pangkat", type: "text" },
    { name: "disc_kode", label: "Kode Karakter DISC (mis. DC)", type: "text" },
    {
      name: "disc_label",
      label: "Label Karakter (pisahkan koma sesuai urutan huruf, mis. Dominasi, Ketelitian)",
      type: "text",
    },
    { name: "kekuatan_utama", label: "Kekuatan Utama", type: "textarea" },
    {
      name: "rekomendasi_pengembangan",
      label: "Rekomendasi Pengembangan Diri",
      type: "textarea",
    },
    { name: "cara_komunikasi", label: "Cara Berkomunikasi", type: "textarea" },
  ];

  const openEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleSubmit = async (values, files) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      const allowedKeys = [
        "name",
        "rank",
        "position",
        "box_color",
        "display_order",
        "disc_kode",
        "disc_label",
        "kekuatan_utama",
        "rekomendasi_pengembangan",
        "cara_komunikasi",
      ];

      allowedKeys.forEach((key) => {
        if (values[key] !== null && values[key] !== undefined) {
          fd.append(key, values[key]);
        }
      });

      if (
        values.parent_id !== null &&
        values.parent_id !== undefined &&
        values.parent_id !== ""
      ) {
        fd.append("parent_id", values.parent_id);
      }

      if (files.photo) {
        fd.append("photo", files.photo);
      }

      await api.put(`/org-structures/${editing.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Data personel berhasil diperbarui.");

      setFormOpen(false);
      load();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gagal menyimpan data.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --- LOGIKA SEARCHING & SORTING PINTAR ---
  const isSearchingOrSorting = q.trim() !== "" || sortBy !== "hierarki";

  const filteredAndSortedItems = useMemo(() => {
    if (!isSearchingOrSorting) return [];

    let result = rawItems.filter(
      (item) => !HIDDEN_NODES.includes(item.position),
    );

    if (q.trim()) {
      const lowerQ = q.toLowerCase();
      result = result.filter(
        (item) =>
          (item.name || "").toLowerCase().includes(lowerQ) ||
          (item.position || "").toLowerCase().includes(lowerQ) ||
          (item.rank || "").toLowerCase().includes(lowerQ),
      );
    }

    result.sort((a, b) => {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      const posA = (a.position || "").toLowerCase();
      const posB = (b.position || "").toLowerCase();

      switch (sortBy) {
        case "nama_asc":
          return nameA.localeCompare(nameB);
        case "nama_desc":
          return nameB.localeCompare(nameA);
        case "jabatan_asc":
          return posA.localeCompare(posB);
        case "jabatan_desc":
          return posB.localeCompare(posA);
        default:
          return 0;
      }
    });

    return result;
  }, [rawItems, q, sortBy, isSearchingOrSorting]);
  // -----------------------------------------

  return (
    <div className="font-dash pb-12">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-[20px] font-semibold text-dashNavy">
          Kelola Personel Struktur Organisasi
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Isi nama dan pangkat untuk setiap jabatan yang telah ditetapkan dalam
          struktur resmi.
        </p>
      </div>

      {/* FILTER SEARCH BAR & SORTING MENU */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, pangkat, atau jabatan..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
          />
        </div>

        <div className="relative shrink-0 w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition appearance-none cursor-pointer"
          >
            <option value="hierarki">Urutan Bagan / Hierarki</option>
            <option value="nama_asc">Nama (A - Z)</option>
            <option value="nama_desc">Nama (Z - A)</option>
            <option value="jabatan_asc">Jabatan (A - Z)</option>
            <option value="jabatan_desc">Jabatan (Z - A)</option>
          </select>
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* AREA RENDER DATA */}
      <div className="bg-white rounded-xl p-2 sm:p-5 shadow-dashCard border border-gray-100">
        {loading && (
          <p className="text-center text-dashNavy/40 py-10">
            Memuat hierarki...
          </p>
        )}
        {!loading && rawItems.length === 0 && (
          <p className="text-center text-dashNavy/40 py-10">
            Struktur belum diinisialisasi di database.
          </p>
        )}

        {/* TAMPILAN NORMAL (TREE BERJENJANG) */}
        {!loading &&
          rawItems.length > 0 &&
          !isSearchingOrSorting &&
          roots.map((rootNode) => (
            <AdminOrgNode key={rootNode.id} node={rootNode} onEdit={openEdit} />
          ))}

        {/* PESAN JIKA PENCARIAN KOSONG */}
        {!loading &&
          isSearchingOrSorting &&
          filteredAndSortedItems.length === 0 && (
            <p className="text-center text-dashNavy/40 py-10">
              Personel tidak ditemukan.
            </p>
          )}

        {/* TAMPILAN SEARCH/SORT (DATAR) */}
        {!loading &&
          isSearchingOrSorting &&
          filteredAndSortedItems.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 mb-4 px-2 uppercase tracking-wide">
                Menampilkan {filteredAndSortedItems.length} hasil
              </p>
              {filteredAndSortedItems.map((item) => (
                <FlatAdminCard key={item.id} node={item} onEdit={openEdit} />
              ))}
            </div>
          )}
      </div>

      <FormModal
        open={formOpen}
        title={`Edit Personel: ${editing?.position || ""}`}
        fields={fields}
        initialValues={editing || {}}
        submitting={submitting}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <Toast toast={toast} />
    </div>
  );
}
