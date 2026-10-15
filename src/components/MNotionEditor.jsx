import React from "react";
import {
  EditorContent,
  useEditor,
  BubbleMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

import { cn } from "../utils/cn.js";
import { createSlashCommandExtension } from "./MNotionEditor.slash.jsx";

/*
 * MNotionEditor — Notion-like minimal editor dựng bằng TipTap.
 *
 * Scope cố ý nhỏ (vs cons_portal_wysiwyg NotionEditor):
 *   - Marks: bold, italic, underline, strike, code, link.
 *   - Blocks: H1/H2/H3, paragraph, bullet/ordered list, blockquote,
 *     horizontal rule, inline code.
 *   - UX: placeholder, slash "/" menu, bubble toolbar khi select,
 *     optional fixed toolbar trên đầu.
 *   - KHÔNG có image/file upload, table, color picker, progress bar,
 *     task list, mentions. Thêm sau nếu cần.
 *
 * Props:
 *   value          : string | object   HTML string hoặc ProseMirror JSON.
 *                                      Controlled; đổi props sẽ sync vào editor.
 *   defaultValue   : string | object   Initial content (uncontrolled).
 *   onChange(html, json)               Fired on mỗi doc update.
 *   placeholder    : string            Default "Nhập nội dung, gõ `/` để chọn block…".
 *   readOnly       : bool              View-only.
 *   autoFocus      : bool              Focus editor khi mount.
 *   minHeight      : number            px. Default 180.
 *   maxHeight      : number            px. Khi vượt → cuộn.
 *   showToolbar    : bool              Fixed toolbar trên đầu (default false, dùng bubble).
 *   showBubble     : bool              Bubble menu khi select (default true).
 *   className      : string            Thêm class ngoài.
 *   editorClassName: string            Thêm class vào vùng ProseMirror.
 *   slashItems     : array             Override danh sách slash items.
 */

const ICONS = {
  bold: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4h7a4 4 0 0 1 0 8H6zM6 12h8a4 4 0 0 1 0 8H6z" />
    </svg>
  ),
  italic: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  ),
  underline: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4v6a6 6 0 0 0 12 0V4" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  ),
  strike: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4H9a3 3 0 0 0-2 5" />
      <path d="M14 20H8" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <path d="M17 15a3 3 0 0 1-3 3" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </svg>
  ),
  bullet: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="4" cy="6" r="1.3" fill="currentColor" />
      <circle cx="4" cy="12" r="1.3" fill="currentColor" />
      <circle cx="4" cy="18" r="1.3" fill="currentColor" />
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
    </svg>
  ),
  ordered: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <text x="2" y="9" fontSize="7" fill="currentColor" stroke="none">1.</text>
      <text x="2" y="15" fontSize="7" fill="currentColor" stroke="none">2.</text>
      <text x="2" y="21" fontSize="7" fill="currentColor" stroke="none">3.</text>
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
    </svg>
  ),
  quote: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 7h4v4H8c0 2 1 3 3 3v2c-3 0-5-2-5-5V7zm8 0h4v4h-2c0 2 1 3 3 3v2c-3 0-5-2-5-5V7z" fill="currentColor" stroke="none" />
    </svg>
  ),
  hr: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  ),
  h1: <span className="m-notion-tbtn__text">H1</span>,
  h2: <span className="m-notion-tbtn__text">H2</span>,
  h3: <span className="m-notion-tbtn__text">H3</span>,
};

