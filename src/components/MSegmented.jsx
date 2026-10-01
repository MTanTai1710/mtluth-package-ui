import React from "react";
import { cn } from "../utils/cn.js";

/*
 * MSegmented — segmented control / toggle button group, chọn 1 trong N.
 *
 * Dùng khi option là mutually-exclusive nhưng ít (2-4) và cần luôn hiện
 * tất cả — hơn radio vì nhìn compact hơn, hơn dropdown vì click nhanh hơn.
 *
 *   <MSegmented
 *     value={op}
 *     onChange={setOp}
 *     options={[
 *       { value: 'and', label: 'AND' },
 *       { value: 'or',  label: 'OR' },
 *     ]}
 *   />
 *
 * Props:
 *   options   : [{value, label, icon?, disabled?}]
 *   value     : giá trị đang chọn
 *   onChange  : (value, item) => void
 *   size      : sm | md (default) | lg
 *   fullWidth : true → dàn đều theo width container
 *   variant   : primary (default) | secondary | success | info | warning | danger
 */

const SIZE_HEIGHT = { sm: "1.75rem", md: "2.25rem", lg: "2.75rem" };
const SIZE_PADDING = { sm: "0 0.75rem", md: "0 1rem", lg: "0 1.25rem" };
const SIZE_FONT = { sm: "0.75rem", md: "0.875rem", lg: "1rem" };

const VARIANT_BG = {
  primary: "var(--color-primary, #3b82f6)",
  secondary: "var(--color-secondary, #8b5cf6)",
  success: "var(--color-success, #22c55e)",
  info: "var(--color-info, #0ea5e9)",
  warning: "var(--color-warning, #f59e0b)",
  danger: "var(--color-danger, #f97316)",
};

export function MSegmented({
  options = [],
  value,
  onChange,
  size = "md",
  fullWidth = false,
  variant = "primary",
  className,
  label,
  hint,
  disabled = false,
  ...rest
}) {
  const activeBg = VARIANT_BG[variant] ?? VARIANT_BG.primary;

  return (
    <div {...rest} className={cn(fullWidth && "w-full", className)}>
      {label && <label className="form-label">{label}</label>}
      <div
        role="radiogroup"
        className={cn("m-segmented", fullWidth && "m-segmented-full")}
        data-size={size}
      >
        {options.map((opt) => {
          const isActive = opt.value === value;
          const isDisabled = disabled || opt.disabled;
          return (
            <button
              key={String(opt.value)}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={isDisabled}
              onClick={() => !isDisabled && onChange?.(opt.value, opt)}
              className={cn(
                "m-segmented-item",
                isActive && "is-active",
                isDisabled && "is-disabled",
              )}
              style={{
                height: SIZE_HEIGHT[size],
                padding: SIZE_PADDING[size],
                fontSize: SIZE_FONT[size],
                "--m-seg-active-bg": activeBg,
              }}
            >
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              <span>{opt.label ?? String(opt.value)}</span>
            </button>
          );
        })}
      </div>
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}

export default MSegmented;
