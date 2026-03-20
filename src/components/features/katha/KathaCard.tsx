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
  Users
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
    { Icon: Heart, label: "Bookmark", onClick: onToggleFav, bg: isFav ? "bg-maroon text-white" : "bg-amber-100 dark:bg-amber-900/40", text: isFav ? "text-white" : "text-amber-700 dark:text-amber-300" },
    { Icon: EyeOff, label: "Hide", onClick: () => { }, bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-500 dark:text-slate-400" },
    { Icon: Tag, label: "Tag", onClick: () => { }, bg: "bg-indigo-100 dark:bg-indigo-900/40", text: "text-indigo-700 dark:text-indigo-300" },
    { Icon: Copy, label: "Copy link", onClick: () => {
      navigator.clipboard.writeText(window.location.origin + `/katha/${item.name}`);
    }, bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
    { Icon: Pin, label: "Pin", onClick: () => { }, bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200" },
    { Icon: Download, label: "Download", onClick: () => { }, bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
    { Icon: Share2, label: "Share", onClick: () => {
      navigator.clipboard.writeText(window.location.origin + `/katha/${item.name}`);
    }, bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300" },
    { Icon: Users, label: "User Share", onClick: () => { }, bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200" },
  ];

  return (
    <div
      className="group relative bg-white dark:bg-slate-900 rounded-[32px] p-4 md:p-5 border border-slate-100 dark:border-slate-800 shadow-[0_4px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(139,29,29,0.25)] transition-all duration-700 w-full flex flex-col overflow-visible cursor-pointer animate-in fade-in zoom-in-95 duration-700 slide-in-from-bottom-4"
      onClick={() => setIsMobileExposed(!isMobileExposed)}
    >
      <div className="relative aspect-[3/4.2] rounded-[24px] overflow-hidden bg-white dark:bg-slate-950 border-2 border-slate-50 dark:border-slate-800 transition-all duration-700 mb-4 md:mb-6 group-hover:border-[#8b1D1D]/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
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

        <div className={`absolute bottom-0 left-0 w-full bg-maroon dark:bg-[#a32b2b] py-3.5 px-3 text-center z-10 shadow-[0_-15px_30px_rgba(0,0,0,0.2)] transition-all duration-700 group-hover:translate-y-full group-hover:opacity-0 ${isMobileExposed ? 'translate-y-full opacity-0' : ''}`}>
          <span className="text-white text-[10px] md:text-xs font-black tracking-[0.1em] uppercase truncate block">{title}</span>
        </div>

        <div 
          className={`absolute inset-0 z-20 flex flex-col justify-center gap-3 md:gap-5 p-5 md:p-6 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl cursor-default border-inset border-white/20 dark:border-slate-800/20 ${
            isMobileExposed 
              ? 'opacity-100 translate-y-0 pointer-events-auto' 
              : 'opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'
          }`}
        >
          <div className="mb-2 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
            <h4 className="text-sm md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none truncate">{title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] md:text-[9px] font-black text-maroon uppercase tracking-widest">{item.info}</span>
              <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
              <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">{date}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
            <span className="text-[10px] md:text-[11px] font-black text-maroon uppercase tracking-[0.3em] whitespace-nowrap text-opacity-70">Actions</span>
            <div className="h-[1px] w-full bg-gradient-to-r from-maroon/20 to-transparent rounded-full" />
          </div>

          <div className="grid grid-cols-4 gap-2 md:gap-3.5">
            {actions.map((action, idx) => (
              <div 
                key={idx} 
                className="flex flex-col items-center gap-1 group/item transition-all duration-700"
                style={{ transitionDelay: `${idx * 40}ms` }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                  className={`aspect-square w-full ${action.bg} ${action.text} rounded-2xl flex flex-col items-center justify-center transition-all duration-500 hover:scale-125 hover:z-30 hover:shadow-2xl active:scale-90 group/btn border border-white/10 dark:border-slate-800/50 hover:border-maroon/20 hover:rotate-3 shadow-md shadow-black/5`}
                  title={action.label}
                >
                  <action.Icon className="h-4 w-4 md:h-5 md:w-5 stroke-[2.5px] transition-transform duration-500 group-hover/btn:rotate-12 group-hover/btn:scale-110" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2 mt-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="w-full py-3 bg-white dark:bg-slate-900 text-maroon dark:text-red-400 border-2 border-maroon/10 hover:border-maroon/30 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-black/5 duration-500 animate-in fade-in slide-in-from-bottom-4 delay-300 group-hover:translate-y-0"
            >
              <Edit size={14} className="group-hover:rotate-12 transition-transform" />
              <span>Rename</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onOpen(); }}
              className="w-full py-3.5 md:py-4 bg-maroon text-white rounded-[22px] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-maroon/20 hover:shadow-maroon/40 hover:-translate-y-1 transition-all active:scale-95 duration-500 animate-in fade-in slide-in-from-bottom-6 delay-500"
            >
              <Eye size={18} strokeWidth={3} className="animate-pulse" />
              <span>Open Collection</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-0.5">
        <h3 className="font-outfit font-black text-slate-900 dark:text-white text-lg md:text-xl tracking-tighter leading-tight group-hover:text-[#8b1D1D] transition-colors truncate">{title}</h3>
        <div className="flex items-center gap-2 mt-1 md:mt-2">
          <span className="text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase">{item.info}</span>
          <div className="w-0.5 h-0.5 rounded-full bg-slate-300" />
          <span className="text-[8px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase">{date}</span>
        </div>
      </div>
    </div>
  );
};
