"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import localforage from "localforage";
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
  CheckCheck, AlertCircle, Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface KathaEditorProps {
  fileId: string;
  fileName: string;
  initialContent: string;
  contentFormat?: "html" | "json";
  fileUpdatedAt?: string | null;  // ISO string from server — used to detect stale drafts
  onSave: (content: string, format: "json", plainText: string) => Promise<void>;
  onClose: () => void;
  readOnly?: boolean;
}
type SaveStatus = "saved" | "saving" | "unsaved" | "error";
type DD = "heading"|"font"|"fontsize"|"highlight"|"textcolor"|"lineheight"|"link"|null;
type Chapter = { id: string; title: string; content?: any };

// ─── Theme ────────────────────────────────────────────────────────────────────
const M = "#8b1D1D"; // maroon

// ─── Data ─────────────────────────────────────────────────────────────────────
const HIGHLIGHT_COLORS = [
  { c:"#FEF08A",n:"Yellow"},{ c:"#BBF7D0",n:"Green"},
  { c:"#BFDBFE",n:"Blue"},  { c:"#FED7AA",n:"Orange"},
  { c:"#F5D0FE",n:"Purple"},{ c:"#FECACA",n:"Red"},
  { c:"#E2E8F0",n:"Gray"},
];
const TEXT_COLORS = [
  {c:"#111827",n:"Black"},{c:M,n:"Maroon"},
  {c:"#dc2626",n:"Red"},{c:"#d97706",n:"Amber"},
  {c:"#16a34a",n:"Green"},{c:"#2563eb",n:"Blue"},
  {c:"#7c3aed",n:"Purple"},{c:"#db2777",n:"Pink"},
  {c:"#6b7280",n:"Gray"},
];
const FONTS = [
  {l:"Default",v:""},
  {l:"Georgia",v:"Georgia, serif"},
  {l:"Courier",v:"'Courier New', monospace"},
  {l:"Noto Sans Gujarati",v:"'Noto Sans Gujarati', sans-serif"},
  {l:"Shruti",v:"Shruti, sans-serif"},
];
const FONT_SIZES = ["8","9","10","11","12","14","16","18","20","24","28","32","36","48","60","72"];
const HEADINGS = [
  {l:"Normal text",lv:0},{l:"Heading 1",lv:1},
  {l:"Heading 2",lv:2},{l:"Heading 3",lv:3},{l:"Heading 4",lv:4},
];
const LINE_HEIGHTS = [
  {l:"Single (1.0)",v:"1.0"},
  {l:"1.15",v:"1.15"},
  {l:"1.5",v:"1.5"},
  {l:"Double (2.0)",v:"2.0"},
];

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function Tip({label,shortcut,children}:{label:string;shortcut?:string;children:React.ReactNode}) {
  const [show,setShow] = useState(false);
  const [pos,setPos] = useState({x:0,y:0});
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span ref={ref} className="relative inline-flex"
      onMouseEnter={()=>{ const r=ref.current?.getBoundingClientRect(); if(r)setPos({x:r.left+r.width/2,y:r.bottom+6}); setShow(true); }}
      onMouseLeave={()=>setShow(false)}>
      {children}
      {show&&(
        <span className="fixed z-[9999] pointer-events-none" style={{left:pos.x,top:pos.y,transform:"translateX(-50%)"}}>
          <span className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-[11px] rounded px-2 py-1 whitespace-nowrap shadow-lg">
            {label}{shortcut&&<span className="text-gray-400 font-mono text-[10px]">{shortcut}</span>}
          </span>
        </span>
      )}
    </span>
  );
}

// ─── Toolbar button ───────────────────────────────────────────────────────────
function TB({onClick,active=false,disabled=false,label,shortcut,children}:{
  onClick:()=>void;active?:boolean;disabled?:boolean;
  label:string;shortcut?:string;children:React.ReactNode;
}) {
  return (
    <Tip label={label} shortcut={shortcut}>
      <button type="button"
        onMouseDown={e=>{e.preventDefault();if(!disabled)onClick();}}
        disabled={disabled}
        className={[
          "inline-flex items-center justify-center h-7 w-7 rounded select-none transition-all duration-100",
          active?"text-white shadow-sm":"text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
          disabled?"opacity-35 cursor-not-allowed":"cursor-pointer",
        ].join(" ")}
        style={active?{backgroundColor:M}:{}}
      >{children}</button>
    </Tip>
  );
}

function Sep(){return <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5 shrink-0"/>;}

// ─── Dropdown ─────────────────────────────────────────────────────────────────
function DD({onClose,children,width=180}:{onClose:()=>void;children:React.ReactNode;width?:number}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const fn=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))onClose();};
    const t=setTimeout(()=>document.addEventListener("mousedown",fn),60);
    return()=>{clearTimeout(t);document.removeEventListener("mousedown",fn);};
  },[onClose]);
  return (
    <div ref={ref}
      className="absolute top-full left-0 mt-0.5 z-[700] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-2xl overflow-hidden"
      style={{width}}
      onMouseDown={e=>e.preventDefault()}>
      {children}
    </div>
  );
}

