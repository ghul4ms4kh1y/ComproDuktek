import { useState } from 'react';
import { UserRound, ChevronDown, ChevronRight } from 'lucide-react';
import { BOX_COLORS } from './orgTreeUtils';

function PersonRow({ node, depth }) {
  const [open, setOpen] = useState(depth === 0); // level teratas otomatis terbuka
  const hasChildren = node.children?.length > 0;
  const c = BOX_COLORS[node.box_color] || BOX_COLORS.teal;

  return (
    <div style={{ marginLeft: depth > 0 ? 16 : 0 }} className={depth > 0 ? 'border-l border-gray-200 dark:border-gray-700 pl-3' : ''}>
      <button
        onClick={() => hasChildren && setOpen((v) => !v)}
        className={`w-full flex items-center gap-2 rounded-xl border ${c.bg} ${c.text} ${c.border} px-3 py-2 mb-2`}
      >
        {node.photo
          ? <img src={node.photo} alt={node.name} className="w-9 h-9 rounded-full object-cover shrink-0 border border-white shadow" />
          : <span className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shrink-0"><UserRound className="w-4 h-4" /></span>}
        <div className="text-left flex-1 min-w-0">
          <p className="text-xs font-bold truncate">{node.position}</p>
          <p className="text-[11px] opacity-80 truncate">{node.rank ? `${node.rank}` : ''} {node.name}</p>
        </div>
        {hasChildren && (open ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />)}
      </button>

      {hasChildren && open && (
        <div className="mb-2">
          {node.children.map((child) => (
            <PersonRow key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgListMobile({ roots }) {
  return (
    <div>
      {roots.map((root) => (
        <PersonRow key={root.id} node={root} depth={0} />
      ))}
    </div>
  );
}
