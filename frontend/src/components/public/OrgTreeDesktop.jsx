import { useMemo } from 'react';
import { UserRound } from 'lucide-react';
import { BOX_COLORS, ORG_LAYOUT, layoutOrgTree } from './orgTreeUtils';

function PersonBox({ node, xSlot, level }) {
  const c = BOX_COLORS[node.box_color] || BOX_COLORS.teal;
  const { cardW, imgW, imgH, cardTotalH } = ORG_LAYOUT;
  const left = xSlot * cardW - cardW / 2;
  const top = (level - 1) * ORG_LAYOUT.rowH;

  return (
    <div
      className="absolute flex flex-col items-center text-center"
      style={{ left, top, width: cardW, height: cardTotalH }}
    >
      <div
        className={`rounded-xl overflow-hidden border-2 ${c.border} shadow-sm bg-gray-100 flex items-center justify-center shrink-0`}
        style={{ width: imgW, height: imgH }}
      >
        {node.photo
          ? <img src={node.photo} alt={node.name} className="w-full h-full object-cover" />
          : <UserRound className="w-8 h-8 text-gray-400" />}
      </div>
      <p
        className="text-[11px] font-bold text-navy leading-tight mt-1.5 px-1"
        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {node.rank ? `${node.rank} ` : ''}{node.name}
      </p>
      <p className={`text-[10px] font-semibold leading-tight mt-1 px-2 py-0.5 rounded-full truncate max-w-full ${c.bg} ${c.text}`}>
        {node.position}
      </p>
    </div>
  );
}

// Bagan berbasis LEVEL (baris) + tree-layout horizontal.
// - Baris (Y) murni dari field `level` yang diisi manual admin: anak boleh
//   ditaruh beberapa baris di bawah parent-nya (skip level), tanpa kotak
//   kosong di baris yang dilewati.
// - Kolom (X) dihitung dari struktur pohon (`parent_id` + `display_order`)
//   lewat layoutOrgTree(): tiap cabang otomatis mengelompok tepat di bawah
//   parent-nya dan melebar sesuai jumlah keturunan.
// - Garis penghubung digambar SIKU (elbow): turun dari bawah kotak parent
//   ke satu garis horizontal ("bus", jaraknya SELALU sama dari parent
//   walau anaknya beberapa baris di bawah), lalu turun lagi masuk ke tiap
//   kotak anak — persis gaya bagan organisasi pada contoh.
export default function OrgTreeDesktop({ items }) {
  const { positions, totalWidth, totalHeight } = useMemo(() => layoutOrgTree(items), [items]);
  const { cardW, cardTotalH, rowH, busOffset } = ORG_LAYOUT;

  const lines = useMemo(() => {
    const next = [];
    items.forEach((child) => {
      if (!child.parent_id) return;
      const parentPos = positions.get(child.parent_id);
      const childPos = positions.get(child.id);
      if (!parentPos || !childPos) return;

      const px = parentPos.xSlot * cardW;
      const py = (parentPos.level - 1) * rowH + cardTotalH;
      const cx = childPos.xSlot * cardW;
      const cy = (childPos.level - 1) * rowH;
      const busY = py + busOffset;

      // M(parent bawah) -> turun ke garis bus -> geser horizontal ke kolom
      // anak -> turun ke atas kotak anak. Kalau px === cx, dua segmen
      // tengah otomatis jadi lurus (tidak ada belokan yang terlihat).
      next.push({
        id: `${child.parent_id}-${child.id}`,
        d: `M ${px},${py} L ${px},${busY} L ${cx},${busY} L ${cx},${cy}`,
      });
    });
    return next;
  }, [items, positions, cardW, cardTotalH, rowH, busOffset]);

  return (
    <div className="overflow-x-auto pb-4">
      <div
        className="relative mx-auto px-8 py-6"
        style={{ width: totalWidth, height: totalHeight }}
      >
        <svg
          className="absolute inset-0 pointer-events-none"
          width={totalWidth + 64}
          height={totalHeight + 48}
        >
          <defs>
            <marker id="orgArrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
            </marker>
          </defs>
          <g transform="translate(32, 24)">
            {lines.map((l) => (
              <path
                key={l.id}
                d={l.d}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
                markerEnd="url(#orgArrow)"
              />
            ))}
          </g>
        </svg>

        {items.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          return <PersonBox key={node.id} node={node} xSlot={pos.xSlot} level={pos.level} />;
        })}
      </div>
    </div>
  );
}