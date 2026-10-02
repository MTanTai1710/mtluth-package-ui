import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn.js";

/*
 * MToast — hệ thống toast notification đứng độc lập (portal + fixed
 * position + stacking + auto-dismiss + animation).
 *
 * ĐỪNG DÙNG MAlert làm toast — MAlert render inline trong flow trang,
 * không shadow / không fixed / không stack → trông như banner tĩnh.
 *
 * Hai cách dùng (chọn 1 — không trộn):
 *
 * 1) Imperative (khuyến nghị, giống `toast()` của sonner / react-hot-toast):
 *
 *      const { toast, toastContainer } = useMToast();
 *
 *      toast.success("Đã lưu.");
 *      toast.error("Lưu thất bại.", { description: err.message });
 *      const id = toast({ variant: "info", message: "...", duration: 0 });
 *      toast.dismiss(id);   // đóng cụ thể
 *      toast.dismiss();     // đóng tất cả
 *
 *      return <>{...}{toastContainer}</>;
 *
 * 2) Declarative — <MToastContainer /> + state cha. Dùng khi cần
 *    control chặt (vd persist qua navigation). Hiếm.
 *
 * Props toast item:
 *   variant     : "success" | "danger" | "warning" | "info" | "primary"
 *                 (default "info")
 *   message     : ReactNode — dòng chính.
 *   description : ReactNode — dòng phụ nhỏ hơn ở dưới (optional).
 *   title       : alias của message khi muốn message ngắn + description dài.
 *   duration    : ms auto-dismiss (default 3500). `0` hoặc `null` = không
 *                 tự tắt (user bắt buộc bấm X).
 *   dismissible : boolean (default true) — hiện nút X.
 *   icon        : ReactNode | null — override icon mặc định. `null` ẩn.
 *   onClose     : () => void — callback khi toast bị đóng (bởi timer
 *                 hoặc X).
 *
 * Props container:
 *   position    : "top-right" | "top-left" | "top-center"
 *                 | "bottom-right" | "bottom-left" | "bottom-center"
 *                 (default "top-right")
 *   max         : số toast tối đa stack cùng lúc (default 5).
 *                 Vượt → toast cũ nhất bị kick ra.
 *   gap         : khoảng cách giữa các toast (Tailwind spacing, default 2).
 */

