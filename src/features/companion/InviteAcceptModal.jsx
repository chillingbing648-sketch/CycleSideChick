/**
 * CycleSideChick — InviteAcceptModal
 * Recipient onboarding and explicit acceptance screen.
 */

import React, { useState, useEffect } from "react";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { BunnyMascot } from "../../components/ui/BunnyMascot.jsx";
import { getInvitationPreview, claimInvitation } from "./api.js";
import { COMPANION_PERMISSIONS } from "./types.js";
import { toast, haptic } from "../../app/store.js";

export function InviteAcceptModal({ token, onAccepted, onDismiss }) {
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [companionName, setCompanionName] = useState("");

  useEffect(() => {
    async function loadPreview() {
      if (!token) {
        setError("Missing invitation token.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getInvitationPreview(token);
        if (!data.valid) {
          setError(data.error || "Invalid invitation.");
        } else {
          setPreview(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPreview();
  }, [token]);

  const handleAccept = async () => {
    if (claiming) return;
    try {
      setClaiming(true);
      const name = companionName.trim() || "Companion";
      const result = await claimInvitation(token, null, name);
      toast("Invitation accepted! Welcome to Cycle Care Companion.");
      haptic(30);
      if (onAccepted) onAccepted(result.relationshipId || result.relationship?.id);
    } catch (err) {
      toast("Failed to accept: " + err.message);
      setError(err.message);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <SheetModal
      isOpen={true}
      onClose={onDismiss}
      title="Cycle Care Companion Invitation"
      maxWidth="480px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "center" }}>
        
        <div style={{ margin: "6px auto 0 auto" }}>
          <BunnyMascot size={44} />
        </div>

        {loading ? (
          <div style={{ padding: "20px 0", color: "var(--text-muted)", fontSize: "14px" }}>
            Validating secure invitation link...
          </div>
        ) : error ? (
          <Card variant="tinted" tint="cream" style={{ padding: "18px", textAlign: "left" }}>
            <b style={{ color: "var(--plum)", display: "block", marginBottom: "6px" }}>
              Unable to Accept Invitation
            </b>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 14px 0" }}>
              {error}
            </p>
            <Button variant="secondary" size="sm" onClick={onDismiss}>
              Close
            </Button>
          </Card>
        ) : preview ? (
          <>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--plum)", margin: "0 0 6px 0" }}>
                You've Been Invited!
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: "1.5" }}>
                <b>{preview.ownerName || "A trusted partner"}</b> has invited you to be their private cycle care companion.
              </p>
            </div>

            <Card variant="tinted" tint="rose" style={{ padding: "14px", textAlign: "left" }}>
              <b style={{ fontSize: "13px", display: "block", marginBottom: "8px", color: "var(--plum)" }}>
                Proposed Sharing Scope:
              </b>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "12px" }}>
                {Object.entries(preview.permissions || {}).map(([key, enabled]) => {
                  if (!enabled) return null;
                  const item = COMPANION_PERMISSIONS[key];
                  return (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--plum)" }}>
                      <Icon name="check" size={13} />
                      <span>{item ? item.label : key}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div style={{ textAlign: "left" }}>
              <label style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--plum)", display: "block", marginBottom: "6px" }}>
                Your Name / Nickname:
              </label>
              <input
                type="text"
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                placeholder="e.g. Partner, Bestie"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(0,0,0,0.12)",
                  fontSize: "13.5px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
              <Button variant="secondary" size="sm" onClick={onDismiss} disabled={claiming}>
                Decline
              </Button>
              <Button variant="primary" size="sm" onClick={handleAccept} disabled={claiming}>
                {claiming ? "Connecting..." : "Accept & View Companion Dashboard"}
              </Button>
            </div>
          </>
        ) : null}

      </div>
    </SheetModal>
  );
}
