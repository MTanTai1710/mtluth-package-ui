import React, { useCallback, useRef, useState } from "react";
import { MModal } from "./MModal.jsx";
import { MButton } from "./MButton.jsx";
import { cn } from "../utils/cn.js";

/*
 * MModalConfirm — dialog xác nhận thay cho `window.confirm`.
 *
 * Build trên MModal: compact size="sm" + icon theo variant + 2 nút
 * Hủy / Xác nhận. Default `closeOnBackdrop=true` + `closeOnEscape=true`
 * — confirm dialog nhẹ, user bấm ngoài hay ESC = cancel (ngược với
 * MModal mặc định "intentional close only" cho form nhiều state).
 *
 * Hai cách dùng:
 *
 * 1) Declarative — <MModalConfirm open={...} onConfirm={...} ...>
 *    Parent giữ state. Tốt khi cần tích hợp sâu (controlled loading,
 *    custom content).
 *
 * 2) Imperative — const { confirm, confirmModal } = useMModalConfirm();
 *    `await confirm({...})` trả về true/false, 1:1 với window.confirm.
 *    Nhớ render `{confirmModal}` 1 lần trong JSX. Dùng khi muốn thay
 *    `window.confirm` tối thiểu churn.
 *
 * Props (declarative):
 *   open             : boolean
 *   onConfirm        : () => void | Promise<void>
 *                      Nếu trả Promise, nút Xác nhận auto bật loading
 *                      tới khi resolve. Reject KHÔNG tự đóng modal
 *                      (parent xử lý error, giữ dialog mở để retry).
 *   onCancel         : () => void
 *   title            : ReactNode (default "Xác nhận")
 *   message          : ReactNode — câu hỏi chính.
 *   description      : ReactNode — dòng phụ dưới message (vd disclaimer).
 *   variant          : "primary" | "danger" | "warning" | "info"
 *                      (default "primary"). Quy định màu icon + nút confirm.
 *   destructive      : boolean — syntactic sugar của variant="danger".
 *   confirmLabel     : ReactNode (default "OK")
 *   cancelLabel      : ReactNode (default "Hủy")
 *   loading          : boolean — controlled override. Nếu không truyền
 *                      thì tự track theo Promise của onConfirm.
 *   size             : passthrough MModal (default "sm")
 *   icon             : ReactNode | null — override icon mặc định.
 *                      Truyền `null` để ẩn icon hoàn toàn.
 *   closeOnBackdrop  : boolean (default true)
 *   closeOnEscape    : boolean (default true)
 */

