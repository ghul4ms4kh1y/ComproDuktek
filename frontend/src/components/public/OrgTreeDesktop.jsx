import { UserRound } from 'lucide-react';
import { BOX_COLORS } from './orgTreeUtils';

function PersonBox({ node }) {
  const c = BOX_COLORS[node.box_color] || BOX_COLORS.teal;
  return (
    <div className="flex flex-col items-center w-48 text-center">
      <div className={`w-40 h-48 rounded-2xl overflow-hidden border-2 ${c.border} shadow-sm bg-gray-100 flex items-center justify-center shrink-0`}>
        {node.photo
          ? <img src={node.photo} alt={node.name} className="w-full h-full object-cover" />
          : <UserRound className="w-16 h-16 text-gray-400" />}
      </div>
      <p className="text-sm font-bold text-navy leading-tight mt-3">{node.rank ? `${node.rank} ` : ''}{node.name}</p>
      <p className={`text-xs font-semibold leading-tight mt-2 px-3 py-1 rounded-full ${c.bg} ${c.text}`}>{node.position}</p>
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