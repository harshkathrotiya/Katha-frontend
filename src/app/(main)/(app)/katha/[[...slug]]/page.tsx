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
  Heart,
  Pin,
  ArrowUpAZ,
  ArrowDownZA
} from "lucide-react";

import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { KathaCard } from "@/components/features/katha/KathaCard";
import { RecursiveItem } from "@/components/features/katha/RecursiveItem";
import { MoveSidebarItem } from "@/components/features/katha/MoveSidebarItem";
import { MiniAction } from "@/components/features/katha/MiniAction";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// 🔹 DSA: Trie (Prefix Tree) for lightning fast search
class TrieNode {
  children: { [key: string]: TrieNode } = {};
  items: any[] = [];
}
class Trie {
  root = new TrieNode();
  insert(name: string, item: any) {
    let node = this.root;
    const cleanName = name.toLowerCase();
    for (const char of cleanName) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
      node.items.push(item);
    }
  }
  search(prefix: string): any[] {
    let node = this.root;
    const cleanPrefix = prefix.toLowerCase();
    for (const char of cleanPrefix) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }
    return node.items;
  }
}

// 🔹 DSA: Doubly Linked List for Undo/Redo History
class HistoryNode {
  content: string;
  next: HistoryNode | null = null;
  prev: HistoryNode | null = null;
  constructor(content: string) { this.content = content; }
}
class EditorHistory {
  current: HistoryNode;
  constructor(initial: string) { this.current = new HistoryNode(initial); }
  push(content: string) {
    if (content === this.current.content) return;
    const newNode = new HistoryNode(content);
    newNode.prev = this.current;
    this.current.next = newNode;
    this.current = newNode;
  }
  undo(): string | null {
    if (this.current.prev) {
      this.current = this.current.prev;
      return this.current.content;
    }
    return null;
  }
  redo(): string | null {
    if (this.current.next) {
      this.current = this.current.next;
      return this.current.content;
    }
    return null;
  }
}

// 🔹 DSA: Global Cache (Hash Map) for instant navigation
// Persisted in sessions to survive reloads
const contentCache = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    const cached = sessionStorage.getItem(`katha_cache_${key}`);
    return cached ? JSON.parse(cached) : null;
  },
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(`katha_cache_${key}`, JSON.stringify(value));
  },
  delete: (key: string) => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(`katha_cache_${key}`);
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    Object.keys(sessionStorage).forEach(k => {
      if (k.startsWith('katha_cache_')) sessionStorage.removeItem(k);
    });
  }
};


