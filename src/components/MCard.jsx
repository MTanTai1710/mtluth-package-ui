import React from "react";
import { cn } from "../utils/cn.js";

/*
 * MCard — thẻ chứa nội dung, layout: header (tùy chọn) → body → footer.
 *
 * 2 cách dùng:
 *   1) Compact:
 *      <MCard title="Tiêu đề" footer={<Btn/>}>Nội dung</MCard>
 *
 *   2) Composable (khi header có action, tabs, ...):
 *      <MCard>
 *        <MCard.Header><MCard.Title>Tiêu đề</MCard.Title><action/></MCard.Header>
 *        <MCard.Body>Nội dung</MCard.Body>
 *        <MCard.Footer>Footer</MCard.Footer>
 *      </MCard>
 */

function CardRoot({ title, actions, footer, children, className, ...rest }) {
  const hasCompactHeader = title != null || actions != null;
  return (
    <div className={cn("card", className)} {...rest}>
      {hasCompactHeader && (
        <MCard.Header>
          {title && <MCard.Title>{title}</MCard.Title>}
          {actions}
        </MCard.Header>
      )}
      {/*
       * Nếu consumer đã dùng MCard.Body bên trong children thì không wrap
       * lần nữa — thô nhưng đủ: nhìn children là mảng React elements.
       */}
      {title != null || actions != null || footer != null ? (
        <MCard.Body>{children}</MCard.Body>
      ) : (
        children
      )}
      {footer != null && <MCard.Footer>{footer}</MCard.Footer>}
    </div>
  );
}

export function MCardHeader({ className, ...rest }) {
  return <div className={cn("card-header", className)} {...rest} />;
}
export function MCardBody({ className, ...rest }) {
  return <div className={cn("card-body", className)} {...rest} />;
}
export function MCardFooter({ className, ...rest }) {
  return <div className={cn("card-footer", className)} {...rest} />;
}
export function MCardTitle({ className, as: Component = "h5", ...rest }) {
  return <Component className={cn("card-title", className)} {...rest} />;
}

export const MCard = Object.assign(CardRoot, {
  Header: MCardHeader,
  Body: MCardBody,
  Footer: MCardFooter,
  Title: MCardTitle,
});

export default MCard;
