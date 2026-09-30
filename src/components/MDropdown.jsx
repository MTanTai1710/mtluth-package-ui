import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../utils/cn.js";

/*
 * MDropdown — 2 chế độ:
 *
 *   1) Action menu (children):
 *      <MDropdown trigger={<MButton>Menu ▾</MButton>}>
 *        <MDropdown.Item onClick={...}>Sửa</MDropdown.Item>
 *        <MDropdown.Divider />
 *        <MDropdown.Item danger onClick={...}>Xoá</MDropdown.Item>
 *      </MDropdown>
 *
 *   2) Select (items + value/onChange) — thay thế native <select>:
 *      <MDropdown
 *        label="Vai trò"
 *        items={[{value:'admin', label:'Admin'}, {value:'user', label:'User'}]}
 *        value={role}
 *        onChange={setRole}
 *        searchable
 *        placeholder="Chọn vai trò..."
 *      />
 *
 *   Cùng chế độ Select nhưng dùng trigger tuỳ biến:
 *      <MDropdown
 *        trigger={<MButton>{selected?.label ?? 'Chọn'}</MButton>}
 *        items={...} value={v} onChange={setV} searchable
 *      />
 *
 * Chọn chế độ:
 *   - Truyền `items` (array) → select mode.
 *   - Ngược lại → action menu (dùng children).
 *
 * Bàn phím:
 *   - Esc → đóng
 *   - ↑ / ↓ → di active item (select mode)
 *   - Enter → chọn active item (select mode)
 */

