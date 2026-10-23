/**
 * CycleSideChick — Premium InviteAcceptModal
 * Recipient onboarding, explicit permission review, identity verification,
 * duplicate/self-claim prevention, and smooth Apple-quality pairing confirmation.
 */

import React, { useState, useEffect } from "react";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { BunnyMascot } from "../../components/ui/BunnyMascot.jsx";
import {
  getInvitationPreview,
  claimInvitation,
  getCurrentAuthUser,
  isLiveBackendConfigured,
  signOutCompanion
} from "./api.js";
import { CompanionAuthCard } from "./CompanionAuthCard.jsx";
import { COMPANION_PERMISSIONS } from "./types.js";
import { toast, haptic } from "../../app/store.js";

export function InviteAcceptModal({ token, onAccepted, onDismiss }) {
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);
  const [preview, setPreview] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null); // { code, message }
  const [companionName, setCompanionName] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [skipAuth, setSkipAuth] = useState(false);

  // Load auth state
  useEffect(() => {
    let mounted = true;
    getCurrentAuthUser().then(u => {
      if (mounted) setAuthUser(u);
    });
    return () => { mounted = false; };
  }, []);

  // Fetch invitation preview metadata
  useEffect(() => {
    async function loadPreview() {
      if (!token) {
        setErrorInfo({ code: "MISSING", message: "Missing invitation code or link." });
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErrorInfo(null);
        const data = await getInvitationPreview(token);
        if (!data.valid) {
          setErrorInfo({
            code: data.errorCode || "INVALID",
            message: data.error || "Invalid invitation."
          });
        } else {
          setPreview(data);
        }
      } catch (err) {
        setErrorInfo({
          code: "ERROR",
          message: err.message || "Failed to load invitation."
        });
      } finally {
        setLoading(false);
      }
    }
    loadPreview();
  }, [token]);

  const handleSignOutOwner = async () => {
    await signOutCompanion();
    setAuthUser(null);
    toast("Signed out. Now you can sign in with your companion account.");
  };

  const handleAccept = async () => {
    if (claiming || acceptedSuccess) return;

    // Check self-companion attempt
    if (authUser && preview && authUser.id === preview.ownerId) {
      toast("You cannot accept your own invitation. Please sign in with your companion's account.");
      return;
    }

    try {
      setClaiming(true);
      const name = companionName.trim() || "Companion";
      const result = await claimInvitation(token, null, name);

      haptic(35);
      setAcceptedSuccess(true);
      toast("Invitation accepted! Welcome to Cycle Care Companion.");

      // Elegant delay to show celebration state before transitioning to dashboard
      setTimeout(() => {
        if (onAccepted) {
          onAccepted(result.relationshipId || result.relationship?.id || "preview");
        }
      }, 1100);
    } catch (err) {
      toast("Failed to accept: " + err.message);
      setErrorInfo({ code: "CLAIM_ERROR", message: err.message });
    } finally {
      setClaiming(false);
    }
  };

  const isSelfOwner = authUser && preview && authUser.id === preview.ownerId;

  return (
    <SheetModal
      isOpen={true}
      onClose={onDismiss}
      title="Cycle Care Companion Invitation"
      maxWidth="480px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "center" }}>
        
        {/* Mascot Header */}
        <div style={{ margin: "6px auto 0 auto" }}>
          <BunnyMascot size={46} />
        </div>

        {/* 1. Loading State */}
        {loading ? (
          <div style={{ padding: "30px 0", color: "var(--text-muted)", fontSize: "14px" }}>
            <div style={{
              width: "32px",
              height: "32px",
              border: "3px solid rgba(224, 83, 117, 0.2)",
              borderTopColor: "var(--rose-hot, #E05375)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px auto"
            }} />
            Validating secure invitation link...
          </div>
        ) : acceptedSuccess ? (
          /* 2. Success Celebration State */
          <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#d1fae5",
              color: "#065f46",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 20px rgba(6, 95, 70, 0.15)"
            }}>
              <Icon name="check" size={28} />
            </div>
            <h2 style={{ fontSize: "19px", fontWeight: "800", color: "var(--plum)", margin: 0 }}>
              Connection Confirmed!
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
              You are now paired with <b>{preview?.ownerName || "your partner"}</b>. Opening your supportive dashboard...
            </p>
          </div>
        ) : errorInfo ? (
          /* 3. Error States */
          <Card variant="tinted" tint="cream" style={{ padding: "18px", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Icon name="shield" size={18} color="var(--rose-hot, #E05375)" />
              <b style={{ color: "var(--plum)", fontSize: "14.5px" }}>
                {errorInfo.code === "ALREADY_CLAIMED"
                  ? "Invitation Already Claimed"
                  : errorInfo.code === "EXPIRED"
                  ? "Invitation Expired"
                  : errorInfo.code === "REVOKED"
                  ? "Invitation Revoked"
                  : "Unable to Open Invitation"}
              </b>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 16px 0", lineHeight: "1.5" }}>
              {errorInfo.code === "ALREADY_CLAIMED"
                ? "This private invitation has already been accepted and can only be used once for privacy protection."
                : errorInfo.code === "EXPIRED"
                ? "This invitation link expired after 48 hours. Please ask your partner to send a fresh invitation or QR code."
                : errorInfo.code === "REVOKED"
                ? "This sharing link was cancelled by the person who created it."
                : errorInfo.message}
            </p>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button variant="secondary" size="sm" onClick={onDismiss}>
                Close
              </Button>
            </div>
          </Card>
        ) : preview ? (
          /* 4. Valid Invitation Review & Acceptance */
          <>
            <div>
              <h2 style={{ fontSize: "19px", fontWeight: "800", color: "var(--plum)", margin: "0 0 6px 0" }}>
                You've Been Invited!
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: "1.5" }}>
                <b>{preview.ownerName || "A trusted partner"}</b> has invited you to be their private cycle care companion.
              </p>
            </div>

            {/* Proposed Sharing Scope */}
            <Card variant="tinted" tint="rose" style={{ padding: "14px", textAlign: "left" }}>
              <b style={{ fontSize: "13px", display: "block", marginBottom: "8px", color: "var(--plum)" }}>
                Authorized Information Scope:
              </b>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "12px" }}>
                {Object.entries(preview.permissions || {}).map(([key, enabled]) => {
                  if (!enabled) return null;
                  const item = COMPANION_PERMISSIONS[key];
                  return (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--plum)" }}>
                      <Icon name="check" size={13} color="var(--rose-hot)" />
                      <span>{item ? item.label : key}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--text-muted)", borderTop: "1px dashed rgba(0,0,0,0.08)", paddingTop: "8px" }}>
                🔒 <b>Privacy Note:</b> Personal journal entries and raw cycle history remain 100% private and are never shared.
              </div>
            </Card>

            {/* Self-Owner Guard Warning */}
            {isSelfOwner && (
              <div style={{
                background: "rgba(224, 150, 60, 0.12)",
                border: "1px solid rgba(224, 150, 60, 0.3)",
                borderRadius: "12px",
                padding: "12px",
                textAlign: "left",
                fontSize: "12.5px",
                color: "#92400e"
              }}>
                <b style={{ display: "block", marginBottom: "4px" }}>⚠️ Account Notice</b>
                You are currently signed in with the same account that generated this invite.
                A companion link must be accepted by your partner on their device or separate account.
                <div style={{ marginTop: "8px" }}>
                  <Button variant="secondary" size="sm" onClick={handleSignOutOwner}>
                    Sign Out & Switch Account
                  </Button>
                </div>
              </div>
            )}

            {/* Recipient Cloud Account Sign-in */}
            {isLiveBackendConfigured && !authUser && !skipAuth && (
              <CompanionAuthCard
                onAuthSuccess={(u) => setAuthUser(u)}
                onSkipToLocal={() => setSkipAuth(true)}
              />
            )}

            {/* Nickname Input */}
            <div style={{ textAlign: "left" }}>
              <label style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--plum)", display: "block", marginBottom: "6px" }}>
                Your Name / Nickname:
              </label>
              <input
                type="text"
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                placeholder="e.g. Partner, Alex, Bestie"
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

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
              <Button variant="secondary" size="sm" onClick={onDismiss} disabled={claiming}>
                Decline
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAccept}
                disabled={claiming || isSelfOwner}
              >
                {claiming ? "Connecting..." : "Accept & Connect as Companion"}
              </Button>
            </div>
          </>
        ) : null}

      </div>
    </SheetModal>
  );
}
