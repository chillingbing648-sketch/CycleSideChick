/**
 * CycleSideChick — Card Primitive
 * Variants: base | raised | hero | glass | tinted
 */

import React from "react";

export function Card({
  variant = "base",
  tint = "rose",
  interactive = false,
  as: Component = "div",
  header,
  footer,
  children,
  className = "",
  ...props
}) {
  const variantClass = `c-card--${variant}`;
  const tintClass = variant === "tinted" ? `c-card--tint-${tint}` : "";
  const interactiveClass = interactive ? "c-card--interactive" : "";

  return (
    <Component
      className={`c-card ${variantClass} ${tintClass} ${interactiveClass} ${className}`.trim()}
      {...props}
    >
      {header && <div className="c-card__header">{header}</div>}
      <div className="c-card__body">{children}</div>
      {footer && <div className="c-card__footer">{footer}</div>}
    </Component>
  );
}
