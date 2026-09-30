import React, { useId } from "react";
import { cn } from "../utils/cn.js";

/*
 * MInput — text input với label/hint/error tuỳ chọn.
 *
 * Props:
 *   label, hint, error : ReactNode
 *   size               : sm | md (default) | lg
 *   leftAddon/rightAddon : phần tử nằm chồng bên trong (icon, unit, ...)
 *   containerClassName : class cho wrapper (label + input + hint block)
 *   Mọi prop khác forward xuống <input>.
 */

const SIZE_CLASS = {
  sm: "form-input-sm",
  md: "",
  lg: "form-input-lg",
};

export const MInput = React.forwardRef(function MInput(
  {
    label,
    hint,
    error,
    size = "md",
    leftAddon,
    rightAddon,
    className,
    containerClassName,
    id: idProp,
    required,
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
      <div className={cn("relative", (leftAddon || rightAddon) && "flex items-center")}>
        {leftAddon && (
          <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-default-400 pointer-events-none">
            {leftAddon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={hint || error ? `${id}-desc` : undefined}
          required={required}
          className={cn(
            "form-input",
            SIZE_CLASS[size],
            leftAddon && "ps-9",
            rightAddon && "pe-9",
            className,
          )}
          {...rest}
        />
        {rightAddon && (
          <span className="absolute inset-y-0 end-0 flex items-center pe-3 text-default-400">
            {rightAddon}
          </span>
        )}
      </div>
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

export default MInput;
