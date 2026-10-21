/**
 * CycleSideChick — Onboarding Flow Component
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { BunnyMascot } from "../../components/ui/BunnyMascot.jsx";
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
      <div className="ob view-enter" style={{ textAlign: "center", padding: "32px 20px", maxWidth: "440px", margin: "0 auto" }}>
        <div style={{ marginBottom: "14px" }}>
          <BunnyMascot size={72} showLabel />
        </div>
        <h1 className="wm" style={{ fontSize: "28px", marginBottom: "4px" }}>CycleSideChick</h1>
        <p className="mut" style={{ fontSize: "15.5px", fontWeight: "600", color: "var(--plum)", margin: "4px 0 16px" }}>
          Your private, evidence-based cycle and wellness companion.
        </p>

        <div className="card tint-mint" style={{ textAlign: "left", marginBottom: "20px", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <Icon name="shield" size={22} />
            <b>100% On-Device Privacy</b>
          </div>
          <p className="mut" style={{ margin: 0, fontSize: "13px", lineHeight: "1.5" }}>
            Your records stay strictly in this browser. Zero cloud tracking, zero accounts, and zero advertising beacons.
          </p>
        </div>

        <div className="step-indicator">
          <div className="step-dot active" />
          <div className="step-dot" />
          <div className="step-dot" />
        </div>

        <button type="button" className="btn" onClick={() => actions.onboardingNext()}>
          Get started
        </button>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="ob view-enter" style={{ maxWidth: "440px", margin: "0 auto", padding: "24px 20px" }}>
        <h2>Your Cycle Baseline</h2>
        <p className="mut" style={{ marginBottom: "16px" }}>
          If you're not sure, leave defaults. You can adjust anytime in Profile.
        </p>

        <div className="step-indicator" style={{ justifyContent: "flex-start" }}>
          <div className="step-dot" />
          <div className="step-dot active" />
          <div className="step-dot" />
        </div>

        <div className="card">
          <label htmlFor="ol">First day of last period</label>
          <input
            id="ol"
            type="date"
            max={I(TD())}
            value={lastPeriod}
            onChange={e => setLastPeriod(e.target.value)}
          />

          <label htmlFor="oc" style={{ marginTop: "14px" }}>Usual cycle length (days)</label>
          <input
            id="oc"
            type="number"
            min="15"
            max="90"
            value={cycleLen}
            onChange={e => setCycleLen(e.target.value)}
          />

          <label htmlFor="op" style={{ marginTop: "14px" }}>Usual period bleeding duration (days)</label>
          <input
            id="op"
            type="number"
            min="1"
            max="14"
            value={periodLen}
            onChange={e => setPeriodLen(e.target.value)}
          />
        </div>

        <button type="button" className="btn" onClick={handleStep1Continue}>
          Continue
        </button>
        <button type="button" className="btn g" style={{ marginTop: "8px" }} onClick={() => actions.onboardingSkip()}>
          Skip for now
        </button>
      </div>
    );
  }

  return (
    <div className="ob view-enter" style={{ maxWidth: "440px", margin: "0 auto", padding: "24px 20px" }}>
      <h2>Select Your Tracking Mode</h2>
      <p className="mut" style={{ marginBottom: "16px" }}>
        Tailor calculations to your unique physiology. Fertility predictions can be disabled anytime.
      </p>

      <div className="step-indicator" style={{ justifyContent: "flex-start" }}>
        <div className="step-dot" />
        <div className="step-dot" />
        <div className="step-dot active" />
      </div>

      <div className="chips" style={{ display: "grid", gap: "8px", marginBottom: "20px" }}>
        {MODES.map(m => {
          const isSelected = (S.mode || "natural") === m.id;
          return (
            <div
              key={m.id}
              className={`card ${isSelected ? "tint-rose" : ""}`}
              style={{ cursor: "pointer", border: isSelected ? "2px solid var(--pink)" : undefined }}
              onClick={() => actions.setOnboardingMode(m.id)}
            >
              <b style={{ fontSize: "15px" }}>{m.title}</b>
              <p className="mut" style={{ margin: "4px 0 0", fontSize: "13px" }}>{m.desc}</p>
            </div>
          );
        })}
      </div>

      <button type="button" className="btn" onClick={() => actions.finishOnboarding()}>
        Start Tracking
      </button>
      <button type="button" className="btn g" style={{ marginTop: "8px" }} onClick={() => actions.onboardingSkip()}>
        Skip for now
      </button>
    </div>
  );
}
