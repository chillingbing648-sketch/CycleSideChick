/**
 * CycleSideChick — SheetModal Primitive
 * Bottom sheet on mobile with drag-to-dismiss gesture; centered dialog on desktop.
 * Accessible: focus trap, escape key, focus restoration, aria-modal.
 */

import React, { useEffect, useRef } from "react";
import { Icon } from "./Icon.jsx";
import { useDragToDismiss } from "../../hooks/useDragToDismiss.js";

export function SheetModal({
  isOpen = true,
  onClose,
  title,
  children,
  maxWidth = "520px",
  className = ""
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  const { dragOffset, isDragging, handleProps } = useDragToDismiss({
    onDismiss: onClose,
    threshold: 110,
    velocityThreshold: 0.45
  });

  // Focus trap and focus restoration
  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement;

    // Focus first focusable element inside modal
    if (modalRef.current) {
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        e.stopPropagation();
        if (onClose) onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="c-sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
        className={`c-sheet ${className}`.trim()}
        style={{
          maxWidth,
          transform: dragOffset !== 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: isDragging ? "none" : undefined
        }}
      >
        {/* Mobile Drag Handle */}
        <div className="c-sheet__handle-wrap" {...handleProps}>
          <div className="c-sheet__handle" />
        </div>

        {/* Header */}
        <div className="c-sheet__header">
          <h2 className="c-sheet__title">{title}</h2>
          <button
            type="button"
            className="icon-btn c-sheet__close"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ minHeight: "44px", minWidth: "44px" }}
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="c-sheet__content">
          {children}
        </div>
      </div>
    </div>
  );
}
