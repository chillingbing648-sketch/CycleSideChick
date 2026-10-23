/**
 * CycleSideChick — Dedicated Companion Dashboard
 * Mobile-first, serene, respectful interface for the paired companion.
 */

import React, { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { BunnyMascot } from "../../components/ui/BunnyMascot.jsx";
import { getSharedSnapshot, sendSupportResponse, subscribeToCompanionRealtime } from "./api.js";
import { PREDEFINED_RESPONSES } from "./types.js";
import { toast, haptic } from "../../app/store.js";

export function CompanionDashboard({ relationshipId, onExit }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [sendingResponse, setSendingResponse] = useState(false);
  const [sentSuccessKey, setSentSuccessKey] = useState(null);
  const [pushEnabled, setPushEnabled] = useState(false);

  const fetchStatus = async () => {
    if (!relationshipId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getSharedSnapshot(relationshipId);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Subscribe to Realtime Postgres Changes
    const sub = subscribeToCompanionRealtime(relationshipId, {
      onSnapshot: (newSnap) => {
        setData(prev => ({ ...prev, snapshot: newSnap }));
        toast("Cycle status updated by companion");
        haptic(15);
      },
      onRelationshipChange: (updatedRel) => {
        if (updatedRel.status === "revoked") {
          setData(prev => ({ ...prev, status: "revoked", revoked: true }));
        } else {
          setData(prev => ({ ...prev, relationship: updatedRel, status: updatedRel.status }));
        }
      }
    });

    // Fallback polling every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => {
      clearInterval(interval);
      if (sub && sub.unsubscribe) sub.unsubscribe();
    };
  }, [relationshipId]);

  const handleSendResponse = async (key) => {
    if (sendingResponse || !relationshipId) return;
    try {
      setSendingResponse(true);
      await sendSupportResponse(relationshipId, key);
      setSentSuccessKey(key);
      toast("Supportive message sent!");
      haptic(25);
      setTimeout(() => setSentSuccessKey(null), 3000);
    } catch (err) {
      toast("Could not send: " + err.message);
    } finally {
      setSendingResponse(false);
    }
  };

  const handleEnablePush = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast("Push notifications not supported by this browser.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setPushEnabled(true);
        toast("Care notifications enabled!");
        haptic(20);
      } else {
        toast("Notifications declined.");
      }
    } catch (e) {
      toast("Notification error: " + e.message);
    }
  };

  if (loading && !data) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
        <BunnyMascot size={48} />
        <div style={{ marginTop: "12px", fontSize: "14px" }}>Connecting with companion updates...</div>
      </div>
    );
  }

  // Revoked or Inactive State
  if (data?.revoked || data?.status === "revoked" || error) {
    return (
      <div style={{ padding: "30px 20px", maxWidth: "480px", margin: "0 auto", textAlign: "center" }}>
        <Card variant="tinted" tint="cream" style={{ padding: "24px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "#fee2e2",
            color: "#991b1b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px auto"
          }}>
            <Icon name="shield" size={24} />
          </div>
          <b style={{ fontSize: "16px", color: "var(--plum)", display: "block", marginBottom: "8px" }}>
            Sharing Access Inactive
          </b>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5", margin: "0 0 16px 0" }}>
            {error || "Sharing has been paused or ended by the cycle owner. No cycle records or updates are accessible."}
          </p>
          {onExit && (
            <Button variant="secondary" size="sm" onClick={onExit}>
              Return to CycleSideChick
            </Button>
          )}
        </Card>
      </div>
    );
  }

  const snapshot = data?.snapshot;
  const relationship = data?.relationship;
  const allowedResponses = relationship?.allowedResponses || relationship?.allowed_responses || PREDEFINED_RESPONSES.map(r => r.key);

  return (
    <div className="v-companion-dashboard" style={{
      padding: "20px 16px 90px 16px",
      maxWidth: "500px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "14px"
    }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BunnyMascot size={32} />
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: "800", color: "var(--plum)", margin: 0 }}>
              Cycle Care Companion
            </h1>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
              Private Supportive Dashboard
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <Button variant="secondary" size="sm" onClick={fetchStatus} title="Refresh">
            <Icon name="refresh" size={14} />
          </Button>
          {onExit && (
            <Button variant="secondary" size="sm" onClick={onExit}>
              Exit
            </Button>
          )}
        </div>
      </div>

      {relationshipId === "preview" && (
        <div style={{
          background: "rgba(180, 140, 200, 0.15)",
          border: "1px dashed var(--plum, #4A3E50)",
          padding: "8px 12px",
          borderRadius: "10px",
          fontSize: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>👀 <b>Preview Mode</b>: Demonstrating companion dashboard.</span>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              style={{
                background: "transparent",
                border: "none",
                fontWeight: "700",
                color: "var(--plum)",
                cursor: "pointer",
                fontSize: "12px",
                textDecoration: "underline"
              }}
            >
              Back to tracker
            </button>
          )}
        </div>
      )}

      {/* Main Cycle Status Card */}
      <Card variant="tinted" tint="rose" style={{ padding: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--rose-hot)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Current Cycle Status
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {snapshot?.synced_at ? `Updated ${new Date(snapshot.synced_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Synced"}
          </span>
        </div>

        <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--plum)", marginBottom: "4px" }}>
          {snapshot?.cycle_phase || snapshot?.cyclePhase || "Cycle In Progress"}
          {snapshot?.cycle_day || snapshot?.cycleDay ? ` · Day ${snapshot.cycle_day || snapshot.cycleDay}` : ""}
        </div>

        {/* Period Status with Logged vs Estimated Label */}
        {snapshot?.period_status || snapshot?.periodStatus ? (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#FFE4E9",
            color: "#B83250",
            fontSize: "12px",
            fontWeight: "700",
            padding: "3px 10px",
            borderRadius: "14px",
            margin: "6px 0 10px 0"
          }}>
            <Icon name="check" size={13} />
            <span>{snapshot.period_status || snapshot.periodStatus}</span>
            <span style={{ fontSize: "10.5px", opacity: 0.8, fontWeight: "400" }}>
              ({(snapshot.is_period_logged || snapshot.isPeriodLogged) ? "Confirmed Logged" : "Estimated"})
            </span>
          </div>
        ) : null}

        {/* Estimated Dates */}
        {(snapshot?.next_period_est || snapshot?.nextPeriodEst) && (
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
            Estimated Next Period: <b style={{ color: "var(--plum)" }}>{snapshot.next_period_est || snapshot.nextPeriodEst}</b>
          </div>
        )}

        {(snapshot?.fertile_window_est || snapshot?.fertileWindowEst) && (
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
            Estimated Fertile Window: <b style={{ color: "var(--plum)" }}>{snapshot.fertile_window_est || snapshot.fertileWindowEst}</b>
          </div>
        )}
      </Card>

      {/* Shared Feelings & Symptoms (Only owner-approved) */}
      {((snapshot?.feelings && snapshot.feelings.length > 0) || (snapshot?.symptoms && snapshot.symptoms.length > 0)) && (
        <Card variant="tinted" tint="lavender" style={{ padding: "16px" }}>
          <b style={{ fontSize: "13.5px", color: "var(--plum)", display: "block", marginBottom: "8px" }}>
            Today's Logged State
          </b>

          {snapshot.feelings && snapshot.feelings.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Feelings: </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                {snapshot.feelings.map(f => (
                  <span key={f} style={{ background: "#FFFFFF", fontSize: "12px", padding: "3px 8px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.06)" }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {snapshot.symptoms && snapshot.symptoms.length > 0 && (
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Physical Symptoms: </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                {snapshot.symptoms.map(s => (
                  <span key={s} style={{ background: "#FCE7EC", color: "#8E2B43", fontSize: "12px", padding: "3px 8px", borderRadius: "10px" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Actionable Supportive Suggestion */}
      {(snapshot?.support_suggestion || snapshot?.supportSuggestion) && (
        <Card variant="tinted" tint="cream" style={{ padding: "16px", borderLeft: "4px solid var(--rose-hot)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Icon name="care" size={16} />
            <b style={{ fontSize: "13px", color: "var(--plum)" }}>Supportive Tip for You:</b>
          </div>
          <p style={{ fontSize: "13px", lineHeight: "1.5", margin: 0, color: "var(--plum)" }}>
            {snapshot.support_suggestion || snapshot.supportSuggestion}
          </p>
        </Card>
      )}

      {/* Predefined Quick Responses */}
      <Card variant="default" style={{ padding: "16px" }}>
        <b style={{ fontSize: "13.5px", color: "var(--plum)", display: "block", marginBottom: "4px" }}>
          Send Quick Supportive Response
        </b>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 12px 0" }}>
          Tap a message to send it directly to their CycleSideChick inbox:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {PREDEFINED_RESPONSES.filter(r => allowedResponses.includes(r.key)).map(resp => {
            const isSent = sentSuccessKey === resp.key;
            return (
              <button
                key={resp.key}
                type="button"
                disabled={sendingResponse}
                onClick={() => handleSendResponse(resp.key)}
                style={{
                  border: isSent ? "1.5px solid var(--rose-hot)" : "1px solid rgba(0,0,0,0.08)",
                  background: isSent ? "#FCE7EC" : "#FFFFFF",
                  color: isSent ? "var(--rose-hot)" : "var(--plum)",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  textAlign: "left",
                  transition: "all 0.15s ease"
                }}
              >
                <Icon name={isSent ? "check" : resp.icon} size={15} />
                <span>{isSent ? "Sent!" : resp.text}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Push Notification Toggle Card */}
      <Card variant="tinted" tint="lavender" style={{ padding: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon name="bell" size={18} />
            <div>
              <b style={{ fontSize: "13px" }}>Care Reminders</b>
              <span style={{ fontSize: "11px", display: "block", color: "var(--text-muted)" }}>
                {pushEnabled ? "Active (quiet hours 10 PM - 8 AM respected)" : "Get occasional reminders when care is needed"}
              </span>
            </div>
          </div>
          {!pushEnabled && (
            <Button variant="secondary" size="sm" onClick={handleEnablePush}>
              Enable
            </Button>
          )}
        </div>
      </Card>

    </div>
  );
}