// ─── Section header inside dropdown ──────────────────────────────────────────
function DDLabel({children}:{children:string}) {
  return <p className="px-3 pt-2.5 pb-1 text-[10px] uppercase tracking-widest font-semibold text-gray-400">{children}</p>;
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN EDITOR
// ═════════════════════════════════════════════════════════════════════════════
export default function KathaEditor({
  fileId, fileName, initialContent, contentFormat="html",
  fileUpdatedAt, onSave, onClose, readOnly=false,
}:KathaEditorProps) {

  const [saveStatus,  setSaveStatus]  = useState<SaveStatus>("saved");
  const [wordCount,   setWordCount]   = useState(0);
  const [charCount,   setCharCount]   = useState(0);
  const [zoom,        setZoom]        = useState(100);
  const [showSearch,  setShowSearch]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCount, setSearchCount] = useState(0);
  const [linkUrl,     setLinkUrl]     = useState("");
  const [openDD,      setOpenDD]      = useState<DD>(null);
  const [focusMode,   setFocusMode]   = useState(false);
  const [lineHeight,  setLineHeight]  = useState("1.8");
  const [hlColor,     setHlColor]     = useState("#FEF08A"); // Last used highlight color
  const [textColor,   setTextColor]   = useState("#111827"); // Last used text color
  const [curFontSize, setCurFontSize] = useState("11");
  const [showOutline, setshowOutline] = useState(false);
  const [outline,      setOutline]     = useState<{text:string,level:number,pos:number}[]>([]);
  const [chapters,     setChapters]    = useState<Chapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string>("");
  const [sidebarTab,   setSidebarTab]  = useState<"chapters"|"outline">("chapters");
  const [chapterRenameId, setChapterRenameId] = useState("");
  const [chapterRenameValue, setChapterRenameValue] = useState("");
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  const chaptersRef = useRef(chapters);
  useEffect(() => { chaptersRef.current = chapters; }, [chapters]);
  const activeChapterRef = useRef(activeChapterId);
  useEffect(() => { activeChapterRef.current = activeChapterId; }, [activeChapterId]);

  const saveTimer  = useRef<ReturnType<typeof setTimeout>|null>(null);
  const lastSaved  = useRef("");
  const editorArea = useRef<HTMLDivElement>(null);

  const tog = (k:DD)=>setOpenDD(p=>p===k?null:k);
  const closeDD = ()=>setOpenDD(null);

  // ── Setup Chapters ────────────────────────────────────────────────────────
  useEffect(() => {
    let unmounted = false;
    
    const initData = async () => {
      let data;
      let usedDraft = false;
      if (typeof window !== "undefined") {
        try {
          const rawDraft = await localforage.getItem<string>(`katha-draft-${fileId}`);
          if (rawDraft) {
            const draft = JSON.parse(rawDraft);
            // Only use the draft if it is newer than the server content.
            // drafts store a _savedAt timestamp (ms). The katha page passes
            // editingFile.updatedAt via initialContent's parsed timestamp.
            // If the draft has no timestamp, prefer it (crash-recovery intent).
            const draftTs = draft._savedAt ?? Infinity;
            const serverTs = fileUpdatedAt ? new Date(fileUpdatedAt).getTime() : 0;
            if (draftTs >= serverTs) {
              data = draft;
              usedDraft = true;
            }
          }
        } catch (e) { console.error("IDB Cache error", e); }
      }

      if (unmounted) return;

      if (!data && initialContent && initialContent !== "<p><br></p>" && initialContent.trim()) {
        if (contentFormat === "json") {
          try { data = typeof initialContent === "string" ? JSON.parse(initialContent) : initialContent; }
          catch (e) { console.error("Parse error:", e); }
        }
      }

      if (!data) {
        const c = { id: Math.random().toString(36).slice(2), title: "Chapter 1", content: { type: "doc", content: [] } };
        setChapters([c]);
        setActiveChapterId(c.id);
        return;
      }

      if (data.isChaptered && data.chapters) {
        setChapters(data.chapters);
        setActiveChapterId(data.chapters[0]?.id);
      } else {
        const c = { id: Math.random().toString(36).slice(2), title: "Chapter 1", content: data };
        setChapters([c]);
        setActiveChapterId(c.id);
      }
      // Show recovery banner if draft was loaded
      if (usedDraft) setShowDraftBanner(true);
    };
    initData();
    return () => { unmounted = true; };
  }, [fileId, initialContent, contentFormat]);

  // ── Build extensions once ─────────────────────────────────────────────────
  const editor = useEditor({
    extensions:[
      StarterKit.configure({
        heading:{levels:[1,2,3,4,5,6]},
        codeBlock:{HTMLAttributes:{class:"ke-pre"}},
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({multicolor:true}),
      TextAlign.configure({types:["heading","paragraph","blockquote"]}),
      CharacterCount,
      Placeholder.configure({placeholder:"Start writing…",emptyNodeClass:"ke-placeholder"}),
      Link.configure({openOnClick:false,HTMLAttributes:{class:"ke-link",rel:"noopener noreferrer"}}),
      TaskList,
      TaskItem.configure({nested:true}),
      Subscript,
      Superscript,
    ],
    content: "",
    editable: !readOnly,
    autofocus: !readOnly,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        spellcheck: "false", // DRAMATIC performance improvement for 300+ page DOM nodes
      },
    },
    onUpdate:({editor})=>{
      const json = editor.getJSON();
      const txt = editor.getText();
      setWordCount(txt.trim()?txt.trim().split(/\s+/).length:0);
      setCharCount(editor.storage.characterCount?.characters()??txt.length);
      setSaveStatus("unsaved");
      
      const newChapters = chaptersRef.current.map(c => 
        c.id === activeChapterRef.current ? { ...c, content: json } : c
      );
      setChapters(newChapters);
      const saveData = { isChaptered: true, chapters: newChapters, _savedAt: Date.now() };

      // Instant Offline Draft protection via IndexedDB (handles gigabytes of data)
      if (typeof window !== "undefined") {
        localforage.setItem(`katha-draft-${fileId}`, JSON.stringify(saveData)).catch(e=>console.error('IDB AutoSave Error', e));
      }

      if(saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current=setTimeout(()=>autoSave(saveData,txt),2000);
    },
    onSelectionUpdate:({editor})=>{
      const sz=editor.getAttributes("textStyle").fontSize;
      if(sz) setCurFontSize(sz.replace(/pt|px/g,""));
      const c = editor.getAttributes("textStyle").color;
      if(c) setTextColor(c);
      const h = editor.getAttributes("highlight").color;
      if(h) setHlColor(h);
    },
  });

  // Switch chapter content
  useEffect(() => {
    if (!editor || !activeChapterId) return;
    const currentChapter = chaptersRef.current.find(c => c.id === activeChapterId);
    if (!currentChapter) return;
    const content = currentChapter.content || { type: "doc", content: [] };
    
    // Check if genuinely changed to avoid jumping cursor
    const curJson = JSON.stringify(editor.getJSON());
    const newJson = JSON.stringify(content);
    if (curJson !== newJson) {
      editor.commands.setContent(content, { emitUpdate: false });
      const txt = editor.getText();
      setWordCount(txt.trim()?txt.trim().split(/\s+/).length:0);
      setCharCount(editor.storage.characterCount?.characters()??txt.length);
      lastSaved.current = JSON.stringify({ isChaptered: true, chapters: chaptersRef.current });
      setSaveStatus("saved");
    }

    // Generate outline for UI
    const headings: any[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "heading") {
        headings.push({ text: node.textContent, level: node.attrs.level, pos });
      }
    });
    setOutline(headings);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChapterId]);

  // Update outline on local updates too
  useEffect(() => {
    if (!editor) return;
    const upd = () => {
      const hs: any[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "heading") {
          hs.push({ text: node.textContent, level: node.attrs.level, pos });
        }
      });
      setOutline(hs);
    };
    editor.on("update", upd);
    return () => { editor.off("update", upd); };
  }, [editor]);

  // Initial counts + lastSaved
  useEffect(()=>{
    if(!editor) return;
    const txt=editor.getText();
    setWordCount(txt.trim()?txt.trim().split(/\s+/).length:0);
    setCharCount(editor.storage.characterCount?.characters()??txt.length);
    lastSaved.current=JSON.stringify(editor.getJSON());
  },[editor]);

  useEffect(()=>()=>{if(saveTimer.current)clearTimeout(saveTimer.current);},[]);

  // Keyboard shortcuts
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{
      const mod=e.ctrlKey||e.metaKey;
      if(mod&&e.key==="s"){e.preventDefault();doSave();}
      if(mod&&e.key==="f"){e.preventDefault();setShowSearch(s=>!s);}
      if(e.key==="Escape"){closeDD();setShowSearch(false);}
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[editor]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const autoSave = useCallback(async(saveData:any,txt:string)=>{
    const s=JSON.stringify(saveData);
    if(s===lastSaved.current) return;
    setSaveStatus("saving");
    try{
      await onSave(s,"json",txt); // txt is current chapter plain text
      lastSaved.current=s;
      setSaveStatus("saved");
      if (typeof window !== "undefined") localforage.removeItem(`katha-draft-${fileId}`).catch(console.error);
    }
    catch{setSaveStatus("error");}
  },[onSave, fileId]);

  const doSave = useCallback(async()=>{
    if(!editor) return;
    if(saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    try{
      const saveData = { isChaptered: true, chapters: chaptersRef.current };
      const s=JSON.stringify(saveData);
      await onSave(s,"json",editor.getText());
      lastSaved.current=s;
      setSaveStatus("saved");
      if (typeof window !== "undefined") localforage.removeItem(`katha-draft-${fileId}`).catch(console.error);
    }catch{setSaveStatus("error");}
  },[editor, onSave, fileId]);

  // ── Link ──────────────────────────────────────────────────────────────────
  const applyLink=()=>{
    if(!editor) return;
    const u=linkUrl.trim();
    u ? editor.chain().focus().setLink({href:u.startsWith("http")?u:`https://${u}`}).run()
      : editor.chain().focus().unsetLink().run();
    closeDD(); setLinkUrl("");
  };

  // ── Search ────────────────────────────────────────────────────────────────
  const doSearch=useCallback((q:string)=>{
    setSearchQuery(q);
    if(!editor||!q.trim()){setSearchCount(0);return;}
    const rx=new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi");
    setSearchCount([...editor.getText().matchAll(rx)].length);
  },[editor]);

  // ── Apply line height to document area ────────────────────────────────────
  useEffect(()=>{
    if(editorArea.current){
      editorArea.current.style.setProperty("--ke-lh", lineHeight);
    }
  },[lineHeight]);

  if(!editor) return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{borderColor:`${M} transparent transparent`}}/>
    </div>
  );

  // ── Derived state ─────────────────────────────────────────────────────────
  const activeH = HEADINGS.find(h=>h.lv===0?!editor.isActive("heading"):editor.isActive("heading",{level:h.lv as any}))??HEADINGS[0];
  const stMap:Record<SaveStatus,{icon:React.ReactNode;label:string;cls:string}> = {
    saved:   {icon:<CheckCheck size={12}/>,                                              label:"Saved",   cls:"text-green-600 dark:text-green-400"},
    saving:  {icon:<Clock size={12} className="animate-spin opacity-70"/>,               label:"Saving…", cls:"text-gray-400"},
    unsaved: {icon:<span className="w-2 h-2 rounded-full bg-amber-400 inline-block mt-0.5"/>, label:"Unsaved", cls:"text-amber-500"},
    error:   {icon:<AlertCircle size={12}/>,                                             label:"Error",   cls:"text-red-500"},
  };
  const st=stMap[saveStatus];
  const curColor=editor.getAttributes("textStyle").color||"#111827";
  const isHighlighted=editor.isActive("highlight");

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{background:"#f0f0f0"}}>
      <style>{`
        .ke-doc .ProseMirror {
          outline: none;
          min-height: 800px;
          line-height: var(--ke-lh, 1.8);
          font-size: var(--ke-fs, 11pt);
        }
        .ke-doc .ProseMirror p {
          margin-bottom: 0.8em;
          line-height: inherit;
        }
        .ke-doc .ProseMirror h1, .ke-doc .ProseMirror h2, .ke-doc .ProseMirror h3 {
          color: ${M};
          line-height: 1.3;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .ke-doc .ProseMirror ul, .ke-doc .ProseMirror ol {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        .ke-doc .ProseMirror li p {
          margin-bottom: 0.2em;
        }
        .ke-placeholder.is-empty::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        @media (max-width: 768px) {
          .ke-doc .ProseMirror { font-size: 13pt; }
        }
      `}</style>

      {/* ══ CHROME ══════════════════════════════════════════════════════════ */}
      <div className={[
        "shrink-0 bg-white dark:bg-[#1f1f1f] border-b border-gray-200 dark:border-gray-700 transition-opacity duration-300",
        focusMode?"opacity-0 hover:opacity-100 absolute top-0 left-0 right-0 z-30":"",
      ].join(" ")}>

        {/* ── Title row ── */}
        <div className="flex items-center h-11 px-3 gap-2 border-b border-gray-100 dark:border-gray-800">
          <Tip label="Close editor">
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors shrink-0">
              <X size={16}/>
            </button>
          </Tip>
          <div className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{background:`${M}18`}}>
            <BookOpen size={14} style={{color:M}}/>
          </div>
          <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate min-w-0 select-none">{fileName}</span>
          {readOnly&&<span className="text-[10px] px-2 py-0.5 rounded border font-semibold shrink-0" style={{color:M,borderColor:`${M}40`,background:`${M}0a`}}>Read only</span>}

          <div className="flex items-center gap-1 shrink-0">
            {/* Save status */}
            <div className={`flex items-center gap-1 text-[11px] font-medium mr-1 ${st.cls}`}>
              {st.icon}<span className="hidden sm:inline">{st.label}</span>
            </div>
            {/* Search */}
            <Tip label="Find" shortcut="Ctrl+F">
              <button onClick={()=>setShowSearch(s=>!s)}
                className="w-8 h-8 flex items-center justify-center rounded transition-colors text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                style={showSearch?{background:M,color:"white"}:{}}>
                <Search size={15}/>
              </button>
            </Tip>
            {/* Focus */}
            <Tip label={focusMode?"Exit focus":"Focus mode"}>
              <button onClick={()=>setFocusMode(f=>!f)}
                className="w-8 h-8 hidden sm:flex items-center justify-center rounded transition-colors text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                style={focusMode?{background:M,color:"white"}:{}}>
                {focusMode?<Minimize2 size={15}/>:<Maximize2 size={15}/>}
              </button>
            </Tip>
            {/* Zoom */}
            <div className="hidden sm:flex items-center border border-gray-200 dark:border-gray-600 rounded overflow-hidden h-7 ml-1">
              <Tip label="Zoom out">
                <button onClick={()=>setZoom(z=>Math.max(50,z-10))}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 border-r border-gray-200 dark:border-gray-600 transition-colors">
                  <ZoomOut size={12}/>
                </button>
              </Tip>
              <span className="text-[11px] text-gray-600 w-11 text-center font-medium select-none">{zoom}%</span>
              <Tip label="Zoom in">
                <button onClick={()=>setZoom(z=>Math.min(200,z+10))}
                  className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 border-l border-gray-200 dark:border-gray-600 transition-colors">
                  <ZoomIn size={12}/>
                </button>
              </Tip>
            </div>

            {/* Save */}
            {!readOnly&&(
              <Tip label="Save" shortcut="Ctrl+S">
                <button onClick={doSave} disabled={saveStatus==="saving"}
                  className="flex items-center gap-1.5 h-8 px-3 text-white text-xs font-semibold rounded transition-opacity disabled:opacity-60 ml-1"
                  style={{background:M}}>
                  <Save size={13}/><span className="hidden sm:inline">Save</span>
                </button>
              </Tip>
            )}
          </div>
        </div>

        {/* ── Draft recovery banner ── */}
        {showDraftBanner && (
          <div className="flex items-center justify-between px-4 py-2 text-sm font-medium text-white"
            style={{background: "#7c2d2d"}}>
            <span>⚠️ Unsaved draft recovered — your last unsaved changes have been restored.</span>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <button
                onClick={() => setShowDraftBanner(false)}
                className="px-3 py-1 rounded text-xs font-bold bg-white/20 hover:bg-white/30 transition-colors">
                Keep draft
              </button>
              <button
                onClick={async () => {
                  // Discard draft — reload from initialContent
                  if (typeof window !== "undefined") {
                    try { await localforage.removeItem(`katha-draft-${fileId}`); } catch {}
                  }
                  setShowDraftBanner(false);
                  // Re-parse server content
                  if (editor && initialContent && initialContent.trim()) {
                    try {
                      const parsed = contentFormat === "json" ? JSON.parse(initialContent) : initialContent;
                      if (parsed.isChaptered && parsed.chapters) {
                        setChapters(parsed.chapters);
                        setActiveChapterId(parsed.chapters[0]?.id);
                      } else {
                        const ch = { id: Math.random().toString(36).slice(2), title: "Chapter 1", content: parsed };
                        setChapters([ch]);
                        setActiveChapterId(ch.id);
                      }
                    } catch {}
                  }
                }}
                className="px-3 py-1 rounded text-xs font-bold bg-white/10 hover:bg-white/20 transition-colors border border-white/30">
                Discard draft
              </button>
            </div>
          </div>
        )}

        {/* ── Search row ── */}
        {showSearch&&(
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input autoFocus type="text" value={searchQuery} onChange={e=>doSearch(e.target.value)}
                placeholder="Find in document…"
                className="pl-7 pr-3 h-7 w-52 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none bg-white dark:bg-gray-800 dark:text-white"
                onFocus={e=>(e.target.style.borderColor=M)}
                onBlur={e=>(e.target.style.borderColor="")}/>
            </div>
            {searchQuery&&<span className="text-xs text-gray-500">{searchCount} result{searchCount!==1?"s":""}</span>}
            <button onClick={()=>{setShowSearch(false);doSearch("");}} className="ml-auto text-gray-400 hover:text-gray-600"><X size={13}/></button>
          </div>
        )}

        {/* ══ TOOLBAR ═══════════════════════════════════════════════════════ */}
        {!readOnly&&(
          <div className="flex flex-wrap items-center justify-center min-h-[36px] px-2 py-1 gap-1 bg-white dark:bg-[#1f1f1f] z-10 relative">

            {/* Sidebar toggle */}
            <TB onClick={()=>setshowOutline(s=>!s)} active={showOutline} label="Toggle Sidebar"><AlignLeft size={14}/></TB>
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5 shrink-0 hidden sm:block"/>

            {/* Undo / Redo */}
            <TB onClick={()=>editor.chain().focus().undo().run()} disabled={!editor.can().undo()} label="Undo" shortcut="Ctrl+Z"><Undo2 size={14}/></TB>
            <TB onClick={()=>editor.chain().focus().redo().run()} disabled={!editor.can().redo()} label="Redo" shortcut="Ctrl+Y"><Redo2 size={14}/></TB>
            <Sep/>

            {/* ── Text style dropdown ── */}
            <div className="relative shrink-0">
              <Tip label="Text style">
                <button onMouseDown={e=>{e.preventDefault();tog("heading");}}
                  className="flex items-center gap-1 h-7 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-medium text-gray-700 dark:text-gray-200"
                  style={{minWidth:120}}>
                  <span className="flex-1 text-left truncate">{activeH.l}</span>
                  <ChevronDown size={11} className="text-gray-400 shrink-0"/>
                </button>
              </Tip>
              {openDD==="heading"&&(
                <DD onClose={closeDD} width={200}>
                  <div className="py-1">
                    {HEADINGS.map(h=>{
                      const isActive=h.lv===0?!editor.isActive("heading"):editor.isActive("heading",{level:h.lv as any});
                      return (
                        <button key={h.lv}
                          onMouseDown={e=>{e.preventDefault();
                            h.lv===0?editor.chain().focus().setParagraph().run()
                              :editor.chain().focus().toggleHeading({level:h.lv as any}).run();
                            closeDD();}}
                          className={`w-full text-left px-4 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between`}
                          style={isActive?{background:`${M}10`}:{}}>
                          <span style={{
                            fontSize: h.lv===0?13:h.lv===1?22:h.lv===2?18:h.lv===3?15:13,
                            fontWeight: h.lv===0?400:700,
                            color: h.lv===1||h.lv===2 ? M : "inherit",
                            lineHeight:1.2,
                          }}>{h.l}</span>
                          {isActive&&<CheckCheck size={12} style={{color:M}}/>}
                        </button>
                      );
                    })}
                  </div>
                </DD>
              )}
            </div>
            <Sep/>

            {/* ── Font family ── */}
            <div className="relative shrink-0">
              <Tip label="Font family">
                <button onMouseDown={e=>{e.preventDefault();tog("font");}}
                  className="flex items-center gap-0.5 h-7 px-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">
                  <Type size={14}/><ChevronDown size={10} className="text-gray-400"/>
                </button>
              </Tip>
              {openDD==="font"&&(
                <DD onClose={closeDD} width={210}>
                  <div className="py-1">
                    {FONTS.map(f=>(
                      <button key={f.v}
                        onMouseDown={e=>{e.preventDefault();
                          f.v?editor.chain().focus().setFontFamily(f.v).run()
                            :editor.chain().focus().unsetFontFamily().run();
                          closeDD();}}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                        style={{fontFamily:f.v||"inherit"}}>
                        {f.l}
                      </button>
                    ))}
                  </div>
                </DD>
              )}
            </div>

            {/* ── Font size ── */}
            <div className="relative shrink-0">
              <Tip label="Font size">
                <button onMouseDown={e=>{e.preventDefault();tog("fontsize");}}
                  className="flex items-center gap-0.5 h-7 px-1.5 min-w-[38px] rounded border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium text-gray-700 dark:text-gray-300 justify-center">
                  {curFontSize}<ChevronDown size={10} className="text-gray-400"/>
                </button>
              </Tip>
              {openDD==="fontsize"&&(
                <DD onClose={closeDD} width={90}>
                  <div className="py-1 max-h-52 overflow-y-auto">
                    {FONT_SIZES.map(s=>(
                      <button key={s}
                        onMouseDown={e=>{e.preventDefault();
                          editor.chain().focus().setFontSize(`${s}pt`).run();
                          setCurFontSize(s);closeDD();}}
                        className="w-full text-left px-4 py-1.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                        style={curFontSize===s?{color:M,fontWeight:600}:{color:"inherit"}}>
                        {s}
                      </button>
                    ))}
                  </div>
                </DD>
              )}
            </div>
            <Sep/>

            {/* ── Bold / Italic / Underline / Strike ── */}
            <TB onClick={()=>editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Bold" shortcut="Ctrl+B"><Bold size={14}/></TB>
            <TB onClick={()=>editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="Italic" shortcut="Ctrl+I"><Italic size={14}/></TB>
            <TB onClick={()=>editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} label="Underline" shortcut="Ctrl+U"><UIcon size={14}/></TB>
            <TB onClick={()=>editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} label="Strikethrough"><Strikethrough size={14}/></TB>
            <Sep/>

            {/* ── Text colour ── */}
            <div className="relative shrink-0 flex items-center">
              <Tip label="Text colour">
                <button 
                  onMouseDown={e=>{e.preventDefault(); 
                    editor.chain().focus().setColor(textColor).run();
                  }}
                  className="inline-flex flex-col items-center justify-center h-7 px-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer pb-0.5">
                  <Palette size={13} className="text-gray-600 dark:text-gray-300 mt-0.5"/>
                  <div className="w-4 h-[3px] rounded-sm mt-0.5" style={{background:curColor}}/>
                </button>
              </Tip>
              <button 
                onMouseDown={e=>{e.preventDefault(); tog("textcolor");}}
                className="h-7 w-4 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                <ChevronDown size={10}/>
              </button>
              
              {openDD==="textcolor"&&(
                <DD onClose={closeDD} width={192}>
                  <DDLabel>Text colour</DDLabel>
                  <div className="px-3 pb-2">
                    <div className="grid grid-cols-5 gap-1.5 mb-2">
                      {TEXT_COLORS.map(({c,n})=>(
                        <Tip key={c} label={n}>
                          <button onMouseDown={e=>{e.preventDefault(); 
                            editor.chain().focus().setColor(c).run();
                            setTextColor(c); 
                            closeDD();
                          }}
                            className="w-6 h-6 rounded-sm border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform shadow-sm cursor-pointer"
                            style={{background:c}}/>
                        </Tip>
                      ))}
                    </div>
                    <button onMouseDown={e=>{e.preventDefault();editor.chain().focus().unsetColor().run();closeDD();}}
                      className="w-full text-center text-[11px] py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                      Remove colour
                    </button>
                  </div>
                </DD>
              )}
            </div>

            {/* ── Highlight ── */}
            <div className="relative shrink-0 flex items-center">
              <Tip label="Highlight">
                <button onMouseDown={e=>{e.preventDefault(); 
                  if(editor.isActive("highlight")) {
                    editor.chain().focus().unsetHighlight().run();
                  } else {
                    editor.chain().focus().setHighlight({color:hlColor}).run();
                  }
                }}
                  className="inline-flex flex-col items-center justify-center h-7 px-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer pb-0.5"
                  style={isHighlighted?{background:`${M}18`}:{}}>
                  <Highlighter size={13} className="text-gray-600 dark:text-gray-300 mt-0.5"/>
                  <div className="w-4 h-[3px] rounded-sm mt-0.5" style={{background:hlColor}}/>
                </button>
              </Tip>
              <button 
                onMouseDown={e=>{e.preventDefault(); tog("highlight");}}
                className="h-7 w-4 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                <ChevronDown size={10}/>
              </button>

              {openDD==="highlight"&&(
                <DD onClose={closeDD} width={192}>
                  <DDLabel>Highlight colour</DDLabel>
                  <div className="px-3 pb-2">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {HIGHLIGHT_COLORS.map(({c,n})=>(
                        <Tip key={c} label={n}>
                          <button onMouseDown={e=>{e.preventDefault();
                            editor.chain().focus().setHighlight({color:c}).run();
                            setHlColor(c);
                            closeDD();
                          }}
                            className="w-6 h-6 rounded-sm border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform shadow-sm cursor-pointer"
                            style={{background:c}}/>
                        </Tip>
                      ))}
                    </div>
                    <button onMouseDown={e=>{e.preventDefault();editor.chain().focus().unsetHighlight().run();closeDD();}}
                      className="w-full text-center text-[11px] py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                      Remove highlight
                    </button>
                  </div>
                </DD>
              )}
            </div>
            <Sep/>

            {/* ── Subscript / Superscript ── */}
            <TB onClick={()=>editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} label="Subscript"><SubIcon size={14}/></TB>
            <TB onClick={()=>editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} label="Superscript"><SupIcon size={14}/></TB>
            <Sep/>

            {/* ── Line spacing ── */}
            <div className="relative shrink-0">
              <Tip label="Line spacing">
                <button onMouseDown={e=>{e.preventDefault();tog("lineheight");}}
                  className="flex items-center gap-0.5 h-7 px-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">
                  {/* Line spacing SVG icon */}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M4 2h7M4 5h7M4 8h7M4 11h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M1.5 2v10M1.5 2l-1 1.2M1.5 2l1 1.2M1.5 12l-1-1.2M1.5 12l1-1.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <ChevronDown size={10} className="text-gray-400"/>
                </button>
              </Tip>
              {openDD==="lineheight"&&(
                <DD onClose={closeDD} width={168}>
                  <DDLabel>Line spacing</DDLabel>
                  <div className="py-1">
                    {LINE_HEIGHTS.map(({l,v})=>(
                      <button key={v}
                        onMouseDown={e=>{e.preventDefault();setLineHeight(v);closeDD();}}
                        className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                        style={lineHeight===v?{color:M,fontWeight:600}:{color:"inherit"}}>
                        {l}
                        {lineHeight===v&&<CheckCheck size={12} style={{color:M}}/>}
                      </button>
                    ))}
                  </div>
                </DD>
              )}
            </div>
            <Sep/>

            {/* ── Alignment ── */}
            <TB onClick={()=>editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({textAlign:"left"})} label="Align left" shortcut="Ctrl+Shift+L"><AlignLeft size={14}/></TB>
            <TB onClick={()=>editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({textAlign:"center"})} label="Align center" shortcut="Ctrl+Shift+E"><AlignCenter size={14}/></TB>
            <TB onClick={()=>editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({textAlign:"right"})} label="Align right" shortcut="Ctrl+Shift+R"><AlignRight size={14}/></TB>
            <TB onClick={()=>editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({textAlign:"justify"})} label="Justify"><AlignJustify size={14}/></TB>
            <Sep/>

            {/* ── Lists ── */}
            <TB onClick={()=>editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Bullet list"><List size={14}/></TB>
            <TB onClick={()=>editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Numbered list"><ListOrdered size={14}/></TB>
            <TB onClick={()=>editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} label="Checklist"><ListChecks size={14}/></TB>
            <Sep/>

            {/* ── Blockquote / Code / Rule ── */}
            <TB onClick={()=>editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="Blockquote"><Quote size={14}/></TB>
            <TB onClick={()=>editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} label="Inline code" shortcut="Ctrl+E"><Code size={14}/></TB>
            <TB onClick={()=>editor.chain().focus().setHorizontalRule().run()} label="Divider"><Minus size={14}/></TB>
            <Sep/>

            {/* ── Link ── */}
            <div className="relative shrink-0">
              <TB
                onClick={()=>{
                  if(editor.isActive("link")){editor.chain().focus().unsetLink().run();}
                  else{setLinkUrl(editor.getAttributes("link").href||"");tog("link");}
                }}
                active={editor.isActive("link")} label="Link" shortcut="Ctrl+K">
                <LinkIcon size={14}/>
              </TB>
              {openDD==="link"&&(
                <DD onClose={closeDD} width={272}>
                  <div className="p-3 flex flex-col gap-2">
                    <DDLabel>Insert link</DDLabel>
                    <input autoFocus type="url" value={linkUrl} onChange={e=>setLinkUrl(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&applyLink()}
                      placeholder="https://example.com"
                      className="h-8 px-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none bg-white dark:bg-gray-900 dark:text-white w-full"
                      onFocus={e=>(e.target.style.borderColor=M)}
                      onBlur={e=>(e.target.style.borderColor="")}/>
                    <div className="flex gap-2">
                      <button onMouseDown={e=>{e.preventDefault();applyLink();}}
                        className="flex-1 h-7 text-white text-xs font-semibold rounded" style={{background:M}}>Apply</button>
                      <button onMouseDown={e=>{e.preventDefault();closeDD();}}
                        className="flex-1 h-7 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-xs rounded hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                    </div>
                  </div>
                </DD>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ══ PAGE CANVAS ═══════════════════════════════════════════════════ */}
      <div className="flex-1 flex min-h-0 bg-[#e8e8e8]" onClick={closeDD}>
        
        {/* Outline / Chapters Sidebar */}
        {showOutline && (
          <div className="w-64 shrink-0 bg-white border-r border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button onClick={() => setSidebarTab("chapters")} className={`flex-1 py-3 text-xs font-semibold ${sidebarTab==="chapters"?"border-b-2":"text-gray-500 hover:text-gray-700"}`}>Chapters</button>
              <button onClick={() => setSidebarTab("outline")} className={`flex-1 py-3 text-xs font-semibold ${sidebarTab==="outline"?"border-b-2":"text-gray-500 hover:text-gray-700"}`}>Outline</button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-2 py-4" style={{scrollbarWidth:"none"}}>
              {sidebarTab === "chapters" && (
                <div className="flex flex-col gap-1">
                  {chapters.map(ch => (
                    <div key={ch.id} className={`group flex items-center justify-between px-2 py-1.5 rounded transition-colors ${ch.id === activeChapterId ? 'font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}>
                      {chapterRenameId === ch.id ? (
                        <input 
                          autoFocus
                          value={chapterRenameValue}
                          onChange={(e) => setChapterRenameValue(e.target.value)}
                          onBlur={() => {
                            setChapters(p => p.map(c => c.id === ch.id ? { ...c, title: chapterRenameValue || "Untitled" } : c));
                            setChapterRenameId("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setChapters(p => p.map(c => c.id === ch.id ? { ...c, title: chapterRenameValue || "Untitled" } : c));
                              setChapterRenameId("");
                            }
                          }}
                          className="flex-1 text-[12px] bg-white border rounded px-1 min-w-0 focus:outline-none"
                        />
                      ) : (
                        <button className="flex-1 text-left text-[12px] truncate" onClick={() => setActiveChapterId(ch.id)}>
                          {ch.title}
                        </button>
                      )}
                      
                      {chapterRenameId !== ch.id && !readOnly && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 ml-2">
                          <button onClick={() => { setChapterRenameId(ch.id); setChapterRenameValue(ch.title); }} className="p-1 text-gray-400 hover:text-red-800"><Type size={12}/></button>
                          {chapters.length > 1 && (
                            <button onClick={() => {
                              const nc = chapters.filter(c => c.id !== ch.id);
                              setChapters(nc);
                              if (activeChapterId === ch.id) setActiveChapterId(nc[0].id);
                            }} className="p-1 text-gray-400 hover:text-red-600"><X size={12}/></button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {!readOnly && (
                    <button onClick={() => {
                      const newCh = { id: Math.random().toString(36).slice(2), title: `Chapter ${chapters.length + 1}`, content: { type: "doc", content: [{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: `Chapter ${chapters.length + 1}` }] }] } };
                      setChapters(p => [...p, newCh]);
                      setActiveChapterId(newCh.id);
                    }} className="mt-3 mx-2 py-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded text-center border border-amber-200 border-dashed transition-colors">
                      + Add Chapter
                    </button>
                  )}
                </div>
              )}
              
              {sidebarTab === "outline" && (
                <div className="flex flex-col gap-0.5">
                  {outline.map((h, i) => (
                    <button 
                      key={i}
                      onMouseDown={(e) => { 
                        e.preventDefault(); 
                        // Tiptap 3: focus() doesn't take a position — use setTextSelection
                        editor.commands.focus();
                        editor.commands.setTextSelection(h.pos);
                        // Scroll the heading into view
                        const dom = editor.view.nodeDOM(h.pos) as HTMLElement | null;
                        if (dom) dom.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="w-full text-left px-3 py-1.5 rounded text-[11px] font-medium transition-colors hover:bg-gray-50 text-gray-700 truncate"
                      style={{ paddingLeft: `${(h.level - 1) * 12 + 12}px` }}
                    >
                      {h.text || "(Empty heading)"}
                    </button>
                  ))}
                  {outline.length === 0 && (
                    <p className="px-4 text-[11px] italic text-gray-400">No headings yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto relative" style={{scrollbarWidth:"none"}}>
          {/* Bubble Menu */}
          {editor && !readOnly && (
            <BubbleMenu editor={editor}>
              <div className="flex items-center bg-gray-900 text-white rounded-lg shadow-2xl px-1.5 py-1 gap-1">
                <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
                  className={`p-1.5 rounded hover:bg-gray-800 ${editor.isActive("bold") ? "text-red-300" : ""}`}><Bold size={14}/></button>
                <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
                  className={`p-1.5 rounded hover:bg-gray-800 ${editor.isActive("italic") ? "text-red-300" : ""}`}><Italic size={14}/></button>
                <button onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
                  className={`p-1.5 rounded hover:bg-gray-800 ${editor.isActive("underline") ? "text-red-300" : ""}`}><UIcon size={14}/></button>
                <div className="w-px h-4 bg-gray-700 mx-0.5"/>
                <button onMouseDown={e => { e.preventDefault(); tog("textcolor"); }}
                  className="p-1.5 rounded hover:bg-gray-800"><Palette size={14}/></button>
              </div>
            </BubbleMenu>
          )}

          <div style={{
            width: 816,
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: 32,
            marginBottom: 64,
            background: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.16),0 4px 16px rgba(0,0,0,0.08)",
            minHeight: 1056,
            padding: "96px 96px 120px",
            transformOrigin: "top center",
            transform: `scale(${zoom / 100})`,
            ...(zoom < 100 ? { marginBottom: `${64 - (1 - zoom / 100) * 1056}px` } : {}),
          }}>
            <div ref={editorArea} className="ke-doc">
              <EditorContent 
                editor={editor}
                style={{ 
                  ["--ke-lh" as any]: lineHeight,
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* ══ STATUS BAR ════════════════════════════════════════════════════ */}
      <div className="shrink-0 flex items-center justify-between px-4 h-6 text-white select-none text-[11px]"
        style={{background:M}}>
        <div className="flex items-center gap-4 font-medium">
          <span>{wordCount.toLocaleString()} words</span>
          <span className="hidden sm:inline opacity-80">{charCount.toLocaleString()} chars</span>
        </div>
        <div className="flex items-center gap-3 opacity-75">
          {!readOnly&&<span className="hidden md:inline">Ctrl+S save  •  Ctrl+F find</span>}
          <span>Katha Editor</span>
        </div>
      </div>
    </div>
  );
}