const DEFAULT_ICONS = {
  danger: (
    // Triangle alert — nguy hiểm, hành động phá hoại.
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  warning: (
    // Circle alert — cảnh báo nhẹ.
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  info: (
    // Circle info — thông tin.
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  primary: (
    // Circle help — câu hỏi generic.
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const VARIANT_META = {
  primary: {
    confirmVariant: "primary",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  danger: {
    confirmVariant: "danger",
    iconBg: "bg-danger/10",
    iconColor: "text-danger",
  },
  warning: {
    confirmVariant: "warning",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
  info: {
    confirmVariant: "info",
    iconBg: "bg-info/10",
    iconColor: "text-info",
  },
};

export function MModalConfirm({
  open,
  onConfirm,
  onCancel,
  title = "Xác nhận",
  message,
  description,
  variant = "primary",
  destructive = false,
  confirmLabel = "OK",
  cancelLabel = "Hủy",
  loading: controlledLoading,
  size = "sm",
  icon,
  closeOnBackdrop = true,
  closeOnEscape = true,
}) {
  // Loading tự track theo Promise của onConfirm. Parent có thể override
  // bằng prop `loading` cho controlled flow.
  const [busy, setBusy] = useState(false);
  const isLoading = controlledLoading ?? busy;

  const effVariant = destructive ? "danger" : variant;
  const meta = VARIANT_META[effVariant] || VARIANT_META.primary;
  const effIcon =
    icon === undefined ? DEFAULT_ICONS[effVariant] || DEFAULT_ICONS.primary : icon;

  const handleConfirm = useCallback(async () => {
    if (isLoading) return;
    try {
      setBusy(true);
      await onConfirm?.();
    } finally {
      setBusy(false);
    }
  }, [onConfirm, isLoading]);

  const footer = (
    <>
      <MButton
        variant="default"
        size="sm"
        onClick={onCancel}
        disabled={isLoading}
      >
        {cancelLabel}
      </MButton>
      <MButton
        variant={meta.confirmVariant}
        size="sm"
        onClick={handleConfirm}
        loading={isLoading}
      >
        {confirmLabel}
      </MButton>
    </>
  );

  return (
    <MModal
      open={!!open}
      onClose={isLoading ? undefined : onCancel}
      size={size}
      // Không dùng header của MModal — layout custom icon-bên-trái.
      showCloseButton={false}
      closeOnBackdrop={closeOnBackdrop && !isLoading}
      closeOnEscape={closeOnEscape && !isLoading}
      footer={footer}
    >
      <div className="p-5 flex gap-4">
        {effIcon && (
          <div
            className={cn(
              "shrink-0 rounded-full size-10 flex items-center justify-center",
              meta.iconBg,
            )}
          >
            <span className={cn("inline-flex", meta.iconColor)}>
              {effIcon}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title != null && (
            <h6 className="text-base font-medium text-default-900 mb-1">
              {title}
            </h6>
          )}
          {message != null && (
            <p className="text-sm text-default-700 whitespace-pre-wrap wrap-break-word">
              {message}
            </p>
          )}
          {description != null && (
            <p className="text-xs text-default-500 mt-2 whitespace-pre-wrap wrap-break-word">
              {description}
            </p>
          )}
        </div>
      </div>
    </MModal>
  );
}

/*
 * useMModalConfirm — hook imperative, 1:1 với window.confirm.
 *
 *   const { confirm, confirmModal } = useMModalConfirm();
 *
 *   const ok = await confirm({
 *     title: "Xoá entity",
 *     message: `Xoá hẳn "${ent.name}"?`,
 *     variant: "danger",
 *     confirmLabel: "Xoá",
 *   });
 *   if (!ok) return;
 *
 *   // Trong JSX:
 *   return (<>... {confirmModal}</>);
 *
 * Trả về:
 *   confirm(options) → Promise<boolean>
 *     - options: tất cả props MModalConfirm (trừ open/onConfirm/onCancel).
 *     - Nếu `options.onConfirm` được truyền và trả Promise, modal giữ
 *       loading tới khi resolve rồi mới resolve hook promise = true.
 *       (dùng khi muốn giữ modal mở trong lúc gọi API).
 *     - Mặc định không có onConfirm thì resolve ngay = true khi user bấm OK.
 *   confirmModal: ReactNode — render một lần trong tree.
 */
export function useMModalConfirm(defaults = {}) {
  const [state, setState] = useState({ open: false, options: {} });
  // Giữ resolver của promise active. Lưu ở ref thay vì state để setter
  // không trigger re-render thừa khi resolve.
  const resolverRef = useRef(null);

  const confirm = useCallback(
    (options = {}) =>
      new Promise((resolve) => {
        // Nếu có dialog cũ chưa đóng (bất thường), resolve nó = false
        // trước khi mở cái mới — tránh promise leak.
        if (resolverRef.current) resolverRef.current(false);
        resolverRef.current = resolve;
        setState({ open: true, options: { ...defaults, ...options } });
      }),
    [defaults],
  );

  const close = useCallback((result) => {
    const r = resolverRef.current;
    resolverRef.current = null;
    setState((s) => ({ ...s, open: false }));
    r?.(result);
  }, []);

  const handleConfirm = useCallback(async () => {
    const custom = state.options?.onConfirm;
    if (typeof custom === "function") {
      // Nếu caller cung cấp onConfirm (vd gọi API), đợi xong mới
      // resolve = true. Nếu throw thì KHÔNG đóng (caller tự xử lý error).
      await custom();
    }
    close(true);
  }, [state.options, close]);

  const handleCancel = useCallback(() => close(false), [close]);

  const { onConfirm: _ignored, ...propsForModal } = state.options || {};
  const confirmModal = (
    <MModalConfirm
      {...propsForModal}
      open={state.open}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, confirmModal };
}

export default MModalConfirm;
