import React, { useId } from "react";
import { cn } from "../utils/cn.js";

/*
 * MSelect — native <select> wrap style theme.
 *
 * `options` chấp nhận:
 *   - [{ value, label, disabled? }, ...]
 *   - hoặc bỏ prop, dùng children <option>...</option>.
 */

export const MSelect = React.forwardRef(function MSelect(
  {
    label,
    hint,
    error,
    options,
    placeholder,
    className,
    containerClassName,
    id: idProp,
    required,
    children,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const id = idProp || autoId;
  const invalid = error != null && error !== false && error !== "";

  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="ms-0.5 text-danger">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={hint || error ? `${id}-desc` : undefined}
        required={required}
        className={cn("form-input", className)}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {Array.isArray(options)
          ? options.map((opt) => (
              <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
                {opt.label ?? String(opt.value)}
              </option>
            ))
          : children}
      </select>
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

export default MSelect;
