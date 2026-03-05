"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Download,
  Trash2,
  Share2,
  Bookmark,
  User,
  Tag,
  Edit,
  Move,
  Plus,
  ArrowLeft,
  Eye,
  MoreVertical
} from "lucide-react";

/**
 * KathaCard Component - Mobile-Ready 'Prism' Style
 * 1. Shows action names on icon hover.
 * 2. Toggles state on tap for mobile devices (no hover needed).
 */
const KathaCard = ({ title, date = "Oct 2024" }: { title: string; date?: string }) => {
  const [isMobileExposed, setIsMobileExposed] = React.useState(false);

  const actions = [
    { Icon: Download, label: "Get", bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
    { Icon: Trash2, label: "Delete", bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-300" },
    { Icon: Share2, label: "Share", bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
    { Icon: Bookmark, label: "Save", bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
    { Icon: User, label: "Owner", bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300" },
    { Icon: Tag, label: "Tag", bg: "bg-indigo-100 dark:bg-indigo-900/40", text: "text-indigo-700 dark:text-indigo-300" },
    { Icon: Edit, label: "Edit", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200" },
    { Icon: Move, label: "Move", bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-200" },
  ];

  return (
    <div
      className="group relative bg-white dark:bg-slate-900 rounded-[40px] p-6 border border-slate-100 dark:border-slate-800 shadow-[0_4px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(139,29,29,0.25)] transition-all duration-700 w-full max-w-[340px] flex flex-col overflow-visible cursor-pointer"
      onClick={() => setIsMobileExposed(!isMobileExposed)}
    >

      {/* 1. The Cover */}
      <div className="relative aspect-[3/4.2] rounded-[30px] overflow-hidden bg-white dark:bg-slate-950 border-2 border-slate-50 dark:border-slate-800 transition-all duration-700 mb-8 group-hover:border-[#8b1D1D]/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">

        <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -ml-16 -mb-16 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Content Layer (Fades/Blurs on hover) */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-700 group-hover:blur-2xl group-hover:scale-110 group-hover:opacity-0 ${isMobileExposed ? 'blur-2xl scale-110 opacity-0' : ''}`}>
          <div className="w-16 h-16 rounded-full border-2 border-[#8b1D1D]/10 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border border-[#8b1D1D]/20 animate-ping opacity-20" />
            <div className="w-4 h-4 bg-[#8b1D1D] rounded-full shadow-[0_0_20px_rgba(139,29,29,0.4)]" />
          </div>
          <div className="text-[#8b1D1D] font-black text-3xl tracking-tighter font-outfit uppercase leading-[0.9] mb-2 pointer-events-none select-none">Satsang</div>
          <div className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] pointer-events-none select-none">SGVP Katha</div>
        </div>

        {/* Bottom Title Tray */}
        <div className={`absolute bottom-0 left-0 w-full bg-[#8b1D1D] dark:bg-[#a32b2b] py-5 px-4 text-center z-10 shadow-[0_-15px_30px_rgba(0,0,0,0.2)] transition-transform duration-500 group-hover:translate-y-full ${isMobileExposed ? 'translate-y-full' : ''}`}>
          <span className="text-white text-sm font-black tracking-[0.2em]">{title}</span>
        </div>

        {/* 2. ACTIONS OVERLAY (Mobile Tap & Desktop Hover) */}
        <div className={`absolute inset-0 z-20 flex flex-col justify-center gap-6 p-6 transition-all duration-500 bg-white/95 dark:bg-slate-950/95 cursor-default ${isMobileExposed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'}`}>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black text-[#8b1D1D] uppercase tracking-widest whitespace-nowrap">Actions</span>
            <div className="h-[2px] w-full bg-[#8b1D1D]/10 rounded-full" />
            {isMobileExposed && <span className="text-[9px] font-bold text-slate-400 animate-pulse lg:hidden">TAP TO CLOSE</span>}
          </div>

          <div className="grid grid-cols-4 gap-3.5">
            {actions.map((action, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 group/item">
                <button
                  title={action.label}
                  onClick={(e) => { e.stopPropagation(); /* Handle action */ }}
                  className={`aspect-square w-full ${action.bg} ${action.text} rounded-[20px] flex flex-col items-center justify-center transition-all duration-500 hover:scale-125 hover:z-30 hover:shadow-xl active:scale-95 group/btn border border-transparent hover:border-white/10`}
                >
                  <action.Icon className="h-6 w-6 stroke-[2.5px] transition-transform group-hover/btn:rotate-12" />
                </button>
                {/* Floating Name Label on Hover */}
                <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {action.label}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); /* Handle Open */ }}
            className="mt-2 w-full py-4 bg-[#8b1D1D] text-white rounded-[22px] text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl shadow-[#8b1D1D]/20 hover:bg-[#6e171b] hover:-translate-y-1 transition-all active:scale-95"
          >
            <Eye className="h-5 w-5 stroke-[2.5px]" />
            <span>Open</span>
          </button>
        </div>
      </div>

      {/* 3. Footer Metadata */}
      <div className="px-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-outfit font-black text-slate-900 dark:text-white text-2xl tracking-tighter leading-none group-hover:text-[#8b1D1D] transition-colors">{title} Collection</h3>
          <div className="h-6 px-2.5 flex items-center bg-[#8b1D1D]/5 dark:bg-[#8b1D1D]/10 border border-[#8b1D1D]/20 rounded-lg">
            <span className="text-[10px] font-black text-[#8b1D1D] tracking-widest">HQ</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <User className="h-3 w-3 text-slate-400" />
              </div>
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase">Updated {date}</span>
        </div>
      </div>
    </div>
  );
};

export default function KathaCollectionPage() {
  const router = useRouter();

  const kathaList = [
    { title: "ABCD", date: "JAN 2024" },
    { title: "KATHA", date: "FEB 2024" },
    { title: "ABCD", date: "MAR 2024" },
    { title: "KATHA", date: "APR 2024" },
    { title: "ABCD", date: "MAY 2024" },
    { title: "KATHA", date: "JUN 2024" },
    { title: "ABCD", date: "JUL 2024" },
    { title: "KATHA", date: "AUG 2024" }
  ];

  return (
    <div className="min-h-full bg-white dark:bg-slate-950 flex flex-col relative pb-32 transition-colors duration-300">
      <div className="px-8 md:px-12 py-8 flex items-center justify-between border-b border-slate-50 dark:border-slate-900/50 sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl z-40">
        <div className="flex items-center gap-8">
          <button
            onClick={() => router.back()}
            className="group p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-[#8b1D1D] transition-all duration-500 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-white" />
          </button>
          <div>
            <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
              <span className="opacity-60">Library</span>
              <div className="w-1.5 h-1.5 bg-[#8b1D1D]/40 rounded-full" />
              <span className="text-[#8b1D1D]">Vault</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white font-outfit tracking-tighter">Katha Gallery</h1>
          </div>
        </div>

        <button className="hidden lg:flex items-center gap-3 px-8 py-4 bg-[#8b1D1D] hover:bg-[#6e171b] text-white rounded-[22px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-[#8b1D1D]/30 hover:-translate-y-1 transition-all active:scale-95">
          <Plus className="h-5 w-5 stroke-[4px]" />
          <span>New Entry</span>
        </button>
      </div>

      <div className="px-10 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-12 gap-y-20 max-w-[1700px] mx-auto place-items-center">
          {kathaList.map((item, idx) => (
            <KathaCard key={idx} title={item.title} date={item.date} />
          ))}
        </div>
      </div>

      <div className="fixed bottom-12 right-10 z-50 lg:hidden">
        <button className="w-16 h-16 bg-[#8b1D1D] text-white rounded-full flex items-center justify-center shadow-3xl hover:scale-110 active:scale-95 transition-all">
          <Plus className="h-7 w-7 stroke-[4px]" />
        </button>
      </div>
    </div>
  );
}
