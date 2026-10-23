/**
 * CycleSideChick — CompanionCard
 * Clean, soft entry card for CareView and HomeView.
 */

import React from "react";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { actions } from "../../app/actions.js";

export function CompanionCard({ hasConnection = false, status = "inactive" }) {
  return (
    <Card
      variant="tinted"
      tint="rose"
      style={{
        padding: "16px",
        marginBottom: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "rgba(224, 83, 117, 0.15)",
            color: "var(--rose-hot, #E05375)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Icon name="heart" size={16} />
          </div>
          <div>
            <b style={{ fontSize: "14px", color: "var(--plum, #2C2230)" }}>Cycle Care Companion</b>
            <span style={{ fontSize: "11px", display: "block", color: "var(--text-muted, #7A7280)" }}>
              {hasConnection ? `Status: ${status}` : "Private, permission-controlled sharing"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => actions.openScanner()}
            title="Scan partner QR code"
          >
            <Icon name="camera" size={14} /> Scan QR
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => actions.openPartner()}
          >
            {hasConnection ? "Manage" : "Share"}
          </Button>
        </div>
      </div>

      <p style={{ fontSize: "12.5px", lineHeight: "1.45", margin: 0, color: "var(--text-muted, #7A7280)" }}>
        Connect with one trusted person using a private QR code or link.
        They receive only authorized cycle updates, practical suggestions, and care reminders—never your private notes.
      </p>
    </Card>
  );
}
