import React from "react";
import { LucideIcon } from "lucide-react";

/**
 * MiniAction Component - A small action button with a tooltip used in item action bars.
 */
interface MiniActionProps {
  Icon: LucideIcon;
  label: string;
  onClick: () => void;
  color?: string;
  fill?: boolean;
  bg?: string;
}

export const MiniAction: React.FC<MiniActionProps> = ({ 
  Icon, 
  label, 
  onClick, 
  color = "text-slate-500", 
  fill = false, 
  bg = "bg-white dark:bg-slate-900" 
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`group/btn relative p-2 md:p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 transition-all ${bg} ${color} hover:border-[#8B1D1D]/30 hover:shadow-lg active:scale-95 flex items-center justify-center`}
      aria-label={label}
    >
      <Icon 
        className={`${fill ? 'fill-current' : 'fill-none'} md:w-[18px] md:h-[18px] w-[16px] h-[16px]`} 
        strokeWidth={2.5} 
      />
      
      {/* Premium Tooltip */}
      <div className="hidden md:block absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover/btn:opacity-100 group-hover/btn:-top-11 transition-all pointer-events-none whitespace-nowrap shadow-2xl z-[100] border border-white/10 dark:border-slate-200">
        <span className="relative z-10">{label}</span>
        {/* Tooltip Arrow */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-white rotate-45" />
      </div>
    </button>
  );
};
