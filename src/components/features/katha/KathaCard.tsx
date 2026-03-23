import React from "react";
import {
  Download,
  Trash2,
  Share2,
  User,
  Tag,
  ChevronUp,
  ChevronDown,
  Heart,
  Edit,
  Eye,
  EyeOff,
  Copy,
  Pin,
  Users,
  Move
} from "lucide-react";

/**
 * KathaCard Component - Main Gallery Style
 */
export const KathaCard = ({
  item,
  onOpen,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleFav,
  onTag,
  onPin,
  onMove
}: {
  item: any;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMove: () => void;
  onToggleFav: () => void;
  onTag: () => void;
  onPin: () => void;
}) => {
  const [isMobileExposed, setIsMobileExposed] = React.useState(false);
  const title = item.name;
  const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const isFav = item.isFav;
  const isPinned = item.isPinned;

  const actions = [
    { Icon: Heart, label: "Bookmark", onClick: onToggleFav, bg: isFav ? "bg-maroon text-white" : "bg-amber-100 dark:bg-amber-900/40", text: isFav ? "text-white" : "text-amber-700 dark:text-amber-300" },
    { Icon: Trash2, label: "Delete", onClick: onDelete, bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400" },
    { Icon: Tag, label: "Tag", onClick: onTag, bg: "bg-indigo-100 dark:bg-indigo-900/40", text: "text-indigo-700 dark:text-indigo-300" },
    {
      Icon: Copy, label: "Copy link", onClick: () => {
        navigator.clipboard.writeText(window.location.origin + `/katha/${item.name}`);
      }, bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300"
    },
    { Icon: Pin, label: isPinned ? "Unpin" : "Pin", onClick: onPin, bg: isPinned ? "bg-maroon text-white" : "bg-slate-100 dark:bg-slate-800", text: isPinned ? "text-white" : "text-slate-700 dark:text-slate-200" },
    { Icon: Download, label: "Download", onClick: () => { }, bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
    {
      Icon: Share2, label: "Share", onClick: () => {
        navigator.clipboard.writeText(window.location.origin + `/katha/${item.name}`);
      }, bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300"
    },
    { Icon: Move, label: "Move", onClick: onMove, bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-600 dark:text-orange-400" },
  ];

  return (
    <div
      className="group relative bg-white dark:bg-slate-900 rounded-[32px] p-4 md:p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_50px_-12px_rgba(139,29,29,0.15)] transition-all duration-700 w-full flex flex-col overflow-visible cursor-pointer animate-in fade-in zoom-in-95 duration-700 slide-in-from-bottom-4"
      onClick={() => setIsMobileExposed(!isMobileExposed)}
    >
      <div className="relative aspect-[3/4.2] rounded-[24px] overflow-hidden bg-white dark:bg-slate-950 border-2 border-slate-50 dark:border-slate-800 transition-all duration-700 mb-4 md:mb-6 group-hover:border-maroon/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -ml-16 -mb-16 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-700 group-hover:blur-2xl group-hover:scale-110 group-hover:opacity-0 ${isMobileExposed ? 'blur-2xl scale-110 opacity-0' : ''}`}>
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-maroon/10 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border border-maroon/20 animate-ping opacity-20" />
            <div className="w-4 h-4 bg-maroon rounded-full shadow-[0_0_20px_rgba(139,29,29,0.4)]" />
          </div>
          <div className="text-maroon font-black text-2xl md:text-3xl tracking-tighter font-outfit uppercase leading-[0.9] mb-2">Satsang</div>
          <div className="text-slate-400 dark:text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.4em]">SGVP Katha</div>
        </div>

        <div className={`absolute bottom-0 left-0 w-full bg-maroon dark:bg-[#a32b2b] py-3.5 px-3 text-center z-10 shadow-[0_-15px_30px_rgba(0,0,0,0.2)] transition-all duration-700 group-hover:translate-y-full group-hover:opacity-0 ${isMobileExposed ? 'translate-y-full opacity-0' : ''}`}>
          <span className="text-white text-[10px] md:text-xs font-black tracking-[0.1em] uppercase truncate block">{title}</span>
        </div>

        <div
          className={`absolute inset-0 z-20 flex flex-col justify-center gap-2 md:gap-3 p-3.5 md:p-4 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl cursor-default border border-white/20 dark:border-slate-800/20 ${isMobileExposed
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'
            }`}
        >
          <div className="mb-1 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
            <div className="flex items-center gap-2">
              <span className="text-[7px] md:text-[8px] font-black text-maroon uppercase tracking-widest">{item.info}</span>
              <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
              <span className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest">{date}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
            <span className="text-[8px] md:text-[9px] font-black text-maroon uppercase tracking-[0.2em] whitespace-nowrap text-opacity-70">Actions</span>
            <div className="h-[1px] w-full bg-gradient-to-r from-maroon/20 to-transparent rounded-full" />
          </div>

          <div className="grid grid-cols-4 gap-1.5 md:gap-2">
            {actions.map((action, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-1 group/item transition-all duration-700"
                style={{ transitionDelay: `${idx * 40}ms` }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                  className={`aspect-square w-full ${action.bg} ${action.text} rounded-xl flex flex-col items-center justify-center transition-all duration-500 hover:scale-125 hover:z-30 hover:shadow-2xl active:scale-90 group/btn border border-white/10 dark:border-slate-800/50 hover:border-maroon/20 shadow-sm shadow-black/5`}
                  title={action.label}
                >
                  <action.Icon className="h-3.5 w-3.5 md:h-4 md:w-4 stroke-[2.5px] transition-transform duration-500 group-hover/btn:rotate-12 group-hover/btn:scale-110" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 mt-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="w-full py-2 bg-white dark:bg-slate-900 text-maroon dark:text-red-400 border-2 border-maroon/10 hover:border-maroon/30 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm shadow-black/5 duration-500"
            >
              <Edit size={12} className="group-hover:rotate-12 transition-transform" />
              <span>Rename</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onOpen(); }}
              className="w-full py-2.5 md:py-3 bg-maroon text-white rounded-[18px] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-maroon/20 hover:shadow-maroon/40 hover:-translate-y-0.5 transition-all active:scale-95 duration-500"
            >
              <Eye size={16} strokeWidth={3} className="animate-pulse" />
              <span>Open</span>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
         {item.isPinned && (
           <div className="w-8 h-8 md:w-10 md:h-10 bg-maroon text-white rounded-xl flex items-center justify-center shadow-lg shadow-maroon/20 animate-in zoom-in-50 duration-300">
             <Pin className="w-4 h-4 md:w-5 md:h-5 fill-white" />
           </div>
         )}
      </div>

      <div className="px-0.5 mt-auto">
        <h3 className="font-outfit font-black text-slate-900 dark:text-white text-lg md:text-xl tracking-tighter leading-tight group-hover:text-[#8b1D1D] transition-colors truncate">{title}</h3>
        
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.tags.map((tag: any) => (
              <span 
                key={tag.id} 
                className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color, border: `1px solid ${tag.color}40` }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-1 md:mt-2">
          <span className="text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase">{item.info}</span>
          <div className="w-0.5 h-0.5 rounded-full bg-slate-300" />
          <span className="text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase">{date}</span>
        </div>
      </div>
    </div>
  );
};
