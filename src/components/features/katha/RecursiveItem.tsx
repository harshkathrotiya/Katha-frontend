import React from "react";
import { 
  FolderOpen, 
  BookOpen, 
  ChevronRight, 
  Tag, 
  Heart, 
  ChevronUp, 
  ChevronDown, 
  Download, 
  Share2, 
  User, 
  Move, 
  Edit, 
  Trash2, 
  Eye 
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
  onMoveUp,
  onMoveDown,
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
  onMoveUp: () => void;
  onMoveDown: () => void;
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

  return (
    <div
      onClick={onClick}
      className={`w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 md:p-6 flex flex-col lg:flex-row items-start lg:items-center gap-4 md:gap-6 shadow-sm hover:border-[#8b1D1D]/30 transition-all group cursor-pointer relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b1D1D]/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center gap-4 md:gap-6 w-full lg:w-auto">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#8b1D1D]/5 transition-colors">
          {isFolder ? <FolderOpen className="w-6 h-6 md:w-8 md:h-8 text-amber-500" /> : <BookOpen className="w-6 h-6 md:w-[30px] md:h-[30px] text-[#8b1D1D] stroke-[2.5]" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] md:text-xs font-black text-slate-300 dark:text-slate-700">
              {index < 10 ? `0${index}` : index}
            </span>
            <h4 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-[#8b1D1D] transition-colors truncate">
              {title}
            </h4>
          </div>
          <p className="text-[10px] md:text-sm text-slate-400 font-medium italic truncate">{info}</p>
        </div>

        <div className="lg:hidden">
          <div className={`p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400`}>
            <ChevronRight size={18} />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between lg:justify-end gap-3 w-full lg:flex-1">
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-sm rounded-[22px] border border-slate-100 dark:border-slate-700/50 shadow-sm relative w-full sm:w-auto">
          <div className="flex items-center gap-1 px-0.5 md:px-1">
            <MiniAction Icon={Tag} label="Tag" onClick={onTag} color="text-indigo-500 hover:text-indigo-600" />
            <MiniAction Icon={Heart} label="Favourite" onClick={onFav} color={isFav ? "text-amber-500" : "text-slate-400 hover:text-amber-500"} />
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 opacity-50" />
          <div className="flex items-center gap-1 px-0.5 md:px-1">
            <MiniAction Icon={ChevronUp} label="Move Up" onClick={onMoveUp} color="text-slate-500 hover:text-slate-900" />
            <MiniAction Icon={ChevronDown} label="Move Down" onClick={onMoveDown} color="text-slate-500 hover:text-slate-900" />
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 opacity-50" />
          <div className="flex items-center gap-1 px-0.5 md:px-1">
            <MiniAction Icon={Download} label="Download" onClick={onDownload} color="text-blue-500 hover:text-blue-600" />
            <MiniAction Icon={Share2} label="Share" onClick={onShare} color="text-emerald-500 hover:text-emerald-600" />
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 opacity-50" />
          <div className="flex items-center gap-1 px-0.5 md:px-1">
            <MiniAction Icon={User} label="User" onClick={onUser} color="text-purple-500 hover:text-purple-600" />
            <MiniAction Icon={Move} label="Move" onClick={onMove} color="text-slate-500 hover:text-slate-900" />
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 opacity-50" />
          <div className="flex items-center gap-1 px-0.5 md:px-1">
            <MiniAction Icon={Edit} label="Edit" onClick={onEdit} color="text-slate-500 hover:text-slate-900" />
            <MiniAction Icon={Trash2} label="Delete" onClick={onDelete} color="text-red-500 hover:text-red-600" />
          </div>
        </div>

        <button className={`w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-[#8b1D1D] text-white rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:opacity-95 shadow-lg shadow-black/5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shrink-0`}>
          {isFolder ? <ChevronRight size={18} /> : <Eye size={18} />}
          <span>{isFolder ? 'OPEN' : 'EDIT'}</span>
        </button>
      </div>
    </div>
  );
};
