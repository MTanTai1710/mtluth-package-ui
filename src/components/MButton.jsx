import React from "react";
import { cn } from "../utils/cn.js";

/*
 * MButton — nút cơ bản dùng class `btn` từ _buttons.css.
 *
 * Props:
 *   variant  : primary | secondary | success | info | warning | danger | default | ghost
 *   fill     : solid (default) | soft | outline
 *   size     : sm | md (default) | lg | icon
 *   as       : element type để render (a, Link, ...). Mặc định button.
 *   loading  : true → disable + spinner
 *   leftIcon / rightIcon : ReactNode
 */

const VARIANT_CLASS = {
  solid: {
    primary: "btn-primary",
    secondary: "btn-secondary",
    success: "btn-success",
    info: "btn-info",
    warning: "btn-warning",
    danger: "btn-danger",
    default: "btn-default",
    ghost: "btn-ghost",
  },
  soft: {
    primary: "btn-soft-primary",
    secondary: "btn-soft-secondary",
    success: "btn-soft-success",
    info: "btn-soft-info",
    warning: "btn-soft-warning",
    danger: "btn-soft-danger",
    default: "btn-default",
    ghost: "btn-ghost",
  },
  outline: {
    primary: "btn-outline-primary border",
    secondary: "btn-outline-secondary border",
    success: "btn-outline-success border",
    info: "btn-outline-info border",
    warning: "btn-outline-warning border",
    danger: "btn-outline-danger border",
    default: "btn-default border",
    ghost: "btn-ghost border",
  },
};

const SIZE_CLASS = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
  icon: "btn-icon",
};

export const MButton = React.forwardRef(function MButton(
  {
    variant = "primary",
    fill = "solid",
    size = "md",
    as: Component = "button",
    className,
    children,
    leftIcon,
    rightIcon,
    loading = false,
    disabled,
    type,
    ...rest
  },
  ref,
) {
  const variantCls = (VARIANT_CLASS[fill] || VARIANT_CLASS.solid)[variant] || "";
  const sizeCls = SIZE_CLASS[size] || "";
  const isDisabled = disabled || loading;

  const nativeButton = Component === "button";

  return (
    <Component
      ref={ref}
      type={nativeButton ? type || "button" : type}
      disabled={nativeButton ? isDisabled : undefined}
      aria-disabled={!nativeButton && isDisabled ? true : undefined}
      className={cn(
        "btn",
        variantCls,
        sizeCls,
        loading && "opacity-70 pointer-events-none",
        className,
      )}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="inline-block size-4 rounded-full border-2 border-current border-t-transparent animate-spin"
        />
      )}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </Component>
  );
});

export default MButton;
