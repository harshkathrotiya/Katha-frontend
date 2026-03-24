"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-text-style/color";
import { TextStyle } from "@tiptap/extension-text-style/text-style";
import { FontFamily } from "@tiptap/extension-text-style/font-family";
import { FontSize } from "@tiptap/extension-text-style/font-size";
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
  CheckCheck, AlertCircle, Clock
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
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
type DropdownKey = "heading" | "font" | "fontsize" | "highlight" | "textcolor" | "lineheight" | "link" | null;

// ─── Constants ────────────────────────────────────────────────────────────────
const MAROON = "#8b1D1D";

const HIGHLIGHT_COLORS = [
  { c: "#FEF08A", n: "Yellow" }, { c: "#BBF7D0", n: "Green" },
  { c: "#BFDBFE", n: "Blue" },  { c: "#FED7AA", n: "Orange" },
  { c: "#F5D0FE", n: "Purple" },{ c: "#FECACA", n: "Red" },
  { c: "#E2E8F0", n: "Gray" },
];

const TEXT_COLORS = [
  { c: "#111827", n: "Black" }, { c: MAROON,    n: "Maroon" },
  { c: "#dc2626", n: "Red" },   { c: "#d97706", n: "Amber" },
  { c: "#16a34a", n: "Green" }, { c: "#2563eb", n: "Blue" },
  { c: "#7c3aed", n: "Purple" },{ c: "#db2777", n: "Pink" },
  { c: "#6b7280", n: "Gray" },
];

const FONT_FAMILIES = [
  { label: "Default",              value: "" },
  { label: "Georgia (Serif)",      value: "Georgia, serif" },
  { label: "Courier (Mono)",       value: "'Courier New', monospace" },
  { label: "Noto Sans Gujarati",   value: "'Noto Sans Gujarati', sans-serif" },
  { label: "Shruti (Gujarati)",    value: "Shruti, sans-serif" },
];

const FONT_SIZES = ["8","9","10","11","12","14","16","18","20","24","28","32","36","48","60","72"];

const HEADING_OPTIONS = [
  { label: "Normal text", level: 0 },
  { label: "Heading 1",   level: 1 },
  { label: "Heading 2",   level: 2 },
  { label: "Heading 3",   level: 3 },
  { label: "Heading 4",   level: 4 },
];

const LINE_HEIGHTS = [
  { label: "Single",   value: "1" },
  { label: "1.15",     value: "1.15" },
  { label: "1.5",      value: "1.5" },
  { label: "Double",   value: "2" },
];

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function Tip({ label, shortcut, children }: {
  label: string; shortcut?: string; children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => { setRect(ref.current?.getBoundingClientRect() ?? null); setShow(true); }}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && rect && (
        <span
          className="fixed z-[9999] pointer-events-none"
          style={{ left: rect.left + rect.width / 2, top: rect.bottom + 6 }}
        >
          <span
            className="relative -translate-x-1/2 inline-flex items-center gap-1.5 bg-gray-900 text-white text-[11px] rounded px-2 py-1 whitespace-nowrap shadow-lg"
            style={{ transform: "translateX(-50%)" }}
          >
            {label}
            {shortcut && <span className="text-gray-400 font-mono text-[10px]">{shortcut}</span>}
          </span>
        </span>
      )}
    </span>
  );
}

