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
  Eye 
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
  onToggleFav
}: {
  item: any;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMove: () => void;
  onToggleFav: () => void;
}) => {
  const [isMobileExposed, setIsMobileExposed] = React.useState(false);
  const title = item.name;
  const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const isFav = item.isFav; 

  const actions = [
    { Icon: Download, label: "Get", onClick: () => { }, bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
    { Icon: Trash2, label: "Delete", onClick: onDelete, bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-300" },
    { Icon: Share2, label: "Share", onClick: () => { }, bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
    { Icon: Heart, label: "Favourite", onClick: onToggleFav, bg: isFav ? "bg-[#8b1D1D] text-white" : "bg-amber-100 dark:bg-amber-900/40", text: isFav ? "text-white" : "text-amber-700 dark:text-amber-300" },
    { Icon: User, label: "Owner", onClick: () => { }, bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300" },
    { Icon: Tag, label: "Tag", onClick: () => { }, bg: "bg-indigo-100 dark:bg-indigo-900/40", text: "text-indigo-700 dark:text-indigo-300" },
    { Icon: ChevronUp, label: "Move Up", onClick: onMoveUp, bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200" },
    { Icon: ChevronDown, label: "Move Down", onClick: onMoveDown, bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200" },
  ];

  return (
    <div
      className="group relative bg-white dark:bg-slate-900 rounded-[40px] p-5 md:p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(139,29,29,0.25)] transition-all duration-700 w-full lg:max-w-[340px] flex flex-col overflow-visible cursor-pointer"
      onClick={() => setIsMobileExposed(!isMobileExposed)}
    >
      <div className="relative aspect-[3/4.2] rounded-[30px] overflow-hidden bg-white dark:bg-slate-950 border-2 border-slate-50 dark:border-slate-800 transition-all duration-700 mb-6 md:mb-8 group-hover:border-[#8b1D1D]/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b1D1D]/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -ml-16 -mb-16 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-700 group-hover:blur-2xl group-hover:scale-110 group-hover:opacity-0 ${isMobileExposed ? 'blur-2xl scale-110 opacity-0' : ''}`}>
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-[#8b1D1D]/10 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border border-[#8b1D1D]/20 animate-ping opacity-20" />
            <div className="w-4 h-4 bg-[#8b1D1D] rounded-full shadow-[0_0_20px_rgba(139,29,29,0.4)]" />
          </div>
          <div className="text-[#8b1D1D] font-black text-2xl md:text-3xl tracking-tighter font-outfit uppercase leading-[0.9] mb-2">Satsang</div>
          <div className="text-slate-400 dark:text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.4em]">SGVP Katha</div>
        </div>

        <div className={`absolute bottom-0 left-0 w-full bg-[#8b1D1D] dark:bg-[#a32b2b] py-5 px-4 text-center z-10 shadow-[0_-15px_30px_rgba(0,0,0,0.2)] transition-transform duration-500 group-hover:translate-y-full ${isMobileExposed ? 'translate-y-full' : ''}`}>
          <span className="text-white text-xs md:text-sm font-black tracking-[0.15em] uppercase truncate block">{title}</span>
        </div>

        <div className={`absolute inset-0 z-20 flex flex-col justify-center gap-4 md:gap-6 p-5 md:p-6 transition-all duration-500 bg-white/95 dark:bg-slate-950/95 cursor-default ${isMobileExposed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'}`}>
          <div className="flex items-center gap-3">
            <span className="text-[10px] md:text-[11px] font-black text-[#8b1D1D] uppercase tracking-widest whitespace-nowrap">Actions</span>
            <div className="h-[2px] w-full bg-[#8b1D1D]/10 rounded-full" />
          </div>

          <div className="grid grid-cols-4 gap-2 md:gap-3.5">
            {actions.map((action, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 group/item">
                <button
                  onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                  className={`aspect-square w-full ${action.bg} ${action.text} rounded-xl md:rounded-[20px] flex flex-col items-center justify-center transition-all duration-500 hover:scale-125 hover:z-30 hover:shadow-xl active:scale-95 group/btn border border-transparent hover:border-white/10`}
                >
                  <action.Icon className="h-4 w-4 md:h-6 md:w-6 stroke-[2.5px] transition-transform group-hover/btn:rotate-12" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="w-full py-3 bg-[#8b1D1D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#6e171b] transition-all active:scale-95 shadow-lg shadow-[#8b1D1D]/20"
            >
              <Edit size={14} />
              <span>Rename Collection</span>
            </button>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            className="w-full py-3 md:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl md:rounded-[22px] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
          >
            <Eye className="h-4 w-4 md:h-5 md:w-5 stroke-[2.5px]" />
            <span>Open Collection</span>
          </button>
        </div>
      </div>

      <div className="px-1 md:px-2">
        <h3 className="font-outfit font-black text-slate-900 dark:text-white text-xl md:text-2xl tracking-tighter leading-tight group-hover:text-[#8b1D1D] transition-colors truncate">{title}</h3>
        <div className="flex items-center gap-4 mt-2 md:mt-3">
          <span className="text-[9px] md:text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase">Modified {date}</span>
        </div>
      </div>
    </div>
  );
};
