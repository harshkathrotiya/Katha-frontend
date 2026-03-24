"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import { Color } from "@tiptap/extension-text-style/color";
import { TextStyle } from "@tiptap/extension-text-style/text-style";
import { FontFamily } from "@tiptap/extension-text-style/font-family";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import {
  Bold, Italic, Underline as UIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, ListChecks, Quote, Code, Minus,
  Link as LinkIcon, Highlighter, Subscript as SubIcon,
  Superscript as SupIcon, Undo2, Redo2, Save, X,
  ChevronDown, Type, Palette, Search, BookOpen,
  ZoomIn, ZoomOut, Maximize2, Minimize2,
  CheckCheck, AlertCircle, Clock, Printer,
  ChevronLeft, ChevronRight
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface KathaEditorProps {
  fileId: string;
  fileName: string;
  initialContent: string;
  contentFormat?: "html" | "json";
  onSave: (content: string, format: "json", plainText: string) => Promise<void>;
  onClose: () => void;
  readOnly?: boolean;
}
type SaveStatus = "saved" | "saving" | "unsaved" | "error";

// ─── Constants ────────────────────────────────────────────────────────────────
const HIGHLIGHT_COLORS = [
  { color: "#FEF08A", name: "Yellow" },
  { color: "#BBF7D0", name: "Green" },
  { color: "#BFDBFE", name: "Blue" },
  { color: "#FED7AA", name: "Orange" },
  { color: "#F5D0FE", name: "Purple" },
  { color: "#FECACA", name: "Red" },
];

const TEXT_COLORS = [
  { color: "#000000", name: "Black" },
  { color: "#374151", name: "Dark" },
  { color: "#8b1D1D", name: "Maroon" },
  { color: "#dc2626", name: "Red" },
  { color: "#d97706", name: "Amber" },
  { color: "#16a34a", name: "Green" },
  { color: "#2563eb", name: "Blue" },
  { color: "#7c3aed", name: "Purple" },
  { color: "#db2777", name: "Pink" },
];

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Monospace", value: "ui-monospace, monospace" },
  { label: "Noto Sans Gujarati", value: "'Noto Sans Gujarati', sans-serif" },
  { label: "Shruti (Gujarati)", value: "Shruti, sans-serif" },
];

const HEADING_OPTIONS = [
  { label: "Normal text", level: 0, size: "text-sm", weight: "font-normal" },
  { label: "Heading 1", level: 1, size: "text-2xl", weight: "font-bold" },
  { label: "Heading 2", level: 2, size: "text-xl", weight: "font-bold" },
  { label: "Heading 3", level: 3, size: "text-lg", weight: "font-semibold" },
  { label: "Heading 4", level: 4, size: "text-base", weight: "font-semibold" },
];

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function Tooltip({ label, shortcut, children }: {
  label: string; shortcut?: string; children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setPos({ x: rect.left + rect.width / 2, y: rect.bottom + 8 });
        setVisible(true);
      }}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{ left: pos.x, top: pos.y, transform: "translateX(-50%)" }}
        >
          <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg flex items-center gap-2">
            <span>{label}</span>
            {shortcut && (
              <span className="text-gray-400 font-mono text-[10px]">{shortcut}</span>
            )}
          </div>
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"
            style={{ marginTop: "-4px", zIndex: -1 }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────
function TBtn({
  onClick, active = false, disabled = false, label, shortcut, children, wide = false
}: {
  onClick: () => void; active?: boolean; disabled?: boolean;
  label: string; shortcut?: string; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <Tooltip label={label} shortcut={shortcut}>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); if (!disabled) onClick(); }}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center rounded transition-all duration-100 select-none
          ${wide ? "h-7 px-2 gap-1" : "h-7 w-7"}
          ${active
            ? "bg-[#c2e0f4] dark:bg-[#1e3a5f] text-[#0d47a1] dark:text-[#90caf9]"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }
          ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function TDivider() {
  return <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1 shrink-0" />;
}

