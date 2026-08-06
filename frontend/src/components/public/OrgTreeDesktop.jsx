import { UserRound } from 'lucide-react';
import { BOX_COLORS } from './orgTreeUtils';

function PersonBox({ node }) {
  const c = BOX_COLORS[node.box_color] || BOX_COLORS.teal;
  return (
    <div className={`inline-flex items-center gap-2 rounded-xl border ${c.bg} ${c.text} ${c.border} px-3 py-2 shadow-sm whitespace-nowrap`}>
      {node.photo
        ? <img src={node.photo} alt={node.name} className="w-9 h-9 rounded-full object-cover shrink-0 border border-white shadow" />
        : <span className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shrink-0"><UserRound className="w-4 h-4" /></span>}
      <div className="text-left">
        <p className="text-xs font-bold leading-tight">{node.position}</p>
        <p className="text-[11px] leading-tight opacity-80">{node.name}{node.rank ? ` • ${node.rank}` : ''}</p>
      </div>
    </div>
  );
}

// Node pohon rekursif: kotak orang + (jika ada anak) garis vertikal turun,
// garis horizontal selebar anak-anaknya, lalu tiap anak digambar ulang secara
// rekursif dengan pola yang sama. Ini membuat bagan tersusun otomatis dari
// data manapun, tanpa perlu koordinat manual.
function TreeNode({ node }) {
  const hasChildren = node.children?.length > 0;
  return (
    <div className="flex flex-col items-center">
      <PersonBox node={node} />
      {hasChildren && (
        <>
          <div className="w-px h-5 bg-gray-300" />
          <div className="flex items-start">
            {node.children.map((child, idx) => (
              <div key={child.id} className="flex flex-col items-center px-4 relative">
                {node.children.length > 1 && (
                  <div
                    className="absolute top-0 h-px bg-gray-300"
                    style={{
                      left: idx === 0 ? '50%' : 0,
                      right: idx === node.children.length - 1 ? '50%' : 0,
                    }}
                  />
                )}
                <div className="w-px h-5 bg-gray-300" />
                <TreeNode node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrgTreeDesktop({ roots }) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex justify-center gap-16 min-w-max px-8">
        {roots.map((root) => (
          <TreeNode key={root.id} node={root} />
        ))}
      </div>
    </div>
  );
}
