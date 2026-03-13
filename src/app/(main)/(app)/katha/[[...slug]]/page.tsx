"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
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
  ChevronLeft,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Repeat,
  FilePlus,
  RefreshCw,
  Library,
  FolderOpen,
  BookOpen,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Upload,
  Settings,
  MoreHorizontal,
  LayoutDashboard,
  Heart
} from "lucide-react";

import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

/**
 * KathaCard Component - Main Gallery Style
 */
const KathaCard = ({
  item,
  onOpen,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onMove,
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
  const isFav = item.isFav; // Simulated for now

  const actions = [
    { Icon: Download, label: "Get", onClick: () => { }, bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
    { Icon: Trash2, label: "Delete", onClick: onDelete, bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-300" },
    { Icon: Share2, label: "Share", onClick: () => { }, bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
    { Icon: Heart, label: "Favourite", onClick: onToggleFav, bg: isFav ? "bg-maroon text-white" : "bg-amber-100 dark:bg-amber-900/40", text: isFav ? "text-white" : "text-amber-700 dark:text-amber-300" },
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
        <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity" />
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

/**
 * MiniAction Component
 */
const MiniAction = ({ Icon, label, onClick, color = "text-[#8b1D1D]" }: { Icon: any; label: string; onClick: (e: any) => void; color?: string }) => (
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

/**
 * RecursiveItem Component
 */
const RecursiveItem = ({
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

export default function KathaCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string[] || [];

  const [loading, setLoading] = useState(true);
  const [kathaList, setKathaList] = useState<any[]>([]);
  const [mixedContents, setMixedContents] = useState<any[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Modal States
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalPlaceholder, setModalPlaceholder] = useState("");
  const [modalInputValue, setModalInputValue] = useState("");
  const [modalType, setModalType] = useState<'create_folder' | 'create_file' | 'edit' | 'create_collection' | null>(null);
  const [activeItem, setActiveItem] = useState<any>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | null }>({ message: '', type: null });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [editingFile, setEditingFile] = useState<any>(null);

  // Move Modal States
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [potentialFolders, setPotentialFolders] = useState<any[]>([]);
  const [moveSearch, setMoveSearch] = useState("");

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (slug.length === 0) {
          const res = await api.get('/folders?section=KATHA');
          setKathaList(res.data || []);
          setCurrentFolderId(null);
        } else {
          const resolveRes = await api.post('/folders/resolve-path', { path: slug, section: 'KATHA' });
          const folderId = resolveRes.data.id;
          setCurrentFolderId(folderId);

          const contentsRes = await api.get(`/folders/contents?parentFolderId=${folderId}`);
          const { folders, files } = contentsRes.data;

          const combined = [
            ...(folders || []).map((f: any) => ({ ...f, type: 'folder', info: 'Folder' })),
            ...(files || []).map((f: any) => ({ ...f, type: 'file', info: `${(f.size / 1024).toFixed(1)} KB - File` }))
          ].sort((a, b) => (a.order || 0) - (b.order || 0));

          setMixedContents(combined);
        }
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug.join('/')]);

  const openInputModal = (type: 'create_folder' | 'create_file' | 'edit' | 'create_collection', item?: any) => {
    setModalType(type);
    setActiveItem(item || null);
    if (type === 'create_folder') {
      setModalTitle("New Folder");
      setModalPlaceholder("Enter folder name...");
      setModalInputValue("");
    } else if (type === 'create_file') {
      setModalTitle("New File");
      setModalPlaceholder("Enter file name...");
      setModalInputValue("");
    } else if (type === 'edit') {
      setModalTitle("Rename Item");
      setModalPlaceholder("Enter new name...");
      setModalInputValue(item.name || item.title || "");
    } else if (type === 'create_collection') {
      setModalTitle("New Collection");
      setModalPlaceholder("Enter collection name...");
      setModalInputValue("");
    }
    setIsInputModalOpen(true);
  };

  const handleInputSubmit = async () => {
    if ((modalType === 'create_folder' || modalType === 'create_collection' || modalType === 'create_file') && !modalInputValue) {
      showToast("Please enter a name", "error");
      return;
    }

    try {
      if (modalType === 'create_folder') {
        await api.post('/folders', { name: modalInputValue, parentFolderId: currentFolderId });
        showToast("Folder created successfully", "success");
      } else if (modalType === 'create_collection') {
        await api.post('/folders', { name: modalInputValue, section: 'KATHA' });
        showToast("Collection created successfully", "success");
      } else if (modalType === 'create_file') {
        await api.post('/files', {
          name: modalInputValue || 'New File',
          parentFolderId: currentFolderId,
          type: 'DOCUMENT',
          content: ""
        });
        showToast("File created successfully", "success");
      } else if (modalType === 'edit' && activeItem) {
        const endpoint = activeItem.type === 'folder' ? `/folders/${activeItem.id}` : `/files/${activeItem.id}`;
        await api.put(endpoint, { name: modalInputValue });
        showToast("Renamed successfully", "success");
      }
      setIsInputModalOpen(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleReorder = async (item: any, direction: 'up' | 'down') => {
    const isGallery = slug.length === 0;
    const targetList = isGallery ? kathaList : mixedContents;
    const setList = isGallery ? setKathaList : setMixedContents;

    const idx = targetList.findIndex(i => i.id === item.id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === targetList.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newItems = [...targetList];

    const temp = newItems[idx];
    newItems[idx] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    newItems.forEach((it, i) => {
      it.order = i + 1;
    });

    setList(newItems);

    try {
      const it1 = newItems[idx];
      const it2 = newItems[targetIdx];

      const endpoint1 = (it1.type === 'folder' || isGallery) ? `/folders/${it1.id}` : `/files/${it1.id}`;
      const endpoint2 = (it2.type === 'folder' || isGallery) ? `/folders/${it2.id}` : `/files/${it2.id}`;

      await Promise.all([
        api.put(endpoint1, { order: it1.order }),
        api.put(endpoint2, { order: it2.order })
      ]);
    } catch (err) {
      showToast('Failed to sync order', 'error');
    }
  };

  const handeToggleFav = async (item: any) => {
    // Simulated toggle logic using metadata for files. For folders, we'd need a backend field.
    try {
      const isGallery = slug.length === 0;
      const setList = isGallery ? setKathaList : setMixedContents;
      const targetList = isGallery ? kathaList : mixedContents;

      const newFavStatus = !item.isFav;

      // Optimistic update
      setList(targetList.map(it => it.id === item.id ? { ...it, isFav: newFavStatus } : it));

      if (item.type === 'file') {
        const meta = JSON.parse(item.metadata || '{}');
        meta.isFav = newFavStatus;
        await api.put(`/files/${item.id}`, { metadata: JSON.stringify(meta) });
      } else {
        // For folders, we'll just keep it in state or wait for backend support
        showToast(newFavStatus ? "Added to Favourites" : "Removed from Favourites", "success");
      }
    } catch (err) {
      showToast("Failed to update Favourite status", "error");
    }
  };

  const handleOpenMoveModal = async (item: any) => {
    setActiveItem(item);
    setIsMoveModalOpen(true);
    try {
      // Fetch ALL folders in the KATHA section for cross-collection movement
      const res = await api.get('/folders?section=KATHA');
      let list = res.data || [];
      
      // Filter out the item itself if it's a folder
      if (item.type === 'folder') {
        list = list.filter((f: any) => f.id !== item.id);
      }
      
      // We don't have human-readable paths yet, so let's use the folder name 
      // but in a more powerful view soon. 
      setPotentialFolders(list);
    } catch (err) {
      showToast("Failed to fetch folders", "error");
    }
  };

  const handleMoveTo = async (targetFolderId: string | null) => {
    if (!activeItem) return;
    try {
      const isFolder = activeItem.type === 'folder' || slug.length === 0;
      const endpoint = isFolder ? `/folders/${activeItem.id}` : `/files/${activeItem.id}`;

      await api.put(endpoint, { parentFolderId: targetFolderId });
      showToast(`Moved successfully`, "success");
      setIsMoveModalOpen(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      showToast(err.message || "Move failed", "error");
    }
  };

  const handleShareClick = async (item: any) => {
    setActiveItem(item);
    setIsUserModalOpen(true);
    try {
      const res = await api.get('/user/all');
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch users");
    }
  };

  const handleSendShareRequest = async () => {
    if (!selectedUser || !activeItem) return;
    try {
      await api.post('/share/request', {
        recipientId: selectedUser,
        itemType: activeItem.type === 'folder' ? 'FOLDER' : 'FILE',
        itemId: activeItem.id,
        message: `Sharing ${activeItem.name || activeItem.title} with you.`
      });
      showToast(`Share request sent to ${users.find(u => u.id === selectedUser)?.name}`, "success");
      setIsUserModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      showToast('Failed to send share request', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const endpoint = itemToDelete.type === 'folder' || slug.length === 0 ? `/folders/${itemToDelete.id}` : `/files/${itemToDelete.id}`;
      await api.delete(endpoint);
      if (slug.length === 0) {
        setKathaList(prev => prev.filter(i => i.id !== itemToDelete.id));
      } else {
        setMixedContents(prev => prev.filter(i => i.id !== itemToDelete.id));
      }
      showToast("Item deleted", "success");
      setIsConfirmModalOpen(false);
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const handleSaveFile = async () => {
    if (!editingFile) return;
    try {
      await api.put(`/files/${editingFile.id}`, {
        metadata: JSON.stringify({ content: editorContent })
      });
      showToast("Changes saved", "success");
      setIsEditorOpen(false);
      setMixedContents(prev => prev.map(item =>
        item.id === editingFile.id ? { ...item, metadata: JSON.stringify({ content: editorContent }) } : item
      ));
    } catch (err) {
      showToast("Failed to save", "error");
    }
  };

  const handleFileClick = (item: any) => {
    if (item.type === 'file') {
      let content = "";
      try {
        const meta = JSON.parse(item.metadata || '{}');
        content = meta.content || "";
      } catch (e) { }
      setEditorContent(content);
      setEditingFile(item);
      setIsEditorOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#8b1D1D] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">Loading Katha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative w-full bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Dynamic Content: Explorer or Gallery */}
      {slug.length > 0 ? (
        <div className="min-h-full bg-slate-50 dark:bg-slate-950 flex flex-col relative transition-colors duration-500 font-outfit pb-20 w-full">
          {/* List Header / Breadcrumbs */}
          <div className="px-5 md:px-10 py-4 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40 w-full shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <button
                onClick={() => router.back()}
                className="p-2 md:px-4 md:py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:text-[#8b1D1D] transition-all text-sm font-black shadow-sm shrink-0"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={() => router.push("/katha")}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:text-[#8b1D1D] transition-all text-sm font-black shadow-sm shrink-0"
              >
                <Home size={16} />
                <span className="hidden sm:inline">Home</span>
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
                {slug.map((s, i) => (
                  <React.Fragment key={i}>
                    <span className="text-[10px] md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight whitespace-nowrap">{s}</span>
                    {i < slug.length - 1 && <ChevronRight size={14} className="text-slate-300 shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="hidden md:flex flex-col items-end">
              <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px]">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Active Explorer</span>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full space-y-4 md:space-y-6">
            <div className="mb-8 md:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
              <div className="space-y-1">
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Folder View</p>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{slug[slug.length - 1]}</h1>
                <div className="flex items-center gap-2 pt-1">
                  <div className="px-2 py-0.5 bg-maroon/5 text-maroon text-[9px] font-black uppercase tracking-widest rounded-md border border-maroon/10">Collection Item</div>
                  <div className="text-slate-400 text-[10px] font-bold">• {mixedContents.length} Items Found</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openInputModal('create_folder')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 md:px-6 py-3.5 md:py-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:border-[#8b1D1D]/30 transition-all"
                >
                  <Plus size={18} />
                  <span>New Folder</span>
                </button>
                <button
                  onClick={() => openInputModal('create_file')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 md:px-6 py-3.5 md:py-4 bg-[#8b1D1D] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#8b1D1D]/20 hover:-translate-y-1 transition-all"
                >
                  <FilePlus size={18} />
                  <span>New File</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {mixedContents.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[40px]">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-3xl flex items-center justify-center text-slate-200 dark:text-slate-800">
                    <FolderOpen size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Empty Folder</p>
                    <p className="text-slate-300 dark:text-slate-700 text-[10px] font-medium italic px-10">Start by creating a new folder or file using the buttons above.</p>
                  </div>
                </div>
              ) : (
                mixedContents.map((item, idx) => (
                  <RecursiveItem
                    key={item.id}
                    index={idx + 1}
                    item={item}
                    onTag={() => showToast('Tag feature active!', 'success')}
                    onFav={() => handeToggleFav(item)}
                    onMoveUp={() => handleReorder(item, 'up')}
                    onMoveDown={() => handleReorder(item, 'down')}
                    onDownload={() => {
                      if (item.type === 'file' && item.metadata) {
                        try {
                          const meta = JSON.parse(item.metadata);
                          if (meta.url) window.open(meta.url, '_blank');
                          else showToast('No download link', 'error');
                        } catch (e) { showToast('Info corrupted', 'error'); }
                      } else showToast('Download coming soon for folders', 'info');
                    }}
                    onShare={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('Link copied to clipboard', 'success');
                    }}
                    onUser={() => handleShareClick(item)}
                    onMove={() => handleOpenMoveModal(item)}
                    onEdit={() => openInputModal('edit', item)}
                    onDelete={() => {
                      setItemToDelete(item);
                      setIsConfirmModalOpen(true);
                    }}
                    onClick={() => {
                      if (item.type === 'folder') {
                        router.push(`/katha/${slug.join('/')}/${item.name}`);
                      } else {
                        handleFileClick(item);
                      }
                    }}
                  />
                ))
              )}
            </div>
            {mixedContents.length > 0 && (
              <p className="text-center text-slate-300 dark:text-slate-900 font-black py-12 md:py-20 uppercase tracking-[0.5em] text-[9px] md:text-[10px]">End of Directory</p>
            )}
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col relative pb-32 w-full">
          <div className="px-5 md:px-12 py-6 md:py-8 flex items-center justify-between border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl z-40 w-full">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 md:px-4 md:py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:text-[#8b1D1D] transition-all text-sm font-black shadow-sm shrink-0 flex items-center gap-2"
              >
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </button>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-maroon/5 flex items-center justify-center rounded-xl md:rounded-2xl border border-maroon/10 text-maroon">
                <Library className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white font-outfit tracking-tighter uppercase leading-none">Katha Gallery</h1>
            </div>

            <button
              onClick={() => openInputModal('create_collection')}
              className="flex items-center gap-2 px-4 md:px-8 py-3 md:py-4 bg-[#8b1D1D] hover:bg-[#6e171b] text-white rounded-xl md:rounded-[22px] font-black uppercase tracking-widest text-[9px] md:text-xs shadow-2xl shadow-[#8b1D1D]/30 hover:-translate-y-1 transition-all"
            >
              <Plus size={18} strokeWidth={3} />
              <span>New Collection</span>
            </button>
          </div>

          <div className="px-5 md:px-10 py-10 md:py-16 max-w-[1700px] mx-auto w-full">
            <div className="mb-10 md:mb-16">
              <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mb-1">Explore</p>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Your Collections</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 md:gap-x-12 gap-y-12 md:gap-y-20">
              {kathaList.map((item, idx) => (
                <KathaCard
                  key={item.id}
                  item={item}
                  onOpen={() => router.push(`/katha/${item.name}`)}
                  onEdit={() => openInputModal('edit', { ...item, type: 'folder' })}
                  onDelete={() => {
                    setItemToDelete({ ...item, type: 'folder' });
                    setIsConfirmModalOpen(true);
                  }}
                  onMoveUp={() => handleReorder(item, 'up')}
                  onMoveDown={() => handleReorder(item, 'down')}
                  onMove={() => handleOpenMoveModal({ ...item, type: 'folder' })}
                  onToggleFav={() => handeToggleFav(item)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Move Modal */}
      <Modal isOpen={isMoveModalOpen} onClose={() => setIsMoveModalOpen(false)} title={`Move ${activeItem?.name || 'Item'}`}
        footer={<div className="flex gap-2 w-full">
          <Button variant="outline" onClick={() => setIsMoveModalOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
          <Button onClick={() => handleMoveTo(null)} className="flex-1 bg-slate-100 text-slate-900 hover:bg-slate-200 rounded-xl font-black uppercase text-[10px] tracking-widest">Move to Root</Button>
        </div>}
      >
        <div className="space-y-4 py-2">
          <div className="relative">
            <Input
              placeholder="Search Folder..."
              value={moveSearch}
              onChange={(e) => setMoveSearch(e.target.value)}
              className="rounded-2xl border-2 border-slate-100 bg-slate-50 pl-10"
            />
            <Settings className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {potentialFolders
              .filter(f => f.name.toLowerCase().includes(moveSearch.toLowerCase()))
              .map(f => (
                <div
                  key={f.id}
                  onClick={() => handleMoveTo(f.id)}
                  className="p-4 rounded-2xl border-2 border-slate-50 hover:border-[#8b1D1D]/20 hover:bg-maroon/5 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-[#8b1D1D]/10">
                      <FolderOpen size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-black text-slate-800 uppercase tracking-tight truncate block">{f.name}</span>
                      <p className="text-[9px] text-slate-400 font-bold uppercase truncate max-w-[200px]">
                        ID: {f.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-200 group-hover:text-[#8b1D1D] transition-colors" size={20} />
                </div>
              ))}
          </div>
        </div>
      </Modal>

      {/* Input Modal */}
      <Modal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        title={modalTitle}
        footer={
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={() => setIsInputModalOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
            <Button onClick={handleInputSubmit} className="flex-1 bg-[#8b1D1D] hover:bg-[#6e171b] rounded-xl text-white">
              {modalType === 'create_file' ? 'Create File' : 'Confirm'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
              {modalType === 'create_file' ? 'File Name' : 'Item Name'}
            </p>
            <Input
              placeholder={modalType === 'create_file' ? "e.g. Satsang Notes" : modalPlaceholder}
              value={modalInputValue}
              onChange={(e) => setModalInputValue(e.target.value)}
              className="rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 border-2 focus:border-[#8b1D1D]/50 transition-all h-12 md:h-14 md:text-lg font-bold"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
            />
          </div>
        </div>
      </Modal>

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-500 md:duration-300">
          <div className="px-5 md:px-8 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/50 backdrop-blur-md sticky top-0">
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all shrink-0"
              >
                <ArrowLeft size={20} className="text-slate-500" />
              </button>
              <div className="truncate">
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[150px] md:max-w-md">{editingFile?.name || editingFile?.title}</h3>
                <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Editor • Rich Text</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <Button variant="outline" onClick={() => setIsEditorOpen(false)} className="hidden sm:inline-flex rounded-xl">Save & Close</Button>
              <Button onClick={handleSaveFile} className="bg-[#8b1D1D] hover:bg-[#6e171b] shadow-lg shadow-[#8b1D1D]/20 rounded-xl px-4 md:px-6 text-white py-2.5 md:py-3 font-black uppercase text-[10px] md:text-xs tracking-widest">Update</Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden p-3 md:p-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-5xl mx-auto h-full bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-[30px] md:rounded-[40px] overflow-hidden flex flex-col">
              <ReactQuill theme="snow" value={editorContent} onChange={(val) => setEditorContent(val)} className="flex-1 h-full overflow-y-auto ql-editor-premium" />
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirm Delete"
        footer={<div className="flex gap-2 w-full">
          <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)} className="flex-1 rounded-xl">Keep Item</Button>
          <Button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl text-white">Delete</Button>
        </div>}
      >
        <div className="py-2 md:py-4 space-y-3 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mx-auto">
            <Trash2 size={28} />
          </div>
          <p className="font-medium text-slate-600 dark:text-slate-300">
            Are you sure you want to delete <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">"{itemToDelete?.name || itemToDelete?.title}"</span>?
          </p>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast.message && (
        <div className="fixed bottom-10 left-0 right-0 px-5 flex justify-center z-[9999] pointer-events-none">
          <div className={`px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 w-full max-w-md border pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-500 relative ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-slate-900 border-slate-800 text-white'
            }`}>
            {toast.type === 'success' ? <CheckCircle className="shrink-0" size={20} /> : toast.type === 'error' ? <XCircle className="shrink-0" size={20} /> : <AlertCircle className="shrink-0" size={20} />}
            <span className="text-sm font-black tracking-tight">{toast.message}</span>
          </div>
        </div>
      )}

      {/* User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Share Workspace"
        footer={<div className="flex gap-2 w-full">
          <Button variant="outline" onClick={() => setIsUserModalOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
          <Button onClick={handleSendShareRequest} disabled={!selectedUser} className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl">Share</Button>
        </div>}
      >
        <div className="space-y-4">
          <div className="grid gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {users.length === 0 ? (
              <p className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs">No users found</p>
            ) : users.map(u => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${selectedUser === u.id ? 'border-maroon bg-maroon/5' : 'border-slate-50 hover:border-slate-100'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${selectedUser === u.id ? 'bg-maroon text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 uppercase truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
