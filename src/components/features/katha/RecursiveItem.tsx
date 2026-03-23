import React from "react";
import { 
  FolderOpen, 
  BookOpen, 
  ChevronRight, 
  Tag, 
  Heart, 
  Pin,
  Download, 
  Share2, 
  User, 
  Move, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Copy
} from "lucide-react";
import { MiniAction } from "./MiniAction";

/**
 * RecursiveItem Component - List item style for folders and files
 */
export const RecursiveItem = ({
  index,
  item,
  onTag,
  onFav,
  onPin,
  onDownload,
  onShare,
  onUser,
  onMove,
  onEdit,
  onDelete,
  onClick
}: {
  index: number;
  item: any;
  onTag: () => void;
  onFav: () => void;
  onPin: () => void;
  onDownload: () => void;
  onShare: () => void;
  onUser: () => void;
  onMove: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}) => {
  const type = item.type;
  const isFolder = type === 'folder';
  const title = item.name || item.title;
  const info = item.info;
  const isFav = item.isFav;
  const isPinned = item.isPinned;

  return (
    <div
      onClick={onClick}
      style={{ animationDelay: `${index * 50}ms` }}
      className={`w-full bg-white dark:bg-slate-900 border ${isPinned ? 'border-[#8b1D1D]/50 bg-[#8b1D1D]/[0.02]' : 'border-slate-100 dark:border-slate-800'} rounded-2xl p-3 md:p-4 flex flex-col lg:flex-row items-start lg:items-center gap-3 md:gap-5 shadow-sm hover:border-[#8b1D1D]/30 transition-all group cursor-pointer relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b1D1D]/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center gap-3 md:gap-5 w-full lg:w-auto">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#8b1D1D]/5 transition-colors">
          {isFolder ? <FolderOpen className="w-5 h-5 md:w-6 md:h-6 text-amber-500" /> : <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-[#8b1D1D] stroke-[2.5]" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {isPinned && <Pin size={12} className="text-[#8b1D1D] fill-[#8b1D1D]" />}
            <span className="text-[10px] md:text-xs font-black text-slate-300 dark:text-slate-700">
              {index < 10 ? `0${index}` : index}
            </span>
            <h4 className="text-base md:text-xl font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-[#8b1D1D] transition-colors truncate">
              {title}
            </h4>
          </div>
          <p className="text-[10px] md:text-sm text-slate-400 font-medium italic truncate">{info}</p>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.tags.map((tag: any) => (
                <span 
                  key={tag.id} 
                  className="text-[7px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color, border: `1px solid ${tag.color}40` }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="lg:hidden">
          <div className={`p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400`}>
            <ChevronRight size={18} />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between lg:justify-end gap-2 w-full lg:flex-1">
        <div className="flex flex-wrap items-center justify-center gap-1 p-1 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm relative w-full sm:w-auto">
          <div className="flex items-center gap-1 px-0.5 md:px-1">
            {/* User Requested Sequence: Bookmark, Hide, Tag, Copy, Pin, Download, Share, User Share */}
            <MiniAction Icon={Heart} label="Bookmark" onClick={onFav} color={isFav ? "text-amber-500" : "text-slate-400 hover:text-amber-500"} />
            <MiniAction Icon={EyeOff} label="Hide" onClick={() => {}} color="text-slate-400 hover:text-slate-600" />
            <MiniAction Icon={Tag} label="Tag" onClick={onTag} color="text-indigo-500 hover:text-indigo-600" />
            <MiniAction Icon={Copy} label="Copy Name" onClick={() => navigator.clipboard.writeText(title)} color="text-blue-500 hover:text-blue-600" />
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 opacity-50" />
          <div className="flex items-center gap-1 px-0.5 md:px-1">
            <MiniAction Icon={Pin} label={isPinned ? "Unpin" : "Pin"} onClick={onPin} color={isPinned ? "text-[#8b1D1D] fill-[#8b1D1D]/10" : "text-slate-400 hover:text-[#8b1D1D]"} />
            <MiniAction Icon={Download} label="Download" onClick={onDownload} color="text-blue-500 hover:text-blue-600" />
            <MiniAction Icon={Share2} label="Share" onClick={onShare} color="text-emerald-500 hover:text-emerald-600" />
            <MiniAction Icon={User} label="User Share" onClick={onUser} color="text-purple-500 hover:text-purple-600" />
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 opacity-50" />
          <div className="flex items-center gap-1 px-0.5 md:px-1">
            <MiniAction Icon={Move} label="Move" onClick={onMove} color="text-slate-500 hover:text-slate-900" />
            <MiniAction Icon={Edit} label="Edit" onClick={onEdit} color="text-slate-500 hover:text-slate-900" />
            <MiniAction Icon={Trash2} label="Delete" onClick={onDelete} color="text-red-500 hover:text-red-600" />
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 opacity-50" />
          <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#8b1D1D] transition-all whitespace-nowrap`}
          >
            {isFolder ? <ChevronRight size={16} /> : <Eye size={16} />}
            <span>{isFolder ? 'OPEN' : 'EDIT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
