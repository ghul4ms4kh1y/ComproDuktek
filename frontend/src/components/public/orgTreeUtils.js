// Warna kotak per box_color, dipetakan ke palet resmi project ini
// (navy/gold/blue-600) - bukan warna Verixa, supaya konsisten dengan
// halaman lain (Navbar, tombol, dst yang sudah pakai navy & blue-600).
export const BOX_COLORS = {
  merah: { bg: "bg-red-50", text: "text-red-800", border: "border-red-300" },
  oranye: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  }, // Fallback
  teal: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }, // Semua staf jadi biru
};

// Mengubah daftar datar (flat, dengan parent_id) menjadi struktur pohon (tree)
// dengan properti `children` di tiap node. Dipakai bersama oleh versi desktop
// (tree bergaris) maupun versi mobile (list bertingkat).
export function buildTree(items) {
  const map = new Map();
  items.forEach((item) => map.set(item.id, { ...item, children: [] }));

  const roots = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// --- Layout bagan desktop (tree berbasis level manual + garis siku) ---
// Ukuran & jarak kotak dipakai bersama oleh OrgTreeDesktop untuk menghitung
// posisi kotak (absolute) dan jalur garis siku (elbow) murni dari data
// (level + parent_id + display_order) — tidak perlu ukur DOM lagi.
export const ORG_LAYOUT = {
  cardW: 128,       // lebar slot per kolom (termasuk jarak antar kotak)
  imgW: 88,
  imgH: 104,
  cardTotalH: 172,  // tinggi kotak+teks yang dicadangkan di tiap baris
  rowGap: 48,       // ruang kosong antar baris, tempat garis siku dibelokkan
  busOffset: 16,    // jarak dari bawah kotak parent ke garis horizontal (bus)
};
ORG_LAYOUT.rowH = ORG_LAYOUT.cardTotalH + ORG_LAYOUT.rowGap;

// Menghitung posisi tiap node untuk bagan:
// - Kolom (X): algoritma tree-layout. Node daun menempati 1 slot kolom;
//   node yang punya anak otomatis center tepat di tengah rentang anak-
//   anaknya. Jadi cabang dengan banyak keturunan melebar sendiri, cabang
//   kecil tetap rapat — persis pengelompokan pada bagan contoh.
// - Baris (Y): murni dari field `level` (BUKAN dari kedalaman pohon),
//   sehingga seorang anak boleh "melompat" beberapa baris dari parent-nya
//   tanpa perlu kotak kosong di baris yang dilewati.
// Mendukung banyak root sekaligus (kalau ada data tanpa parent_id, semua
// diletakkan berdampingan) — tapi biasanya cukup 1 root (pucuk pimpinan).
export function layoutOrgTree(items) {
  const roots = buildTree(items);
  const positions = new Map(); // id -> { xSlot, level }
  let cursor = 0;
  let maxLevel = 1;

  const place = (node) => {
    const level = node.level ?? 1;
    maxLevel = Math.max(maxLevel, level);

    if (!node.children.length) {
      const xSlot = cursor + 0.5;
      cursor += 1;
      positions.set(node.id, { xSlot, level });
      return xSlot;
    }

    const childXs = node.children.map(place);
    const xSlot = (childXs[0] + childXs[childXs.length - 1]) / 2;
    positions.set(node.id, { xSlot, level });
    return xSlot;
  };

  roots.forEach(place);

  const { cardW, rowH } = ORG_LAYOUT;
  return {
    positions,
    totalWidth: Math.max(cursor * cardW, cardW),
    totalHeight: maxLevel * rowH,
  };
}