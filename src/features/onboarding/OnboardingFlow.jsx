/**
 * CycleSideChick — Onboarding Flow Component
 * Multi-step calm flow:
 * 1. Welcome & privacy pledge
 * 2. Cycle baseline parameters
 * 3. Tracking mode selection
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { BunnyMascot } from "../../components/ui/BunnyMascot.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { TD, I, N } from "../../core/engine.js";

export function OnboardingFlow() {
  const { S, ui } = useStore();
  const step = ui.obStep || 0;

  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLen, setCycleLen] = useState(S.cl || 28);
  const [periodLen, setPeriodLen] = useState(S.pl || 5);

  const MODES = [
    { id: "natural", title: "Natural Cycle", desc: "Predicts periods & estimated fertile window based on past history." },
    { id: "irregular", title: "Irregular Cycle", desc: "Turns off fixed fertile windows to prevent false assurance." },
    { id: "contraception", title: "Hormonal Contraception", desc: "Hides ovulation; tracks withdrawal bleeds & pill adherence." },
    { id: "ttc", title: "Trying to Conceive", desc: "Elevates fertile window, LH test strips & BBT tracking." },
    { id: "pregnancy", title: "Pregnancy", desc: "Calculates gestational age, trimesters & EDD using Naegele's rule." },
    { id: "perimenopause", title: "Perimenopause", desc: "Focuses on cycle variability, symptom shifts & comfort insights." }
  ];

  const handleStep1Continue = () => {
    S.cl = Number(cycleLen) || 28;
    S.pl = Number(periodLen) || 5;
    if (lastPeriod) {
      if (!S.periods) S.periods = [];
      const exists = S.periods.some(p => p.s === lastPeriod);
      if (!exists) {
        S.periods.push({ s: lastPeriod, e: I(N(lastPeriod) + (S.pl || 5) - 1) });
      }
    }
    actions.onboardingNext();
  };

  if (step === 0) {
    return (
      <div className="ob view-enter" style={{ textAlign: "center", padding: "40px 20px", maxWidth: "460px", margin: "0 auto" }}>
        <div style={{ marginBottom: "16px" }}>
          <BunnyMascot size={80} showLabel />
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-display)", margin: "0 0 6px", color: "var(--plum)" }}>
          CycleSideChick
        </h1>
        <p className="mut" style={{ fontSize: "16px", fontWeight: "600", color: "var(--plum)", margin: "0 0 24px" }}>
          Your private, evidence-based cycle and wellness companion.
        </p>

        <Card variant="tinted" tint="mint" style={{ textAlign: "left", marginBottom: "24px", padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <Icon name="shield" size={24} />
            <b style={{ fontSize: "15px" }}>100% On-Device Privacy</b>
          </div>
          <p className="mut" style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.5" }}>
            Your records stay strictly in this browser. Zero cloud tracking, zero accounts, and zero advertising beacons.
          </p>
        </Card>

        <div className="step-indicator" style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
          <div className="step-dot active" />
          <div className="step-dot" />
          <div className="step-dot" />
        </div>

        <Button variant="primary" size="lg" style={{ width: "100%" }} onClick={() => actions.onboardingNext()}>
          Get Started
        </Button>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="ob view-enter" style={{ maxWidth: "460px", margin: "0 auto", padding: "32px 20px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", margin: "0 0 4px" }}>Your Cycle Baseline</h2>
        <p className="mut" style={{ marginBottom: "20px", fontSize: "14px" }}>
          If you're not sure, leave defaults. You can adjust anytime in Profile.
        </p>

        <div className="step-indicator" style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <div className="step-dot" />
          <div className="step-dot active" />
          <div className="step-dot" />
        </div>

        <Card variant="base" style={{ padding: "20px", marginBottom: "20px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="ol" style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
              First day of last period
            </label>
            <input
              id="ol"
              type="date"
              max={I(TD())}
              value={lastPeriod}
              onChange={e => setLastPeriod(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "14px" }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="oc" style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
              Usual cycle length (days)
            </label>
            <input
              id="oc"
              type="number"
              min="15"
              max="90"
              value={cycleLen}
              onChange={e => setCycleLen(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "14px" }}
            />
          </div>

          <div>
            <label htmlFor="op" style={{ fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
              Usual period bleeding duration (days)
            </label>
            <input
              id="op"
              type="number"
              min="1"
              max="14"
              value={periodLen}
              onChange={e => setPeriodLen(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "14px" }}
            />
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Button variant="primary" size="md" onClick={handleStep1Continue}>
            Continue
          </Button>
          <Button variant="ghost" size="sm" onClick={() => actions.onboardingSkip()}>
            Skip for now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="ob view-enter" style={{ maxWidth: "460px", margin: "0 auto", padding: "32px 20px" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", margin: "0 0 4px" }}>Select Tracking Mode</h2>
      <p className="mut" style={{ marginBottom: "20px", fontSize: "14px" }}>
        Tailor calculations to your unique physiology. Fertility predictions can be disabled anytime.
      </p>

      <div className="step-indicator" style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <div className="step-dot" />
        <div className="step-dot" />
        <div className="step-dot active" />
      </div>

      <div style={{ display: "grid", gap: "10px", marginBottom: "24px" }}>
        {MODES.map(m => {
          const isSelected = (S.mode || "natural") === m.id;
          return (
            <Card
              key={m.id}
              variant={isSelected ? "raised" : "base"}
              interactive
              style={{
                padding: "16px",
                borderColor: isSelected ? "var(--berry)" : undefined,
                background: isSelected ? "var(--pink-light)" : undefined
              }}
              onClick={() => actions.setOnboardingMode(m.id)}
            >
              <b style={{ fontSize: "15px", color: isSelected ? "var(--berry)" : "inherit" }}>{m.title}</b>
              <p className="mut" style={{ margin: "4px 0 0", fontSize: "13px" }}>{m.desc}</p>
            </Card>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Button variant="primary" size="md" onClick={() => actions.finishOnboarding()}>
          Start Tracking
        </Button>
        <Button variant="ghost" size="sm" onClick={() => actions.onboardingSkip()}>
          Skip for now
        </Button>
      </div>
    </div>
  );
}