// ─── Toolbar button ───────────────────────────────────────────────────────────
function TB({
  onClick, active = false, disabled = false, label, shortcut, children, wide = false,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean;
  label: string; shortcut?: string; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <Tip label={label} shortcut={shortcut}>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); if (!disabled) onClick(); }}
        disabled={disabled}
        className={[
          "inline-flex items-center justify-center rounded select-none transition-all duration-100",
          wide ? "h-7 px-2 gap-1 text-xs" : "h-7 w-7",
          active
            ? "text-white shadow-sm"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
          disabled ? "opacity-35 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
        style={active ? { backgroundColor: MAROON } : {}}
      >
        {children}
      </button>
    </Tip>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5 shrink-0" />;
}

// ─── Dropdown panel ───────────────────────────────────────────────────────────
function Dropdown({
  onClose, children, style,
}: { onClose: () => void; children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    // small delay so the opening click doesn't immediately close it
    const t = setTimeout(() => document.addEventListener("mousedown", fn), 50);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", fn); };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 z-[600] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-xl overflow-hidden"
      style={{ minWidth: 160, ...style }}
      onMouseDown={(e) => e.preventDefault()} // keep editor focus
    >
      {children}
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────
export default function KathaEditor({
  fileId, fileName, initialContent, contentFormat = "html",
  onSave, onClose, readOnly = false,
}: KathaEditorProps) {

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCount, setSearchCount] = useState(0);
  const [linkUrl, setLinkUrl] = useState("");
  const [openDD, setOpenDD] = useState<DropdownKey>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [lineHeight, setLineHeight] = useState("1.8");
  const [fontSize, setFontSize] = useState("11");

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  const tog = (k: DropdownKey) => setOpenDD(p => p === k ? null : k);
  const closeDD = () => setOpenDD(null);

  // ── Parse content ──────────────────────────────────────────────────────────
  const parseContent = useCallback((): string => {
    if (!initialContent || initialContent === "<p><br></p>" || !initialContent.trim()) return "";
    if (contentFormat === "json") {
      try { JSON.parse(initialContent); return initialContent; } catch {}
    }
    return initialContent;
  }, [initialContent, contentFormat]);

  // ── Editor setup ───────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        // disable built-in typography rules that break Gujarati
        codeBlock: {
          HTMLAttributes: { class: "ke-pre" },
        },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph", "blockquote"] }),
      CharacterCount,
      Placeholder.configure({
        placeholder: "Start writing…",
        emptyNodeClass: "ke-placeholder",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "ke-link", rel: "noopener noreferrer" },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Subscript,
      Superscript,
    ],
    content: parseContent(),
    editable: !readOnly,
    autofocus: !readOnly,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      setCharCount(editor.storage.characterCount?.characters() ?? text.length);
      setSaveStatus("unsaved");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => autoSave(editor.getJSON(), text), 2000);
    },
    onSelectionUpdate: ({ editor }) => {
      // sync font size display
      const sz = editor.getAttributes("textStyle").fontSize;
      if (sz) setFontSize(sz.replace("pt", "").replace("px", ""));
    },
  });

  // Initial counts
  useEffect(() => {
    if (!editor) return;
    const t = editor.getText();
    setWordCount(t.trim() ? t.trim().split(/\s+/).length : 0);
    setCharCount(editor.storage.characterCount?.characters() ?? t.length);
    lastSavedRef.current = JSON.stringify(editor.getJSON());
  }, [editor]);

  useEffect(() => () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "s") { e.preventDefault(); doSave(); }
      if (mod && e.key === "f") { e.preventDefault(); setShowSearch(s => !s); }
      if (e.key === "Escape") { closeDD(); setShowSearch(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [editor]);

  // ── Save ───────────────────────────────────────────────────────────────────
  const autoSave = useCallback(async (json: any, text: string) => {
    const s = JSON.stringify(json);
    if (s === lastSavedRef.current) return;
    setSaveStatus("saving");
    try {
      await onSave(s, "json", text);
      lastSavedRef.current = s;
      setSaveStatus("saved");
    } catch { setSaveStatus("error"); }
  }, [onSave]);

  const doSave = useCallback(async () => {
    if (!editor) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    try {
      const s = JSON.stringify(editor.getJSON());
      await onSave(s, "json", editor.getText());
      lastSavedRef.current = s;
      setSaveStatus("saved");
    } catch { setSaveStatus("error"); }
  }, [editor, onSave]);

  // ── Link ───────────────────────────────────────────────────────────────────
  const applyLink = () => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (url) {
      editor.chain().focus().setLink({ href: url.startsWith("http") ? url : `https://${url}` }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    closeDD();
    setLinkUrl("");
  };

  // ── Search ─────────────────────────────────────────────────────────────────
  const doSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (!editor || !q.trim()) { setSearchCount(0); return; }
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    setSearchCount([...editor.getText().matchAll(rx)].length);
  }, [editor]);

  if (!editor) return null;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const activeHeading = HEADING_OPTIONS.find(h =>
    h.level === 0 ? !editor.isActive("heading") : editor.isActive("heading", { level: h.level as any })
  ) ?? HEADING_OPTIONS[0];

  const stMap: Record<SaveStatus, { icon: React.ReactNode; label: string; cls: string }> = {
    saved:   { icon: <CheckCheck size={12} />,                                                    label: "Saved",    cls: "text-green-600 dark:text-green-400" },
    saving:  { icon: <Clock size={12} className="animate-spin opacity-60" />,                    label: "Saving…",  cls: "text-gray-400" },
    unsaved: { icon: <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mt-0.5" />, label: "Unsaved",  cls: "text-amber-500" },
    error:   { icon: <AlertCircle size={12} />,                                                   label: "Error",    cls: "text-red-500" },
  };
  const st = stMap[saveStatus];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: "#f8f9fa" }}>

      {/* ══ TITLE BAR ═══════════════════════════════════════════════════════ */}
      <div
        className={[
          "shrink-0 bg-white dark:bg-[#1f1f1f] border-b border-gray-200 dark:border-gray-700 transition-opacity duration-300",
          focusMode ? "opacity-0 hover:opacity-100 absolute top-0 left-0 right-0 z-30" : "",
        ].join(" ")}
      >
        {/* Top row */}
        <div className="flex items-center h-11 px-3 gap-2 border-b border-gray-100 dark:border-gray-800">
          <Tip label="Close">
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors shrink-0">
              <X size={16} />
            </button>
          </Tip>

          {/* Icon */}
          <div className="w-7 h-7 rounded flex items-center justify-center shrink-0"
            style={{ background: `${MAROON}15` }}>
            <BookOpen size={14} style={{ color: MAROON }} />
          </div>

          {/* Title */}
          <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate min-w-0 select-none">
            {fileName}
          </span>
          {readOnly && (
            <span className="text-[10px] px-2 py-0.5 rounded border font-semibold shrink-0"
              style={{ color: MAROON, borderColor: `${MAROON}40`, background: `${MAROON}08` }}>
              Read only
            </span>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Save status */}
            <div className={`flex items-center gap-1 text-[11px] font-medium mr-1 ${st.cls}`}>
              {st.icon}
              <span className="hidden sm:inline">{st.label}</span>
            </div>

            {/* Search */}
            <Tip label="Find" shortcut="Ctrl+F">
              <button onClick={() => setShowSearch(s => !s)}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors
                  ${showSearch ? "text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"}`}
                style={showSearch ? { background: MAROON } : {}}>
                <Search size={15} />
              </button>
            </Tip>

            {/* Focus mode */}
            <Tip label={focusMode ? "Exit focus" : "Focus mode"}>
              <button onClick={() => setFocusMode(f => !f)}
                className={`w-8 h-8 hidden sm:flex items-center justify-center rounded transition-colors
                  ${focusMode ? "text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"}`}
                style={focusMode ? { background: MAROON } : {}}>
                {focusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </Tip>

            {/* Zoom */}
            <div className="hidden sm:flex items-center border border-gray-200 dark:border-gray-600 rounded overflow-hidden h-7 ml-1">
              <Tip label="Zoom out">
                <button onClick={() => setZoom(z => Math.max(50, z - 10))}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-r border-gray-200 dark:border-gray-600">
                  <ZoomOut size={12} />
                </button>
              </Tip>
              <span className="text-[11px] text-gray-600 dark:text-gray-400 w-11 text-center select-none font-medium">
                {zoom}%
              </span>
              <Tip label="Zoom in">
                <button onClick={() => setZoom(z => Math.min(200, z + 10))}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-l border-gray-200 dark:border-gray-600">
                  <ZoomIn size={12} />
                </button>
              </Tip>
            </div>

            {/* Save button */}
            {!readOnly && (
              <Tip label="Save" shortcut="Ctrl+S">
                <button onClick={doSave} disabled={saveStatus === "saving"}
                  className="flex items-center gap-1.5 h-8 px-3 text-white text-xs font-semibold rounded transition-colors disabled:opacity-60 ml-1"
                  style={{ background: MAROON }}>
                  <Save size={13} />
                  <span className="hidden sm:inline">Save</span>
                </button>
              </Tip>
            )}
          </div>
        </div>

        {/* Search row */}
        {showSearch && (
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input autoFocus type="text" value={searchQuery}
                onChange={e => doSearch(e.target.value)}
                placeholder="Find in document…"
                className="pl-7 pr-3 h-7 w-52 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none bg-white dark:bg-gray-800 dark:text-white"
                style={{ "--tw-ring-color": MAROON, focusBorderColor: MAROON } as any}
                onFocus={e => (e.target.style.borderColor = MAROON)}
                onBlur={e => (e.target.style.borderColor = "")}
              />
            </div>
            {searchQuery && (
              <span className="text-xs text-gray-500">
                {searchCount} result{searchCount !== 1 ? "s" : ""}
              </span>
            )}
            <button onClick={() => { setShowSearch(false); doSearch(""); }}
              className="text-gray-400 hover:text-gray-600 ml-auto">
              <X size={13} />
            </button>
          </div>
        )}

        {/* ══ TOOLBAR ══════════════════════════════════════════════════════ */}
        {!readOnly && (
          <div className="flex items-center h-9 px-2 gap-0.5 overflow-x-auto scrollbar-none bg-white dark:bg-[#1f1f1f]">

            {/* Undo / Redo */}
            <TB onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} label="Undo" shortcut="Ctrl+Z">
              <Undo2 size={14} />
            </TB>
            <TB onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} label="Redo" shortcut="Ctrl+Y">
              <Redo2 size={14} />
            </TB>

            <Sep />

            {/* Heading style */}
            <div className="relative shrink-0">
              <Tip label="Text style">
                <button
                  onMouseDown={(e) => { e.preventDefault(); tog("heading"); }}
                  className="flex items-center gap-1 h-7 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[126px] justify-between text-xs text-gray-700 dark:text-gray-200 font-medium"
                >
                  <span>{activeHeading.label}</span>
                  <ChevronDown size={12} className="text-gray-400 shrink-0" />
                </button>
              </Tip>
              {openDD === "heading" && (
                <Dropdown onClose={closeDD} style={{ minWidth: 180 }}>
                  {HEADING_OPTIONS.map(h => (
                    <button key={h.level}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        h.level === 0
                          ? editor.chain().focus().setParagraph().run()
                          : editor.chain().focus().toggleHeading({ level: h.level as any }).run();
                        closeDD();
                      }}
                      className={`w-full text-left px-4 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 ${
                        (h.level === 0 ? !editor.isActive("heading") : editor.isActive("heading", { level: h.level as any }))
                          ? "font-semibold" : ""
                      }`}
                    >
                      <span
                        className="block leading-tight"
                        style={{
                          fontSize: h.level === 0 ? 13 : h.level === 1 ? 20 : h.level === 2 ? 16 : h.level === 3 ? 14 : 13,
                          fontWeight: h.level === 0 ? 400 : 700,
                          color: h.level <= 2 && h.level > 0 ? MAROON : "inherit",
                        }}
                      >
                        {h.label}
                      </span>
                    </button>
                  ))}
                </Dropdown>
              )}
            </div>

            <Sep />

            {/* Font family */}
            <div className="relative shrink-0">
              <Tip label="Font family">
                <button
                  onMouseDown={(e) => { e.preventDefault(); tog("font"); }}
                  className="flex items-center gap-1 h-7 px-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                >
                  <Type size={14} />
                  <ChevronDown size={11} className="text-gray-400" />
                </button>
              </Tip>
              {openDD === "font" && (
                <Dropdown onClose={closeDD} style={{ minWidth: 200 }}>
                  {FONT_FAMILIES.map(f => (
                    <button key={f.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        f.value ? editor.chain().focus().setFontFamily(f.value).run()
                          : editor.chain().focus().unsetFontFamily().run();
                        closeDD();
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                      style={{ fontFamily: f.value || "inherit" }}
                    >
                      {f.label}
                    </button>
                  ))}
                </Dropdown>
              )}
            </div>

            {/* Font size */}
            <div className="relative shrink-0">
              <Tip label="Font size">
                <button
                  onMouseDown={(e) => { e.preventDefault(); tog("fontsize"); }}
                  className="flex items-center gap-0.5 h-7 px-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs text-gray-700 dark:text-gray-300 font-medium min-w-[38px] justify-center border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                >
                  {fontSize}
                  <ChevronDown size={10} className="text-gray-400" />
                </button>
              </Tip>
              {openDD === "fontsize" && (
                <Dropdown onClose={closeDD} style={{ minWidth: 80, maxHeight: 240, overflowY: "auto" }}>
                  {FONT_SIZES.map(s => (
                    <button key={s}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        editor.chain().focus().setFontSize(`${s}pt`).run();
                        setFontSize(s);
                        closeDD();
                      }}
                      className={`w-full text-left px-4 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                        ${fontSize === s ? "font-semibold" : "text-gray-700 dark:text-gray-300"}`}
                      style={fontSize === s ? { color: MAROON } : {}}
                    >
                      {s}
                    </button>
                  ))}
                </Dropdown>
              )}
            </div>

            <Sep />

            {/* Bold / Italic / Underline / Strike */}
            <TB onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Bold" shortcut="Ctrl+B">
              <Bold size={14} />
            </TB>
            <TB onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="Italic" shortcut="Ctrl+I">
              <Italic size={14} />
            </TB>
            <TB onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="Underline" shortcut="Ctrl+U">
              <UIcon size={14} />
            </TB>
            <TB onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} label="Strikethrough">
              <Strikethrough size={14} />
            </TB>

            <Sep />

            {/* Text color */}
            <div className="relative shrink-0">
              <Tip label="Text color">
                <button
                  onMouseDown={(e) => { e.preventDefault(); tog("textcolor"); }}
                  className="inline-flex flex-col items-center justify-center h-7 w-8 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors gap-0 pb-0.5"
                >
                  <Palette size={13} className="text-gray-600 dark:text-gray-300 mt-0.5" />
                  <div className="w-4 h-[3px] rounded-sm"
                    style={{ background: editor.getAttributes("textStyle").color || "#111827" }} />
                </button>
              </Tip>
              {openDD === "textcolor" && (
                <Dropdown onClose={closeDD} style={{ minWidth: 180 }}>
                  <div className="p-3">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Text colour</p>
                    <div className="grid grid-cols-5 gap-1.5 mb-2">
                      {TEXT_COLORS.map(({ c, n }) => (
                        <Tip key={c} label={n}>
                          <button
                            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); closeDD(); }}
                            className="w-6 h-6 rounded border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform shadow-sm"
                            style={{ background: c }}
                          />
                        </Tip>
                      ))}
                    </div>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); closeDD(); }}
                      className="w-full text-center text-[11px] py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                      Remove colour
                    </button>
                  </div>
                </Dropdown>
              )}
            </div>

            {/* Highlight */}
            <div className="relative shrink-0">
              <Tip label="Highlight color">
                <button
                  onMouseDown={(e) => { e.preventDefault(); tog("highlight"); }}
                  className={`inline-flex flex-col items-center justify-center h-7 w-8 rounded transition-colors gap-0 pb-0.5 ${
                    editor.isActive("highlight") ? "" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  style={editor.isActive("highlight") ? { background: `${MAROON}20` } : {}}
                >
                  <Highlighter size={13} className="text-gray-600 dark:text-gray-300 mt-0.5" />
                  <div className="w-4 h-[3px] rounded-sm bg-yellow-300" />
                </button>
              </Tip>
              {openDD === "highlight" && (
                <Dropdown onClose={closeDD} style={{ minWidth: 180 }}>
                  <div className="p-3">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Highlight colour</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {HIGHLIGHT_COLORS.map(({ c, n }) => (
                        <Tip key={c} label={n}>
                          <button
                            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setHighlight({ color: c }).run(); closeDD(); }}
                            className="w-6 h-6 rounded border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform shadow-sm"
                            style={{ background: c }}
                          />
                        </Tip>
                      ))}
                    </div>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); closeDD(); }}
                      className="w-full text-center text-[11px] py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                      Remove highlight
                    </button>
                  </div>
                </Dropdown>
              )}
            </div>

            <Sep />

            {/* Sub / Super */}
            <TB onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} label="Subscript">
              <SubIcon size={14} />
            </TB>
            <TB onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} label="Superscript">
              <SupIcon size={14} />
            </TB>

            <Sep />

            {/* Line height */}
            <div className="relative shrink-0">
              <Tip label="Line spacing">
                <button
                  onMouseDown={(e) => { e.preventDefault(); tog("lineheight"); }}
                  className="flex items-center gap-0.5 h-7 px-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                >
                  {/* line-height icon */}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="3" y1="2" x2="11" y2="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <line x1="3" y1="5.5" x2="11" y2="5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <line x1="3" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <line x1="3" y1="12" x2="11" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <ChevronDown size={10} className="text-gray-400" />
                </button>
              </Tip>
              {openDD === "lineheight" && (
                <Dropdown onClose={closeDD} style={{ minWidth: 140 }}>
                  <div className="py-1">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-3 pt-1.5 pb-1">Line spacing</p>
                    {LINE_HEIGHTS.map(({ label, value }) => (
                      <button key={value}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setLineHeight(value);
                          // apply to all paragraphs via CSS var
                          document.documentElement.style.setProperty("--ke-line-height", value);
                          closeDD();
                        }}
                        className={`w-full text-left px-4 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between`}
                        style={lineHeight === value ? { color: MAROON, fontWeight: 600 } : { color: "#374151" }}
                      >
                        {label}
                        {lineHeight === value && <CheckCheck size={12} style={{ color: MAROON }} />}
                      </button>
                    ))}
                  </div>
                </Dropdown>
              )}
            </div>

            <Sep />

            {/* Alignment */}
            <TB onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} label="Align left" shortcut="Ctrl+Shift+L">
              <AlignLeft size={14} />
            </TB>
            <TB onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} label="Align center" shortcut="Ctrl+Shift+E">
              <AlignCenter size={14} />
            </TB>
            <TB onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} label="Align right" shortcut="Ctrl+Shift+R">
              <AlignRight size={14} />
            </TB>
            <TB onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} label="Justify">
              <AlignJustify size={14} />
            </TB>

            <Sep />

            {/* Lists */}
            <TB onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Bullet list">
              <List size={14} />
            </TB>
            <TB onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Numbered list">
              <ListOrdered size={14} />
            </TB>
            <TB onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} label="Checklist">
              <ListChecks size={14} />
            </TB>

            <Sep />

            {/* Quote / Code / Rule */}
            <TB onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="Blockquote">
              <Quote size={14} />
            </TB>
            <TB onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} label="Inline code" shortcut="Ctrl+E">
              <Code size={14} />
            </TB>
            <TB onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Divider line">
              <Minus size={14} />
            </TB>

            <Sep />

            {/* Link */}
            <div className="relative shrink-0">
              <TB
                onClick={() => {
                  if (editor.isActive("link")) {
                    editor.chain().focus().unsetLink().run();
                  } else {
                    setLinkUrl(editor.getAttributes("link").href || "");
                    tog("link");
                  }
                }}
                active={editor.isActive("link")}
                label="Insert link"
                shortcut="Ctrl+K"
              >
                <LinkIcon size={14} />
              </TB>
              {openDD === "link" && (
                <Dropdown onClose={closeDD} style={{ minWidth: 268 }}>
                  <div className="p-3 flex flex-col gap-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Insert link</p>
                    <input
                      autoFocus
                      type="url"
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && applyLink()}
                      placeholder="https://example.com"
                      className="h-8 px-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none bg-white dark:bg-gray-900 dark:text-white w-full"
                      style={{ focusBorderColor: MAROON } as any}
                      onFocus={e => (e.target.style.borderColor = MAROON)}
                      onBlur={e => (e.target.style.borderColor = "")}
                    />
                    <div className="flex gap-2">
                      <button
                        onMouseDown={(e) => { e.preventDefault(); applyLink(); }}
                        className="flex-1 h-7 text-white text-xs font-semibold rounded transition-colors"
                        style={{ background: MAROON }}
                      >
                        Apply
                      </button>
                      <button
                        onMouseDown={(e) => { e.preventDefault(); closeDD(); }}
                        className="flex-1 h-7 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs font-medium rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </Dropdown>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ══ DOCUMENT CANVAS ═══════════════════════════════════════════════ */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ background: "#f0f0f0" }}
        onClick={closeDD}
      >
        {/* Page */}
        <div
          className="mx-auto my-8 bg-white dark:bg-[#2d2d2d]"
          style={{
            width: 816,
            boxShadow: "0 1px 4px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)",
            minHeight: 1056,
            padding: "96px 96px 120px",
            transformOrigin: "top center",
            transform: `scale(${zoom / 100})`,
            marginBottom: zoom < 100 ? `${(1 - zoom / 100) * -1056}px` : undefined,
          }}
        >
          <EditorContent
            editor={editor}
            className="ke-doc"
            style={{ ["--ke-lh" as any]: lineHeight }}
          />
        </div>
        <div style={{ height: 64 }} />
      </div>

      {/* ══ STATUS BAR ════════════════════════════════════════════════════ */}
      <div
        className="shrink-0 flex items-center justify-between px-4 h-6 text-white select-none"
        style={{ background: MAROON }}
      >
        <div className="flex items-center gap-4 text-[11px] font-medium">
          <span>{wordCount.toLocaleString()} words</span>
          <span className="hidden sm:inline opacity-80">{charCount.toLocaleString()} characters</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] opacity-75">
          {!readOnly && <span className="hidden md:inline">Ctrl+S · save  •  Ctrl+F · find</span>}
          <span>Katha Editor</span>
        </div>
      </div>
    </div>
  );
}
