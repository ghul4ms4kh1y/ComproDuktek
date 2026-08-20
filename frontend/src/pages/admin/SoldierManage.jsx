import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import {
  Pencil,
  KeyRound,
  ShieldAlert,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { buildTree } from "../../components/public/orgTreeUtils";

export default function SoldierManage() {
  const [soldiers, setSoldiers] = useState([]);
  const [orgHierarchy, setOrgHierarchy] = useState([]); // array of org_structure_id in hierarchical order
  const [loading, setLoading] = useState(true);

  const [selectedSoldier, setSelectedSoldier] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    full_name: "",
    password: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  // Sorting & Searching State
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("hierarki");

  const fetchData = async () => {
    try {
      setLoading(true);
      // Ambil data anggota dan struktur organisasi secara paralel
      const [soldiersRes, orgRes] = await Promise.all([
        api.get(`/soldiers`),
        api.get(`/org-structures`, { params: { limit: 200 } }),
      ]);

      if (Array.isArray(soldiersRes.data)) {
        setSoldiers(soldiersRes.data);
      } else {
        console.error("API did not return an array:", soldiersRes.data);
        setSoldiers([]);
      }

      // Bangun struktur tree untuk mengetahui urutan hierarki
      const rawOrg = orgRes.data?.data || [];
      const roots = buildTree(rawOrg);

      const flattenTree = (nodes) => {
        let list = [];
        const traverse = (node) => {
          list.push(node.id);
          if (node.children) {
            node.children.forEach(traverse);
          }
        };
        nodes.forEach(traverse);
        return list;
      };

      setOrgHierarchy(flattenTree(roots));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (soldier) => {
    setSelectedSoldier(soldier);
    setEditForm({
      username: soldier.username,
      full_name: soldier.full_name || "",
      password: "",
    });
    setIsEditModalOpen(true);
    setMessage({ type: "", text: "" });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/soldiers/${selectedSoldier.id}`, editForm);
      setMessage({
        type: "success",
        text: "Data anggota berhasil diperbarui.",
      });
      fetchData(); // Reload data
      setTimeout(() => setIsEditModalOpen(false), 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Gagal memperbarui data anggota.",
      });
    }
  };

  const filteredAndSortedSoldiers = useMemo(() => {
    let result = [...soldiers];

    // 1. Filter (Searching)
    if (q.trim()) {
      const lowerQ = q.toLowerCase();
      result = result.filter(
        (s) =>
          (s.full_name || "").toLowerCase().includes(lowerQ) ||
          (s.username || "").toLowerCase().includes(lowerQ) ||
          (s.OrgStructure?.position || "").toLowerCase().includes(lowerQ),
      );
    }

    // 2. Sort
    result.sort((a, b) => {
      const nameA = (a.full_name || "").toLowerCase();
      const nameB = (b.full_name || "").toLowerCase();
      const unameA = (a.username || "").toLowerCase();
      const unameB = (b.username || "").toLowerCase();

      switch (sortBy) {
        case "nama_asc":
          return nameA.localeCompare(nameB);
        case "nama_desc":
          return nameB.localeCompare(nameA);
        case "uname_asc":
          return unameA.localeCompare(unameB);
        case "uname_desc":
          return unameB.localeCompare(unameA);
        case "hierarki":
        default: {
          const idxA = orgHierarchy.indexOf(a.org_structure_id);
          const idxB = orgHierarchy.indexOf(b.org_structure_id);
          // Jika tidak ada di orgHierarchy (misal admin murni dsb), taruh di paling bawah
          const posA = idxA === -1 ? 999999 : idxA;
          const posB = idxB === -1 ? 999999 : idxB;
          return posA - posB;
        }
      }
    });

    return result;
  }, [soldiers, q, sortBy, orgHierarchy]);

  if (loading) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="space-y-6 pb-12 font-dash">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-[20px] font-semibold text-dashNavy">
            Kelola Personel Struktur Organisasi
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola nama akun, profil, dan reset kata sandi anggota.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama lengkap, username, atau jabatan..."
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
            <option value="hierarki">Urutan Jabatan (Hierarki)</option>
            <option value="nama_asc">Nama Lengkap (A - Z)</option>
            <option value="nama_desc">Nama Lengkap (Z - A)</option>
            <option value="uname_asc">Username (A - Z)</option>
            <option value="uname_desc">Username (Z - A)</option>
          </select>
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-dashCard border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4">Nama Lengkap</th>
                <th scope="col" className="px-6 py-4">Username</th>
                <th scope="col" className="px-6 py-4">Jabatan</th>
                <th scope="col" className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAndSortedSoldiers.map((soldier) => (
                <tr key={soldier.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {soldier.full_name || "-"}
                  </td>
                  <td className="px-6 py-4">{soldier.username}</td>
                  <td className="px-6 py-4">
                    {soldier.OrgStructure?.position || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleEditClick(soldier)}
                        className="p-1.5 text-dashAccent bg-dashAccent/10 rounded hover:bg-dashAccent/20 transition"
                        title="Edit Akun"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAndSortedSoldiers.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    {q.trim() !== ""
                      ? "Pencarian tidak menemukan hasil."
                      : "Belum ada data anggota."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredAndSortedSoldiers.length > 0 && (
          <div className="p-4 border-t border-gray-100 text-xs text-gray-500 text-right">
            Menampilkan {filteredAndSortedSoldiers.length} data anggota
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div role="dialog" aria-modal="true" aria-labelledby="edit-soldier-title" className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 id="edit-soldier-title" className="text-lg font-semibold text-dashNavy">
                Edit Akun Anggota
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent"
                  required
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <KeyRound className="w-4 h-4" /> Reset Password (Opsional)
                </label>
                <input
                  type="password"
                  placeholder="Kosongkan jika tidak ingin diubah"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dashAccent/20 focus:border-dashAccent"
                />
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Mengisi kolom ini akan
                  me-reset password anggota.
                </p>
              </div>

              {message.text && (
                <div
                  className={`p-3 rounded-lg text-sm ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-dashNavy hover:bg-dashNavy/90 rounded-lg transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
