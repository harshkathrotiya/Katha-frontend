import React from "react";
import { FolderOpen, ChevronRight } from "lucide-react";

/**
 * MoveSidebarItem - Recursive Tree Node for the Move Sidebar
 */
export const MoveSidebarItem = ({
  folder,
  depth = 0,
  activeId,
  expandedIds,
  onSelect,
  onToggle
}: {
  folder: any;
  depth?: number;
  activeId: string | null;
  expandedIds: Set<string>;
  onSelect: (f: any) => void;
  onToggle: (id: string) => void;
}) => {
  const isExpanded = expandedIds.has(folder.id);
  const isActive = activeId === folder.id;
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div className="flex flex-col">
      <div
        onClick={() => onSelect(folder)}
        className={`flex items-center gap-2 py-1 px-2 rounded-md cursor-pointer transition-all duration-150 group/item ${isActive ? 'bg-[#8b1D1D]/10 text-[#8b1D1D]' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium'}`}
        style={{ paddingLeft: `${(depth * 12) + 6}px` }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(folder.id); }}
          className={`p-0.5 rounded transition-transform ${isExpanded ? 'rotate-90' : ''} ${!hasChildren ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <ChevronRight size={12} className={isActive ? 'text-[#8b1D1D]' : 'text-slate-400'} />
        </button>
        <div className={`shrink-0 ${isActive ? 'text-[#8b1D1D]' : 'text-blue-500/80 dark:text-blue-400/80'}`}>
          <FolderOpen size={16} strokeWidth={2.5} />
        </div>
        <span className={`text-[11px] font-semibold truncate flex-1 ${isActive ? 'text-[#8b1D1D]' : ''}`}>
          {folder.name}
        </span>
      </div>
      {isExpanded && folder.children && (
        <div className="flex flex-col">
          {folder.children.map((child: any) => (
            <MoveSidebarItem
              key={child.id}
              folder={child}
              depth={depth + 1}
              activeId={activeId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