function DefaultSelectTrigger({ label, placeholder, open, disabled, onClick, ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={open}
      className={cn(
        "form-input",
        !label && "text-default-400",
      )}
      {...rest}
    >
      <span className="truncate min-w-0 flex-1">{label ?? placeholder}</span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={cn("shrink-0 ms-2 transition-transform", open && "rotate-180")}
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

function MDropdownRoot({
  trigger,
  items,
  value,
  onChange,
  searchable = false,
  searchPlaceholder = "Tìm...",
  placeholder = "Chọn...",
  emptyText = "Không có kết quả",
  align = "start",
  placement = "bottom",
  disabled = false,
  label,
  hint,
  error,
  containerClassName,
  className,
  menuClassName,
  children,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(-1);
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const isSelectMode = Array.isArray(items);
  const invalid = error != null && error !== false && error !== "";

  const filtered = useMemo(() => {
    if (!isSelectMode) return [];
    if (!q.trim()) return items;
    const s = q.trim().toLowerCase();
    return items.filter((it) =>
      String(it.label ?? it.value).toLowerCase().includes(s),
    );
  }, [items, isSelectMode, q]);

  const selected = isSelectMode
    ? items.find((it) => it.value === value)
    : null;

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setActiveIdx(-1);
  }, []);

  const toggle = useCallback(() => {
    if (disabled) return;
    setOpen((v) => !v);
  }, [disabled]);

  // Click outside + Esc + arrow keys.
  useEffect(() => {
    if (!open) return undefined;

    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    }
    function onKey(e) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (!isSelectMode) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => (i + 1 >= filtered.length ? 0 : i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => (i <= 0 ? filtered.length - 1 : i - 1));
      } else if (e.key === "Enter") {
        if (activeIdx >= 0 && filtered[activeIdx]) {
          e.preventDefault();
          handleSelect(filtered[activeIdx]);
        }
      }
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, close, isSelectMode, filtered, activeIdx]);

  // Auto-focus search + reset active idx khi menu mở / filter đổi.
  useEffect(() => {
    if (open && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open, searchable]);

  useEffect(() => {
    if (!open) return;
    // Reset active về item đã select (nếu có) hoặc 0.
    if (isSelectMode) {
      const idx = filtered.findIndex((it) => it.value === value);
      setActiveIdx(idx >= 0 ? idx : filtered.length > 0 ? 0 : -1);
    }
  }, [open, isSelectMode, filtered, value]);

  // Scroll active item vào view.
  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${activeIdx}"]`);
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  function handleSelect(item) {
    if (item.disabled) return;
    onChange?.(item.value, item);
    close();
  }

  // Trigger — clone user's trigger để inject onClick, hoặc dùng default select-style.
  const triggerNode = trigger ? (
    React.isValidElement(trigger) ? (
      React.cloneElement(trigger, {
        onClick: (e) => {
          trigger.props.onClick?.(e);
          if (!e.defaultPrevented) toggle();
        },
        disabled: disabled || trigger.props.disabled,
        "aria-haspopup": isSelectMode ? "listbox" : "menu",
        "aria-expanded": open,
      })
    ) : (
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-haspopup={isSelectMode ? "listbox" : "menu"}
        aria-expanded={open}
      >
        {trigger}
      </button>
    )
  ) : isSelectMode ? (
    <DefaultSelectTrigger
      label={selected?.label}
      placeholder={placeholder}
      open={open}
      disabled={disabled}
      onClick={toggle}
      aria-invalid={invalid || undefined}
    />
  ) : null;

  const menu = (
    <div
      ref={listRef}
      role={isSelectMode ? "listbox" : "menu"}
      data-open={open ? "true" : "false"}
      className={cn(
        "m-dropdown-menu",
        align === "end" ? "end-0" : "start-0",
        placement === "top" ? "bottom-full mb-2 mt-0" : "top-full",
        isSelectMode && "w-full",
        menuClassName,
      )}
      onClick={(e) => {
        if (!isSelectMode && e.target.closest("[data-dropdown-item]")) close();
      }}
    >
      {searchable && isSelectMode && (
        <div className="mb-1 -mx-2 -mt-2 px-3 py-2 border-b border-default-200">
          <input
            ref={searchRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full outline-none bg-transparent text-sm text-default-800 placeholder:text-default-400"
          />
        </div>
      )}

      {isSelectMode ? (
        filtered.length === 0 ? (
          <div className="px-3 py-2 text-sm text-default-500">{emptyText}</div>
        ) : (
          <div className="max-h-60 overflow-y-auto -mx-2 px-2">
            {filtered.map((it, idx) => {
              const isSelected = it.value === value;
              const isActive = idx === activeIdx;
              return (
                <button
                  key={String(it.value)}
                  type="button"
                  role="option"
                  data-idx={idx}
                  aria-selected={isSelected}
                  disabled={it.disabled}
                  onClick={() => handleSelect(it)}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={cn(
                    "m-dropdown-item w-full text-start",
                    isActive && !isSelected && "bg-default-100",
                    isSelected && "bg-primary/10 text-primary font-medium",
                    it.disabled && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <span className="flex-1 truncate">{it.label ?? String(it.value)}</span>
                  {isSelected && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="shrink-0"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )
      ) : (
        children
      )}
    </div>
  );

  return (
    <div className={cn(isSelectMode ? "w-full" : "", containerClassName)}>
      {label && <label className="form-label">{label}</label>}
      <div
        ref={rootRef}
        className={cn(
          "relative",
          isSelectMode ? "block w-full" : "inline-block",
          className,
        )}
      >
        {triggerNode}
        {menu}
      </div>
      {invalid ? (
        <p className="form-error">{error}</p>
      ) : hint ? (
        <p className="form-hint">{hint}</p>
      ) : null}
    </div>
  );
}

function MDropdownItem({
  children,
  danger,
  className,
  as: Component = "button",
  ...rest
}) {
  return (
    <Component
      type={Component === "button" ? "button" : undefined}
      role="menuitem"
      data-dropdown-item
      className={cn(
        "m-dropdown-item w-full text-start",
        danger && "is-danger",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

function MDropdownDivider({ className }) {
  return <div role="separator" className={cn("m-dropdown-divider", className)} />;
}

function MDropdownHeader({ children, className }) {
  return (
    <div
      className={cn(
        "px-3 py-1 text-xs font-semibold text-default-500 uppercase",
        className,
      )}
    >
      {children}
    </div>
  );
}

export const MDropdown = Object.assign(MDropdownRoot, {
  Item: MDropdownItem,
  Divider: MDropdownDivider,
  Header: MDropdownHeader,
});

export default MDropdown;
