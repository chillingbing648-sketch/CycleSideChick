/**
 * CycleSideChick — Design System v3 Styleguide View
 * Visual testbed for all tokens, ramps, fluid type, elevations, and states.
 */

import React from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Icon } from "../../components/ui/Icon.jsx";

export function StyleguideView() {
  const { S } = useStore();

  const TINTS = [
    { name: "Rose", bg: "var(--tint-rose-bg)", text: "var(--tint-rose-text)", border: "var(--tint-rose-border)" },
    { name: "Lavender", bg: "var(--tint-lavender-bg)", text: "var(--tint-lavender-text)", border: "var(--tint-lavender-border)" },
    { name: "Butter", bg: "var(--tint-butter-bg)", text: "var(--tint-butter-text)", border: "var(--tint-butter-border)" },
    { name: "Amber", bg: "var(--tint-amber-bg)", text: "var(--tint-amber-text)", border: "var(--tint-amber-border)" },
    { name: "Sage", bg: "var(--tint-sage-bg)", text: "var(--tint-sage-text)", border: "var(--tint-sage-border)" },
    { name: "Mint", bg: "var(--tint-mint-bg)", text: "var(--tint-mint-text)", border: "var(--tint-mint-border)" },
    { name: "Sky", bg: "var(--tint-sky-bg)", text: "var(--tint-sky-text)", border: "var(--tint-sky-border)" },
    { name: "Peach", bg: "var(--tint-peach-bg)", text: "var(--tint-peach-text)", border: "var(--tint-peach-border)" }
  ];

  const PHASES = [
    { name: "Menstrual", bg: "var(--phase-menstrual-bg)", text: "var(--phase-menstrual-text)", border: "var(--phase-menstrual-border)", hex: "var(--phase-menstrual)" },
    { name: "Follicular", bg: "var(--phase-follicular-bg)", text: "var(--phase-follicular-text)", border: "var(--phase-follicular-border)", hex: "var(--phase-follicular)" },
    { name: "Ovulatory", bg: "var(--phase-ovulatory-bg)", text: "var(--phase-ovulatory-text)", border: "var(--phase-ovulatory-border)", hex: "var(--phase-ovulatory)" },
    { name: "Luteal", bg: "var(--phase-luteal-bg)", text: "var(--phase-luteal-text)", border: "var(--phase-luteal-border)", hex: "var(--phase-luteal)" }
  ];

  return (
    <div className="styleguide-view" style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px 80px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <span className="pill-tag" style={{ background: "var(--pink-light)", color: "var(--pink)" }}>
            Design System v3
          </span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", margin: "8px 0 2px" }}>
            CycleSideChick Styleguide
          </h1>
          <p className="mut" style={{ margin: 0, fontSize: "14px" }}>
            Living token catalog, editorial typography, plum elevations & contrast ramps.
          </p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button type="button" className="chip active" onClick={() => actions.setTheme("light")}>Light</button>
          <button type="button" className="chip active" onClick={() => actions.setTheme("dark")}>Dark</button>
          <button type="button" className="btn sm" onClick={() => actions.setTab("home")}>← Back to App</button>
        </div>
      </div>

      {/* 1. Fluid Typography Scale */}
      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "var(--text-h2)", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "16px" }}>
          1. Typography & Hierarchy
        </h2>
        <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>DISPLAY · FRAUNCES VARIABLE</span>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-display)", lineHeight: "var(--lh-tight)", color: "var(--plum)" }}>
              Cycle Day 14
            </div>
          </div>
          <div>
            <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>HEADING 1 (H1) · FRAUNCES / MANROPE</span>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", lineHeight: "var(--lh-heading)", color: "var(--plum)" }}>
              Restorative Living
            </div>
          </div>
          <div>
            <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>HEADING 2 (H2) · MANROPE 700</span>
            <div style={{ fontSize: "var(--text-h2)", fontWeight: "700", color: "var(--plum)" }}>
              Four Physiological Phases
            </div>
          </div>
          <div>
            <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>HEADING 3 (H3) · MANROPE 600</span>
            <div style={{ fontSize: "var(--text-h3)", fontWeight: "600", color: "var(--plum)" }}>
              Gentle Daily Check-in & Care Kit
            </div>
          </div>
          <div>
            <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>BODY · MANROPE 400</span>
            <p style={{ fontSize: "var(--text-body)", lineHeight: "var(--lh-body)", margin: "4px 0", maxWidth: "60ch" }}>
              CycleSideChick is an on-device health companion that helps you track your body's natural shifts with kindness, scientific clarity, and total privacy.
            </p>
          </div>
          <div>
            <span className="subtle" style={{ fontSize: "11px", fontWeight: "700" }}>TABULAR NUMBERS · MANROPE TABULAR-NUMS</span>
            <div style={{ fontVariantNumeric: "tabular-nums", fontSize: "16px", fontWeight: "700", display: "flex", gap: "16px" }}>
              <span>28.0 days</span>
              <span>97.85 °F</span>
              <span>12:00:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Layered Elevation & Tinted Shadows */}
      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "var(--text-h2)", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "16px" }}>
          2. Layered Depth & Plum Shadows
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "14px" }}>
          {[1, 2, 3, 4, 5].map(lvl => (
            <div
              key={lvl}
              style={{
                padding: "20px 14px",
                borderRadius: "var(--radius-lg)",
                background: "var(--surface-raised)",
                boxShadow: `var(--elev-${lvl})`,
                textAlign: "center"
              }}
            >
              <b style={{ fontSize: "14px", display: "block" }}>Elev-{lvl}</b>
              <span className="subtle" style={{ fontSize: "11px" }}>Plum Ambient + Key</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Physiological Phase Colors */}
      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "var(--text-h2)", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "16px" }}>
          3. Phase Colors (WCAG AA Compliant)
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
          {PHASES.map(p => (
            <div
              key={p.name}
              style={{
                padding: "16px",
                borderRadius: "var(--radius-md)",
                background: p.bg,
                color: p.text,
                border: `1.5px solid ${p.border}`
              }}
            >
              <b style={{ fontSize: "15px", display: "block" }}>{p.name}</b>
              <span style={{ fontSize: "12px", opacity: 0.85 }}>Phase Accent</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 8 Soft Semantic Tints */}
      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "var(--text-h2)", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "16px" }}>
          4. Soft Semantic Tints (Contrast ≥ 4.5:1)
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
          {TINTS.map(t => (
            <div
              key={t.name}
              style={{
                padding: "14px",
                borderRadius: "var(--radius-md)",
                background: t.bg,
                color: t.text,
                border: `1px solid ${t.border}`
              }}
            >
              <b style={{ fontSize: "14px", display: "block" }}>{t.name}</b>
              <span style={{ fontSize: "11.5px", opacity: 0.85 }}>≥ 4.5:1 contrast</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Frosted Glass & Ambient Mesh */}
      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "var(--text-h2)", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "16px" }}>
          5. Glass & Phase-Adaptive Ambience
        </h2>
        <div
          style={{
            position: "relative",
            height: "160px",
            borderRadius: "var(--radius-xl)",
            background: "radial-gradient(circle at 30% 30%, var(--ambient-a) 0%, transparent 70%), radial-gradient(circle at 70% 70%, var(--ambient-b) 0%, transparent 70%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              padding: "16px 24px",
              borderRadius: "var(--radius-pill)",
              background: "var(--glass-bg)",
              backdropFilter: "var(--glass-blur)",
              border: "1px solid var(--glass-border)",
              boxShadow: "var(--elev-3)",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <Icon name="sparkle" size={20} />
            <b style={{ fontSize: "14px" }}>Frosted Glass Pill with Blur & Saturate</b>
          </div>
        </div>
      </section>
    </div>
  );
}
