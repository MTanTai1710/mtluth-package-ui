import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn.js";

/*
 * MModal — dialog controlled, portal ra document.body.
 *
 * Props:
 *   open        : boolean (bắt buộc)
 *   onClose     : () => void — gọi khi click backdrop hoặc bấm ESC
 *   size        : sm | md (default) | lg | xl
 *   title       : ReactNode (nếu có → render MModal.Header mặc định)
 *   footer      : ReactNode (nếu có → render MModal.Footer mặc định)
 *   dismissable : true (default) — cho phép ESC / click backdrop đóng
 */

function ModalRoot({
  open,
  onClose,
  size = "md",
  title,
  footer,
  dismissable = true,
  className,
  children,
}) {
  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === "Escape" && dismissable) onClose?.();
    }
    document.addEventListener("keydown", onKey);
    // Lock body scroll khi mở modal — trả lại khi cleanup.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, dismissable]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="m-modal-backdrop"
      onClick={(e) => {
        if (dismissable && e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={cn("m-modal-panel", `size-${size}`, className)}>
        {(title != null || dismissable) && (
          <ModalHeader onClose={dismissable ? onClose : undefined}>{title}</ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        {footer != null && <ModalFooter>{footer}</ModalFooter>}
      </div>
    </div>,
    document.body,
  );
}

function ModalHeader({ children, onClose, className }) {
  return (
    <div className={cn("m-modal-header", className)}>
      <h3 className="m-modal-title">{children}</h3>
      {onClose && (
        <button
          type="button"
          aria-label="Close"
          className="m-modal-close"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
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
  return <div className={cn("m-modal-body", className)}>{children}</div>;
}

function ModalFooter({ children, className }) {
  return <div className={cn("m-modal-footer", className)}>{children}</div>;
}

export const MModal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});

export default MModal;
