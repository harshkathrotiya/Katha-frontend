"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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
  Upload
} from "lucide-react";

/**
 * KathaCard Component - Main Gallery Style
 */
const KathaCard = ({ title, date = "Oct 2024", onOpen }: { title: string; date?: string; onOpen: () => void }) => {
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
      <div className="relative aspect-[3/4.2] rounded-[30px] overflow-hidden bg-white dark:bg-slate-950 border-2 border-slate-50 dark:border-slate-800 transition-all duration-700 mb-8 group-hover:border-[#8b1D1D]/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -ml-16 -mb-16 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center transition-all duration-700 group-hover:blur-2xl group-hover:scale-110 group-hover:opacity-0 ${isMobileExposed ? 'blur-2xl scale-110 opacity-0' : ''}`}>
          <div className="w-16 h-16 rounded-full border-2 border-[#8b1D1D]/10 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border border-[#8b1D1D]/20 animate-ping opacity-20" />
            <div className="w-4 h-4 bg-[#8b1D1D] rounded-full shadow-[0_0_20px_rgba(139,29,29,0.4)]" />
          </div>
          <div className="text-[#8b1D1D] font-black text-3xl tracking-tighter font-outfit uppercase leading-[0.9] mb-2">Satsang</div>
          <div className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em]">SGVP Katha</div>
        </div>

        <div className={`absolute bottom-0 left-0 w-full bg-[#8b1D1D] dark:bg-[#a32b2b] py-5 px-4 text-center z-10 shadow-[0_-15px_30px_rgba(0,0,0,0.2)] transition-transform duration-500 group-hover:translate-y-full ${isMobileExposed ? 'translate-y-full' : ''}`}>
          <span className="text-white text-sm font-black tracking-[0.2em]">{title}</span>
        </div>

        <div className={`absolute inset-0 z-20 flex flex-col justify-center gap-6 p-6 transition-all duration-500 bg-white/95 dark:bg-slate-950/95 cursor-default ${isMobileExposed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'}`}>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black text-[#8b1D1D] uppercase tracking-widest whitespace-nowrap">Actions</span>
            <div className="h-[2px] w-full bg-[#8b1D1D]/10 rounded-full" />
          </div>

          <div className="grid grid-cols-4 gap-3.5">
            {actions.map((action, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 group/item">
                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  className={`aspect-square w-full ${action.bg} ${action.text} rounded-[20px] flex flex-col items-center justify-center transition-all duration-500 hover:scale-125 hover:z-30 hover:shadow-xl active:scale-95 group/btn border border-transparent hover:border-white/10`}
                >
                  <action.Icon className="h-6 w-6 stroke-[2.5px] transition-transform group-hover/btn:rotate-12" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            className="mt-2 w-full py-4 bg-[#8b1D1D] text-white rounded-[22px] text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl shadow-[#8b1D1D]/20 hover:bg-[#6e171b] hover:-translate-y-1 transition-all active:scale-95"
          >
            <Eye className="h-5 w-5 stroke-[2.5px]" />
            <span>Open</span>
          </button>
        </div>
      </div>

      <div className="px-2">
        <h3 className="font-outfit font-black text-slate-900 dark:text-white text-2xl tracking-tighter leading-none group-hover:text-[#8b1D1D] transition-colors">{title} Collection</h3>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wide uppercase">Updated {date}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Simple Action Icon Button with Tooltip
 */
const MiniAction = ({ Icon, label, onClick, color = "text-slate-400" }: { Icon: any; label: string; onClick: (e: any) => void; color?: string }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(e); }}
    className={`group/btn relative p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-[#8b1D1D]/30 transition-all ${color} hover:shadow-lg active:scale-95 flex items-center justify-center`}
  >
    <Icon size={18} strokeWidth={2.5} />

    {/* Float Label (Tooltip) */}
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover/btn:opacity-100 transition-all duration-300 pointer-events-none shadow-xl transform translate-y-2 group-hover/btn:translate-y-0 z-[100] whitespace-nowrap">
      {label}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-white rotate-45" />
    </div>
  </button>
);

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/**
 * RecursiveItem Component
 * Now with full actions for both Folders and Files.
 */
const RecursiveItem = ({
  index,
  title,
  type,
  info,
  onTag,
  onBookmark,
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
  title: string;
  type: 'folder' | 'file';
  info: string;
  onTag: () => void;
  onBookmark: () => void;
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
  const isFolder = type === 'folder';

  return (
    <div
      onClick={onClick}
      className={`w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 md:p-6 flex flex-col xl:flex-row items-center xl:items-center gap-4 md:gap-6 shadow-sm hover:border-[#8b1D1D]/30 transition-all group cursor-pointer`}
    >
      <div className="flex items-center gap-4 md:gap-6 w-full xl:w-auto">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#8b1D1D]/5 transition-colors text-amber-500">
          {isFolder ? (
            <FolderOpen size={32} />
          ) : (
            <BookOpen size={30} strokeWidth={2.5} className="text-[#8b1D1D]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
            <span className="text-[10px] md:text-xs font-black text-slate-300 dark:text-slate-700 w-6">
              {index < 10 ? `0${index}` : index}
            </span>
            <h4 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-[#8b1D1D] transition-colors truncate">
              {title}
            </h4>
          </div>
          <p className="text-xs md:text-sm text-slate-400 font-medium italic truncate">{info}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center xl:justify-end gap-3 w-full xl:flex-1">
        <button className={`w-full sm:w-auto px-5 py-4 ${isFolder ? 'bg-slate-800' : 'bg-[#8b1D1D]'} text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-lg transition-all flex items-center justify-center gap-2`}>
          {isFolder ? <ChevronRight size={18} /> : <Eye size={18} />}
          <span>{isFolder ? 'OPEN' : 'READ'}</span>
        </button>

        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-sm rounded-[22px] border border-slate-100 dark:border-slate-700/50 shadow-sm relative">
          <div className="flex items-center gap-1 px-1">
            <MiniAction Icon={Tag} label="Label" onClick={onTag} color="hover:text-indigo-500" />
            <MiniAction Icon={Bookmark} label="Save" onClick={onBookmark} color="hover:text-amber-500" />
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 opacity-50" />
          <div className="flex items-center gap-1 px-1">
            <MiniAction Icon={ChevronUp} label="Move Up" onClick={onMoveUp} color="hover:text-[#8b1D1D]" />
            <MiniAction Icon={ChevronDown} label="Move Down" onClick={onMoveDown} color="hover:text-[#8b1D1D]" />
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 opacity-50" />
          <div className="flex items-center gap-1 px-1">
            <MiniAction Icon={Download} label="Download" onClick={onDownload} color="hover:text-blue-500" />
            <MiniAction Icon={Share2} label="Share" onClick={onShare} color="hover:text-emerald-500" />
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 opacity-50" />
          <div className="flex items-center gap-1 px-1">
            <MiniAction Icon={User} label="User" onClick={onUser} color="hover:text-purple-500" />
            <MiniAction Icon={Move} label="Move" onClick={onMove} color="hover:text-slate-900 dark:hover:text-white" />
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 opacity-50" />
          <div className="flex items-center gap-1 px-1">
            <MiniAction Icon={Edit} label="Edit" onClick={onEdit} color="hover:text-slate-900 dark:hover:text-white" />
            <MiniAction Icon={Trash2} label="Delete" onClick={onDelete} color="hover:text-red-500" />
          </div>
        </div>
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
  const [modalType, setModalType] = useState<'create_folder' | 'create_file' | 'edit' | null>(null);
  const [activeItem, setActiveItem] = useState<any>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | null }>({ message: '', type: null });
  
  // File Upload State
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Deletion Confirm Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

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
          
          // Sort items by order
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

  const openInputModal = (type: 'create_folder' | 'create_file' | 'edit', item?: any) => {
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
    }
    setIsInputModalOpen(true);
  };

  const handleInputSubmit = async () => {
    if (modalType === 'create_folder' && !modalInputValue) return;
    if (modalType === 'create_file' && !selectedFile) {
      showToast("Please select a file first", "error");
      return;
    }

    try {
      if (modalType === 'create_folder') {
        await api.post('/folders', { name: modalInputValue, parentFolderId: currentFolderId });
        showToast("Folder created successfully", "success");
      } else if (modalType === 'create_file') {
        const formData = new FormData();
        formData.append('file', selectedFile!);
        formData.append('name', modalInputValue || selectedFile!.name);
        if (currentFolderId) formData.append('parentFolderId', currentFolderId);
        formData.append('type', 'DOCUMENT');
        
        await api.post('/files', formData);
        showToast("File uploaded successfully", "success");
      } else if (modalType === 'edit' && activeItem) {
        const endpoint = activeItem.type === 'folder' ? `/folders/${activeItem.id}` : `/files/${activeItem.id}`;
        await api.put(endpoint, { name: modalInputValue });
        showToast("Renamed successfully", "success");
      }
      setIsInputModalOpen(false);
      setSelectedFile(null);
      
      // Refresh after a small delay to show toast
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleReorder = async (item: any, direction: 'up' | 'down') => {
    const idx = mixedContents.findIndex(i => i.id === item.id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === mixedContents.length - 1) return;

    const otherItem = direction === 'up' ? mixedContents[idx - 1] : mixedContents[idx + 1];
    
    // Use order values or indices if order is missing
    const order1 = item.order ?? (idx + 1);
    const order2 = otherItem.order ?? (direction === 'up' ? idx : idx + 2);

    try {
      const endpoint1 = item.type === 'folder' ? `/folders/${item.id}` : `/files/${item.id}`;
      const endpoint2 = otherItem.type === 'folder' ? `/folders/${otherItem.id}` : `/files/${otherItem.id}`;
      
      await Promise.all([
        api.put(endpoint1, { order: order2 }),
        api.put(endpoint2, { order: order1 })
      ]);
      
      window.location.reload();
    } catch (err) {
      alert('Failed to reorder');
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
      alert('Share request sent!');
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
      const endpoint = itemToDelete.type === 'folder' ? `/folders/${itemToDelete.id}` : `/files/${itemToDelete.id}`;
      await api.delete(endpoint);
      setMixedContents(prev => prev.filter(i => i.id !== itemToDelete.id));
      showToast("Item deleted", "success");
      setIsConfirmModalOpen(false);
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#8b1D1D] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Katha...</p>
        </div>
      </div>
    );
  }

  if (slug.length > 0) {
    const currentFolderName = slug[slug.length - 1];

    return (
      <div className="min-h-full bg-slate-50 dark:bg-slate-950 flex flex-col relative transition-colors duration-500 font-outfit">
        <div className="px-6 md:px-10 py-4 md:py-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:text-[#8b1D1D] transition-all text-[10px] md:text-sm font-black shadow-sm"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => router.push("/katha")}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:text-[#8b1D1D] transition-all text-[10px] md:text-sm font-black shadow-sm"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>

          <div className="flex flex-col items-end max-w-[200px] md:max-w-none">
            <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[8px] md:text-[10px]">Location:</span>
            <h2 className="text-sm md:text-xl font-black text-[#8b1D1D] tracking-tighter uppercase truncate w-full text-right">{slug.join(' / ')}</h2>
          </div>
        </div>

        <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full space-y-4 md:space-y-6">
          <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] md:text-[11px] mb-1">Explorer</p>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{currentFolderName}</h1>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => openInputModal('create_folder')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:-translate-y-1 transition-all"
              >
                 <Plus size={18} />
                 <span>New Folder</span>
              </button>
              <button 
                onClick={() => openInputModal('create_file')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#8b1D1D] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#8b1D1D]/20 hover:-translate-y-1 transition-all"
              >
                 <FilePlus size={18} />
                 <span>New File</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {mixedContents.map((item, idx) => (
              <RecursiveItem 
                key={item.id} 
                index={idx + 1} 
                title={item.name || item.title} 
                type={item.type as 'folder' | 'file'}
                info={item.info} 
                onTag={() => showToast('Tag feature coming soon!', 'info')}
                onBookmark={() => showToast('Saved to bookmarks!', 'success')}
                onMoveUp={() => handleReorder(item, 'up')}
                onMoveDown={() => handleReorder(item, 'down')}
                onDownload={() => {
                   if (item.type === 'file' && item.metadata) {
                      try {
                        const meta = JSON.parse(item.metadata);
                        if (meta.url) window.open(meta.url, '_blank');
                        else showToast('No download link', 'error');
                      } catch(e) { showToast('Info corrupted', 'error'); }
                   } else showToast('Download coming soon for folders', 'info');
                }}
                onShare={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Link copied to clipboard', 'success');
                }}
                onUser={() => handleShareClick(item)}
                onMove={() => showToast('Move feature coming soon!', 'info')}
                onEdit={() => openInputModal('edit', item)}
                onDelete={() => {
                  setItemToDelete(item);
                  setIsConfirmModalOpen(true);
                }}
                onClick={() => {
                  if (item.type === 'folder') {
                    const newPath = `/katha/${slug.join('/')}/${item.name}`;
                    router.push(newPath);
                  }
                }}
              />
            ))}
          </div>

          <p className="text-center text-slate-300 dark:text-slate-900 font-black py-10 uppercase tracking-[0.5em] text-[10px]">
            --- End of {currentFolderName} ---
          </p>
        </div>

        {/* Custom Input Modal */}
        <Modal 
          isOpen={isInputModalOpen} 
          onClose={() => setIsInputModalOpen(false)} 
          title={modalTitle}
          footer={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsInputModalOpen(false)}>Cancel</Button>
              <Button onClick={handleInputSubmit} className="bg-[#8b1D1D] hover:bg-[#6e171b]">
                {modalType === 'create_file' ? 'Upload' : 'Confirm'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {modalType === 'create_file' && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#8b1D1D]/30 hover:bg-[#8b1D1D]/5 transition-all mb-4"
              >
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                  <Upload size={24} className="text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {selectedFile ? selectedFile.name : 'Click to select file'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">MAX SIZE: 50MB</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      if (!modalInputValue) setModalInputValue(file.name);
                    }
                  }} 
                />
              </div>
            )}
            
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              {modalType === 'create_file' ? 'Display Name' : 'Item Name'}
            </p>
            <Input 
              placeholder={modalPlaceholder} 
              value={modalInputValue} 
              onChange={(e) => setModalInputValue(e.target.value)}
              className="rounded-xl border-slate-200"
              autoFocus={modalType !== 'create_file'}
            />
          </div>
        </Modal>

        {/* Confirmation Modal */}
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="Confirm Delete"
          footer={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>No, Keep it</Button>
              <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Yes, Delete</Button>
            </div>
          }
        >
          <div className="py-4">
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              Are you sure you want to delete <span className="font-bold text-[#8b1D1D]">"{itemToDelete?.name || itemToDelete?.title}"</span>? This action moved it to trash.
            </p>
          </div>
        </Modal>

        {/* Toast System */}
        {toast.message && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px] border ${
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
              toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' :
              'bg-slate-900 border-slate-800 text-white'
            }`}>
              {toast.type === 'success' ? <CheckCircle size={20} /> : 
               toast.type === 'error' ? <XCircle size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-bold tracking-tight">{toast.message}</span>
            </div>
          </div>
        )}

        {/* User Selection Modal for Sharing */}
        <Modal 
          isOpen={isUserModalOpen} 
          onClose={() => setIsUserModalOpen(false)} 
          title="Share with User"
          footer={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSendShareRequest} 
                disabled={!selectedUser}
                className="bg-[#8b1D1D] hover:bg-[#6e171b]"
              >
                Send Request
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Select a User</p>
            {users.length === 0 ? (
              <p className="text-xs italic text-slate-500">No other users found.</p>
            ) : (
              <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                {users.map(u => (
                  <div 
                    key={u.id}
                    onClick={() => setSelectedUser(u.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${selectedUser === u.id ? 'border-[#8b1D1D] bg-[#8b1D1D]/5' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{u.name}</p>
                      <p className="text-[10px] text-slate-500">{u.email}</p>
                    </div>
                    {selectedUser === u.id && <div className="w-2 h-2 rounded-full bg-[#8b1D1D]" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white dark:bg-slate-950 flex flex-col relative pb-32 transition-colors duration-300">
      <div className="px-8 md:px-12 py-8 flex items-center justify-between border-b border-slate-50 dark:border-slate-900/50 sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl z-40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#8b1D1D]/5 flex items-center justify-center rounded-2xl border border-[#8b1D1D]/10">
            <Library size={24} className="text-[#8b1D1D]" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white font-outfit tracking-tighter">Katha Gallery</h1>
        </div>

        <button className="hidden lg:flex items-center gap-3 px-8 py-4 bg-[#8b1D1D] hover:bg-[#6e171b] text-white rounded-[22px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-[#8b1D1D]/30 hover:-translate-y-1 transition-all">
          <Plus size={20} strokeWidth={3} />
          <span>New Collection</span>
        </button>
      </div>

      <div className="px-10 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-20 max-w-[1700px] mx-auto place-items-center">
          {kathaList.map((item, idx) => (
            <KathaCard
              key={idx}
              title={item.name}
              date={new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              onOpen={() => router.push(`/katha/${item.name}`)}
            />
          ))}
        </div>
      </div>

      <div className="fixed bottom-12 right-10 z-50 lg:hidden">
        <button className="w-16 h-16 bg-[#8b1D1D] text-white rounded-full flex items-center justify-center shadow-3xl hover:scale-110 active:scale-95 transition-all">
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
