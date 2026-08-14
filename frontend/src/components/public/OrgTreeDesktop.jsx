import { BOX_COLORS } from "./orgTreeUtils";
import { UserRound } from "lucide-react";

// Tambahkan parameter hasChildren di sini ⬇️
function PersonBox({ node, hasChildren }) {
  if (node.position === "_TRUNK_") {
    return (
      <div className="flex flex-col items-center w-36 h-[70px] justify-center relative">
        <div className="w-px h-full bg-gray-300 dark:bg-gray-600 absolute top-0 bottom-0" />
      </div>
    );
  }

  if (
    node.position === "_SPACER_BATIMIN_" ||
    node.position === "_SPACER_PENATA_"
  ) {
    return (
      <div className="flex flex-col items-center w-36 h-[220px] justify-center relative">
        <div className="w-px h-full bg-gray-300 dark:bg-gray-600 absolute top-0 bottom-0" />
      </div>
    );
  }

  if (node.position === "_EMPTY_") {
    return <div className="w-36 h-[220px]"></div>;
  }

  // --- LOGIKA "EFEK PUDAR" & ANTI-TABRAKAN WARNA ---
  const pos = (node.position || "").toUpperCase();

  let haloEffect = "ring-blue-600";

  if (pos.includes("DANSATLAK")) {
    haloEffect = "ring-red-600";
  } else if (pos.includes("DANTIM") || pos.includes("DANUNIT")) {
    haloEffect = "ring-amber-400";
  }

  return (
    <div className="flex flex-col items-center w-36 text-center relative z-10 h-[220px]">
      <div
        className={`w-28 h-36 mt-1 rounded-[14px] overflow-hidden flex items-center justify-center shrink-0 bg-gray-50 dark:bg-gray-800/50 ring-[2px] ring-offset-[3px] ring-offset-white dark:ring-offset-slate-900 shadow-xl transition-all ${haloEffect}`}
      >
        {node.photo ? (
          <img
            src={node.photo}
            alt={node.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <UserRound className="w-12 h-12 text-gray-300" />
        )}
      </div>

      <p className="text-[13px] font-bold text-gray-700 dark:text-gray-200 leading-snug mt-4 px-1">
        {node.rank ? `${node.rank} ` : ""}
        {node.name || "-"}
      </p>

      <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mt-1 px-1">
        {node.position}
      </p>

      {/* ⬇️ TAMBAHAN BARU: Garis elastis untuk menutupi celah kosong */}
      {hasChildren && (
        <div className="w-px flex-grow bg-gray-300 dark:bg-gray-600 mt-2" />
      )}
    </div>
  );
}

function TreeNode({ node }) {
  const hasChildren = node.children?.length > 0;

  let firstVisibleIndex = 0;
  let lastVisibleIndex = hasChildren ? node.children.length - 1 : 0;

  if (hasChildren) {
    firstVisibleIndex = node.children.findIndex(
      (c) => c.position !== "_EMPTY_",
    );
    for (let i = node.children.length - 1; i >= 0; i--) {
      if (node.children[i].position !== "_EMPTY_") {
        lastVisibleIndex = i;
        break;
      }
    }
  }

  return (
    <div className="flex flex-col items-center">
      <PersonBox node={node} hasChildren={hasChildren} />

      {hasChildren && (
        <>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-start">
            {node.children.map((child, idx) => {
              const isEmpty = child.position === "_EMPTY_";

              // Cek apakah node ini adalah ujung garis berdasarkan node yang terlihat
              const isFirstVisible = idx === firstVisibleIndex;
              const isLastVisible = idx === lastVisibleIndex;
              const needsHorizontalLine =
                firstVisibleIndex !== lastVisibleIndex;

              return (
                <div
                  key={child.id}
                  className="flex flex-col items-center px-3 relative"
                >
                  {/* Gambar Garis Horizontal hanya pada node yang bukan _EMPTY_ */}
                  {needsHorizontalLine && !isEmpty && (
                    <div
                      className="absolute top-0 h-px bg-gray-300 dark:bg-gray-600"
                      style={{
                        left: isFirstVisible ? "50%" : 0,
                        right: isLastVisible ? "50%" : 0,
                      }}
                    />
                  )}

                  {/* Sembunyikan garis vertikal (turun) jika node-nya adalah _EMPTY_ */}
                  <div
                    className={`w-px h-4 ${isEmpty ? "bg-transparent" : "bg-gray-300 dark:bg-gray-600"}`}
                  />

                  <TreeNode node={child} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrgTreeDesktop({ roots }) {
  return (
    <div className="overflow-x-auto pb-4 pt-4">
      <div className="flex justify-center gap-8 min-w-max px-6">
        {roots.map((root) => (
          <TreeNode key={root.id} node={root} />
        ))}
      </div>
    </div>
  );
}
