import React from "react";

/**
 * MiniAction Component - Small icon button with tooltip
 */
export const MiniAction = ({
  Icon,
  label,
  onClick,
  color = "text-[#8b1D1D]"
}: {
  Icon: any;
  label: string;
  onClick: (e: any) => void;
  color?: string
}) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(e); }}
    className={`group/btn relative p-2 md:p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-[#8b1D1D]/30 transition-all ${color} hover:shadow-lg active:scale-95 flex items-center justify-center`}
  >
    <Icon size={18} strokeWidth={2.5} className="md:w-[18px] md:h-[18px] w-[16px] h-[16px]" />

    {/* Tooltip */}
    <div className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover/btn:opacity-100 transition-all duration-300 pointer-events-none shadow-xl transform translate-y-2 group-hover/btn:translate-y-0 z-[100] whitespace-nowrap">
      {label}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-white rotate-45" />
    </div>
  </button>
);