export default function KathaCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string[] || [];

  const [loading, setLoading] = useState(true);
  const [kathaList, setKathaList] = useState<any[]>([]);
  const [mixedContents, setMixedContents] = useState<any[]>([]);
  const [filteredContents, setFilteredContents] = useState<any[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const trieRef = useRef<Trie>(new Trie());
  const historyRef = useRef<EditorHistory | null>(null);

  // Sorting States
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal States
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalPlaceholder, setModalPlaceholder] = useState("");
  const [modalInputValue, setModalInputValue] = useState("");
  const [modalType, setModalType] = useState<'create_folder' | 'create_file' | 'edit' | 'create_collection' | null>(null);
  const [activeItem, setActiveItem] = useState<any>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modalMoveContext, setModalMoveContext] = useState<any>(null); // Current folder in move modal
  const [modalMoveFolders, setModalMoveFolders] = useState<any[]>([]); // Current subfolders in move modal
  const [modalMoveBreadcrumbs, setModalMoveBreadcrumbs] = useState<any[]>([]); // Current path in move modal
  const [allKathaFolders, setAllKathaFolders] = useState<any[]>([]); // Flat list of all folders for local explorer
  const [isMoveLoading, setIsMoveLoading] = useState(false);
  const [isCreatingInMove, setIsCreatingInMove] = useState(false);
  const [newMoveFolderName, setNewMoveFolderName] = useState("");
  const [moveFolderTree, setMoveFolderTree] = useState<any[]>([]);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
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

  // 🔹 DSA: Dynamic Programming / Memoization for stats
  const statsCache = useRef(new Map<string, string>());
  const getItemInfoMemo = (item: any) => {
    const key = `${item.id}-${item.updatedAt || '0'}`;
    if (statsCache.current.has(key)) return statsCache.current.get(key);
    const info = getItemInfo(item);
    statsCache.current.set(key, info);
    return info;
  };

  const formatSize = (bytes: any) => {
    const b = Number(bytes);
    if (isNaN(b) || b <= 0) return '0 KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getItemInfo = (item: any) => {
    if (item.type === 'folder') {
      const count = (item._count?.children || 0) + (item._count?.files || 0);
      return `${count} Item${count !== 1 ? 's' : ''}`;
    }
    const size = Number(item.size);
    return size > 0 ? `${formatSize(size)} - Source` : 'New Document';
  };

  useEffect(() => {
    const fetchData = async () => {
      const cacheKey = slug.join('/') || 'root';
      const cached = contentCache.get(cacheKey);

      if (cached) {
        setMixedContents(cached.contents);
        setFilteredContents(cached.contents);
        setCurrentFolderId(cached.folderId);
        setLoading(false);
        // Build trie in background
        const trie = new Trie();
        cached.contents.forEach((it: any) => trie.insert(it.name || it.title || '', it));
        trieRef.current = trie;
        // Proceed to fetch fresh data in background (Stale-While-Revalidate)
      } else {
        setLoading(true);
      }

      try {
        if (slug.length === 0) {
          const res = await api.get('/folders?section=KATHA');
          const data = (res.data || []).map((f: any) => ({ ...f, type: 'folder', info: getItemInfo({ ...f, type: 'folder' }) }));
          setKathaList(data);
          setCurrentFolderId(null);
          contentCache.set('root', { contents: data, folderId: null });
        } else {
          // Optimized: Resolve path and get contents in ONE call
          const resolveRes = await api.post('/folders/resolve-path', {
            path: slug,
            section: 'KATHA',
            includeContents: true
          });

          const folderData = resolveRes.data;
          const folderId = folderData.id;
          setCurrentFolderId(folderId);

          const { folders, files } = folderData.contents;

          const combined = [
            ...(folders || []).map((f: any) => ({ ...f, type: 'folder', info: getItemInfoMemo({ ...f, type: 'folder' }) })),
            ...(files || []).map((f: any) => ({ ...f, type: 'file', info: getItemInfoMemo({ ...f, type: 'file' }) }))
          ].sort((a, b) => (a.order || 0) - (b.order || 0));

          setMixedContents(combined);
          setFilteredContents(combined);
          contentCache.set(cacheKey, { contents: combined, folderId });

          // DSA: Initialize Trie for search
          const trie = new Trie();
          combined.forEach(it => trie.insert(it.name || it.title || '', it));
          trieRef.current = trie;
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
      let res: any;
      let processedItem: any;

      if (modalType === 'create_folder') {
        const tempId = `temp-${Date.now()}`;
        const tempItem = { id: tempId, name: modalInputValue, type: 'folder', createdAt: new Date().toISOString(), isPinned: false, info: 'Just now' };
        if (slug.length === 0) setKathaList(prev => [tempItem, ...prev]);
        else {
          setMixedContents(prev => [tempItem, ...prev]);
          setFilteredContents(prev => [tempItem, ...prev]);
        }
        setIsInputModalOpen(false);

        try {
          res = await api.post('/folders', { name: modalInputValue, parentFolderId: currentFolderId });
          const newFolder = res.data?.data || res.data;
          processedItem = { ...newFolder, type: 'folder', info: getItemInfoMemo({ ...newFolder, type: 'folder' }) };
          
          const finalMapper = (it: any) => it.id === tempId ? processedItem : it;
          if (slug.length === 0) setKathaList(prev => prev.map(finalMapper));
          else {
            setMixedContents(prev => prev.map(finalMapper));
            setFilteredContents(prev => prev.map(finalMapper));
          }
          contentCache.delete(slug.join('/') || 'root');
          showToast("Folder created successfully", "success");
        } catch (err) {
          const revert = (prev: any[]) => prev.filter(i => i.id !== tempId);
          if (slug.length === 0) setKathaList(revert);
          else { setMixedContents(revert); setFilteredContents(revert); }
          throw err;
        }
        return;
      } else if (modalType === 'create_collection') {
        const tempId = `temp-${Date.now()}`;
        const tempItem = { id: tempId, name: modalInputValue, type: 'folder', createdAt: new Date().toISOString(), isPinned: false, info: 'Just now' };
        setKathaList(prev => [tempItem, ...prev]);
        setIsInputModalOpen(false);

        try {
          res = await api.post('/folders', { name: modalInputValue, section: 'KATHA' });
          const newCol = res.data?.data || res.data;
          processedItem = { ...newCol, type: 'folder', info: getItemInfoMemo({ ...newCol, type: 'folder' }) };
          
          const finalMapper = (it: any) => it.id === tempId ? processedItem : it;
          setKathaList(prev => prev.map(finalMapper));
          contentCache.delete('root');
          showToast("Collection created successfully", "success");
        } catch (err) {
          setKathaList(prev => prev.filter(i => i.id !== tempId));
          throw err;
        }
        return;
      } else if (modalType === 'create_file') {
        const tempId = `temp-${Date.now()}`;
        const tempItem = { id: tempId, name: modalInputValue, type: 'file', createdAt: new Date().toISOString(), isPinned: false, info: 'Just now' };
        setMixedContents(prev => [tempItem, ...prev]);
        setFilteredContents(prev => [tempItem, ...prev]);
        setIsInputModalOpen(false);

        try {
          res = await api.post('/files', {
            name: modalInputValue || 'New File',
            parentFolderId: currentFolderId,
            type: 'DOCUMENT',
            content: ""
          });
          const newFile = res.data?.data || res.data;
          processedItem = { ...newFile, type: 'file', info: getItemInfoMemo({ ...newFile, type: 'file' }) };
          
          const finalMapper = (it: any) => it.id === tempId ? processedItem : it;
          setMixedContents(prev => prev.map(finalMapper));
          setFilteredContents(prev => prev.map(finalMapper));
          contentCache.delete(slug.join('/') || 'root');
          showToast("File created successfully", "success");
        } catch (err) {
          setMixedContents(prev => prev.filter(i => i.id !== tempId));
          setFilteredContents(prev => prev.filter(i => i.id !== tempId));
          throw err;
        }
        return;
      } else if (modalType === 'edit' && activeItem) {
        const oldName = activeItem.name || activeItem.title;
        const endpoint = activeItem.type === 'folder' ? `/folders/${activeItem.id}` : `/files/${activeItem.id}`;
        
        // Optimistic Rename
        const mapper = (it: any) => it.id === activeItem.id ? { ...it, name: modalInputValue, title: modalInputValue } : it;
        if (slug.length === 0) setKathaList(prev => prev.map(mapper));
        else {
          setMixedContents(prev => prev.map(mapper));
          setFilteredContents(prev => prev.map(mapper));
        }
        setIsInputModalOpen(false);

        try {
          await api.put(endpoint, { name: modalInputValue });
          contentCache.delete(slug.join('/') || 'root');
          if (slug.length === 0) contentCache.delete('root');
          showToast("Renamed successfully", "success");
        } catch (err) {
          const revert = (it: any) => it.id === activeItem.id ? { ...it, name: oldName, title: oldName } : it;
          if (slug.length === 0) setKathaList(prev => prev.map(revert));
          else {
            setMixedContents(prev => prev.map(revert));
            setFilteredContents(prev => prev.map(revert));
          }
          throw err;
        }
        return;
      }
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleReorder = async (item: any, direction: 'up' | 'down') => {
    const isGallery = slug.length === 0;
    if (!isGallery) return; // Disable for files/folders in favor of sorting/pinning

    const targetList = kathaList;
    const setList = setKathaList;

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
    if (!isGallery) setFilteredContents(newItems);
    contentCache.delete(slug.join('/') || 'root');

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
      const mapper = (it: any) => it.id === item.id ? { ...it, isFav: newFavStatus } : it;
      setList(targetList.map(mapper));
      if (!isGallery) setFilteredContents(prev => prev.map(mapper));

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

  const buildTree = (folders: any[]) => {
    const map: any = {};
    const roots: any[] = [];
    folders.forEach(f => { map[f.id] = { ...f, children: [] }; });
    folders.forEach(f => {
      if (f.parentFolderId) {
        if (map[f.parentFolderId]) map[f.parentFolderId].children.push(map[f.id]);
        else roots.push(map[f.id]);
      } else {
        roots.push(map[f.id]);
      }
    });
    return roots;
  };

  const updateModalFolderList = (parentId: string | null, folders: any[]) => {
    const normalizedParentId = parentId || null;
    const list = folders.filter((f: any) => {
      const fParentId = f.parentFolderId || null;
      return fParentId === normalizedParentId;
    }).filter((f: any) => f.id !== activeItem?.id);
    setModalMoveFolders(list);
  };

  const handleOpenMoveModal = async (item: any) => {
    setActiveItem(item);
    setIsMoveModalOpen(true);
    setModalMoveContext(null);
    setModalMoveBreadcrumbs([]);
    setIsMoveLoading(true);
    setIsCreatingInMove(false);
    setNewMoveFolderName("");
    try {
      // Fetch ALL folders (flattened) to allow universal cross-collection movement in the tree
      const res = await api.get('/folders?section=KATHA&flat=true');
      const all = res.data || [];
      setAllKathaFolders(all);
      const tree = buildTree(all);
      setMoveFolderTree(tree);
      updateModalFolderList(null, all);
    } catch (err) {
      showToast("Failed to fetch folders", "error");
    } finally {
      setIsMoveLoading(false);
    }
  };

  const toggleFolderExpansion = (id: string) => {
    setExpandedFolderIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleModalNavigate = (folder: any) => {
    setModalMoveContext(folder);

    // Rebuild breadcrumbs
    const path = [];
    let curr = folder;
    while (curr) {
      path.unshift(curr);
      curr = allKathaFolders.find(f => f.id === curr.parentFolderId);
    }
    setModalMoveBreadcrumbs(path);
    updateModalFolderList(folder.id, allKathaFolders);
    setIsCreatingInMove(false);

    // Auto-expand in sidebar if navigate via panel
    setExpandedFolderIds(prev => new Set(prev).add(folder.id));
  };

  const handleBreadcrumbNavigate = (idx: number) => {
    if (idx === -1) {
      setModalMoveBreadcrumbs([]);
      setModalMoveContext(null);
      updateModalFolderList(null, allKathaFolders);
    } else {
      const newCrumbs = modalMoveBreadcrumbs.slice(0, idx + 1);
      const target = newCrumbs[idx];
      setModalMoveBreadcrumbs(newCrumbs);
      setModalMoveContext(target);
      updateModalFolderList(target.id, allKathaFolders);
    }
    setIsCreatingInMove(false);
  };

  const handleCreateInMove = async () => {
    if (!newMoveFolderName.trim()) return;
    try {
      const res = await api.post('/folders', {
        name: newMoveFolderName,
        parentFolderId: modalMoveContext?.id || null,
        section: 'KATHA'
      });
      const newFolder = res.data?.data || res.data;
      if (newFolder) {
        const updatedAll = [...allKathaFolders, newFolder];
        setAllKathaFolders(updatedAll);
        const tree = buildTree(updatedAll);
        setMoveFolderTree(tree);
        updateModalFolderList(modalMoveContext?.id || null, updatedAll);
        setIsCreatingInMove(false);
        setNewMoveFolderName("");
        showToast("Folder created successfully", "success");
      }
    } catch (err) {
      showToast("Failed to create folder", "error");
    }
  };

  const handleMoveTo = async (targetFolderId: string | null) => {
    if (!activeItem) return;
    try {
      const isFolderItem = activeItem.type === 'folder' || slug.length === 0;
      const endpoint = isFolderItem ? `/folders/${activeItem.id}` : `/files/${activeItem.id}`;

      await api.put(endpoint, { parentFolderId: targetFolderId });

      // Optimistic state update: remove from current view
      if (slug.length === 0) {
        setKathaList(prev => prev.filter(i => i.id !== activeItem.id));
        contentCache.delete('root');
      } else {
        setMixedContents(prev => prev.filter(i => i.id !== activeItem.id));
        setFilteredContents(prev => prev.filter(i => i.id !== activeItem.id));
        contentCache.delete(slug.join('/') || 'root');
      }
      // Invalidate target cache if we knew it
      if (targetFolderId) contentCache.delete(targetFolderId);

      showToast(`Moved to ${modalMoveContext?.name || 'Root'} successfully`, "success");
      setIsMoveModalOpen(false);
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
    const deletedId = itemToDelete.id;
    const originalMixed = [...mixedContents];
    const originalKatha = [...kathaList];

    // Optimistic Delete
    if (slug.length === 0) setKathaList(prev => prev.filter(i => i.id !== deletedId));
    else {
      setMixedContents(prev => prev.filter(i => i.id !== deletedId));
      setFilteredContents(prev => prev.filter(i => i.id !== deletedId));
    }
    setIsConfirmModalOpen(false);

    try {
      const endpoint = itemToDelete.type === 'folder' || slug.length === 0 ? `/folders/${deletedId}` : `/files/${deletedId}`;
      await api.delete(endpoint);
      contentCache.delete(slug.join('/') || 'root');
      if (slug.length === 0) contentCache.delete('root');
      showToast("Item deleted", "success");
    } catch (err) {
      if (slug.length === 0) setKathaList(originalKatha);
      else {
        setMixedContents(originalMixed);
        setFilteredContents(originalMixed);
      }
      showToast("Delete failed", "error");
    }
  };

  const handleSaveFile = async () => {
    if (!editingFile) return;
    try {
      const res = await api.put(`/files/${editingFile.id}`, {
        metadata: JSON.stringify({ content: editorContent })
      });
      const updated = res.data?.data || res.data;
      showToast("Changes saved", "success");
      // DSA: DLL push new state
      historyRef.current?.push(editorContent);

      const updateMapper = (item: any) => {
        if (item.id === editingFile.id) {
          const newItem = { ...item, ...updated, type: 'file' };
          return { ...newItem, info: getItemInfo(newItem) };
        }
        return item;
      };
      setMixedContents(prev => prev.map(updateMapper));
      setFilteredContents(prev => prev.map(updateMapper));
      // Invalidate cache
      contentCache.delete(slug.join('/') || 'root');
    } catch (err) {
      showToast("Failed to save", "error");
    }
  };

  const handleSearch = (q: string) => {
    setMoveSearch(q);
    if (!q.trim()) {
      setFilteredContents(mixedContents);
      return;
    }
    // DSA: Search using Trie (O(L) where L is prefix length)
    const results = trieRef.current.search(q);
    setFilteredContents(results);
  };

  const handleUndoRedo = (dir: 'undo' | 'redo') => {
    const content = dir === 'undo' ? historyRef.current?.undo() : historyRef.current?.redo();
    if (content !== undefined && content !== null) {
      setEditorContent(content);
    }
  };

  const handleTogglePin = async (item: any) => {
    const newPinnedStatus = !item.isPinned;
    const mapper = (it: any) => it.id === item.id ? { ...it, isPinned: newPinnedStatus } : it;

    // Optimistic Update
    setMixedContents(prev => prev.map(mapper));
    setFilteredContents(prev => prev.map(mapper));

    try {
      const endpoint = item.type === 'folder' ? `/folders/${item.id}` : `/files/${item.id}`;
      await api.put(endpoint, { isPinned: newPinnedStatus });
      contentCache.delete(slug.join('/') || 'root');
      showToast(newPinnedStatus ? "Pinned to top" : "Removed from top", "success");
    } catch (err) {
      // Rollback on error
      const rollbackMapper = (it: any) => it.id === item.id ? { ...it, isPinned: !newPinnedStatus } : it;
      setMixedContents(prev => prev.map(rollbackMapper));
      setFilteredContents(prev => prev.map(rollbackMapper));
      showToast("Failed to pin item", "error");
    }
  };

  const getSortedItems = (items: any[]) => {
    return [...items].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = (a.name || a.title || "").localeCompare(b.name || b.title || "");
      } else if (sortBy === 'date') {
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'size') {
        comparison = Number(b.size || 0) - Number(a.size || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const findFolderBFS = (targetName: string, rootNodes: any[]) => {
    const queue = [...rootNodes];
    const results: any[] = [];
    while (queue.length > 0) {
      const current = queue.shift();
      if (current.name.toLowerCase().includes(targetName.toLowerCase())) {
        results.push(current);
      }
      if (current.children) queue.push(...current.children);
    }
    return results;
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
      // DSA: Initialize History (DLL)
      historyRef.current = new EditorHistory(content);
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
                  <div className="text-slate-400 text-[10px] font-bold">• {filteredContents.length} Items Found</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="relative w-full sm:w-64 group">
                  <Input
                    placeholder="Fast Search..."
                    value={moveSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm group-hover:border-maroon/30 transition-all font-black uppercase tracking-widest text-[9px]"
                  />
                  <Eye size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-maroon transition-all" />
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl items-center gap-1 border border-slate-200 dark:border-slate-800">
                  <button onClick={() => setSortBy('name')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${sortBy === 'name' ? 'bg-white dark:bg-slate-800 text-maroon shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Name</button>
                  <button onClick={() => setSortBy('date')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${sortBy === 'date' ? 'bg-white dark:bg-slate-800 text-maroon shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Date</button>
                  <button onClick={() => setSortBy('size')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${sortBy === 'size' ? 'bg-white dark:bg-slate-800 text-maroon shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Size</button>
                  <div className="w-px h-3 bg-slate-300 dark:bg-slate-700 mx-1" />
                  <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-1.5 text-slate-400 hover:text-maroon transition-colors">
                    {sortOrder === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownZA size={14} />}
                  </button>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => openInputModal('create_folder')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 md:px-6 py-3 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-sm hover:border-[#8b1D1D]/30 transition-all"
                  >
                    <Plus size={16} />
                    <span>New Folder</span>
                  </button>
                  <button
                    onClick={() => openInputModal('create_file')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 md:px-6 py-3 bg-[#8b1D1D] text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-[#8b1D1D]/20 hover:-translate-y-0.5 transition-all"
                  >
                    <FilePlus size={16} />
                    <span>New File</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {getSortedItems(filteredContents).length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[40px]">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-3xl flex items-center justify-center text-slate-200 dark:text-slate-800">
                    <FolderOpen size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Empty or No Match</p>
                    <p className="text-slate-300 dark:text-slate-700 text-[10px] font-medium italic px-10">Start by creating a new folder or file, or clear your search.</p>
                  </div>
                </div>
              ) : (
                getSortedItems(filteredContents).map((item, idx) => (
                  <RecursiveItem
                    key={item.id}
                    index={idx + 1}
                    item={item}
                    onTag={() => showToast('Tag feature active!', 'success')}
                    onFav={() => handeToggleFav(item)}
                    onPin={() => handleTogglePin(item)}
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
                onClick={() => router.push("/user")}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16">
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
      <Modal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        title={`Move ${activeItem?.name || activeItem?.title || 'Item'}`}
        maxWidth="max-w-2xl"
        footer={<div className="flex items-center justify-between w-full pt-1">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-slate-400">
            <span className="opacity-50">To:</span>
            <span className="text-[#8b1D1D] bg-maroon/5 px-2 py-0.5 rounded border border-maroon/10">{modalMoveContext?.name || 'Root'}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsMoveModalOpen(false)} className="rounded-xl h-9 px-4 text-xs">Cancel</Button>
            <Button
              onClick={() => handleMoveTo(modalMoveContext?.id || null)}
              className="bg-[#8b1D1D] hover:bg-[#6e171b] text-white rounded-xl h-9 px-6 font-bold uppercase text-[9px] tracking-widest shadow-lg shadow-[#8b1D1D]/20 transition-all active:scale-95"
            >
              Move
            </Button>
          </div>
        </div>}
      >
        <div className="flex flex-col h-[420px] bg-white dark:bg-slate-950 overflow-hidden">
          {/* Breadcrumbs Top Bar - Minimal Finder Style */}
          <div className="flex items-center gap-1 p-2 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <button
              onClick={() => handleBreadcrumbNavigate(-1)}
              className={`text-[10px] font-bold px-2 py-1 rounded transition-all ${!modalMoveContext ? 'bg-white dark:bg-slate-800 shadow-sm text-[#8b1D1D]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Collections
            </button>
            {modalMoveBreadcrumbs.map((crumb, i) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight size={10} className="text-slate-300 shrink-0" />
                <button
                  onClick={() => handleBreadcrumbNavigate(i)}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-all truncate max-w-[100px] ${i === modalMoveBreadcrumbs.length - 1 ? 'bg-white dark:bg-slate-800 shadow-sm text-[#8b1D1D]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Tree - macOS Style */}
            <div className="w-[200px] border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-900/10">
              <div className="p-2.5">
                <span className="text-[8px] font-bold uppercase text-slate-400 tracking-[0.05em] px-2 text-center block">Library</span>
              </div>
              <div className="flex-1 overflow-y-auto px-1 pb-4 custom-scrollbar">
                {moveFolderTree.map(root => (
                  <MoveSidebarItem
                    key={root.id}
                    folder={root}
                    activeId={modalMoveContext?.id || null}
                    expandedIds={expandedFolderIds}
                    onSelect={handleModalNavigate}
                    onToggle={toggleFolderExpansion}
                  />
                ))}
              </div>
            </div>

            {/* Folder Contents Panel - Finder List Style */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-[180px]">
                    <Input
                      placeholder="Search"
                      value={moveSearch}
                      onChange={(e) => setMoveSearch(e.target.value)}
                      className="rounded-md border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 h-7 text-[10px] pl-7"
                    />
                    <Settings className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                  </div>
                  <button
                    onClick={() => setIsCreatingInMove(!isCreatingInMove)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 transition-all"
                    title="New Folder"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* List Header */}
              <div className="flex items-center px-4 py-1.5 border-b border-slate-50 dark:border-slate-900 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex-1">Name</div>
                <div className="w-24">Kind</div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isCreatingInMove && (
                  <div className="p-2 border-b border-slate-50 bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in slide-in-from-top-1">
                    <div className="flex gap-2">
                      <Input
                        autoFocus
                        placeholder="Folder Name"
                        value={newMoveFolderName}
                        onChange={(e) => setNewMoveFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateInMove()}
                        className="rounded border-slate-200 dark:border-slate-800 h-7 text-[10px] flex-1"
                      />
                      <button onClick={handleCreateInMove} className="px-3 bg-[#8b1D1D] text-white rounded text-[10px] font-bold hover:bg-[#6e171b]">Add</button>
                    </div>
                  </div>
                )}

                {isMoveLoading ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="w-5 h-5 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : modalMoveFolders.length === 0 && !isCreatingInMove ? (
                  <div className="flex flex-col items-center justify-center h-40 opacity-30">
                    <FolderOpen size={32} className="text-slate-200 mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-tight">Empty Folder</span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {modalMoveFolders
                      .filter(f => f.name.toLowerCase().includes(moveSearch.toLowerCase()))
                      .map(f => (
                        <div
                          key={f.id}
                          onClick={() => handleModalNavigate(f)}
                          className="flex items-center px-4 py-2 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer group border-b border-slate-50/50 dark:border-slate-900/30"
                        >
                          <div className="flex-1 flex items-center gap-2 min-w-0">
                            <FolderOpen size={14} className="text-blue-500/80 shrink-0" strokeWidth={2.5} />
                            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">{f.name}</span>
                          </div>
                          <div className="w-24 text-[10px] text-slate-400 font-medium whitespace-nowrap">Folder</div>
                          <ChevronRight size={12} className="text-slate-200 group-hover:text-slate-400 ml-2" />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
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
              <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-3 mr-1">
                <button
                  onClick={() => handleUndoRedo('undo')}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-all flex items-center gap-1 group"
                >
                  <ChevronLeft size={18} className="group-active:-translate-x-1 transition-transform" />
                  <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Undo</span>
                </button>
                <button
                  onClick={() => handleUndoRedo('redo')}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-all flex items-center gap-1 group"
                >
                  <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Redo</span>
                  <ChevronRight size={18} className="group-active:translate-x-1 transition-transform" />
                </button>
              </div>
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
