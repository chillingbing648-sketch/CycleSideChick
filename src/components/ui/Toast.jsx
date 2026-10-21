/**
 * CycleSideChick — Toast Primitive
 * Floating glass pill anchored above navigation.
 * Swipe-down to dismiss gesture, action button, aria-live polite announcement.
 */

import React, { useRef, useState, useEffect } from "react";
import { Icon } from "./Icon.jsx";

export function Toast({
  message,
  actionLabel,
  onAction,
  onDismiss,
  duration = 4000,
  icon = "sparkle"
}) {
  const [startY, setStartY] = useState(null);
  const [offsetY, setOffsetY] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (duration > 0 && onDismiss) {
      timerRef.current = setTimeout(() => {
        onDismiss();
      }, duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, onDismiss]);

  const handlePointerDown = (e) => {
    setStartY(e.clientY);
  };

  const handlePointerMove = (e) => {
    if (startY === null) return;
    const delta = e.clientY - startY;
    if (delta > 0) {
      setOffsetY(delta);
    }
  };

  const handlePointerUp = () => {
    if (offsetY > 40) {
      if (onDismiss) onDismiss();
    } else {
      setOffsetY(0);
    }
    setStartY(null);
  };

  if (!message) return null;

  return (
    <div className="c-toast-wrap" role="status" aria-live="polite">
      <div
        className="c-toast"
        style={{
          transform: offsetY > 0 ? `translateY(${offsetY}px)` : undefined,
          opacity: offsetY > 0 ? Math.max(0, 1 - offsetY / 80) : 1
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {icon && <Icon name={icon} size={18} />}
          <span>{message}</span>
        </div>

        {actionLabel && (
          <button
            type="button"
            className="c-toast__action"
            onClick={(e) => {
              e.stopPropagation();
              if (onAction) onAction();
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
