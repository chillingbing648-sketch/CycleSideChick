/**
 * CycleSideChick — Design System v3 Styleguide View
 * Living token catalog, editorial typography, plum elevations & contrast ramps,
 * and isolated UI component primitives testbed.
 */

import React, { useState } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ToggleChip } from "../../components/ui/ToggleChip.jsx";
import { SegmentedControl } from "../../components/ui/SegmentedControl.jsx";
import { Slider } from "../../components/ui/Slider.jsx";
import { WaterCup } from "../../components/ui/WaterCup.jsx";
import { Toast } from "../../components/ui/Toast.jsx";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Icon, ICONS } from "../../components/ui/Icon.jsx";
import { BunnyMascot } from "../../components/ui/BunnyMascot.jsx";

export function StyleguideView() {
  const { S } = useStore();

  // State for interactive primitive demos
  const [btnLoading, setBtnLoading] = useState(false);
  const [btnSuccess, setBtnSuccess] = useState(false);
  const [chipSelected, setChipSelected] = useState({ cramps: true, fatigue: false, calm: true });
  const [segmentedTab, setSegmentedTab] = useState("care");
  const [sliderVal, setSliderVal] = useState(4);
  const [waterCups, setWaterCups] = useState(3);
  const [showToast, setShowToast] = useState(false);
  const [showSheet, setShowSheet] = useState(false);

  const triggerButtonDemo = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      setBtnSuccess(true);
      setTimeout(() => setBtnSuccess(false), 2000);
    }, 1200);
  };

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
    <div className="styleguide-view" style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px 100px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <span className="pill-tag" style={{ background: "var(--pink-light)", color: "var(--pink)" }}>
            Design System v3
          </span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h1)", margin: "8px 0 2px" }}>
            CycleSideChick Styleguide
          </h1>
          <p className="mut" style={{ margin: 0, fontSize: "14px" }}>
            Living token catalog, editorial typography, plum elevations & accessible UI primitives.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Button variant="secondary" size="sm" onClick={() => actions.setTheme("light")}>Light</Button>
          <Button variant="secondary" size="sm" onClick={() => actions.setTheme("dark")}>Dark</Button>
          <Button variant="primary" size="sm" onClick={() => actions.setTab("home")}>← Back to App</Button>
        </div>
      </div>

      {/* 1. Fluid Typography Scale */}
      <section style={{ marginBottom: "36px" }}>
        <h2 style={{ fontSize: "var(--text-h2)", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "16px" }}>
          1. Typography & Hierarchy
        </h2>
        <Card variant="base" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
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
        </Card>
      </section>

      {/* 2. Layered Elevation & Plum Shadows */}
      <section style={{ marginBottom: "36px" }}>
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
                background: "var(--surface)",
                boxShadow: `var(--elev-${lvl})`,
                border: "1px solid var(--border-subtle)",
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
      <section style={{ marginBottom: "36px" }}>
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
      <section style={{ marginBottom: "36px" }}>
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

      {/* 5. UI Component Primitives (Phase 3 Spec) */}
      <section style={{ marginBottom: "36px" }}>
        <h2 style={{ fontSize: "var(--text-h2)", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "16px" }}>
          5. Accessible UI Primitives
        </h2>

        {/* 5.1 Card Variants */}
        <h3 style={{ fontSize: "var(--text-h3)", marginBottom: "12px" }}>Card Variants</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          <Card variant="base" interactive>
            <b>Base Card</b>
            <p className="subtle" style={{ margin: "4px 0 0", fontSize: "12px" }}>1px border, elev-1, hover lift</p>
          </Card>
          <Card variant="raised" interactive>
            <b>Raised Card</b>
            <p className="subtle" style={{ margin: "4px 0 0", fontSize: "12px" }}>Elev-2 shadow with soft gradient</p>
          </Card>
          <Card variant="hero">
            <b>Hero Ambient Card</b>
            <p className="subtle" style={{ margin: "4px 0 0", fontSize: "12px" }}>Dynamic dual ambient mesh glow</p>
          </Card>
          <Card variant="glass">
            <b>Glass Card</b>
            <p className="subtle" style={{ margin: "4px 0 0", fontSize: "12px" }}>Frosted blur backdrop</p>
          </Card>
          <Card variant="tinted" tint="lavender">
            <b>Tinted Card (Lavender)</b>
            <p style={{ margin: "4px 0 0", fontSize: "12px" }}>Semantic calm tint</p>
          </Card>
          <Card variant="tinted" tint="sage">
            <b>Tinted Card (Sage)</b>
            <p style={{ margin: "4px 0 0", fontSize: "12px" }}>Semantic restorative tint</p>
          </Card>
        </div>

        {/* 5.2 Button Sizes & States */}
        <h3 style={{ fontSize: "var(--text-h3)", marginBottom: "12px" }}>Button Variants & States</h3>
        <Card variant="base" style={{ padding: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
            <Button variant="primary" size="lg" icon="sparkle">Primary Large</Button>
            <Button variant="primary" size="md">Primary Medium</Button>
            <Button variant="primary" size="sm">Primary Small</Button>
            <Button variant="secondary" size="md">Secondary</Button>
            <Button variant="ghost" size="md">Ghost</Button>
            <Button variant="danger" size="md" icon="trash">Danger</Button>
            <Button variant="pill" size="md">Pill Variant</Button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            <Button variant="primary" onClick={triggerButtonDemo} loading={btnLoading} success={btnSuccess}>
              Tap for Loading & Success Morph
            </Button>
            <Button variant="primary" disabled>Disabled State</Button>
          </div>
        </Card>

        {/* 5.3 ToggleChip */}
        <h3 style={{ fontSize: "var(--text-h3)", marginBottom: "12px" }}>ToggleChips (Symptoms & Moods)</h3>
        <Card variant="base" style={{ padding: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <ToggleChip
              label="Cramps (Mild)"
              icon="droplet"
              count={2}
              selected={chipSelected.cramps}
              onClick={() => setChipSelected(s => ({ ...s, cramps: !s.cramps }))}
            />
            <ToggleChip
              label="Fatigue"
              icon="moon"
              selected={chipSelected.fatigue}
              onClick={() => setChipSelected(s => ({ ...s, fatigue: !s.fatigue }))}
            />
            <ToggleChip
              label="Calm / Grounded"
              icon="moodCalm"
              selected={chipSelected.calm}
              onClick={() => setChipSelected(s => ({ ...s, calm: !s.calm }))}
            />
            <ToggleChip
              label="Energetic"
              icon="moodEnergetic"
              selected={false}
              disabled
            />
          </div>
        </Card>

        {/* 5.4 SegmentedControl */}
        <h3 style={{ fontSize: "var(--text-h3)", marginBottom: "12px" }}>Segmented Control (Sliding Thumb)</h3>
        <Card variant="base" style={{ padding: "16px", marginBottom: "24px" }}>
          <SegmentedControl
            value={segmentedTab}
            onChange={setSegmentedTab}
            items={[
              { id: "care", label: "Daily Care", icon: "care" },
              { id: "journal", label: "Private Journal", icon: "book" },
              { id: "guide", label: "Full Guide", icon: "star" }
            ]}
          />
          <p className="subtle" style={{ margin: "12px 0 0", fontSize: "13px" }}>
            Selected tab: <b>{segmentedTab}</b> (arrow keys supported)
          </p>
        </Card>

        {/* 5.5 Slider */}
        <h3 style={{ fontSize: "var(--text-h3)", marginBottom: "12px" }}>Slider with Live Value Bubble</h3>
        <Card variant="base" style={{ padding: "20px", marginBottom: "24px" }}>
          <Slider
            label="Pelvic Pain Intensity"
            min={0}
            max={10}
            step={1}
            value={sliderVal}
            onChange={setSliderVal}
            valueFormat={(v) => `${v} / 10 ${v === 0 ? "(None)" : v <= 3 ? "(Mild)" : v <= 6 ? "(Moderate)" : "(Severe)"}`}
          />
        </Card>

        {/* 5.6 WaterCup Liquid Fill */}
        <h3 style={{ fontSize: "var(--text-h3)", marginBottom: "12px" }}>WaterCup Liquid-Rise Primitive</h3>
        <div style={{ marginBottom: "24px" }}>
          <WaterCup
            count={waterCups}
            goal={8}
            onAdd={() => setWaterCups(c => Math.min(8, c + 1))}
            onReset={() => setWaterCups(0)}
          />
        </div>

        {/* 5.7 Toast & SheetModal Triggers */}
        <h3 style={{ fontSize: "var(--text-h3)", marginBottom: "12px" }}>Toast & SheetModal Primitives</h3>
        <Card variant="base" style={{ padding: "16px", display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
          <Button variant="secondary" onClick={() => setShowToast(true)}>
            Show Floating Toast
          </Button>
          <Button variant="secondary" onClick={() => setShowSheet(true)}>
            Open Drag-to-Dismiss Sheet
          </Button>
        </Card>

        {/* 5.8 Bunny Mascot */}
        <h3 style={{ fontSize: "var(--text-h3)", marginBottom: "12px" }}>Bunny Mascot (Blinks & Ear Tilt)</h3>
        <Card variant="base" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px" }}>
          <BunnyMascot size={72} />
          <div>
            <b style={{ fontSize: "16px", display: "block" }}>Tactile Brand Mascot</b>
            <p className="subtle" style={{ margin: "4px 0 0", fontSize: "13px" }}>
              Blinks autonomously every 5.5s; tilts ears on hover/tap. No external assets required.
            </p>
          </div>
        </Card>

        {/* 5.9 Icon Gallery */}
        <h3 style={{ fontSize: "var(--text-h3)", marginBottom: "12px" }}>Complete Vector Icon System</h3>
        <Card variant="base" style={{ padding: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "10px" }}>
            {Object.keys(ICONS).map(name => (
              <div
                key={name}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "10px 4px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                <Icon name={name} size={22} />
                <span style={{ fontSize: "10.5px", marginTop: "6px", color: "var(--text-muted)", textAlign: "center", wordBreak: "break-all" }}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Floating Toast Demo */}
      {showToast && (
        <Toast
          message="Daily check-in saved safely to local device"
          actionLabel="Dismiss"
          onAction={() => setShowToast(false)}
          onDismiss={() => setShowToast(false)}
          duration={3500}
        />
      )}

      {/* SheetModal Demo */}
      <SheetModal
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        title="Interactive Sheet Demo"
      >
        <p style={{ margin: "0 0 16px", fontSize: "14px", lineHeight: "1.5" }}>
          This bottom sheet features a tactile drag-to-dismiss handle. On touch or mouse drag, pulling downward smoothly dismisses the modal. Pulling upward applies rubber-band resistance.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => setShowSheet(false)}>Close</Button>
          <Button variant="primary" onClick={() => setShowSheet(false)}>Got it</Button>
        </div>
      </SheetModal>
    </div>
  );
}
