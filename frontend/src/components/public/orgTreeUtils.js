// Warna kotak per box_color, dipetakan ke palet resmi project ini
// (navy/gold/blue-600) - bukan warna Verixa, supaya konsisten dengan
// halaman lain (Navbar, tombol, dst yang sudah pakai navy & blue-600).
export const BOX_COLORS = {
  merah: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300' }, // pucuk pimpinan
  oranye: { bg: 'bg-gold/20', text: 'text-navy', border: 'border-gold' },      // pemimpin unit
  teal: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }, // staf
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
