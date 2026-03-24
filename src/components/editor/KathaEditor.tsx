"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
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
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, ListChecks,
  Heading1, Heading2, Heading3,
  Quote, Code, Minus,
  Link as LinkIcon, Highlighter,
  Subscript as SubIcon, Superscript as SupIcon,
  Undo2, Redo2, Save, X, ChevronDown,
  Type, Palette, Search, BookOpen,
  ZoomIn, ZoomOut, Sun, Moon,
  CheckCheck, AlertCircle
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface KathaEditorProps {
  fileId: string;
  fileName: string;
  initialContent: string;         // HTML (legacy) or JSON string (ProseMirror)
  contentFormat?: "html" | "json";
  onSave: (content: string, format: "json", plainText: string) => Promise<void>;
  onClose: () => void;
  readOnly?: boolean;
}

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

// ─── Font sizes ──────────────────────────────────────────────────────────────

const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "28", "32", "36", "48"];
const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Mono", value: "ui-monospace, monospace" },
  { label: "Noto Sans Gujarati", value: "'Noto Sans Gujarati', sans-serif" },
  { label: "Shruti", value: "Shruti, sans-serif" },
];

const HIGHLIGHT_COLORS = [
  "#FEF08A", "#BBF7D0", "#BFDBFE", "#FED7AA",
  "#F5D0FE", "#FECACA", "#E2E8F0"
];

// ─── Toolbar Button ──────────────────────────────────────────────────────────

