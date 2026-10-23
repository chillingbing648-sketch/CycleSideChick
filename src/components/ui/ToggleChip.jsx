/**
 * CycleSideChick — ToggleChip Primitive
 * Accessible toggle chip for symptoms, moods, tags, and multi-select filters.
 */

import React from "react";
import { Icon } from "./Icon.jsx";

export function ToggleChip({
  selected = false,
  icon,
  count,
  label,
  onClick,
  disabled = false,
  className = "",
  ...props
}) {
  const classes = [
    "c-chip",
    selected ? "c-chip--selected" : "",
    className
  ].filter(Boolean).join(" ");

  const handleKeyDown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!disabled && onClick) onClick(e);
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      className={classes}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      {...props}
    >
      {icon && <Icon name={icon} size={16} />}
      <span>{label}</span>
      {typeof count === "number" && count > 0 && (
        <span className="c-chip__count">{count}</span>
      )}
    </button>
  );
}
