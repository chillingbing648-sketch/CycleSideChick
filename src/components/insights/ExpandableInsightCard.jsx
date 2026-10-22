/**
 * CycleSideChick — Component 07: Expandable Insight Cards (Insights Page)
 * Reference: https://motion.dev/docs/react-layout-animations
 * 
 * Features:
 * - Smooth layout transitions using modern CSS grid-template-rows (0fr -> 1fr).
 * - Clear visual hierarchy: icon, category badge, title, preview summary, rotating chevron.
 * - Sensible empty states when history is insufficient.
 * - Accessible keyboard interaction & ARIA attributes.
 */

import React, { useState } from "react";
import { Icon } from "../ui/Icon.jsx";
import { Button } from "../ui/Button.jsx";

export function ExpandableInsightCard({
  id,
  title,
  subtitle,
  badge = "Insight",
  icon = "sparkle",
  tint = "rose",
  summary,
  children,
  initiallyExpanded = false,
  emptyState = null
}) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  const toggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`v-expandable-insight-card v-card-tint--${tint} ${isExpanded ? "is-expanded" : ""}`}
      id={`insight-card-${id}`}
    >
      {/* Header Button Trigger */}
      <button
        type="button"
        className="v-expandable-trigger"
        onClick={toggle}
        aria-expanded={isExpanded}
        aria-controls={`insight-content-${id}`}
      >
        <div className="v-expandable-header-left">
          <div className="v-expandable-icon-box">
            <Icon name={icon} size={18} />
          </div>
          <div className="v-expandable-titles">
            <span className="v-expandable-badge">{badge}</span>
            <h3 className="v-expandable-title">{title}</h3>
            {subtitle && <span className="v-expandable-subtitle">{subtitle}</span>}
          </div>
        </div>

        <div className={`v-expandable-chevron ${isExpanded ? "rotated" : ""}`} aria-hidden="true">
          <Icon name="chevronDown" size={18} />
        </div>
      </button>

      {/* Summary preview (always visible or collapses into details) */}
      {summary && !isExpanded && (
        <p className="v-expandable-summary-preview" onClick={toggle}>
          {summary}
        </p>
      )}

      {/* Modern Grid Layout Animation Drawer */}
      <div
        id={`insight-content-${id}`}
        className={`v-expandable-content-grid ${isExpanded ? "is-expanded" : ""}`}
      >
        <div className="v-expandable-content-inner">
          {summary && (
            <p className="v-expandable-full-summary">
              {summary}
            </p>
          )}

          {emptyState && emptyState.isEmpty ? (
            <div className="v-expandable-empty-state">
              <Icon name="sparkle" size={20} />
              <p className="v-empty-msg">{emptyState.message}</p>
              {emptyState.actionLabel && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={emptyState.onAction}
                  style={{ marginTop: "6px" }}
                >
                  {emptyState.actionLabel}
                </Button>
              )}
            </div>
          ) : (
            <div className="v-expandable-body">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
