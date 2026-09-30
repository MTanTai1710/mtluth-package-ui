import React, { useId } from "react";
import { cn } from "../utils/cn.js";

/*
 * MSwitch — toggle on/off, style dùng class `form-switch`.
 *
 * Controlled: `checked` + `onChange`
 * Uncontrolled: `defaultChecked`
 */
export const MSwitch = React.forwardRef(function MSwitch(
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
        type="checkbox"
        role="switch"
        className={cn("form-switch", className)}
        {...rest}
      />
      {label && <span className="text-sm text-default-700">{label}</span>}
    </label>
  );
});

export default MSwitch;