// ─── Dropdown wrapper with outside-click close ────────────────────────────────
function DropdownPanel({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-xl z-[500] py-1"
      style={{ minWidth: 160 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

// ─── Main Editor ─────────────────────────────────────────────────────────────
export default function KathaEditor({
  fileId, fileName, initialContent, contentFormat = "html",
  onSave, onClose, readOnly = false
}: KathaEditorProps) {

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCount, setSearchCount] = useState(0);
  const [linkUrl, setLinkUrl] = useState("");

  // Which dropdown is open — only one at a time
  const [openDropdown, setOpenDropdown] = useState<
    "heading" | "font" | "highlight" | "textcolor" | "link" | null
  >(null);

  const [focusMode, setFocusMode] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  const toggle = (d: typeof openDropdown) =>
    setOpenDropdown(prev => (prev === d ? null : d));
  const closeAll = () => setOpenDropdown(null);

  // ── Parse initial content ─────────────────────────────────────────────────
  const parseInitialContent = useCallback((): string => {
    if (!initialContent || initialContent === "<p><br></p>" || initialContent === "") return "";
    if (contentFormat === "json") {
      try { JSON.parse(initialContent); return initialContent; } catch {}
    }
    return initialContent;
  }, [initialContent, contentFormat]);

  // ── Editor ────────────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: { HTMLAttributes: { class: "ke-code-block" } },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Typography,
      CharacterCount,
      Placeholder.configure({
        placeholder: "Start writing…",
        emptyEditorClass: "ke-empty",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "ke-link", target: "_blank", rel: "noopener noreferrer" },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Subscript,
      Superscript,
    ],
    content: parseInitialContent(),
    editable: !readOnly,
    autofocus: !readOnly,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      setCharCount(editor.storage.characterCount?.characters() ?? text.length);
      setSaveStatus("unsaved");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        handleAutoSave(editor.getJSON(), editor.getText());
      }, 2000);
    },
  });

  // Initial counts
  useEffect(() => {
    if (!editor) return;
    const text = editor.getText();
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    setCharCount(editor.storage.characterCount?.characters() ?? text.length);
    lastSavedRef.current = JSON.stringify(editor.getJSON());
  }, [editor]);

  useEffect(() => () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "s") { e.preventDefault(); handleManualSave(); }
      if (mod && e.key === "f") { e.preventDefault(); setShowSearch(s => !s); }
      if (e.key === "Escape") { closeAll(); setShowSearch(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [editor]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleAutoSave = useCallback(async (json: any, text: string) => {
    const str = JSON.stringify(json);
    if (str === lastSavedRef.current) return;
    setSaveStatus("saving");
    try {
      await onSave(str, "json", text);
      lastSavedRef.current = str;
      setSaveStatus("saved");
    } catch { setSaveStatus("error"); }
  }, [onSave]);

  const handleManualSave = useCallback(async () => {
    if (!editor) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    try {
      const str = JSON.stringify(editor.getJSON());
      await onSave(str, "json", editor.getText());
      lastSavedRef.current = str;
      setSaveStatus("saved");
    } catch { setSaveStatus("error"); }
  }, [editor, onSave]);

  // ── Link ──────────────────────────────────────────────────────────────────
  const applyLink = () => {
    if (!editor) return;
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}` }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    closeAll();
    setLinkUrl("");
  };

  // ── Search ────────────────────────────────────────────────────────────────
  const doSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (!editor || !q.trim()) { setSearchCount(0); return; }
    const matches = [...editor.getText().matchAll(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"))];
    setSearchCount(matches.length);
  }, [editor]);

  if (!editor) return null;

  // ── Active heading label ──────────────────────────────────────────────────
  const activeHeading = HEADING_OPTIONS.find(h =>
    h.level === 0 ? !editor.isActive("heading") : editor.isActive("heading", { level: h.level })
  ) ?? HEADING_OPTIONS[0];

  // ── Save status ───────────────────────────────────────────────────────────
  const statusMap = {
    saved:   { icon: <CheckCheck size={12} />, text: "Saved",        cls: "text-green-600 dark:text-green-400" },
    saving:  { icon: <Clock size={12} className="animate-spin" />,    text: "Saving…",     cls: "text-gray-400" },
    unsaved: { icon: <div className="w-2 h-2 rounded-full bg-amber-400" />, text: "Unsaved", cls: "text-amber-500" },
    error:   { icon: <AlertCircle size={12} />, text: "Error",        cls: "text-red-500" },
  };
  const st = statusMap[saveStatus];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={`fixed inset-0 z-[200] flex flex-col ${focusMode ? "bg-[#f0f0f0] dark:bg-[#1a1a1a]" : "bg-[#f0f0f0] dark:bg-[#1a1a1a]"}`}>

      {/* ══ TOP CHROME (Title bar) ══════════════════════════════════════════ */}
      <div className={`shrink-0 bg-white dark:bg-[#1f1f1f] border-b border-gray-200 dark:border-gray-700 ${focusMode ? "opacity-0 hover:opacity-100 transition-opacity duration-300 absolute top-0 left-0 right-0 z-20" : ""}`}>

        {/* ── Title row ── */}
        <div className="flex items-center h-11 px-3 gap-2">
          {/* Close */}
          <Tooltip label="Close editor">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </Tooltip>

          {/* Doc icon */}
          <div className="w-7 h-7 rounded flex items-center justify-center bg-[#4285f4]/10 shrink-0">
            <BookOpen size={14} className="text-[#4285f4]" />
          </div>

          {/* Title */}
          <h1 className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate min-w-0">
            {fileName}
          </h1>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Save status */}
            <div className={`flex items-center gap-1.5 text-[11px] mr-1 ${st.cls}`}>
              {st.icon}
              <span className="hidden sm:inline">{st.text}</span>
            </div>

            {/* Search */}
            <Tooltip label="Find" shortcut="Ctrl+F">
              <button
                onClick={() => setShowSearch(s => !s)}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors
                  ${showSearch ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"}`}
              >
                <Search size={15} />
              </button>
            </Tooltip>

            {/* Focus mode */}
            <Tooltip label={focusMode ? "Exit focus mode" : "Focus mode"}>
              <button
                onClick={() => setFocusMode(f => !f)}
                className={`w-8 h-8 hidden sm:flex items-center justify-center rounded transition-colors
                  ${focusMode ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"}`}
              >
                {focusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </Tooltip>

            {/* Zoom */}
            <div className="hidden sm:flex items-center border border-gray-200 dark:border-gray-600 rounded overflow-hidden">
              <Tooltip label="Zoom out">
                <button
                  onClick={() => setZoom(z => Math.max(60, z - 10))}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ZoomOut size={13} />
                </button>
              </Tooltip>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 w-10 text-center border-x border-gray-200 dark:border-gray-600 font-medium">
                {zoom}%
              </span>
              <Tooltip label="Zoom in">
                <button
                  onClick={() => setZoom(z => Math.min(150, z + 10))}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ZoomIn size={13} />
                </button>
              </Tooltip>
            </div>

            {/* Save */}
            {!readOnly && (
              <Tooltip label="Save" shortcut="Ctrl+S">
                <button
                  onClick={handleManualSave}
                  disabled={saveStatus === "saving"}
                  className="flex items-center gap-1.5 h-8 px-3 bg-[#1a73e8] hover:bg-[#1765cc] text-white rounded text-xs font-medium transition-colors disabled:opacity-60 ml-1"
                >
                  <Save size={13} />
                  <span className="hidden sm:inline">Save</span>
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* ── Search bar ── */}
        {showSearch && (
          <div className="flex items-center gap-2 px-3 pb-2 border-t border-gray-100 dark:border-gray-700 pt-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => doSearch(e.target.value)}
                placeholder="Find in document"
                className="pl-8 pr-3 h-7 w-52 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-white"
              />
            </div>
            {searchQuery && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {searchCount} {searchCount === 1 ? "result" : "results"}
              </span>
            )}
            <button onClick={() => { setShowSearch(false); setSearchQuery(""); }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ══ TOOLBAR ═══════════════════════════════════════════════════════ */}
        {!readOnly && (
          <div className="flex items-center h-9 px-2 gap-0.5 overflow-x-auto no-scrollbar border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1f1f1f]">

            {/* Undo / Redo */}
            <TBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} label="Undo" shortcut="Ctrl+Z">
              <Undo2 size={14} />
            </TBtn>
            <TBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} label="Redo" shortcut="Ctrl+Shift+Z">
              <Redo2 size={14} />
            </TBtn>

            <TDivider />

            {/* Heading dropdown */}
            <div className="relative shrink-0">
              <Tooltip label="Text style">
                <button
                  onMouseDown={(e) => { e.preventDefault(); toggle("heading"); }}
                  className="flex items-center gap-1 h-7 px-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors min-w-[120px] justify-between"
                >
                  <span>{activeHeading.label}</span>
                  <ChevronDown size={12} className="text-gray-400 shrink-0" />
                </button>
              </Tooltip>
              {openDropdown === "heading" && (
                <DropdownPanel onClose={closeAll}>
                  {HEADING_OPTIONS.map(h => (
                    <button
                      key={h.level}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (h.level === 0) editor.chain().focus().setParagraph().run();
                        else editor.chain().focus().toggleHeading({ level: h.level as any }).run();
                        closeAll();
                      }}
                      className={`w-full text-left px-3 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700
                        ${(h.level === 0 ? !editor.isActive("heading") : editor.isActive("heading", { level: h.level as any }))
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
                        }`}
                    >
                      <span className={`${h.size} ${h.weight} block leading-tight`} style={{
                        ...(h.level === 1 ? { color: "#8b1D1D" } : h.level === 2 ? { color: "#8b1D1D" } : {})
                      }}>
                        {h.label}
                      </span>
                    </button>
                  ))}
                </DropdownPanel>
              )}
            </div>

            <TDivider />

            {/* Font family */}
            <div className="relative shrink-0">
              <Tooltip label="Font">
                <button
                  onMouseDown={(e) => { e.preventDefault(); toggle("font"); }}
                  className="flex items-center gap-1 h-7 px-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Type size={13} />
                  <ChevronDown size={11} className="text-gray-400" />
                </button>
              </Tooltip>
              {openDropdown === "font" && (
                <DropdownPanel onClose={closeAll}>
                  {FONT_FAMILIES.map(f => (
                    <button
                      key={f.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        f.value ? editor.chain().focus().setFontFamily(f.value).run()
                          : editor.chain().focus().unsetFontFamily().run();
                        closeAll();
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      style={{ fontFamily: f.value || "inherit" }}
                    >
                      {f.label}
                    </button>
                  ))}
                </DropdownPanel>
              )}
            </div>

            <TDivider />

            {/* Bold / Italic / Underline / Strike */}
            <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Bold" shortcut="Ctrl+B">
              <Bold size={14} />
            </TBtn>
            <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="Italic" shortcut="Ctrl+I">
              <Italic size={14} />
            </TBtn>
            <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="Underline" shortcut="Ctrl+U">
              <UIcon size={14} />
            </TBtn>
            <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} label="Strikethrough">
              <Strikethrough size={14} />
            </TBtn>

            <TDivider />

            {/* Text color */}
            <div className="relative shrink-0">
              <Tooltip label="Text color">
                <button
                  onMouseDown={(e) => { e.preventDefault(); toggle("textcolor"); }}
                  className="flex flex-col items-center justify-center h-7 w-7 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors gap-0"
                >
                  <Palette size={13} className="text-gray-700 dark:text-gray-300" />
                  <div className="w-4 h-1 rounded-sm mt-0.5" style={{ backgroundColor: editor.getAttributes("textStyle").color || "#000000" }} />
                </button>
              </Tooltip>
              {openDropdown === "textcolor" && (
                <DropdownPanel onClose={closeAll}>
                  <div className="px-2 py-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-medium">Text color</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {TEXT_COLORS.map(({ color, name }) => (
                        <Tooltip key={color} label={name}>
                          <button
                            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(color).run(); closeAll(); }}
                            className="w-6 h-6 rounded border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        </Tooltip>
                      ))}
                    </div>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); closeAll(); }}
                      className="mt-2 w-full text-[11px] text-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      Remove color
                    </button>
                  </div>
                </DropdownPanel>
              )}
            </div>

            {/* Highlight */}
            <div className="relative shrink-0">
              <Tooltip label="Highlight color">
                <button
                  onMouseDown={(e) => { e.preventDefault(); toggle("highlight"); }}
                  className={`flex flex-col items-center justify-center h-7 w-7 rounded transition-colors gap-0
                    ${editor.isActive("highlight") ? "bg-[#c2e0f4] dark:bg-[#1e3a5f]" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                >
                  <Highlighter size={13} className="text-gray-700 dark:text-gray-300" />
                  <div className="w-4 h-1 rounded-sm mt-0.5 bg-yellow-300" />
                </button>
              </Tooltip>
              {openDropdown === "highlight" && (
                <DropdownPanel onClose={closeAll}>
                  <div className="px-2 py-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-medium">Highlight color</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {HIGHLIGHT_COLORS.map(({ color, name }) => (
                        <Tooltip key={color} label={name}>
                          <button
                            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setHighlight({ color }).run(); closeAll(); }}
                            className="w-6 h-6 rounded border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        </Tooltip>
                      ))}
                    </div>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); closeAll(); }}
                      className="mt-2 w-full text-[11px] text-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      Remove highlight
                    </button>
                  </div>
                </DropdownPanel>
              )}
            </div>

            <TDivider />

            {/* Subscript / Superscript */}
            <TBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} label="Subscript">
              <SubIcon size={14} />
            </TBtn>
            <TBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} label="Superscript">
              <SupIcon size={14} />
            </TBtn>

            <TDivider />

            {/* Alignment */}
            <TBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} label="Align left" shortcut="Ctrl+Shift+L">
              <AlignLeft size={14} />
            </TBtn>
            <TBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} label="Align center" shortcut="Ctrl+Shift+E">
              <AlignCenter size={14} />
            </TBtn>
            <TBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} label="Align right" shortcut="Ctrl+Shift+R">
              <AlignRight size={14} />
            </TBtn>
            <TBtn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} label="Justify" shortcut="Ctrl+Shift+J">
              <AlignJustify size={14} />
            </TBtn>

            <TDivider />

            {/* Lists */}
            <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Bullet list" shortcut="Ctrl+Shift+8">
              <List size={14} />
            </TBtn>
            <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Numbered list" shortcut="Ctrl+Shift+7">
              <ListOrdered size={14} />
            </TBtn>
            <TBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} label="Checklist">
              <ListChecks size={14} />
            </TBtn>

            <TDivider />

            {/* Blockquote / Code / Rule */}
            <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="Quote" shortcut="Ctrl+Shift+B">
              <Quote size={14} />
            </TBtn>
            <TBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} label="Inline code" shortcut="Ctrl+E">
              <Code size={14} />
            </TBtn>
            <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Horizontal line">
              <Minus size={14} />
            </TBtn>

            <TDivider />

            {/* Link */}
            <div className="relative shrink-0">
              <TBtn
                onClick={() => {
                  if (editor.isActive("link")) {
                    editor.chain().focus().unsetLink().run();
                  } else {
                    setLinkUrl(editor.getAttributes("link").href || "");
                    toggle("link");
                  }
                }}
                active={editor.isActive("link")}
                label="Insert link"
                shortcut="Ctrl+K"
              >
                <LinkIcon size={14} />
              </TBtn>
              {openDropdown === "link" && (
                <DropdownPanel onClose={closeAll}>
                  <div className="px-3 py-2 flex flex-col gap-2" style={{ minWidth: 260 }}>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Insert link</p>
                    <input
                      autoFocus
                      type="url"
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && applyLink()}
                      placeholder="https://example.com"
                      className="h-8 px-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-white w-full"
                    />
                    <div className="flex gap-2">
                      <button
                        onMouseDown={(e) => { e.preventDefault(); applyLink(); }}
                        className="flex-1 h-7 bg-[#1a73e8] text-white text-xs font-medium rounded hover:bg-[#1765cc] transition-colors"
                      >
                        Apply
                      </button>
                      <button
                        onMouseDown={(e) => { e.preventDefault(); closeAll(); }}
                        className="flex-1 h-7 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs font-medium rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </DropdownPanel>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ══ DOCUMENT CANVAS ════════════════════════════════════════════════ */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: focusMode ? "#e8e8e8" : "#e8e8e8" }}
        onClick={closeAll}
      >
        <div
          className="mx-auto my-8"
          style={{
            width: `${Math.min(816, 816 * zoom / 100)}px`,
            transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
            transformOrigin: zoom !== 100 ? "top center" : undefined,
          }}
        >
          {/* Page shadow + white background — exactly like Google Docs */}
          <div
            className="bg-white dark:bg-[#2d2d2d] relative"
            style={{
              boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
              minHeight: "1056px",
              padding: "72px 72px 96px",
            }}
          >
            <EditorContent editor={editor} className="ke-doc" />
          </div>
        </div>

        {/* Spacer at bottom */}
        <div className="h-12" />
      </div>

      {/* ══ STATUS BAR ══════════════════════════════════════════════════════ */}
      <div className="shrink-0 flex items-center justify-between px-4 h-6 bg-[#1a73e8] text-white">
        <div className="flex items-center gap-4 text-[11px]">
          <span>{wordCount.toLocaleString()} words</span>
          <span className="hidden sm:inline">{charCount.toLocaleString()} characters</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] opacity-80">
          {!readOnly && <span className="hidden md:inline">Ctrl+S · save  •  Ctrl+F · find</span>}
          <span>ProseMirror</span>
        </div>
      </div>

    </div>
  );
}
