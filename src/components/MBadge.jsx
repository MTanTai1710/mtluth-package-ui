import React from "react";
import { cn } from "../utils/cn.js";

const VARIANT_CLASS = {
  solid: {
    primary: "badge-primary",
    secondary: "badge-secondary",
    success: "badge-success",
    info: "badge-info",
    warning: "badge-warning",
    danger: "badge-danger",
    default: "badge-default",
  },
  soft: {
    primary: "badge-soft-primary",
    secondary: "badge-soft-secondary",
    success: "badge-soft-success",
    info: "badge-soft-info",
    warning: "badge-soft-warning",
    danger: "badge-soft-danger",
    default: "badge-default",
  },
  outline: {
    primary: "badge-outline-primary border",
    secondary: "badge-outline-secondary border",
    success: "badge-outline-success border",
    info: "badge-outline-info border",
    warning: "badge-outline-warning border",
    danger: "badge-outline-danger border",
    default: "badge-default border",
  },
};

const SIZE_CLASS = { sm: "badge-sm", md: "", lg: "badge-lg" };

export function MBadge({
  variant = "primary",
  fill = "soft",
  size = "md",
  className,
  children,
  ...rest
}) {
  const variantCls = (VARIANT_CLASS[fill] || VARIANT_CLASS.soft)[variant] || "";
  return (
    <span className={cn("badge", variantCls, SIZE_CLASS[size], className)} {...rest}>
      {children}
    </span>
  );
}

export default MBadge;
