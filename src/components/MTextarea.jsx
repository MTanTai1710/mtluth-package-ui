import React, { useId } from "react";
import { cn } from "../utils/cn.js";

export const MTextarea = React.forwardRef(function MTextarea(
  {
    label,
    hint,
    error,
    className,
    containerClassName,
    id: idProp,
    required,
    rows = 4,
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
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={invalid || undefined}
        aria-describedby={hint || error ? `${id}-desc` : undefined}
        required={required}
        className={cn("form-input", className)}
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
