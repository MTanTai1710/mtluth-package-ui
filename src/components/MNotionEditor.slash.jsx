import React from "react";
import ReactDOM from "react-dom/client";
import { Extension } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";

/*
 * MNotionEditor slash command — gõ "/" trong editor hiện popup chọn block
 * (Heading 1/2/3, Bullet/Ordered list, Quote, Divider).
 *
 * - Dùng @tiptap/suggestion để match trigger + filter theo query.
 * - Positioning: tự tính rect từ caret (không dùng tippy.js để không phải
 *   thêm dependency chỉ cho 1 popup).
 * - Keyboard: ArrowUp/Down/Enter/Escape — handled trong onKeyDown của
 *   suggestion render callback.
 */

function Icon(label) {
  return (
    <span className="m-notion-slash__text-icon" aria-hidden="true">
      {label}
    </span>
  );
}

function IconSvg(children) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const DEFAULT_ITEMS = [
  {
    key: "h1",
    title: "Heading 1",
    subtitle: "Tiêu đề lớn",
    icon: Icon("H1"),
    command: (editor, range) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    key: "h2",
    title: "Heading 2",
    subtitle: "Tiêu đề vừa",
    icon: Icon("H2"),
    command: (editor, range) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    key: "h3",
    title: "Heading 3",
    subtitle: "Tiêu đề nhỏ",
    icon: Icon("H3"),
    command: (editor, range) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    key: "bullet",
    title: "Bullet list",
    subtitle: "Danh sách gạch đầu dòng",
    icon: IconSvg(
      <>
        <circle cx="4" cy="6" r="1.2" fill="currentColor" />
        <circle cx="4" cy="12" r="1.2" fill="currentColor" />
        <circle cx="4" cy="18" r="1.2" fill="currentColor" />
        <line x1="9" y1="6" x2="20" y2="6" />
        <line x1="9" y1="12" x2="20" y2="12" />
        <line x1="9" y1="18" x2="20" y2="18" />
      </>,
    ),
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    key: "ordered",
    title: "Ordered list",
    subtitle: "Danh sách đánh số",
    icon: IconSvg(
      <>
        <text x="2" y="8" fontSize="7" fill="currentColor" stroke="none">1.</text>
        <text x="2" y="14" fontSize="7" fill="currentColor" stroke="none">2.</text>
        <text x="2" y="20" fontSize="7" fill="currentColor" stroke="none">3.</text>
        <line x1="9" y1="6" x2="20" y2="6" />
        <line x1="9" y1="12" x2="20" y2="12" />
        <line x1="9" y1="18" x2="20" y2="18" />
      </>,
    ),
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    key: "quote",
    title: "Quote",
    subtitle: "Đoạn trích dẫn",
    icon: IconSvg(
      <path d="M6 7h4v4H8c0 2 1 3 3 3v2c-3 0-5-2-5-5V7zm8 0h4v4h-2c0 2 1 3 3 3v2c-3 0-5-2-5-5V7z" />,
    ),
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    key: "divider",
    title: "Divider",
    subtitle: "Đường kẻ ngang",
    icon: IconSvg(<line x1="3" y1="12" x2="21" y2="12" />),
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];

function SlashMenu({ items, selectedIdx, onHover, onPick }) {
  if (!items.length) {
    return (
      <div className="m-notion-slash m-notion-slash--empty">
        Không có kết quả
      </div>
    );
  }
  return (
    <div
      className="m-notion-slash"
      onMouseDown={(e) => e.preventDefault()}
    >
      {items.map((item, i) => {
        const selected = i === selectedIdx;
        return (
          <button
            key={item.key}
            type="button"
            tabIndex={-1}
            ref={selected ? scrollIntoViewRef : null}
            className={
              "m-notion-slash__item" + (selected ? " is-selected" : "")
            }
            onMouseEnter={() => onHover(i)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick(i)}
          >
            <span className="m-notion-slash__icon">{item.icon}</span>
            <span className="m-notion-slash__body">
              <span className="m-notion-slash__title">{item.title}</span>
              {item.subtitle ? (
                <span className="m-notion-slash__subtitle">{item.subtitle}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function scrollIntoViewRef(el) {
  if (el && typeof el.scrollIntoView === "function") {
    el.scrollIntoView({ block: "nearest" });
  }
}

export function createSlashCommandExtension(opts) {
  const items = (opts && opts.items) || DEFAULT_ITEMS;

  return Extension.create({
    name: "mNotionSlashCommand",

    addOptions() {
      return {
        suggestion: {
          char: "/",
          startOfLine: false,
          allowSpaces: false,
          pluginKey: new PluginKey("mNotionSlashCommand"),
          command: ({ editor, range, props }) => {
            if (props && typeof props.command === "function") {
              props.command(editor, range);
            }
          },
          items: ({ query }) => {
            const q = (query || "").toLowerCase().trim();
            if (!q) return items.slice(0, 10);
            return items
              .filter(
                (it) =>
                  it.title.toLowerCase().includes(q) ||
                  (it.subtitle && it.subtitle.toLowerCase().includes(q)),
              )
              .slice(0, 10);
          },
          render: renderSuggestion,
        },
      };
    },

    addProseMirrorPlugins() {
      return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
    },
  });
}

function renderSuggestion() {
  let container;
  let root;
  let currentProps;
  let selectedIdx = 0;

  function paint() {
    if (!root || !currentProps) return;
    root.render(
      <SlashMenu
        items={currentProps.items}
        selectedIdx={selectedIdx}
        onHover={(i) => {
          selectedIdx = i;
          paint();
        }}
        onPick={(i) => {
          const item = currentProps.items[i];
          if (item) currentProps.command(item);
        }}
      />,
    );
  }

  function position(clientRect) {
    if (!container || !clientRect) return;
    const r = clientRect();
    if (!r) return;

    const menuH = container.offsetHeight || 240;
    const menuW = container.offsetWidth || 260;
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    let top = r.bottom + 6;
    let left = r.left;

    if (top + menuH > vh - 8 && r.top - menuH - 6 > 8) {
      top = r.top - menuH - 6;
    }
    if (left + menuW > vw - 8) left = vw - menuW - 8;
    if (left < 8) left = 8;

    container.style.top = top + "px";
    container.style.left = left + "px";
  }

  return {
    onStart(props) {
      currentProps = props;
      selectedIdx = 0;

      container = document.createElement("div");
      container.className = "m-notion-slash-portal";
      container.style.position = "fixed";
      container.style.zIndex = "9999";
      document.body.appendChild(container);

      root = ReactDOM.createRoot(container);
      paint();
      requestAnimationFrame(() => position(props.clientRect));
    },

    onUpdate(props) {
      currentProps = props;
      if (selectedIdx >= props.items.length) selectedIdx = 0;
      paint();
      requestAnimationFrame(() => position(props.clientRect));
    },

    onKeyDown(props) {
      const items = currentProps ? currentProps.items : [];
      const key = props.event.key;

      if (key === "ArrowDown") {
        if (items.length) selectedIdx = (selectedIdx + 1) % items.length;
        paint();
        return true;
      }
      if (key === "ArrowUp") {
        if (items.length)
          selectedIdx = (selectedIdx + items.length - 1) % items.length;
        paint();
        return true;
      }
      if (key === "Enter" || key === "Tab") {
        const item = items[selectedIdx];
        if (item && currentProps) currentProps.command(item);
        return true;
      }
      if (key === "Escape") {
        return true;
      }
      return false;
    },

    onExit() {
      if (root) {
        const r = root;
        // Defer unmount — React warns if a root is torn down during a render
        // flush triggered by the same event (Enter on a slash item).
        setTimeout(() => r.unmount(), 0);
        root = null;
      }
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
        container = null;
      }
      currentProps = null;
    },
  };
}

export const defaultSlashItems = DEFAULT_ITEMS;
