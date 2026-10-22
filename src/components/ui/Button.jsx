/**
 * CycleSideChick — Button Primitive
 * Variants: primary | secondary | ghost | danger | pill
 * Sizes: sm | md | lg
 * States: default | hover | pressed | focus-visible | loading | success | disabled
 */

import React from "react";
import { Icon } from "./Icon.jsx";

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  success = false,
  icon,
  children,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  const classes = [
    "c-btn",
    `c-btn--${variant}`,
    `c-btn--${size}`,
    className
  ].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="c-btn__spinner" aria-label="Loading..." />
      ) : success ? (
        <span className="c-btn__check">
          <Icon name="check" size={size === "sm" ? 16 : 18} />
        </span>
      ) : (
        <>
          {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} />}
          {children}
        </>
      )}
    </button>
  );
}
