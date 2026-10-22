/**
 * CycleSideChick — Women's Wellness & Non-Commercial Notice Modal
 * 
 * Provides complete transparency to the user that CycleSideChick
 * is 100% free for women's well-being and care, and that payment
 * features are strictly an inactive sandbox prototype for testing another product.
 */

import React from "react";
import { SheetModal } from "./SheetModal.jsx";
import { Button } from "./Button.jsx";
import { Icon } from "./Icon.jsx";
import { BrandDropletLogo } from "./PhaseIllustrations.jsx";

export function WellnessNoticeModal({ isOpen = true, onClose }) {
  return (
    <SheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Women's Wellness Mission"
      maxWidth="500px"
      className="v-wellness-notice-sheet"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "18px", textAlign: "center", alignItems: "center" }}>
        <BrandDropletLogo size={64} />

        <div style={{ maxWidth: "420px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "800",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: "var(--surface-tint)",
              color: "var(--primary)",
              padding: "4px 12px",
              borderRadius: "999px",
              display: "inline-block",
              marginBottom: "10px"
            }}
          >
            Care Over Commerce
          </span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "22px",
              fontWeight: "900",
              color: "var(--text)",
              margin: "0 0 10px"
            }}
          >
            Built With Care For Women
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "13.5px",
              lineHeight: 1.55,
              color: "var(--text-muted)"
            }}
          >
            CycleSideChick is a dedicated, 100% free menstrual and reproductive health tracker created solely for the dignity, privacy, and personal care of women — <b>not as a commercial business</b>.
          </p>
        </div>

        {/* 3 Pillars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", textAlign: "left" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "12px 14px",
              borderRadius: "16px",
              background: "var(--surface)",
              border: "1px solid var(--border)"
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--surface-tint)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "2px"
              }}
            >
              <Icon name="heart" size={16} />
            </div>
            <div>
              <b style={{ fontSize: "13.5px", color: "var(--text)", display: "block" }}>100% Free & Open Access</b>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4, display: "block" }}>
                Every clinical calculation, phase prediction, and journal tool is unlocked for all users without fees.
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "12px 14px",
              borderRadius: "16px",
              background: "var(--surface)",
              border: "1px solid var(--border)"
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--surface-tint)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "2px"
              }}
            >
              <Icon name="shield" size={16} />
            </div>
            <div>
              <b style={{ fontSize: "13.5px", color: "var(--text)", display: "block" }}>Absolute On-Device Privacy</b>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4, display: "block" }}>
                Your private health data never leaves your device. No cloud servers, no account logins, and no tracking beacons.
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "12px 14px",
              borderRadius: "16px",
              background: "var(--surface)",
              border: "1px solid var(--border)"
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--surface-tint)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "2px"
              }}
            >
              <Icon name="lock" size={16} />
            </div>
            <div>
              <b style={{ fontSize: "13.5px", color: "var(--text)", display: "block" }}>Inactive Evaluation Sandbox</b>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4, display: "block" }}>
                Any payment options or card checkout flows are purely inactive design prototypes for testing another product. You will never be billed.
              </span>
            </div>
          </div>
        </div>

        <Button variant="primary" size="lg" style={{ width: "100%", marginTop: "6px" }} onClick={onClose}>
          I Understand
        </Button>
      </div>
    </SheetModal>
  );
}
