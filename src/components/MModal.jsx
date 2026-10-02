import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn.js";

/*
 * MModal — dialog controlled, portal ra document.body.
 *
 * CƠ CHẾ ĐÓNG — mặc định "intentional close only":
 *   - `closeOnBackdrop` default FALSE  → click ra ngoài KHÔNG tắt.
 *   - `closeOnEscape`   default FALSE  → bấm ESC KHÔNG tắt.
 *   - `showCloseButton` default TRUE   → nút X ở header vẫn hiện.
 *
 * Lý do: form chọn nhiều item (import, bulk edit) rất dễ bay state khi
 * lỡ ESC/click lệch — admin phải đóng chủ ý qua X / nút Hủy.
 * Dialog confirm nhẹ muốn ESC-dismiss thì opt-in: `closeOnEscape={true}`.
 *
 * `dismissable` (backward-compat): nếu truyền tường minh (bool), ghi
 * đè cả 3 cờ trên — pattern cũ `dismissable=false` giấu luôn nút X.
 *
 * STYLE: dùng class `.card` + Tailwind utilities (có sẵn ở host portal
 * đã import Tailwind + Tailwick-port CSS). Package tự import
 * `_modal.css` nhưng ở host portal thì class `.card`, `.card-header`,
 * `.card-footer`, `.btn` đã có → không phụ thuộc file CSS riêng của
 * package.
 *
 * Props:
 *   open             : boolean (bắt buộc)
 *   onClose          : () => void — gọi bởi nút X / backdrop / ESC
 *                      (tuỳ cờ bật/tắt).
 *   size             : sm | md | lg | xl | 2xl (default md)
 *   title            : ReactNode — tiêu đề header.
 *   subtitle         : ReactNode — dòng mô tả nhỏ dưới title.
 *   footer           : ReactNode — footer card.
 *   closeOnBackdrop  : boolean (default false)
 *   closeOnEscape    : boolean (default false)
 *   showCloseButton  : boolean (default true)
 *   dismissable      : boolean | undefined — backward-compat alias.
 *   className        : extra class cho panel.
 *   bodyClassName    : extra class cho body wrapper.
 */

const SIZE_CLASS = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-6xl",
};

function ModalRoot({
  open,
  onClose,
  size = "md",
  title,
  subtitle,
  footer,
  closeOnBackdrop = false,
  closeOnEscape = false,
  showCloseButton = true,
  dismissable,
  className,
  bodyClassName,
  children,
}) {
  // Backward-compat: `dismissable` tường minh override cả 3.
  // Dùng biến local thay vì mutate prop để React fast refresh ổn.
  const effCloseOnBackdrop =
    dismissable === undefined ? closeOnBackdrop : !!dismissable;
  const effCloseOnEscape =
    dismissable === undefined ? closeOnEscape : !!dismissable;
  const effShowClose =
    dismissable === undefined ? showCloseButton : !!dismissable;

  useEffect(() => {
    if (!open) return undefined;
    // Lock body scroll khi modal mở — trả lại khi cleanup.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let onKey;
    if (effCloseOnEscape) {
      onKey = (e) => {
        if (e.key === "Escape") onClose?.();
      };
      document.addEventListener("keydown", onKey);
    }

    return () => {
      if (onKey) document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, effCloseOnEscape]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const panelSize = SIZE_CLASS[size] || SIZE_CLASS.md;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={(e) => {
        if (effCloseOnBackdrop && e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "card w-full max-h-[85vh] flex flex-col",
          panelSize,
          className,
        )}
      >
        {(title != null || subtitle != null || effShowClose) && (
          <ModalHeader
            title={title}
            subtitle={subtitle}
            onClose={effShowClose ? onClose : undefined}
          />
        )}
        <div className={cn("flex-1 min-h-0 flex flex-col", bodyClassName)}>
          {children}
        </div>
        {footer != null && <ModalFooter>{footer}</ModalFooter>}
      </div>
    </div>,
    document.body,
  );
}

function ModalHeader({ title, subtitle, onClose, children, className }) {
  return (
    <div className={cn("card-header", className)}>
      <div className="flex-1 min-w-0">
        {children ? (
          children
        ) : (
          <>
            {title != null && <h6 className="card-title">{title}</h6>}
            {subtitle != null && (
              <p className="text-xs text-default-500 mt-0.5">{subtitle}</p>
            )}
          </>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="btn btn-sm btn-icon text-default-500 hover:bg-default-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

function ModalBody({ children, className }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

function ModalFooter({ children, className }) {
  return <div className={cn("card-footer", className)}>{children}</div>;
}

export const MModal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});

export default MModal;
