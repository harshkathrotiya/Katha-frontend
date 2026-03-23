"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Plus,
  FolderOpen,
  BookOpen,
  Trash2,
  Edit,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  LayoutDashboard,
  FolderHeart,
  X,
  Folder,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// ─── Types ───────────────────────────────────────────────────────────────────
interface FavFolder {
  id: string;
  name: string;
  parentFavoriteFolderId: string | null;
  order: number;
  _count: { items: number; children: number };
}

interface FavItem {
  id: string;
  itemType: "FILE" | "FOLDER";
  order: number;
  file?: { id: string; name: string; type: string } | null;
  folder?: { id: string; name: string; section: string } | null;
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | null }>({ message: "", type: null });
  const show = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: null }), 3000);
  };
  return { toast, show };
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[40px]">
      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center text-slate-200 dark:text-slate-700">
        <FolderHeart size={32} />
      </div>
      <div className="space-y-1">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{label}</p>
        <p className="text-slate-300 dark:text-slate-700 text-[10px] font-medium italic px-10">{sub}</p>
      </div>
    </div>
  );
}

// ─── Folder card ─────────────────────────────────────────────────────────────
function FolderCard({
  folder,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: {
  folder: FavFolder;
  isActive: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const total = folder._count.items + folder._count.children;
  return (
    <div
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-[28px] p-5 border-2 transition-all duration-500 flex flex-col gap-4
        ${isActive
          ? "border-maroon bg-maroon/5 shadow-xl shadow-maroon/10"
          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-maroon/40 hover:shadow-lg"
        }`}
    >
      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300
        ${isActive ? "bg-maroon/10" : "bg-slate-50 dark:bg-slate-800 group-hover:bg-maroon/5"}`}>
        <FolderHeart size={28} className={isActive ? "text-maroon" : "text-slate-400 group-hover:text-maroon transition-colors"} />
      </div>

      {/* Name & count */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-black text-base tracking-tight uppercase truncate transition-colors duration-300 font-outfit
          ${isActive ? "text-maroon" : "text-slate-800 dark:text-white group-hover:text-maroon"}`}>
          {folder.name}
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          {total} {total === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Actions — appear on hover */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
        <button
          onClick={(e) => { e.stopPropagation(); onRename(); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-maroon hover:border-maroon/30 transition-all"
        >
          <Edit size={12} /> Rename
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="flex items-center justify-center p-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-100 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Favourite item row ───────────────────────────────────────────────────────
function FavItemRow({
  item,
  idx,
  onOpen,
  onRemove,
}: {
  item: FavItem;
  idx: number;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const isFile = item.itemType === "FILE";
  const name = isFile ? item.file?.name : item.folder?.name;
  const sub = isFile ? item.file?.type : item.folder?.section;

  return (
    <div
      className="group w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 md:p-4 flex items-center gap-4 shadow-sm hover:border-maroon/30 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-500"
      style={{ animationDelay: `${idx * 40}ms` }}
      onClick={onOpen}
    >
      {/* Icon */}
      <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-maroon/5 transition-colors">
        {isFile
          ? <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-maroon stroke-[2.5]" />
          : <FolderOpen className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-maroon transition-colors truncate">
          {name || "Unknown"}
        </h4>
        <p className="text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-wider">
          {sub} · {isFile ? "File" : "Folder"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-maroon text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-maroon/20 hover:-translate-y-0.5 transition-all"
        >
          <Eye size={12} /> Open
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FavouritesPage() {
  const router = useRouter();
  const { toast, show: showToast } = useToast();

  const [folders, setFolders] = useState<FavFolder[]>([]);
  const [activeFolder, setActiveFolder] = useState<FavFolder | null>(null);
  const [items, setItems] = useState<FavItem[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [isDeleteItemOpen, setIsDeleteItemOpen] = useState(false);
  const [folderToAct, setFolderToAct] = useState<FavFolder | null>(null);
  const [itemToRemove, setItemToRemove] = useState<FavItem | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Load folders ──────────────────────────────────────────────────────────
  const loadFolders = useCallback(async () => {
    setLoadingFolders(true);
    try {
      const res = await api.get("/favorites");
      const data: FavFolder[] = res.data || [];
      setFolders(data);
      // Auto-select first folder if none selected
      if (data.length > 0 && !activeFolder) {
        setActiveFolder(data[0]);
      }
    } catch {
      showToast("Failed to load favourite collections", "error");
    } finally {
      setLoadingFolders(false);
    }
  }, []); // eslint-disable-line

  // ── Load items for active folder ─────────────────────────────────────────
  const loadItems = useCallback(async (folderId: string) => {
    setLoadingItems(true);
    try {
      const res = await api.get(`/favorites/${folderId}/items`);
      setItems(res.data || []);
    } catch {
      showToast("Failed to load items", "error");
    } finally {
      setLoadingItems(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { loadFolders(); }, [loadFolders]);

  useEffect(() => {
    if (activeFolder) loadItems(activeFolder.id);
    else setItems([]);
  }, [activeFolder, loadItems]);

  // ── Create folder ─────────────────────────────────────────────────────────
  const handleCreateFolder = async () => {
    if (!inputValue.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post("/favorites", { name: inputValue.trim() });
      const newFolder: FavFolder = { ...res.data, _count: { items: 0, children: 0 } };
      setFolders(prev => [...prev, newFolder]);
      setActiveFolder(newFolder);
      setIsCreateOpen(false);
      setInputValue("");
      showToast("Collection created", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to create collection", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Rename folder ─────────────────────────────────────────────────────────
  const handleRenameFolder = async () => {
    if (!folderToAct || !inputValue.trim()) return;
    setSubmitting(true);
    const oldName = folderToAct.name;
    // Optimistic
    setFolders(prev => prev.map(f => f.id === folderToAct.id ? { ...f, name: inputValue.trim() } : f));
    if (activeFolder?.id === folderToAct.id) setActiveFolder(prev => prev ? { ...prev, name: inputValue.trim() } : prev);
    setIsRenameOpen(false);
    try {
      await api.put(`/favorites/${folderToAct.id}`, { name: inputValue.trim() });
      showToast("Renamed successfully", "success");
    } catch (err: any) {
      // Rollback
      setFolders(prev => prev.map(f => f.id === folderToAct.id ? { ...f, name: oldName } : f));
      if (activeFolder?.id === folderToAct.id) setActiveFolder(prev => prev ? { ...prev, name: oldName } : prev);
      showToast(err.message || "Failed to rename", "error");
    } finally {
      setSubmitting(false);
      setInputValue("");
    }
  };

  // ── Delete folder ─────────────────────────────────────────────────────────
  const handleDeleteFolder = async () => {
    if (!folderToAct) return;
    setSubmitting(true);
    const deletedId = folderToAct.id;
    const remaining = folders.filter(f => f.id !== deletedId);
    setFolders(remaining);
    if (activeFolder?.id === deletedId) setActiveFolder(remaining[0] || null);
    setIsDeleteFolderOpen(false);
    try {
      await api.delete(`/favorites/${deletedId}`);
      showToast("Collection deleted", "success");
    } catch (err: any) {
      await loadFolders();
      showToast(err.message || "Failed to delete collection", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Remove item ───────────────────────────────────────────────────────────
  const handleRemoveItem = async () => {
    if (!itemToRemove) return;
    const removedId = itemToRemove.id;
    setItems(prev => prev.filter(i => i.id !== removedId));
    // Update folder count optimistically
    setFolders(prev => prev.map(f =>
      f.id === activeFolder?.id ? { ...f, _count: { ...f._count, items: Math.max(0, f._count.items - 1) } } : f
    ));
    setIsDeleteItemOpen(false);
    try {
      await api.delete(`/favorites/items/${removedId}`);
      showToast("Removed from favourites", "success");
    } catch (err: any) {
      if (activeFolder) loadItems(activeFolder.id);
      showToast(err.message || "Failed to remove item", "error");
    }
  };

  // ── Open item ─────────────────────────────────────────────────────────────
  const handleOpenItem = (item: FavItem) => {
    if (item.itemType === "FILE" && item.file) {
      // Navigate to the parent section — files live inside katha/granth/book
      router.push(`/katha`);
    } else if (item.itemType === "FOLDER" && item.folder) {
      const section = item.folder.section?.toLowerCase() || "katha";
      router.push(`/${section}/${item.folder.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col pb-24">

      {/* ── Header ── */}
      <div className="px-5 md:px-10 py-3 md:py-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl z-40 shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => router.push("/user")}
            className="p-1.5 md:px-3 md:py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg hover:text-maroon transition-all text-[10px] md:text-xs font-black shadow-sm shrink-0 flex items-center gap-2"
          >
            <LayoutDashboard size={14} />
            <span className="hidden md:inline">Dashboard</span>
          </button>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-maroon/5 flex items-center justify-center rounded-lg md:rounded-xl border border-maroon/10 text-maroon">
            <Heart className="w-4 h-4 md:w-5 md:h-5 fill-maroon/20" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white font-outfit tracking-tighter uppercase leading-none">
              Favourites
            </h1>
            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
              {folders.length} {folders.length === 1 ? "Collection" : "Collections"}
            </p>
          </div>
        </div>

        <button
          onClick={() => { setInputValue(""); setIsCreateOpen(true); }}
          className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-maroon hover:bg-[#6e171b] text-white rounded-xl font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-lg shadow-maroon/20 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={16} strokeWidth={3} />
          <span>New Collection</span>
        </button>
      </div>

      {/* ── Body: two-column layout ── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 max-w-[1700px] mx-auto w-full">

        {/* ── Left: Collection sidebar ── */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 px-5 md:px-6 py-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Collections</p>
            <span className="text-[9px] font-bold text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-800">
              {folders.length}
            </span>
          </div>

          {loadingFolders ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 rounded-[28px] bg-slate-50 dark:bg-slate-900 animate-pulse" />
              ))}
            </div>
          ) : folders.length === 0 ? (
            <EmptyState
              label="No collections yet"
              sub="Create a collection to organise your favourite Kathas, Granths, and Books."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:flex lg:flex-col">
              {folders.map(folder => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  isActive={activeFolder?.id === folder.id}
                  onSelect={() => setActiveFolder(folder)}
                  onRename={() => {
                    setFolderToAct(folder);
                    setInputValue(folder.name);
                    setIsRenameOpen(true);
                  }}
                  onDelete={() => {
                    setFolderToAct(folder);
                    setIsDeleteFolderOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Items panel ── */}
        <div className="flex-1 px-5 md:px-8 py-6 flex flex-col gap-5 min-w-0">

          {/* Panel header */}
          {activeFolder ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-maroon/5 rounded-xl flex items-center justify-center border border-maroon/10">
                  <FolderHeart size={18} className="text-maroon" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white font-outfit leading-none">
                    {activeFolder.name}
                  </h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  Use Heart / Bookmark on any Katha to add items here
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center">
                <Heart size={18} className="text-slate-300" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-400 font-outfit">
                Select a collection
              </h2>
            </div>
          )}

          {/* How-to banner — shown when collection is empty */}
          {activeFolder && !loadingItems && items.length === 0 && (
            <div className="rounded-[24px] border-2 border-dashed border-maroon/20 bg-maroon/[0.02] p-6 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-14 h-14 bg-maroon/5 rounded-2xl flex items-center justify-center shrink-0">
                <Heart size={28} className="text-maroon fill-maroon/20" />
              </div>
              <div className="text-center sm:text-left">
                <p className="font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">This collection is empty</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-md">
                  Open any Katha, Granth, or Book collection and tap the{" "}
                  <span className="font-bold text-maroon">♥ Bookmark</span> action to add it to this collection.
                </p>
              </div>
            </div>
          )}

          {/* Items list */}
          {activeFolder && (
            loadingItems ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 rounded-2xl bg-slate-50 dark:bg-slate-900 animate-pulse" />
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="flex flex-col gap-3">
                {items.map((item, idx) => (
                  <FavItemRow
                    key={item.id}
                    item={item}
                    idx={idx}
                    onOpen={() => handleOpenItem(item)}
                    onRemove={() => {
                      setItemToRemove(item);
                      setIsDeleteItemOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : null
          )}

          {/* No folder selected */}
          {!activeFolder && !loadingFolders && folders.length > 0 && (
            <EmptyState
              label="Select a collection"
              sub="Click a collection on the left to see its items."
            />
          )}
        </div>
      </div>

      {/* ── Create Collection Modal ── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Favourite Collection"
        footer={
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={submitting || !inputValue.trim()}
              className="flex-1 bg-maroon hover:bg-[#6e171b] rounded-xl text-white"
            >
              {submitting ? "Creating..." : "Create"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
            Collection Name
          </p>
          <Input
            placeholder="e.g. Morning Satsang, Vachanamrut..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 border-2 focus:border-maroon/50 transition-all h-12 md:h-14 md:text-lg font-bold"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
          />
        </div>
      </Modal>

      {/* ── Rename Modal ── */}
      <Modal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        title="Rename Collection"
        footer={
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={() => setIsRenameOpen(false)} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleRenameFolder}
              disabled={submitting || !inputValue.trim()}
              className="flex-1 bg-maroon hover:bg-[#6e171b] rounded-xl text-white"
            >
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
            New Name
          </p>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 border-2 focus:border-maroon/50 transition-all h-12 md:h-14 md:text-lg font-bold"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleRenameFolder()}
          />
        </div>
      </Modal>

      {/* ── Delete Collection Modal ── */}
      <Modal
        isOpen={isDeleteFolderOpen}
        onClose={() => setIsDeleteFolderOpen(false)}
        title="Delete Collection"
        footer={
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={() => setIsDeleteFolderOpen(false)} className="flex-1 rounded-xl">Keep it</Button>
            <Button
              onClick={handleDeleteFolder}
              disabled={submitting}
              className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl text-white"
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        }
      >
        <div className="py-2 space-y-3 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
            <Trash2 size={28} />
          </div>
          <p className="font-medium text-slate-600 dark:text-slate-300">
            Delete{" "}
            <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              "{folderToAct?.name}"
            </span>
            ?
          </p>
          <p className="text-xs text-slate-400">
            All items saved in this collection will be removed. The original Kathas and files are not affected.
          </p>
        </div>
      </Modal>

      {/* ── Remove Item Modal ── */}
      <Modal
        isOpen={isDeleteItemOpen}
        onClose={() => setIsDeleteItemOpen(false)}
        title="Remove from Favourites"
        footer={
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={() => setIsDeleteItemOpen(false)} className="flex-1 rounded-xl">Keep it</Button>
            <Button onClick={handleRemoveItem} className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl text-white">Remove</Button>
          </div>
        }
      >
        <div className="py-2 space-y-3 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
            <Heart size={28} />
          </div>
          <p className="font-medium text-slate-600 dark:text-slate-300">
            Remove{" "}
            <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              "{itemToRemove?.file?.name || itemToRemove?.folder?.name}"
            </span>{" "}
            from this collection?
          </p>
        </div>
      </Modal>

      {/* ── Toast ── */}
      {toast.message && (
        <div className="fixed bottom-10 left-0 right-0 px-5 flex justify-center z-[9999] pointer-events-none">
          <div className={`px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 w-full max-w-md border pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-500
            ${toast.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : toast.type === "error" ? "bg-red-50 border-red-100 text-red-800"
              : "bg-slate-900 border-slate-800 text-white"}`}
          >
            {toast.type === "success" ? <CheckCircle className="shrink-0" size={20} />
              : toast.type === "error" ? <XCircle className="shrink-0" size={20} />
              : <AlertCircle className="shrink-0" size={20} />}
            <span className="text-sm font-black tracking-tight">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
