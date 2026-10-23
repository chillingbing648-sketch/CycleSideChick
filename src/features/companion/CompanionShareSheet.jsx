/**
 * CycleSideChick — CompanionShareSheet Component
 * Complete Owner Control Panel for Cycle Care Companion.
 * 
 * Includes:
 * 1. Voluntary activation
 * 2. Granular permission switches
 * 3. Humorous notification toggle
 * 4. Permitted predefined response selector
 * 5. QR Code and private invite link generator
 * 6. Live preview of recipient dashboard
 * 7. Active connection status & sync trigger
 * 8. Incoming responses inbox
 * 9. Immediate pause & revocation
 */

import React, { useState, useEffect } from "react";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { QRCode, downloadQrPng } from "./qr.jsx";
import { useCompanion } from "./useCompanion.js";
import { checkBackendStatus, buildCompanionInviteUrl } from "./api.js";
import { CompanionAuthCard } from "./CompanionAuthCard.jsx";
import { COMPANION_PERMISSIONS, PREDEFINED_RESPONSES } from "./types.js";
import { toast, haptic } from "../../app/store.js";
import { actions } from "../../app/actions.js";

export function CompanionShareSheet({ isOpen = true, onClose }) {
  const {
    loading,
    error,
    activeRelationship,
    activeInvitation,
    snapshot,
    responses,
    lastSyncTime,
    createInvite,
    syncNow,
    revoke,
    togglePause,
    updatePerms,
    compileApprovedSnapshot,
    isLiveBackend
  } = useCompanion();

  const [backendStatus, setBackendStatus] = useState({
    status: isLiveBackend ? "checking" : "local",
    message: isLiveBackend ? "Checking Supabase connection..." : "Privacy-first local companion mode active."
  });

  useEffect(() => {
    let mounted = true;
    checkBackendStatus().then(res => {
      if (mounted) setBackendStatus(res);
    });
    return () => { mounted = false; };
  }, []);

  // Tab inside sheet: "settings" | "invite" | "preview" | "inbox"
  const [activeTab, setActiveTab] = useState("settings");

  // Local draft state for permissions
  const [permissions, setPermissions] = useState(
    activeRelationship?.permissions || {
      sharePhase: true,
      shareDay: true,
      sharePeriodStatus: true,
      shareEstimatedDates: true,
      shareFeelings: true,
      shareSymptoms: true,
      shareEnergy: true,
      shareMood: true,
      shareNotes: false,
      shareSupportPreferences: true
    }
  );

  const [humorEnabled, setHumorEnabled] = useState(
    activeRelationship?.humorous_notifications !== undefined
      ? activeRelationship.humorous_notifications
      : true
  );

  const [allowedResponses, setAllowedResponses] = useState(
    activeRelationship?.allowed_responses || PREDEFINED_RESPONSES.map(r => r.key)
  );

  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [enlargeQr, setEnlargeQr] = useState(false);

  const togglePermission = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleResponse = (key) => {
    setAllowedResponses(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleGenerateInvite = async (preferLocal = false) => {
    try {
      const inv = await createInvite({
        permissions,
        humorousNotifications: humorEnabled,
        allowedResponses,
        preferLocal
      });
      // Build clean verified URL with token
      const fullUrl = buildCompanionInviteUrl(inv.rawToken);
      setInviteUrl(fullUrl);
      setActiveTab("invite");
      haptic(20);
    } catch (e) {
      if (e.message && e.message.includes("AUTHENTICATION_REQUIRED")) {
        toast("Sign in above to link your companion cloud account, or choose local mode.");
      } else if (e.message && e.message.includes("SCHEMA_PENDING")) {
        toast("Supabase migration pending in SQL editor. Generated offline-compatible invitation.");
        handleGenerateInvite(true);
      } else {
        toast(e.message || "Could not generate invitation.");
      }
    }
  };

  const handleCopyLink = async () => {
    if (!inviteUrl) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        toast("Invitation link copied to clipboard!");
        haptic(20);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      toast("Please copy link from text box below.");
    }
  };

  const handleShare = async () => {
    if (!inviteUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "CycleSideChick Companion Invitation",
          text: "I've invited you to be my cycle care companion on CycleSideChick.",
          url: inviteUrl
        });
        toast("Invitation shared!");
        haptic(20);
        return;
      } catch (err) {
        if (err.name !== "AbortError") console.warn(err);
      }
    }
    handleCopyLink();
  };

  const handleDownloadQr = async () => {
    if (!inviteUrl) return;
    const ok = await downloadQrPng(inviteUrl, "CycleSideChick-Invite-QR.png");
    if (ok) {
      toast("QR code image downloaded!");
      haptic(20);
    }
  };

  const handleSavePermissions = async () => {
    if (activeRelationship?.id) {
      await updatePerms(permissions, humorEnabled, allowedResponses);
    } else {
      toast("Preferences saved for next invitation.");
    }
  };

  // Preview snapshot object
  const previewSnapshot = compileApprovedSnapshot(permissions);

  return (
    <SheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cycle Care Companion"
      maxWidth="500px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "10px" }}>
        
        {/* Navigation Tabs */}
        <div style={{
          display: "flex",
          background: "var(--lavender-soft, #F5EFF7)",
          borderRadius: "14px",
          padding: "4px",
          gap: "4px"
        }}>
          {[
            { id: "settings", label: "Permissions", icon: "shield" },
            { id: "invite", label: "Invite & Link", icon: "share" },
            { id: "preview", label: "Live Preview", icon: "care" },
            { id: "inbox", label: `Inbox (${responses.length})`, icon: "heart" }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                border: "none",
                borderRadius: "10px",
                padding: "8px 4px",
                fontSize: "12.5px",
                fontWeight: activeTab === tab.id ? "700" : "500",
                background: activeTab === tab.id ? "#FFFFFF" : "transparent",
                color: activeTab === tab.id ? "var(--plum, #2C2230)" : "var(--text-muted, #7A7280)",
                boxShadow: activeTab === tab.id ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                transition: "all 0.15s ease"
              }}
            >
              <Icon name={tab.icon} size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Backend mode indicator (Privacy banner) */}
        {backendStatus.status === "ready" && (
          <div style={{
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            borderRadius: "10px",
            background: "rgba(78, 175, 124, 0.12)",
            color: "#26734d"
          }}>
            <Icon name="check" size={14} />
            <span>Connected to Supabase with Row Level Security.</span>
          </div>
        )}

        {backendStatus.status === "schema_pending" && (
          <div style={{
            fontSize: "12px",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            padding: "9px 12px",
            borderRadius: "10px",
            background: "rgba(224, 150, 60, 0.12)",
            color: "#92400e",
            border: "1px solid rgba(224, 150, 60, 0.25)"
          }}>
            <div style={{ marginTop: "1px" }}><Icon name="shield" size={14} /></div>
            <div style={{ flex: 1, lineHeight: "1.4" }}>
              <span style={{ fontWeight: "700" }}>Supabase Connected · Schema Pending</span>
              <div style={{ fontSize: "11px", marginTop: "2px", opacity: 0.9 }}>
                Credentials verified. Run SQL migration in Supabase SQL editor to enable cloud tables. Running in local secure mode in the meantime.
              </div>
            </div>
          </div>
        )}

        {backendStatus.status === "invalid_key" && (
          <div style={{
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            borderRadius: "10px",
            background: "rgba(239, 68, 68, 0.12)",
            color: "#b91c1c"
          }}>
            <Icon name="shield" size={14} />
            <span>Invalid Supabase API key in .env.local (Using local safe mode).</span>
          </div>
        )}

        {(backendStatus.status === "local" || backendStatus.status === "checking") && (
          <div style={{
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            borderRadius: "10px",
            background: "rgba(180, 140, 200, 0.12)",
            color: "var(--plum, #4A3E50)"
          }}>
            <Icon name="check" size={14} />
            <span>{backendStatus.message || "Privacy-first local companion mode active."}</span>
          </div>
        )}

        {/* TAB 1: PERMISSIONS & SETTINGS */}
        {activeTab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Supabase Account Connection Card */}
            <CompanionAuthCard onSkipToLocal={() => handleGenerateInvite(true)} />

            <p style={{ fontSize: "13px", lineHeight: "1.5", margin: 0, color: "var(--text-muted)" }}>
              Choose strictly which cycle information your companion is authorized to view.
              Your private journal reflections and unrestricted cycle logs are <b>never</b> shared.
            </p>

            <Card variant="tinted" tint="rose" style={{ padding: "14px" }}>
              <b style={{ fontSize: "13.5px", display: "block", marginBottom: "10px" }}>
                Authorized Information Fields
              </b>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {Object.values(COMPANION_PERMISSIONS).map(perm => (
                  <label
                    key={perm.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      cursor: "pointer",
                      fontSize: "13px"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(permissions[perm.id])}
                      onChange={() => togglePermission(perm.id)}
                      style={{ marginTop: "3px", accentColor: "var(--rose-hot, #E05375)" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600" }}>{perm.label}</div>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{perm.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            <Card variant="tinted" tint="lavender" style={{ padding: "14px" }}>
              <b style={{ fontSize: "13.5px", display: "block", marginBottom: "8px" }}>
                Humorous Care Notifications
              </b>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
                <input
                  type="checkbox"
                  checked={humorEnabled}
                  onChange={(e) => setHumorEnabled(e.target.checked)}
                  style={{ marginTop: "3px", accentColor: "var(--rose-hot, #E05375)" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600" }}>Enable Lighthearted Care Missions</div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                    Recipient receives playful notifications reminding them of their support duties (e.g. snack side quests). Jokes never target your body or mood.
                  </div>
                </div>
              </label>
            </Card>

            <Card variant="tinted" tint="cream" style={{ padding: "14px" }}>
              <b style={{ fontSize: "13.5px", display: "block", marginBottom: "8px" }}>
                Allowed Quick Responses
              </b>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {PREDEFINED_RESPONSES.map(resp => (
                  <label
                    key={resp.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      background: "#FFFFFF",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0,0,0,0.06)",
                      cursor: "pointer"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={allowedResponses.includes(resp.key)}
                      onChange={() => toggleResponse(resp.key)}
                      style={{ accentColor: "var(--rose-hot, #E05375)" }}
                    />
                    <span>{resp.text}</span>
                  </label>
                ))}
              </div>
            </Card>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
              {activeRelationship ? (
                <Button variant="secondary" size="sm" onClick={handleSavePermissions} disabled={loading}>
                  Save Changes
                </Button>
              ) : <div />}
              <Button variant="primary" size="sm" onClick={handleGenerateInvite} disabled={loading}>
                Generate Invitation Link & QR
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: INVITE & CONNECTION STATUS */}
        {activeTab === "invite" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", textAlign: "center" }}>
            {inviteUrl ? (
              <>
                <div style={{
                  background: "#FFFFFF",
                  padding: enlargeQr ? "16px" : "12px",
                  borderRadius: "24px",
                  boxShadow: "0 10px 32px rgba(44, 34, 48, 0.12)",
                  border: "1px solid rgba(44, 34, 48, 0.08)",
                  display: "inline-block",
                  transition: "all 0.25s ease"
                }}>
                  <QRCode value={inviteUrl} size={enlargeQr ? 260 : 210} />
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setEnlargeQr(prev => !prev)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--rose-hot, #E05375)",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <Icon name="maximize" size={13} />
                    <span>{enlargeQr ? "Standard Size" : "Enlarge QR for Scanning"}</span>
                  </button>
                </div>

                <div style={{ maxWidth: "380px" }}>
                  <b style={{ fontSize: "15px", display: "block", marginBottom: "4px", color: "var(--plum)" }}>
                    Private Companion Invitation
                  </b>
                  <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0, lineHeight: "1.45" }}>
                    Have your partner scan this QR with their camera or CycleSideChick app.
                    The invitation expires in 48 hours and can only be claimed once.
                  </p>
                </div>

                {/* Primary Actions Row */}
                <div style={{
                  display: "flex",
                  gap: "8px",
                  width: "100%",
                  justifyContent: "center",
                  flexWrap: "wrap"
                }}>
                  <Button
                    variant={copied ? "secondary" : "primary"}
                    size="sm"
                    onClick={handleCopyLink}
                    style={{
                      flex: 1,
                      minWidth: "120px",
                      background: copied ? "#d1fae5" : undefined,
                      color: copied ? "#065f46" : undefined,
                      borderColor: copied ? "#065f46" : undefined
                    }}
                  >
                    <Icon name={copied ? "check" : "copy"} size={14} />
                    <span>{copied ? "Copied! ✓" : "Copy Link"}</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleShare}
                    style={{ flex: 1, minWidth: "100px" }}
                  >
                    <Icon name="share" size={14} />
                    <span>Share Link</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadQr}
                    title="Save QR code image to camera roll"
                  >
                    <Icon name="download" size={14} /> Save QR
                  </Button>
                </div>

                {/* Direct Link Display */}
                <div style={{
                  display: "flex",
                  width: "100%",
                  gap: "8px",
                  background: "#F8F5F9",
                  padding: "6px 10px",
                  borderRadius: "10px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxSizing: "border-box"
                }}>
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "transparent",
                      fontSize: "11.5px",
                      color: "var(--plum)",
                      outline: "none"
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--rose-hot)",
                      fontSize: "11.5px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                {/* Scan Partner QR action */}
                <div style={{ borderTop: "1px dashed rgba(0,0,0,0.08)", width: "100%", paddingTop: "12px", marginTop: "4px" }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (onClose) onClose();
                      actions.openScanner();
                    }}
                    style={{ width: "100%", justifyContent: "center", color: "var(--plum)" }}
                  >
                    <Icon name="camera" size={14} /> Scan a Partner's QR Code Instead
                  </Button>
                </div>
              </>
            ) : (
              <div style={{ padding: "20px 0" }}>
                <p style={{ fontSize: "13.5px", color: "var(--text-muted)" }}>
                  No active invitation generated yet. Configure permissions and click generate!
                </p>
                <Button variant="primary" size="sm" onClick={handleGenerateInvite}>
                  Generate Invitation Now
                </Button>
              </div>
            )}

            {/* Connection Management Card */}
            {activeRelationship && (
              <Card variant="tinted" tint="lavender" style={{ width: "100%", textAlign: "left", padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <b style={{ fontSize: "13.5px" }}>Active Connection Status</b>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    padding: "2px 8px",
                    borderRadius: "20px",
                    background: activeRelationship.status === "active" ? "#d1fae5" : "#fee2e2",
                    color: activeRelationship.status === "active" ? "#065f46" : "#991b1b"
                  }}>
                    {activeRelationship.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  Last synced: {lastSyncTime ? lastSyncTime.toLocaleTimeString() : "Just now"}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button variant="secondary" size="sm" onClick={() => syncNow()} disabled={loading}>
                    Sync Snapshot
                  </Button>
                  <Button variant="secondary" size="sm" onClick={togglePause} disabled={loading}>
                    {activeRelationship.status === "paused" ? "Resume" : "Pause"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={revoke} disabled={loading}>
                    Revoke Access
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 3: LIVE PREVIEW */}
        {activeTab === "preview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0 }}>
              This is the exact view your companion sees on their dashboard. Notice that private notes or unapproved details are completely excluded.
            </p>

            <div style={{
              background: "#FFFDFE",
              border: "2px solid #EEDCE8",
              borderRadius: "20px",
              padding: "16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.04)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--rose-hot)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Cycle Care Companion
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Verified Active
                </span>
              </div>

              <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--plum)", marginBottom: "4px" }}>
                {previewSnapshot.cyclePhase || "Cycle Active"} {previewSnapshot.cycleDay ? `· Day ${previewSnapshot.cycleDay}` : ""}
              </div>

              {previewSnapshot.periodStatus && (
                <div style={{ display: "inline-block", background: "#FFE4E9", color: "#B83250", fontSize: "11.5px", fontWeight: "600", padding: "2px 8px", borderRadius: "12px", marginBottom: "10px" }}>
                  {previewSnapshot.periodStatus} (Confirmed Logged)
                </div>
              )}

              {previewSnapshot.nextPeriodEst && (
                <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Estimated next period: <b>{previewSnapshot.nextPeriodEst}</b>
                </div>
              )}

              {previewSnapshot.feelings && previewSnapshot.feelings.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: "600", color: "var(--text-muted)" }}>Shared Feelings: </span>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                    {previewSnapshot.feelings.map(f => (
                      <span key={f} style={{ background: "#F3EDF5", fontSize: "11px", padding: "2px 7px", borderRadius: "8px" }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {previewSnapshot.symptoms && previewSnapshot.symptoms.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: "600", color: "var(--text-muted)" }}>Logged Symptoms: </span>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                    {previewSnapshot.symptoms.map(s => (
                      <span key={s} style={{ background: "#FCE7EC", color: "#8E2B43", fontSize: "11px", padding: "2px 7px", borderRadius: "8px" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: "14px", padding: "10px", background: "#FAF5F8", borderRadius: "10px", borderLeft: "3px solid var(--rose-hot)" }}>
                <b style={{ fontSize: "12px", display: "block", color: "var(--plum)" }}>Supportive Suggestion:</b>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {previewSnapshot.supportSuggestion}
                </span>
              </div>
            </div>

            <div style={{ marginTop: "4px" }}>
              <Button
                variant="secondary"
                size="sm"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.hash = "#/companion/preview";
                  }
                  if (onClose) onClose();
                }}
              >
                <Icon name="heart" size={14} /> Open Full Companion Dashboard Preview
              </Button>
            </div>
          </div>
        )}

        {/* TAB 4: INBOX OF PREDEFINED RESPONSES */}
        {activeTab === "inbox" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0 }}>
              Predefined caring messages sent back by your companion:
            </p>

            {responses && responses.length > 0 ? (
              responses.map(resp => {
                const item = PREDEFINED_RESPONSES.find(r => r.key === resp.response_key) || { text: resp.response_key, icon: "heart" };
                const timeStr = new Date(resp.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                return (
                  <div
                    key={resp.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      background: "#FFFFFF",
                      borderRadius: "14px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      border: "1px solid rgba(0,0,0,0.05)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "#FCE7EC",
                        color: "var(--rose-hot)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <Icon name={item.icon} size={16} />
                      </div>
                      <span style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--plum)" }}>
                        "{item.text}"
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{timeStr}</span>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)", fontSize: "13px" }}>
                No responses received yet. When your companion taps a quick response, it will appear here.
              </div>
            )}
          </div>
        )}

      </div>
    </SheetModal>
  );
}