const VARIANT_META = {
  success: {
    border: "border-l-emerald-500",
    icon: "text-emerald-500",
    iconDefault: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
  },
  danger: {
    border: "border-l-rose-500",
    icon: "text-rose-500",
    iconDefault: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  warning: {
    border: "border-l-amber-500",
    icon: "text-amber-500",
    iconDefault: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  info: {
    border: "border-l-sky-500",
    icon: "text-sky-500",
    iconDefault: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  primary: {
    border: "border-l-indigo-500",
    icon: "text-indigo-500",
    iconDefault: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
};

const POSITION_META = {
  "top-right": {
    container: "top-4 right-4 items-end",
    enter: "translate-x-4",
  },
  "top-left": {
    container: "top-4 left-4 items-start",
    enter: "-translate-x-4",
  },
  "top-center": {
    container: "top-4 left-1/2 -translate-x-1/2 items-center",
    enter: "-translate-y-4",
  },
  "bottom-right": {
    container: "bottom-4 right-4 items-end flex-col-reverse",
    enter: "translate-x-4",
  },
  "bottom-left": {
    container: "bottom-4 left-4 items-start flex-col-reverse",
    enter: "-translate-x-4",
  },
  "bottom-center": {
    container: "bottom-4 left-1/2 -translate-x-1/2 items-center flex-col-reverse",
    enter: "translate-y-4",
  },
};

const DEFAULT_DURATION = 3500;

/*
 * MToastItem — 1 toast, tự quản animation enter/leave + timer.
 * Không nên dùng trực tiếp; MToastContainer sẽ render.
 */
function MToastItem({ toast, enterTranslate, onClose }) {
  const {
    id,
    variant = "info",
    message,
    description,
    title,
    duration = DEFAULT_DURATION,
    dismissible = true,
    icon,
  } = toast;

  const meta = VARIANT_META[variant] || VARIANT_META.info;
  const effIcon = icon === undefined ? meta.iconDefault : icon;

  // State enter animation: mount với translate + opacity-0, sau 1 frame
  // chuyển sang translate-0 + opacity-100.
  const [entered, setEntered] = useState(false);
  // leaving: để fade-out trước khi parent remove khỏi list.
  const [leaving, setLeaving] = useState(false);
  const closedRef = useRef(false);

  useEffect(() => {
    const r = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(r);
  }, []);

  const handleClose = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    setLeaving(true);
    // Chờ animation leave xong mới remove khỏi parent list.
    setTimeout(() => {
      toast.onClose?.();
      onClose(id);
    }, 180);
  }, [id, onClose, toast]);

  useEffect(() => {
    if (!duration) return undefined;
    const t = setTimeout(handleClose, duration);
    return () => clearTimeout(t);
  }, [duration, handleClose]);

  const headline = message ?? title;

  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      aria-live={variant === "danger" ? "assertive" : "polite"}
      className={cn(
        "pointer-events-auto flex items-start gap-3 min-w-70 max-w-sm",
        "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100",
        "border border-neutral-200 dark:border-neutral-700",
        "border-l-4", meta.border,
        "rounded-md shadow-lg px-4 py-3",
        "transition-all duration-200 ease-out",
        !entered || leaving ? `opacity-0 ${enterTranslate}` : "opacity-100 translate-x-0 translate-y-0",
      )}
    >
      {effIcon && (
        <span className={cn("shrink-0 mt-0.5 inline-flex", meta.icon)}>
          {effIcon}
        </span>
      )}
      <div className="flex-1 min-w-0 text-sm">
        {headline != null && (
          <div className="font-medium wrap-break-word whitespace-pre-wrap">
            {headline}
          </div>
        )}
        {description != null && (
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 wrap-break-word whitespace-pre-wrap">
            {description}
          </div>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          aria-label="Đóng"
          onClick={handleClose}
          className="shrink-0 -mt-0.5 -mr-1 inline-flex p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

/*
 * MToastContainer — render list toast ở vị trí cố định, portal document.body.
 *
 * Dùng declarative (hiếm): <MToastContainer toasts={[...]} onDismiss={...}/>
 * Phần lớn consumer dùng qua `useMToast()`.
 */
export function MToastContainer({
  toasts = [],
  onDismiss,
  position = "top-right",
  gap = 2,
}) {
  if (typeof document === "undefined") return null;
  const posMeta = POSITION_META[position] || POSITION_META["top-right"];

  return createPortal(
    <div
      // z-[60] để trên MModal (z-50). pointer-events-none ở container
      // để chỗ trống giữa toast không chặn click vào trang; mỗi toast
      // override lại pointer-events-auto.
      //
      // gap qua inline style vì Tailwind JIT không purge dynamic class
      // (`gap-${n}` không tồn tại trong source → bị strip).
      className={cn(
        "fixed z-60 flex flex-col pointer-events-none",
        posMeta.container,
      )}
      style={{ gap: gap * 4 }}
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <MToastItem
          key={t.id}
          toast={t}
          enterTranslate={posMeta.enter}
          onClose={onDismiss}
        />
      ))}
    </div>,
    document.body,
  );
}

/*
 * useMToast — hook imperative. Trả về {toast, toastContainer}:
 *
 *   toast(options)         → id
 *   toast.success(msg, opt)
 *   toast.error(msg, opt)
 *   toast.warning(msg, opt)
 *   toast.info(msg, opt)
 *   toast.dismiss(id?)     — không truyền id = đóng tất cả
 *   toast.update(id, opt)  — merge options vào toast đang hiện
 *
 * `options` = props của MToastItem (variant/message/description/duration/...)
 */
let TOAST_COUNTER = 0;
function nextId() {
  TOAST_COUNTER += 1;
  return `t${TOAST_COUNTER}`;
}

export function useMToast({ position = "top-right", max = 5, gap = 2 } = {}) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) =>
      id == null ? [] : list.filter((t) => t.id !== id),
    );
  }, []);

  const push = useCallback(
    (opts) => {
      const id = opts?.id || nextId();
      // Nếu id đã tồn tại → update tại chỗ (tránh dupe khi caller
      // dùng id custom).
      setToasts((list) => {
        const existing = list.findIndex((t) => t.id === id);
        if (existing >= 0) {
          const next = list.slice();
          next[existing] = { ...next[existing], ...opts, id };
          return next;
        }
        const next = [...list, { ...opts, id }];
        // Giới hạn stack — bỏ cái cũ nhất.
        return next.length > max ? next.slice(next.length - max) : next;
      });
      return id;
    },
    [max],
  );

  const update = useCallback((id, patch) => {
    setToasts((list) =>
      list.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  }, []);

  // API toast() dạng hàm + shortcut (toast.success / toast.error / ...).
  const toast = useMemo(() => {
    const fn = (opts) => push(opts || {});
    fn.success = (message, opts = {}) =>
      push({ variant: "success", message, ...opts });
    fn.error = (message, opts = {}) =>
      push({ variant: "danger", message, ...opts });
    fn.danger = fn.error;
    fn.warning = (message, opts = {}) =>
      push({ variant: "warning", message, ...opts });
    fn.info = (message, opts = {}) =>
      push({ variant: "info", message, ...opts });
    fn.dismiss = dismiss;
    fn.update = update;
    return fn;
  }, [push, dismiss, update]);

  const toastContainer = (
    <MToastContainer
      toasts={toasts}
      onDismiss={dismiss}
      position={position}
      gap={gap}
    />
  );

  return { toast, toastContainer, toasts, dismiss };
}

/*
 * MToast — alias default export cho declarative single-toast dùng ít.
 * Component này giả định consumer tự quản state visible.
 */
export function MToast({ open = true, onClose, ...props }) {
  if (!open) return null;
  // Dùng Container 1-item để tận dụng positioning + animation sẵn.
  const toast = { id: "mtoast-single", ...props };
  return (
    <MToastContainer
      toasts={[toast]}
      onDismiss={() => onClose?.()}
      position={props.position || "top-right"}
    />
  );
}

export default MToast;