function ToolBtn({
  onClick, active = false, disabled = false, title, children, className = ""
}: {
  onClick: () => void; active?: boolean; disabled?: boolean;
  title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-all duration-150 flex items-center justify-center
        ${active
          ? "bg-maroon text-white shadow-sm"
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
        }
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
        ${className}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />;
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
  const [searchResults, setSearchResults] = useState(0);
  const [currentResult, setCurrentResult] = useState(0);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  // ── Parse initial content ──────────────────────────────────────────────────

  const parseInitialContent = useCallback((): string => {
    if (!initialContent || initialContent === '<p><br></p>' || initialContent === '') {
      return '';
    }
    if (contentFormat === "json") {
      // Already ProseMirror JSON — pass directly
      try {
        JSON.parse(initialContent);
        return initialContent;
      } catch { /* fall through to HTML */ }
    }
    // HTML content (legacy) — Tiptap accepts HTML directly
    return initialContent;
  }, [initialContent, contentFormat]);

  // ── Editor setup ──────────────────────────────────────────────────────────

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: { HTMLAttributes: { class: "not-prose" } },
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
        placeholder: "Start writing… (Supports Gujarati, Hindi, English)",
        emptyEditorClass: "is-editor-empty",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "editor-link", target: "_blank", rel: "noopener noreferrer" },
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
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(editor.storage.characterCount?.characters() ?? text.length);
      setSaveStatus("unsaved");

      // Auto-save after 2 seconds of inactivity
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        handleAutoSave(editor.getJSON(), editor.getText());
      }, 2000);
    },
  });

  // Detect dark mode
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    setIsDark(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  // Initial word/char count
  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      setCharCount(editor.storage.characterCount?.characters() ?? text.length);
      lastSavedRef.current = JSON.stringify(editor.getJSON());
    }
  }, [editor]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (editor) handleManualSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch(s => !s);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowLinkInput(false);
        setShowHighlightPicker(false);
        setShowColorPicker(false);
        setShowFontPicker(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editor]);

  // ── Save functions ─────────────────────────────────────────────────────────

  const handleAutoSave = useCallback(async (jsonContent: any, plainText: string) => {
    const jsonStr = JSON.stringify(jsonContent);
    if (jsonStr === lastSavedRef.current) return; // No change
    setSaveStatus("saving");
    try {
      await onSave(jsonStr, "json", plainText);
      lastSavedRef.current = jsonStr;
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }, [onSave]);

  const handleManualSave = useCallback(async () => {
    if (!editor) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    try {
      const jsonStr = JSON.stringify(editor.getJSON());
      await onSave(jsonStr, "json", editor.getText());
      lastSavedRef.current = jsonStr;
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }, [editor, onSave]);

  // ── Link handler ───────────────────────────────────────────────────────────

  const handleSetLink = () => {
    if (!editor) return;
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}` }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  // ── Search ─────────────────────────────────────────────────────────────────

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!editor || !query.trim()) { setSearchResults(0); setCurrentResult(0); return; }
    const text = editor.getText();
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = [...text.matchAll(regex)];
    setSearchResults(matches.length);
    setCurrentResult(matches.length > 0 ? 1 : 0);
  }, [editor]);

  if (!editor) return null;

  // ── Save status indicator ──────────────────────────────────────────────────

  const SaveIndicator = () => {
    const map = {
      saved: { icon: <CheckCheck size={13} />, text: "Saved", cls: "text-emerald-500" },
      saving: { icon: <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />, text: "Saving…", cls: "text-slate-400" },
      unsaved: { icon: <div className="w-2 h-2 rounded-full bg-amber-400" />, text: "Unsaved", cls: "text-amber-500" },
      error: { icon: <AlertCircle size={13} />, text: "Save failed", cls: "text-red-500" },
    };
    const { icon, text, cls } = map[saveStatus];
    return (
      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${cls}`}>
        {icon}<span className="hidden sm:inline">{text}</span>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col bg-white dark:bg-slate-950 transition-all duration-300 ${focusMode ? "bg-slate-50 dark:bg-slate-900" : ""}`}>

      {/* ── Header ── */}
      <div className={`shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ${focusMode ? "opacity-0 hover:opacity-100 absolute top-0 left-0 right-0 z-10" : ""}`}>

        {/* Top bar: title + actions */}
        <div className="flex items-center justify-between px-4 md:px-6 h-12 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0"
            >
              <X size={18} className="text-slate-500" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen size={14} className="text-maroon shrink-0" />
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[200px] md:max-w-md">
                {fileName}
              </h2>
              {readOnly && (
                <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-200 dark:border-amber-800 shrink-0">
                  Read only
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <SaveIndicator />

            <button
              onClick={() => setShowSearch(s => !s)}
              className={`p-1.5 rounded-lg transition-all ${showSearch ? "bg-maroon/10 text-maroon" : "text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"}`}
              title="Search (Ctrl+F)"
            >
              <Search size={16} />
            </button>

            <button
              onClick={() => setFocusMode(f => !f)}
              className={`p-1.5 rounded-lg transition-all hidden sm:flex ${focusMode ? "bg-maroon/10 text-maroon" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
              title="Focus mode"
            >
              {focusMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="hidden sm:flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <button onClick={() => setZoom(z => Math.max(60, z - 10))} className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">
                <ZoomOut size={13} />
              </button>
              <span className="text-[10px] font-black text-slate-500 w-9 text-center">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-all">
                <ZoomIn size={13} />
              </button>
            </div>

            {!readOnly && (
              <button
                onClick={handleManualSave}
                disabled={saveStatus === "saving"}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-maroon hover:bg-[#6e171b] text-white rounded-lg text-xs font-bold shadow-lg shadow-maroon/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60"
                title="Save (Ctrl+S)"
              >
                <Save size={13} />
                <span className="hidden sm:inline">Save</span>
              </button>
            )}
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="flex items-center gap-2 px-4 md:px-6 pb-2 animate-in slide-in-from-top-2 duration-200">
            <div className="relative flex-1 max-w-sm">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search in document…"
                className="w-full pl-8 pr-4 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-maroon/50 text-slate-900 dark:text-white"
              />
            </div>
            {searchQuery && (
              <span className="text-[10px] text-slate-400 font-bold shrink-0">
                {currentResult}/{searchResults} results
              </span>
            )}
          </div>
        )}

        {/* ── Toolbar ── */}
        {!readOnly && (
          <div className="flex items-center gap-0.5 px-3 md:px-4 py-2 overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800/50">

            {/* History */}
            <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
              <Undo2 size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Shift+Z)">
              <Redo2 size={15} />
            </ToolBtn>

            <Divider />

            {/* Headings */}
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
              <Heading1 size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
              <Heading2 size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
              <Heading3 size={15} />
            </ToolBtn>

            <Divider />

            {/* Text formatting */}
            <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
              <Bold size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
              <Italic size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">
              <UnderlineIcon size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
              <Strikethrough size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} title="Subscript">
              <SubIcon size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title="Superscript">
              <SupIcon size={15} />
            </ToolBtn>

            <Divider />

            {/* Highlight */}
            <div className="relative">
              <ToolBtn
                onClick={() => { setShowHighlightPicker(s => !s); setShowColorPicker(false); setShowFontPicker(false); }}
                active={editor.isActive("highlight")}
                title="Highlight"
              >
                <Highlighter size={15} />
              </ToolBtn>
              {showHighlightPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50 flex gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onMouseDown={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlightPicker(false); }}
                    className="w-6 h-6 rounded border-2 border-slate-300 bg-white flex items-center justify-center text-[9px] font-bold text-slate-400"
                    title="Remove highlight"
                  >✕</button>
                  {HIGHLIGHT_COLORS.map(color => (
                    <button
                      key={color}
                      onMouseDown={() => { editor.chain().focus().setHighlight({ color }).run(); setShowHighlightPicker(false); }}
                      className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Text color */}
            <div className="relative">
              <ToolBtn
                onClick={() => { setShowColorPicker(s => !s); setShowHighlightPicker(false); setShowFontPicker(false); }}
                title="Text color"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Palette size={13} />
                  <div className="w-4 h-0.5 rounded" style={{ backgroundColor: editor.getAttributes("textStyle").color || "#8b1D1D" }} />
                </div>
              </ToolBtn>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <input
                    type="color"
                    defaultValue={editor.getAttributes("textStyle").color || "#000000"}
                    onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                    className="w-8 h-8 cursor-pointer rounded border-none"
                  />
                </div>
              )}
            </div>

            <Divider />

            {/* Alignment */}
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
              <AlignLeft size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center">
              <AlignCenter size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
              <AlignRight size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">
              <AlignJustify size={15} />
            </ToolBtn>

            <Divider />

            {/* Lists */}
            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
              <List size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list">
              <ListOrdered size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Task list">
              <ListChecks size={15} />
            </ToolBtn>

            <Divider />

            {/* Blocks */}
            <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
              <Quote size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code">
              <Code size={15} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
              <Minus size={15} />
            </ToolBtn>

            <Divider />

            {/* Link */}
            <div className="relative">
              <ToolBtn
                onClick={() => {
                  if (editor.isActive("link")) {
                    editor.chain().focus().unsetLink().run();
                  } else {
                    setLinkUrl(editor.getAttributes("link").href || "");
                    setShowLinkInput(s => !s);
                    setShowHighlightPicker(false);
                    setShowColorPicker(false);
                  }
                }}
                active={editor.isActive("link")}
                title="Link"
              >
                <LinkIcon size={15} />
              </ToolBtn>
              {showLinkInput && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50 flex gap-2 min-w-[240px] animate-in fade-in slide-in-from-top-2 duration-150">
                  <input
                    autoFocus
                    type="url"
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSetLink()}
                    placeholder="https://…"
                    className="flex-1 h-8 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:border-maroon/50"
                  />
                  <button onMouseDown={handleSetLink} className="px-3 h-8 bg-maroon text-white rounded-lg text-xs font-bold hover:bg-[#6e171b] transition-colors">
                    Set
                  </button>
                </div>
              )}
            </div>

            <Divider />

            {/* Font family */}
            <div className="relative">
              <button
                onMouseDown={(e) => { e.preventDefault(); setShowFontPicker(s => !s); setShowHighlightPicker(false); setShowColorPicker(false); }}
                className="flex items-center gap-1 px-2 h-8 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title="Font family"
              >
                <Type size={13} />
                <ChevronDown size={10} />
              </button>
              {showFontPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50 min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-150">
                  {FONT_FAMILIES.map(f => (
                    <button
                      key={f.value}
                      onMouseDown={() => {
                        if (f.value) {
                          editor.chain().focus().setFontFamily(f.value).run();
                        } else {
                          editor.chain().focus().unsetFontFamily().run();
                        }
                        setShowFontPicker(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                      style={{ fontFamily: f.value || "inherit" }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ── Selection Bubble (custom — Tiptap 3 no longer ships a React BubbleMenu) ── */}
      {editor && !readOnly && !editor.state.selection.empty && (
        <div className="fixed z-[300] pointer-events-none" style={{ top: 0, left: 0, width: "100%", height: "100%" }}>
          <div
            className="absolute pointer-events-auto flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl px-1.5 py-1 animate-in fade-in slide-in-from-bottom-2 duration-150"
            style={{
              bottom: "auto",
              left: "50%",
              top: "50px",
              transform: "translateX(-50%)",
            }}
          >
            <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
              <Bold size={13} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
              <Italic size={13} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
              <UnderlineIcon size={13} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strike">
              <Strikethrough size={13} />
            </ToolBtn>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
            {HIGHLIGHT_COLORS.slice(0, 4).map(color => (
              <button
                key={color}
                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setHighlight({ color }).run(); }}
                className="w-4 h-4 rounded hover:scale-110 transition-transform border border-slate-200 dark:border-slate-700"
                style={{ backgroundColor: color }}
              />
            ))}
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
              <Heading2 size={13} />
            </ToolBtn>
            <ToolBtn onClick={() => { setLinkUrl(""); setShowLinkInput(true); }} active={editor.isActive("link")} title="Link">
              <LinkIcon size={13} />
            </ToolBtn>
          </div>
        </div>
      )}

      {/* ── Editor area ── */}
      <div
        className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors"
        onClick={() => { setShowHighlightPicker(false); setShowColorPicker(false); setShowFontPicker(false); }}
      >
        <div
          className="max-w-4xl mx-auto my-8 md:my-12 px-4"
          style={{ zoom: `${zoom}%` }}
        >
          <div className={`bg-white dark:bg-slate-900 shadow-xl border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden min-h-[80vh] ${focusMode ? "shadow-2xl" : ""}`}>
            <EditorContent
              editor={editor}
              className="katha-editor"
            />
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="shrink-0 flex items-center justify-between px-4 md:px-6 h-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>{wordCount.toLocaleString()} words</span>
          <span className="hidden sm:inline">{charCount.toLocaleString()} chars</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {!readOnly && <span className="hidden sm:inline">Ctrl+S to save • Ctrl+F to search</span>}
          <span>Tiptap • ProseMirror</span>
        </div>
      </div>

    </div>
  );
}
