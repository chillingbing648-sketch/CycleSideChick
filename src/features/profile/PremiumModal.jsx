/**
 * CycleSideChick — Subscription & Payment Gateway Prototype
 * 
 * IMPORTANT NON-COMMERCIAL NOTICE:
 * CycleSideChick is a 100% free reproductive health tracker created exclusively
 * for the wellness, dignity, and private care of women — not as a commercial business.
 * Payment processing is permanently disabled and inactive.
 * This payment gateway interface is strictly an evaluation prototype for testing another product.
 * Zero charges will ever occur, and all features remain completely free and on-device.
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";

// Professional Brand Marks (Inline accessible SVGs)
function ApplePayMark() {
  return (
    <svg width="34" height="15" viewBox="0 0 54 24" fill="currentColor" aria-label="Apple Pay">
      <path d="M7.74 12.16c0-2.33 1.87-3.48 1.95-3.53-1.07-1.57-2.73-1.78-3.32-1.81-1.42-.14-2.77.83-3.49.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.78 2.29-1.61 2.81-.41 6.96 1.15 9.24.77 1.11 1.68 2.36 2.89 2.31 1.16-.05 1.6-.75 3-.75s1.8.75 3.01.73c1.24-.02 2.03-1.12 2.78-2.24.88-1.28 1.24-2.52 1.26-2.58-.03-.01-2.44-.94-2.44-3.69zM5.99 5.21c.64-.78 1.07-1.85.95-2.93-.92.04-2.03.62-2.69 1.39-.58.67-1.09 1.76-.95 2.82 1.03.08 2.05-.5 2.69-1.28zM19.16 2.3v17.27h2.82v-5.69h3.7c3.1 0 5.4-2.12 5.4-5.79 0-3.69-2.28-5.79-5.4-5.79h-6.52zm2.82 2.45h3.36c2.02 0 3.19 1.18 3.19 3.34 0 2.15-1.17 3.34-3.19 3.34h-3.36V4.75zM31.25 14.15c0-3.52 2.65-5.59 6.27-5.59 1.48 0 2.65.34 3.32.76v-.65c0-1.89-1.24-2.92-3.17-2.92-1.39 0-2.61.57-3.17 1.28l-1.48-1.55c.99-1.2 2.69-1.93 4.81-1.93 3.38 0 5.67 1.83 5.67 5.17v10.85h-2.65v-1.91c-.84 1.28-2.3 2.14-4.04 2.14-3.23 0-5.56-2.18-5.56-5.65zm9.59-.8v-1.12c-.59-.36-1.53-.61-2.67-.61-2.16 0-3.48 1.09-3.48 3.01 0 1.87 1.34 3.03 3.25 3.03 1.66 0 2.9-.99 2.9-2.31v-2zM45.68 23.96l4.22-10.27-4.02-9.74h2.98l2.67 6.95 2.65-6.95h2.94l-7.35 17.51h-4.09z" />
    </svg>
  );
}

function GooglePayMark() {
  return (
    <svg width="34" height="15" viewBox="0 0 56 24" fill="currentColor" aria-label="Google Pay">
      <path d="M12.08 12.23v4.61H9.92V2.73h5.71c1.47 0 2.73.5 3.75 1.51 1.02 1.01 1.54 2.25 1.54 3.71s-.51 2.7-1.54 3.71c-1.02 1.01-2.28 1.51-3.75 1.51h-3.55v-.94zm0-7.39v5.33h3.63c.95 0 1.76-.32 2.42-.97.66-.65.99-1.45.99-2.39s-.33-1.74-.99-2.39c-.66-.65-1.47-.97-2.42-.97h-3.63v1.39zm15.45 4.31c1.37 0 2.45.37 3.25 1.11.8.74 1.2 1.73 1.2 2.98v5.51h-2.07v-1.59h-.09c-.9 1.31-2.09 1.97-3.57 1.97-1.25 0-2.3-.38-3.15-1.13-.85-.75-1.28-1.68-1.28-2.79 0-1.17.45-2.12 1.35-2.84.9-.72 2.08-1.08 3.53-1.08 1.25 0 2.29.23 3.12.7v-.49c0-.75-.3-1.39-.89-1.92-.59-.53-1.3-.8-2.12-.8-.99 0-1.8.42-2.43 1.25l-1.87-1.18c1.03-1.49 2.59-2.24 4.67-2.24zm-3.08 7.37c0 .58.25 1.07.75 1.47.5.4 1.11.6 1.83.6 1.02 0 1.91-.39 2.67-1.16.76-.77 1.14-1.66 1.14-2.67-.68-.53-1.58-.8-2.7-.8-1.03 0-1.86.25-2.49.75-.63.5-.95 1.1-.95 1.81zm15.82-7.07l-7.33 16.92h-2.23l2.74-5.91-4.83-11.01h2.38l3.47 8.36h.05l3.4-8.36h2.35z" />
    </svg>
  );
}

function PayPalMark() {
  return (
    <svg width="28" height="16" viewBox="0 0 48 24" fill="currentColor" aria-label="PayPal">
      <path d="M12.5 3h10.2c4.8 0 8.3 2.5 7.6 7.2-.6 4.1-3.6 6.8-8.2 6.8h-4.3l-2.1 8h-6.2l3-22zm7.6 4.6l-1.7 6.4h3.1c2.4 0 4.1-1.3 4.4-3.3.4-2.2-1.2-3.1-3.3-3.1h-2.5z" />
      <path opacity="0.65" d="M22.5 7.5h10.2c4.8 0 8.3 2.5 7.6 7.2-.6 4.1-3.6 6.8-8.2 6.8h-4.3l-2.1 8h-6.2l3-22zm7.6 4.6l-1.7 6.4h3.1c2.4 0 4.1-1.3 4.4-3.3.4-2.2-1.2-3.1-3.3-3.1h-2.5z" />
    </svg>
  );
}

export function PremiumModal({ isOpen = true, onClose }) {
  const { S } = useStore();
  const [selectedPlan, setSelectedPlan] = useState("annual"); // 'annual' | 'monthly'
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'apple' | 'google' | 'card' | 'paypal'
  const [step, setStep] = useState(S.premium ? "success" : "plans"); // 'plans' | 'processing' | 'success'

  // Card form state
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [cardHolder, setCardHolder] = useState(S.name ? `${S.name}` : "Jane Doe");
  const [cardExpiry, setCardExpiry] = useState("08 / 28");
  const [cardCvc, setCardCvc] = useState("•••");

  const handleStartDemoCheckout = () => {
    setStep("processing");
    actions.haptic(20);
    setTimeout(() => {
      S.premium = true;
      actions.persistState();
      actions.haptic([30, 60, 30]);
      setStep("success");
    }, 1500);
  };

  const handleCancelSubscription = () => {
    S.premium = false;
    actions.persistState();
    actions.toast("Evaluation license deactivated");
    onClose();
  };

  return (
    <SheetModal
      isOpen={isOpen}
      onClose={onClose}
      title={step === "success" ? "Evaluation License Active" : "CycleSideChick Pro Sandbox"}
      maxWidth="500px"
      className="v-premium-sheet"
    >
      {/* 1. PLANS & CHECKOUT SCREEN */}
      {step === "plans" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* MANDATORY WOMEN'S CARE & NON-COMMERCIAL NOTICE */}
          <div
            className="v-payment-wellness-notice"
            style={{
              background: "var(--surface-tint)",
              border: "1.5px solid var(--berry-border)",
              borderRadius: "18px",
              padding: "16px",
              boxShadow: "var(--shadow-subtle)"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "var(--surface)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(255, 91, 153, 0.2)"
                }}
              >
                <Icon name="heart" size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <b style={{ fontSize: "14px", color: "var(--primary)" }}>Women's Health & Care Notice</b>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "800",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      background: "rgba(255, 91, 153, 0.15)",
                      color: "var(--primary)",
                      padding: "2px 8px",
                      borderRadius: "999px"
                    }}
                  >
                    100% Free · No Billing
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.5", color: "var(--text)" }}>
                  CycleSideChick is a dedicated reproductive health tool built exclusively for the well-being, dignity, and private care of women — <b>not for commercial business</b>. Payments are permanently disabled and inactive.
                </p>
                <p style={{ margin: "6px 0 0", fontSize: "11.5px", lineHeight: "1.4", color: "var(--text-muted)" }}>
                  This checkout screen is strictly an inactive design sandbox for evaluating an external product's payment architecture. No money will ever be charged.
                </p>
              </div>
            </div>
          </div>

          {/* Hero Header Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #FF6F9F 0%, #FF5B99 100%)",
              borderRadius: "20px",
              padding: "20px 18px",
              color: "#FFFFFF",
              textAlign: "center",
              boxShadow: "0 8px 24px rgba(255, 91, 153, 0.25)"
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: "800",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                background: "rgba(255, 255, 255, 0.24)",
                padding: "3px 10px",
                borderRadius: "999px",
                display: "inline-block",
                marginBottom: "8px"
              }}
            >
              Evaluation License
            </div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "24px",
                fontWeight: "900",
                margin: "0 0 6px",
                color: "#FFFFFF"
              }}
            >
              CycleSideChick Pro
            </h2>
            <p style={{ margin: 0, fontSize: "13px", opacity: 0.95, lineHeight: 1.4 }}>
              Unlock basal body temperature biphasic charts, clinician exports, and extended cycle analytics.
            </p>
          </div>

          {/* Unlocked Features Checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { icon: "thermometer", title: "BBT Biphasic Thermal Shift", desc: "Scientific basal body temperature curves confirming ovulation." },
              { icon: "shield", title: "Clinician PDF Report Export", desc: "One-click comprehensive reproductive diagnostic summary for your doctor." },
              { icon: "insights", title: "Extended FIGO Regularity Metrics", desc: "Multi-year cycle variation standard deviations and interval trends." },
              { icon: "droplet", title: "Smart Hydration & Luteal Water Goals", desc: "Adaptive daily hydration goals with fluid retention guidance." }
            ].map(f => (
              <div
                key={f.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "14px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)"
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "var(--surface-tint)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <Icon name={f.icon} size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: "13px", color: "var(--text)", display: "block" }}>{f.title}</b>
                  <span style={{ fontSize: "11.5px", color: "var(--text-muted)", display: "block" }}>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Plan Options Selector */}
          <div>
            <span style={{ fontSize: "11.5px", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Select Evaluation Plan
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {/* Annual Plan */}
              <div
                onClick={() => setSelectedPlan("annual")}
                style={{
                  position: "relative",
                  padding: "16px 14px",
                  borderRadius: "18px",
                  border: selectedPlan === "annual" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  background: selectedPlan === "annual" ? "var(--surface-tint)" : "var(--surface)",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-9px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--primary)",
                    color: "#FFFFFF",
                    fontSize: "9.5px",
                    fontWeight: "800",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    whiteSpace: "nowrap"
                  }}
                >
                  BEST VALUE · SAVE 58%
                </div>
                <b style={{ fontSize: "14px", display: "block", marginTop: "4px", color: "var(--text)" }}>Annual</b>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "var(--primary)", margin: "4px 0" }}>
                  $39.99 <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>/ yr</span>
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>
                  $0.00 in Sandbox Mode
                </span>
              </div>

              {/* Monthly Plan */}
              <div
                onClick={() => setSelectedPlan("monthly")}
                style={{
                  padding: "16px 14px",
                  borderRadius: "18px",
                  border: selectedPlan === "monthly" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  background: selectedPlan === "monthly" ? "var(--surface-tint)" : "var(--surface)",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <b style={{ fontSize: "14px", display: "block", color: "var(--text)" }}>Monthly</b>
                <div style={{ fontSize: "18px", fontWeight: "900", color: "var(--primary)", margin: "4px 0" }}>
                  $7.99 <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)" }}>/ mo</span>
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>
                  $0.00 in Sandbox Mode
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <span style={{ fontSize: "11.5px", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Payment Method Architecture
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {[
                { id: "card", label: "Card", icon: <Icon name="creditCard" size={16} /> },
                { id: "apple", label: "Apple", icon: <ApplePayMark /> },
                { id: "google", label: "GPay", icon: <GooglePayMark /> },
                { id: "paypal", label: "PayPal", icon: <PayPalMark /> }
              ].map(pm => {
                const isSel = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    style={{
                      height: "46px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      borderRadius: "14px",
                      border: isSel ? "2px solid var(--primary)" : "1px solid var(--border)",
                      background: isSel ? "var(--surface-tint)" : "var(--surface)",
                      fontWeight: "700",
                      fontSize: "11px",
                      color: isSel ? "var(--primary)" : "var(--text)",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {pm.icon}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Professional Card Gateway Inputs (Simulated when Card is selected) */}
          {paymentMethod === "card" && (
            <div
              style={{
                background: "var(--surface-soft)",
                borderRadius: "18px",
                padding: "16px",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text)" }}>Credit or Debit Card</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "600" }}>Sandbox Input</span>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  CARDHOLDER NAME
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    fontSize: "13px",
                    fontWeight: "600",
                    background: "var(--surface)",
                    color: "var(--text)"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  CARD NUMBER
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 38px 10px 12px",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      fontSize: "13px",
                      fontFamily: "monospace",
                      fontWeight: "600",
                      background: "var(--surface)",
                      color: "var(--text)"
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <Icon name="creditCard" size={16} />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    EXPIRES
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      fontSize: "13px",
                      fontWeight: "600",
                      background: "var(--surface)",
                      color: "var(--text)"
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    SECURITY CVC
                  </label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      fontSize: "13px",
                      fontWeight: "600",
                      background: "var(--surface)",
                      color: "var(--text)"
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Express Checkout Button for Apple / Google / PayPal */}
          {paymentMethod !== "card" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                type="button"
                onClick={handleStartDemoCheckout}
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "16px",
                  border: "none",
                  background: paymentMethod === "apple" ? "#000000" : paymentMethod === "google" ? "#1F1F1F" : "#0070BA",
                  color: "#FFFFFF",
                  fontWeight: "700",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
                }}
              >
                {paymentMethod === "apple" && <><span>Pay with</span> <ApplePayMark /></>}
                {paymentMethod === "google" && <><span>Pay with</span> <GooglePayMark /></>}
                {paymentMethod === "paypal" && <><span>Check out with</span> <PayPalMark /></>}
              </button>
            </div>
          )}

          {/* Total Breakdown / Sandbox Billing Summary */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "16px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", color: "var(--text-muted)" }}>
              <span>{selectedPlan === "annual" ? "Annual License" : "Monthly License"}</span>
              <span style={{ textDecoration: "line-through" }}>
                {selectedPlan === "annual" ? "$39.99" : "$7.99"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", color: "var(--primary)" }}>
              <span>Women's Wellness Courtesy (Free)</span>
              <span>{selectedPlan === "annual" ? "-$39.99" : "-$7.99"}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
                fontWeight: "800",
                color: "var(--text)",
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: "8px",
                marginTop: "2px"
              }}
            >
              <span>Total Due Today</span>
              <span style={{ color: "var(--primary)" }}>$0.00</span>
            </div>
          </div>

          {/* Security & Sandbox Trust Indicators */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              fontSize: "11px",
              color: "var(--text-muted)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Icon name="lock" size={13} />
              <span>256-Bit SSL Encrypted Sandbox</span>
            </div>
            <span>·</span>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Icon name="shield" size={13} />
              <span>Zero Charges Guaranteed</span>
            </div>
          </div>

          {paymentMethod === "card" && (
            <Button variant="primary" size="lg" style={{ width: "100%" }} onClick={handleStartDemoCheckout}>
              Activate Free Evaluation Token
            </Button>
          )}
        </div>
      )}

      {/* 2. PROCESSING STATE */}
      {step === "processing" && (
        <div style={{ padding: "60px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "3px solid var(--border)",
              borderTopColor: "var(--primary)",
              animation: "spin 0.8s linear infinite",
              marginBottom: "20px"
            }}
          />
          <h3 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "800", color: "var(--text)" }}>
            Authorizing Sandbox License...
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, maxWidth: "300px" }}>
            Registering on-device verification token. Zero monetary charges are processed.
          </p>
        </div>
      )}

      {/* 3. CONFIRMATION / ACTIVE STATE */}
      {step === "success" && (
        <div style={{ padding: "30px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "var(--surface-tint)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "18px",
              boxShadow: "0 8px 24px rgba(255, 91, 153, 0.25)"
            }}
          >
            <Icon name="check" size={32} />
          </div>

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
              marginBottom: "10px"
            }}
          >
            100% Free · On-Device Active
          </span>

          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: "900", margin: "0 0 8px", color: "var(--text)" }}>
            Evaluation License Active
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.5, maxWidth: "340px" }}>
            CycleSideChick is completely free and for women's care. All clinical clinician exports, BBT biphasic tracking, and historical predictions are active on your device.
          </p>

          <Button variant="primary" size="lg" style={{ width: "100%", marginBottom: "12px" }} onClick={onClose}>
            Continue Using CycleSideChick
          </Button>

          <button
            type="button"
            onClick={handleCancelSubscription}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "12.5px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "8px"
            }}
          >
            Deactivate Evaluation Token
          </button>
        </div>
      )}
    </SheetModal>
  );
}
