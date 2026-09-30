import React, { useId } from "react";
import { cn } from "../utils/cn.js";

export const MRadio = React.forwardRef(function MRadio(
  { label, className, containerClassName, id: idProp, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer select-none",
        rest.disabled && "opacity-70 cursor-not-allowed",
        containerClassName,
      )}
    >
      <input
        ref={ref}
        id={id}
        type="radio"
        className={cn("form-radio rounded-full text-primary", className)}
        {...rest}
      />
      {label && <span className="text-sm text-default-700">{label}</span>}
    </label>
  );
});

export default MRadio;
