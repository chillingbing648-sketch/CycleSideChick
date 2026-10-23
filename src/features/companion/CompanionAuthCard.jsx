/**
 * CycleSideChick — CompanionAuthCard
 * Secure, privacy-first Supabase authentication component for Cycle Care Companion.
 * 
 * Guarantees:
 * - Tracking data is never uploaded automatically.
 * - Sign in is optional and only required when linking with a cloud companion.
 */

import React, { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import {
  getCurrentAuthUser,
  signInWithEmailOtp,
  signInWithPassword,
  signUpWithPassword,
  signOutCompanion,
  onAuthStateChange,
  isLiveBackendConfigured
} from "./api.js";
import { toast, haptic } from "../../app/store.js";

export function CompanionAuthCard({ onAuthSuccess, onSkipToLocal }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("otp"); // "otp" | "password"
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    getCurrentAuthUser().then(u => {
      if (mounted) {
        setUser(u);
        setLoading(false);
      }
    });

    const sub = onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user || null);
        if (session?.user && onAuthSuccess) {
          onAuthSuccess(session.user);
        }
      }
    });

    return () => {
      mounted = false;
      if (sub && sub.unsubscribe) sub.unsubscribe();
    };
  }, [onAuthSuccess]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      setMessage(null);
      await signInWithEmailOtp(email.trim());
      setMessage("Magic link sent! Check your email to sign in.");
      toast("Magic link sent!");
      haptic(20);
    } catch (err) {
      if (err.message && err.message.includes("rate limit")) {
        setError("Email rate limit reached on Supabase. Try using password sign-in or local mode.");
      } else {
        setError(err.message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handlePasswordAuth = async (isSignUp) => {
    if (!email || !email.includes("@") || !password) {
      setError("Please enter email and password.");
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      setMessage(null);
      if (isSignUp) {
        const res = await signUpWithPassword(email.trim(), password);
        if (res.user && !res.session) {
          setMessage("Sign-up initiated! Check your email to confirm, or sign in.");
        } else {
          toast("Account created and signed in!");
          haptic(20);
        }
      } else {
        await signInWithPassword(email.trim(), password);
        toast("Signed in successfully!");
        haptic(20);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setActionLoading(true);
      await signOutCompanion();
      setUser(null);
      toast("Signed out from companion cloud.");
      haptic(15);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isLiveBackendConfigured) return null;

  if (loading) {
    return <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Checking companion account...</div>;
  }

  if (user) {
    return (
      <Card variant="tinted" tint="lavender" style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--plum)"
          }}>
            <Icon name="user" size={15} />
          </div>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
              Cloud Companion Account
            </span>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--plum)" }}>
              {user.email || "Authenticated User"}
            </div>
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={handleSignOut} disabled={actionLoading}>
          Sign Out
        </Button>
      </Card>
    );
  }

  return (
    <Card variant="tinted" tint="rose" style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Icon name="shield" size={16} />
        <b style={{ fontSize: "13.5px", color: "var(--plum)" }}>Sign In for Cloud Companion Sharing</b>
      </div>

      <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, lineHeight: "1.45" }}>
        An account is required to securely identify and connect you with your companion via Supabase.
        Your local tracking logs remain completely private on your device.
      </p>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: "4px", background: "rgba(0,0,0,0.04)", padding: "3px", borderRadius: "8px" }}>
        <button
          type="button"
          onClick={() => { setAuthMode("otp"); setError(null); setMessage(null); }}
          style={{
            flex: 1,
            border: "none",
            borderRadius: "6px",
            padding: "5px",
            fontSize: "11.5px",
            fontWeight: authMode === "otp" ? "700" : "500",
            background: authMode === "otp" ? "#FFFFFF" : "transparent",
            cursor: "pointer"
          }}
        >
          Magic Link
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode("password"); setError(null); setMessage(null); }}
          style={{
            flex: 1,
            border: "none",
            borderRadius: "6px",
            padding: "5px",
            fontSize: "11.5px",
            fontWeight: authMode === "password" ? "700" : "500",
            background: authMode === "password" ? "#FFFFFF" : "transparent",
            cursor: "pointer"
          }}
        >
          Email & Password
        </button>
      </div>

      {/* Input fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <input
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            padding: "8px 10px",
            borderRadius: "8px",
            border: "1px solid rgba(0,0,0,0.12)",
            fontSize: "12.5px",
            outline: "none"
          }}
        />

        {authMode === "password" && (
          <input
            type="password"
            placeholder="Password (minimum 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.12)",
              fontSize: "12.5px",
              outline: "none"
            }}
          />
        )}
      </div>

      {error && (
        <div style={{ fontSize: "11.5px", color: "#b91c1c", background: "#fee2e2", padding: "6px 8px", borderRadius: "6px" }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{ fontSize: "11.5px", color: "#065f46", background: "#d1fae5", padding: "6px 8px", borderRadius: "6px" }}>
          {message}
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center", marginTop: "2px" }}>
        {onSkipToLocal && (
          <button
            type="button"
            onClick={onSkipToLocal}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "11.5px",
              cursor: "pointer",
              textDecoration: "underline",
              padding: "4px"
            }}
          >
            Continue in Local Mode
          </button>
        )}

        {authMode === "otp" ? (
          <Button variant="primary" size="sm" onClick={handleSendOtp} disabled={actionLoading}>
            {actionLoading ? "Sending..." : "Send Magic Link"}
          </Button>
        ) : (
          <div style={{ display: "flex", gap: "6px" }}>
            <Button variant="secondary" size="sm" onClick={() => handlePasswordAuth(false)} disabled={actionLoading}>
              Sign In
            </Button>
            <Button variant="primary" size="sm" onClick={() => handlePasswordAuth(true)} disabled={actionLoading}>
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
