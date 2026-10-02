import React, { useId, useLayoutEffect, useRef } from "react";
import { cn } from "../utils/cn.js";

/*
 * MTextarea — textarea với label/hint/error và tuỳ chọn auto-height.
 *
 * Props mở rộng ngoài prop <textarea> gốc:
 *   label / hint / error / containerClassName — tiêu chuẩn form.
 *   rows             — số dòng tối thiểu (default 4). Vẫn áp cho autoHeight
 *                       (dòng min hiển thị trước khi phình).
 *   autoHeight       — bool, default false. Bật → height = scrollHeight
 *                       mỗi lần `value` đổi, scrollbar bị ẩn, user KHÔNG
 *                       drag resize được. Chỉ hoạt động chuẩn với
 *                       `value` controlled; uncontrolled dùng
 *                       `defaultValue` chỉ fit size ban đầu.
 */

export const MTextarea = React.forwardRef(function MTextarea(
  {
    label,
    hint,
    error,
    autoHeight = false,
    className,
    containerClassName,
    id: idProp,
    required,
    rows = 4,
    value,
    defaultValue,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const id = idProp || autoId;
  const invalid = error != null && error !== false && error !== "";

  // Giữ ref nội bộ để useLayoutEffect đo scrollHeight. Nếu consumer
  // truyền ref ngoài, forward song song — pattern "combined ref".
  const innerRef = useRef(null);
  const setRefs = (el) => {
    innerRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  // Auto-height: reset về `auto` trước khi đọc scrollHeight để content
  // thu hẹp cũng co lại được (không set auto thì scrollHeight = height
  // cũ, textarea chỉ to lên không bao giờ nhỏ xuống). useLayoutEffect
  // chạy trước paint → không flash scrollbar frame đầu.
  useLayoutEffect(() => {
    if (!autoHeight) return;
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [autoHeight, value, defaultValue]);

  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="ms-0.5 text-danger">*</span>}
        </label>
      )}
      <textarea
        ref={setRefs}
        id={id}
        rows={rows}
        value={value}
        defaultValue={defaultValue}
        aria-invalid={invalid || undefined}
        aria-describedby={hint || error ? `${id}-desc` : undefined}
        required={required}
        className={cn(
          "form-input",
          // resize-none + overflow-hidden: khoá kéo tay + ẩn scrollbar
          // khi auto-grow. Không áp khi autoHeight=false để giữ hành vi
          // native (user drag resize + scroll).
          autoHeight && "resize-none overflow-hidden",
          className,
        )}
        {...rest}
      />
      {invalid ? (
        <p id={`${id}-desc`} className="form-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-desc`} className="form-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default MTextarea;
