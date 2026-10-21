/**
 * CycleSideChick — useDragToDismiss Hook
 * Handles tactile pointer dragging for bottom sheets with velocity calculation
 * and rubber-banding.
 */

import { useState, useRef, useCallback } from "react";

export function useDragToDismiss({ onDismiss, threshold = 120, velocityThreshold = 0.5 }) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const currentYRef = useRef(0);

  const onPointerDown = useCallback((e) => {
    // Only respond to primary mouse button or touch
    if (e.button !== undefined && e.button !== 0) return;
    startYRef.current = e.clientY;
    currentYRef.current = e.clientY;
    startTimeRef.current = Date.now();
    setIsDragging(true);

    if (e.target && e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    }
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!isDragging) return;
    currentYRef.current = e.clientY;
    const deltaY = e.clientY - startYRef.current;

    if (deltaY < 0) {
      // Rubber-band resistance when pulling upwards
      setDragOffset(deltaY * 0.2);
    } else {
      setDragOffset(deltaY);
    }
  }, [isDragging]);

  const onPointerUp = useCallback((e) => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = currentYRef.current - startYRef.current;
    const deltaTime = Math.max(1, Date.now() - startTimeRef.current);
    const velocity = deltaY / deltaTime; // px/ms

    if (deltaY > threshold || (velocity > velocityThreshold && deltaY > 30)) {
      if (onDismiss) onDismiss();
    } else {
      setDragOffset(0);
    }
  }, [isDragging, threshold, velocityThreshold, onDismiss]);

  const onPointerCancel = useCallback(() => {
    setIsDragging(false);
    setDragOffset(0);
  }, []);

  return {
    dragOffset,
    isDragging,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel
    }
  };
}