function TBtn({ onClick, isActive, title, children, disabled }) {
  return (
    <button
      type="button"
      className={cn(
        "m-notion-tbtn",
        isActive && "is-active",
        disabled && "is-disabled",
      )}
      title={title}
      aria-label={title}
      aria-pressed={isActive ? "true" : undefined}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="m-notion-tbar__divider" aria-hidden="true" />;
}

function Toolbar({ editor, compact }) {
  if (!editor) return null;

  const run = (fn) => () => fn(editor.chain().focus()).run();

  const promptLink = () => {
    const prev = editor.getAttributes("link").href || "";
    // eslint-disable-next-line no-alert
    const url = window.prompt("URL:", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  return (
    <div
      className="m-notion-tbar"
      onMouseDown={(e) => e.preventDefault()}
    >
      <TBtn
        title="Bold (Ctrl+B)"
        isActive={editor.isActive("bold")}
        onClick={run((c) => c.toggleBold())}
      >
        {ICONS.bold}
      </TBtn>
      <TBtn
        title="Italic (Ctrl+I)"
        isActive={editor.isActive("italic")}
        onClick={run((c) => c.toggleItalic())}
      >
        {ICONS.italic}
      </TBtn>
      <TBtn
        title="Underline (Ctrl+U)"
        isActive={editor.isActive("underline")}
        onClick={run((c) => c.toggleUnderline())}
      >
        {ICONS.underline}
      </TBtn>
      <TBtn
        title="Strikethrough"
        isActive={editor.isActive("strike")}
        onClick={run((c) => c.toggleStrike())}
      >
        {ICONS.strike}
      </TBtn>
      <TBtn
        title="Inline code"
        isActive={editor.isActive("code")}
        onClick={run((c) => c.toggleCode())}
      >
        {ICONS.code}
      </TBtn>
      <TBtn
        title="Link"
        isActive={editor.isActive("link")}
        onClick={promptLink}
      >
        {ICONS.link}
      </TBtn>

      {!compact && (
        <>
          <Divider />
          <TBtn
            title="Heading 1"
            isActive={editor.isActive("heading", { level: 1 })}
            onClick={run((c) => c.toggleHeading({ level: 1 }))}
          >
            {ICONS.h1}
          </TBtn>
          <TBtn
            title="Heading 2"
            isActive={editor.isActive("heading", { level: 2 })}
            onClick={run((c) => c.toggleHeading({ level: 2 }))}
          >
            {ICONS.h2}
          </TBtn>
          <TBtn
            title="Heading 3"
            isActive={editor.isActive("heading", { level: 3 })}
            onClick={run((c) => c.toggleHeading({ level: 3 }))}
          >
            {ICONS.h3}
          </TBtn>

          <Divider />
          <TBtn
            title="Bullet list"
            isActive={editor.isActive("bulletList")}
            onClick={run((c) => c.toggleBulletList())}
          >
            {ICONS.bullet}
          </TBtn>
          <TBtn
            title="Ordered list"
            isActive={editor.isActive("orderedList")}
            onClick={run((c) => c.toggleOrderedList())}
          >
            {ICONS.ordered}
          </TBtn>
          <TBtn
            title="Quote"
            isActive={editor.isActive("blockquote")}
            onClick={run((c) => c.toggleBlockquote())}
          >
            {ICONS.quote}
          </TBtn>
          <TBtn
            title="Divider"
            onClick={run((c) => c.setHorizontalRule())}
          >
            {ICONS.hr}
          </TBtn>
        </>
      )}
    </div>
  );
}

function normalizeContent(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return v;
}

function sameContent(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a === "string") return a === b;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export const MNotionEditor = React.forwardRef(function MNotionEditor(
  {
    value,
    defaultValue,
    onChange,
    placeholder = "Nhập nội dung, gõ `/` để chọn block…",
    readOnly = false,
    autoFocus = false,
    minHeight = 180,
    maxHeight,
    showToolbar = false,
    showBubble = true,
    className,
    editorClassName,
    slashItems,
    ...rest
  },
  ref,
) {
  const isControlled = value !== undefined;
  const initialContent = normalizeContent(
    isControlled ? value : defaultValue,
  );

  // Theo dõi content editor vừa emit — để effect sync `value` prop không
  // setContent lại khi parent chỉ echo lại cái vừa onChange emit (sẽ reset
  // selection + caret).
  const lastEmittedRef = React.useRef(initialContent);

  const slashExt = React.useMemo(
    () => createSlashCommandExtension({ items: slashItems }),
    [slashItems],
  );

  const editor = useEditor({
    editable: !readOnly,
    autofocus: autoFocus,
    content: initialContent,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Placeholder.configure({ placeholder }),
      slashExt,
    ],
    onUpdate: ({ editor }) => {
      if (!onChange) {
        lastEmittedRef.current = editor.getJSON();
        return;
      }
      const html = editor.getHTML();
      const json = editor.getJSON();
      lastEmittedRef.current = json;
      onChange(html, json);
    },
  });

  React.useEffect(() => {
    if (!editor || !isControlled) return;
    const normalized = normalizeContent(value);
    if (sameContent(normalized, lastEmittedRef.current)) return;
    const current = editor.getJSON();
    if (sameContent(normalized, current)) return;
    editor.commands.setContent(normalized, false);
    lastEmittedRef.current = normalized;
  }, [editor, isControlled, value]);

  React.useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  React.useImperativeHandle(ref, () => ({ editor }), [editor]);

  const style = {};
  if (minHeight) style["--m-notion-min-h"] = minHeight + "px";
  if (maxHeight) style["--m-notion-max-h"] = maxHeight + "px";

  return (
    <div
      className={cn(
        "m-notion",
        readOnly && "m-notion--readonly",
        className,
      )}
      style={style}
      {...rest}
    >
      {showToolbar && !readOnly && editor && (
        <div className="m-notion__toolbar">
          <Toolbar editor={editor} />
        </div>
      )}

      {showBubble && !readOnly && editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, placement: "top" }}
          shouldShow={({ editor, from, to }) => {
            if (from === to) return false;
            if (editor.isActive("codeBlock")) return false;
            return true;
          }}
        >
          <div className="m-notion-bubble">
            <Toolbar editor={editor} compact />
          </div>
        </BubbleMenu>
      )}

      <EditorContent
        editor={editor}
        className={cn("m-notion__content", editorClassName)}
      />
    </div>
  );
});

export default MNotionEditor;
