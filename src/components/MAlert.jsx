import React, { useState } from "react";
import { cn } from "../utils/cn.js";

const VARIANT_CLASS = {
  soft: {
    primary: "alert-primary",
    secondary: "alert-secondary",
    success: "alert-success",
    info: "alert-info",
    warning: "alert-warning",
    danger: "alert-danger",
  },
  solid: {
    primary: "alert-solid-primary",
    secondary: "alert-solid-secondary",
    success: "alert-solid-success",
    info: "alert-solid-info",
    warning: "alert-solid-warning",
    danger: "alert-solid-danger",
  },
};

/*
 * MAlert — thanh thông báo.
 *
 * `dismissible=true` → tự quản state đóng bằng nội bộ (nếu consumer không
 * truyền `onClose`) hoặc bắn callback (nếu có) và consumer tự ẩn.
 */
export function MAlert({
  variant = "info",
  fill = "soft",
  title,
  icon,
  dismissible = false,
  onClose,
  className,
  children,
  ...rest
}) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const variantCls = (VARIANT_CLASS[fill] || VARIANT_CLASS.soft)[variant] || "";

  function handleClose() {
    if (onClose) onClose();
    else setOpen(false);
  }

  return (
    <div role="alert" className={cn("alert", variantCls, className)} {...rest}>
      {icon && <span className="shrink-0 mt-0.5">{icon}</span>}
      <div className="flex-1 min-w-0">
        {title && <div className="alert-title">{title}</div>}
        <div className="text-sm">{children}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="alert-close"
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

export default MAlert;
