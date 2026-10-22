/**
 * CycleSideChick — Complete Onboarding Flow Component
 * Faithfully recreating the 12-screen sequence from the visual design references:
 * 1. Branded Splash Screen (#FF5B99, white droplet logo, loading indicator)
 * 2-4. 3-Slide Feature Carousel with mobile mockups, dots indicator & Next/Skip
 * 5. Name entry ("What's your name?")
 * 6. Birthday selection (3-column Month / Day / Year wheel picker)
 * 7. Weight selection (kg/lb toggle, large number, interactive horizontal precision ruler)
 * 8. Height selection (cm/ft toggle, large number, interactive horizontal precision ruler)
 * 9. Period duration (vertical wheel picker 1-10 days)
 * 10. Cycle length (vertical wheel picker 21-45 days)
 * 11. Last period start date (interactive calendar picker)
 * 12. Setup loading progress ring (circular 65% -> 100% animation)
 * 13. Personalized completion screen ("You're All Set! 🎉")
 */

import React, { useState, useEffect } from "react";
import { useStore } from "../../app/store.js";
import { actions } from "../../app/actions.js";
import { Button } from "../../components/ui/Button.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { HorizontalRuler } from "../../components/ui/HorizontalRuler.jsx";
import { WheelPicker } from "../../components/ui/WheelPicker.jsx";
import {
  BrandDropletLogo,
  UterusPhaseIllustration,
  OnboardingCelebrationIllustration
} from "../../components/ui/PhaseIllustrations.jsx";
import { TD, I, N, fmt } from "../../core/engine.js";

export function OnboardingFlow() {
  const { S, ui } = useStore();
  const step = ui.obStep || 0;

  // Local onboarding state initialized from store defaults
  const [userName, setUserName] = useState(S.userName || "Isabella");
  const [bMonth, setBMonth] = useState(7); // Aug (0-indexed)
  const [bDay, setBDay] = useState(28);
  const [bYear, setBYear] = useState(1998);

  const [weightUnit, setWeightUnit] = useState(S.weightUnit || "kg");
  const [weight, setWeight] = useState(S.weight || 60.0);

  const [heightUnit, setHeightUnit] = useState(S.heightUnit || "cm");
  const [height, setHeight] = useState(S.height || 165.0);

  const [periodDuration, setPeriodDuration] = useState(S.pl || 5);
  const [cycleLength, setCycleLength] = useState(S.cl || 28);

  // Default last period start to 4 days ago for an active cycle
  const defaultLastPeriod = I(TD() - 4);
  const [lastPeriodDate, setLastPeriodDate] = useState(defaultLastPeriod);

  // Calendar picker state
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  // Setup calculation progress state (Step 11)
  const [setupProgress, setSetupProgress] = useState(65);

  useEffect(() => {
    if (step === 11) {
      const interval = setInterval(() => {
        setSetupProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => actions.onboardingNext(), 400);
            return 100;
          }
          return prev + 5;
        });
      }, 70);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Back navigation handler
  const handleBack = () => {
    if (step > 0) {
      ui.obStep = Math.max(0, step - 1);
      actions.notify();
    }
  };

  // Save current step data to store
  const saveCurrentBaseline = () => {
    S.userName = userName.trim() || "Riley";
    S.birthday = `${bYear}-${String(bMonth + 1).padStart(2, "0")}-${String(bDay).padStart(2, "0")}`;
    S.weight = weight;
    S.weightUnit = weightUnit;
    S.height = height;
    S.heightUnit = heightUnit;
    S.pl = Number(periodDuration) || 5;
    S.cl = Number(cycleLength) || 28;

    if (lastPeriodDate) {
      if (!S.periods) S.periods = [];
      const exists = S.periods.some(p => p.s === lastPeriodDate);
      if (!exists) {
        S.periods = [{ s: lastPeriodDate, e: I(N(lastPeriodDate) + S.pl - 1) }];
      }
    }
  };

  // Step 0: Splash Screen
  if (step === 0) {
    return (
      <div
        className="v-onboarding-screen v-splash-screen"
        onClick={() => actions.onboardingNext()}
        style={{
          background: "var(--primary, #FF5B99)",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px 24px 60px",
          flex: 1,
          cursor: "pointer"
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ marginBottom: "20px", transform: "scale(1.15)" }}>
            <BrandDropletLogo size={90} />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "36px",
              fontWeight: "900",
              letterSpacing: "-0.03em",
              margin: "0 0 8px",
              color: "#FFFFFF"
            }}
          >
            CycleSideChick
          </h1>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: "600", opacity: 0.9 }}>
            Your Menstrual Health Companion
          </p>
        </div>

        {/* Loading Spinner at Bottom */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
          <div
            className="v-splash-spinner"
            style={{
              width: "36px",
              height: "36px",
              border: "3px solid rgba(255, 255, 255, 0.3)",
              borderTopColor: "#FFFFFF",
              borderRadius: "50%",
              animation: "spin 0.9s linear infinite"
            }}
          />
          <span style={{ fontSize: "13px", fontWeight: "600", letterSpacing: "0.02em", opacity: 0.85 }}>
            Tap anywhere to begin
          </span>
        </div>
      </div>
    );
  }

  // Steps 1 to 3: Feature Carousel Slides
  if (step >= 1 && step <= 3) {
    const slideIdx = step - 1; // 0, 1, 2
    const SLIDES = [
      {
        title: "Select Your Personal Period Tracker",
        desc: "Tailored algorithms that adapt whether you have natural cycles, irregular timings, or use hormonal birth control.",
        illus: <UterusPhaseIllustration phase="menstrual" size={150} />
      },
      {
        title: "Track and Record with Complete Privacy",
        desc: "Effortlessly log flow intensity, cramps, mood, sleep, water, and body temperature. 100% on-device, zero cloud selling.",
        illus: <UterusPhaseIllustration phase="ovulation" size={150} />
      },
      {
        title: "Empower Yourself with Knowledge",
        desc: "Access certified clinical guides and biological phase predictions to sync your fitness, nutrition, and work with your cycle.",
        illus: <UterusPhaseIllustration phase="luteal" size={150} />
      }
    ];

    const curSlide = SLIDES[slideIdx];

    return (
      <div className="v-onboarding-screen view-enter" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "20px 20px 32px" }}>
        {/* Top Mockup Illustration Card */}
        <div
          style={{
            background: "var(--surface-tint, #FFF0F5)",
            borderRadius: "28px",
            padding: "40px 20px 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            maxHeight: "340px",
            margin: "10px 0 24px",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {curSlide.illus}
        </div>

        {/* Bottom Editorial Content */}
        <div style={{ textAlign: "center", padding: "0 8px" }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "24px",
              fontWeight: "800",
              color: "var(--text)",
              margin: "0 0 10px",
              lineHeight: 1.25
            }}
          >
            {curSlide.title}
          </h2>
          <p
            style={{
              fontSize: "14px",
              lineHeight: 1.55,
              color: "var(--text-muted)",
              margin: "0 0 28px",
              maxWidth: "340px",
              marginLeft: "auto",
              marginRight: "auto"
            }}
          >
            {curSlide.desc}
          </p>

          {/* 3 Dots Progress Indicator */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "28px" }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: i === slideIdx ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: i === slideIdx ? "var(--primary)" : "var(--border)",
                  transition: "all 0.25s ease"
                }}
              />
            ))}
          </div>

          {/* Action Buttons */}
          {slideIdx < 2 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <button
                type="button"
                onClick={() => {
                  ui.obStep = 4;
                  actions.notify();
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  padding: "12px 16px"
                }}
              >
                Skip
              </button>
              <Button
                variant="primary"
                size="md"
                style={{ flex: 1, maxWidth: "160px" }}
                onClick={() => actions.onboardingNext()}
              >
                Next
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              style={{ width: "100%" }}
              onClick={() => actions.onboardingNext()}
            >
              Get Started
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Common Header for Guided Question Steps (Steps 4 to 10)
  const renderHeader = (stepNum, totalSteps = 7) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", width: "100%" }}>
      <button
        type="button"
        onClick={handleBack}
        aria-label="Previous step"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "1px solid var(--border)",
          background: "var(--surface)",
          color: "var(--text)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer"
        }}
      >
        <Icon name="arrowLeft" size={18} />
      </button>

      {/* Progress pill indicator */}
      <div style={{ display: "flex", gap: "4px" }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === (stepNum - 1) ? "20px" : "6px",
              height: "6px",
              borderRadius: "3px",
              background: i <= (stepNum - 1) ? "var(--primary)" : "var(--border)",
              transition: "all 0.2s ease"
            }}
          />
        ))}
      </div>

      <div style={{ width: "40px" }} />
    </div>
  );

  // Step 4: Name Entry ("What's your name?")
  if (step === 4) {
    return (
      <div className="v-onboarding-screen view-enter" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "20px 20px 32px" }}>
        <div>
          {renderHeader(1)}
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "26px", fontWeight: "800", margin: "0 0 8px", color: "var(--text)" }}>
            What's your name?
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 32px" }}>
            We'll use this to personalize your cycle insights and greetings.
          </p>

          <div style={{ marginTop: "40px" }}>
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="e.g. Isabella"
              autoFocus
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: "18px",
                border: "2px solid var(--border)",
                background: "var(--surface)",
                fontSize: "20px",
                fontWeight: "700",
                color: "var(--text)",
                outline: "none",
                textAlign: "center",
                transition: "border-color 0.2s ease"
              }}
              onFocus={e => (e.target.style.borderColor = "var(--primary)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
              onKeyDown={e => {
                if (e.key === "Enter") actions.onboardingNext();
              }}
            />
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          style={{ width: "100%" }}
          onClick={() => actions.onboardingNext()}
        >
          Continue
        </Button>
      </div>
    );
  }

  // Step 5: Birthday Selection (3-Column Wheel Picker)
  if (step === 5) {
    const MONTHS = [
      { value: 0, label: "Jan" },
      { value: 1, label: "Feb" },
      { value: 2, label: "Mar" },
      { value: 3, label: "Apr" },
      { value: 4, label: "May" },
      { value: 5, label: "Jun" },
      { value: 6, label: "Jul" },
      { value: 7, label: "Aug" },
      { value: 8, label: "Sep" },
      { value: 9, label: "Oct" },
      { value: 10, label: "Nov" },
      { value: 11, label: "Dec" }
    ];

    const DAYS = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
    const currentYear = new Date().getFullYear();
    const YEARS = Array.from({ length: 50 }, (_, i) => {
      const yr = currentYear - 12 - i;
      return { value: yr, label: String(yr) };
    });

    return (
      <div className="v-onboarding-screen view-enter" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "20px 20px 32px" }}>
        <div>
          {renderHeader(2)}
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "26px", fontWeight: "800", margin: "0 0 8px", color: "var(--text)" }}>
            When's your birthday?
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 24px" }}>
            Helps tailor age-adjusted cycle variation and hormone expectations.
          </p>

          {/* 3-Column Drum Picker */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1.2fr",
              gap: "8px",
              background: "var(--surface)",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              padding: "10px",
              marginTop: "20px"
            }}
          >
            <WheelPicker items={MONTHS} value={bMonth} onChange={setBMonth} />
            <WheelPicker items={DAYS} value={bDay} onChange={setBDay} />
            <WheelPicker items={YEARS} value={bYear} onChange={setBYear} />
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          style={{ width: "100%" }}
          onClick={() => actions.onboardingNext()}
        >
          Continue
        </Button>
      </div>
    );
  }

  // Step 6: Weight Selection (kg / lb toggle + Horizontal Precision Ruler)
  if (step === 6) {
    return (
      <div className="v-onboarding-screen view-enter" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "20px 20px 32px" }}>
        <div>
          {renderHeader(3)}
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "26px", fontWeight: "800", margin: "0 0 8px", color: "var(--text)" }}>
            What is your weight?
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 24px" }}>
            Track weight shifts across luteal fluid retention and period phases.
          </p>

          {/* Segmented Unit Toggle */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <div style={{ display: "inline-flex", background: "var(--surface-alt)", padding: "4px", borderRadius: "999px" }}>
              <button
                type="button"
                onClick={() => setWeightUnit("kg")}
                style={{
                  padding: "6px 20px",
                  borderRadius: "999px",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  background: weightUnit === "kg" ? "var(--primary)" : "transparent",
                  color: weightUnit === "kg" ? "#FFFFFF" : "var(--text-muted)",
                  transition: "all 0.2s ease"
                }}
              >
                kg
              </button>
              <button
                type="button"
                onClick={() => setWeightUnit("lb")}
                style={{
                  padding: "6px 20px",
                  borderRadius: "999px",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  background: weightUnit === "lb" ? "var(--primary)" : "transparent",
                  color: weightUnit === "lb" ? "#FFFFFF" : "var(--text-muted)",
                  transition: "all 0.2s ease"
                }}
              >
                lb
              </button>
            </div>
          </div>

          <HorizontalRuler
            value={weight}
            min={weightUnit === "kg" ? 30 : 66}
            max={weightUnit === "kg" ? 180 : 396}
            step={0.5}
            unit={weightUnit}
            onChange={setWeight}
          />
        </div>

        <Button
          variant="primary"
          size="lg"
          style={{ width: "100%" }}
          onClick={() => actions.onboardingNext()}
        >
          Continue
        </Button>
      </div>
    );
  }

  // Step 7: Height Selection (cm / ft toggle + Horizontal Precision Ruler)
  if (step === 7) {
    return (
      <div className="v-onboarding-screen view-enter" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "20px 20px 32px" }}>
        <div>
          {renderHeader(4)}
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "26px", fontWeight: "800", margin: "0 0 8px", color: "var(--text)" }}>
            How tall are you?
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 24px" }}>
            Helps calculate healthy BMI ranges and metabolic baseline.
          </p>

          {/* Segmented Unit Toggle */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <div style={{ display: "inline-flex", background: "var(--surface-alt)", padding: "4px", borderRadius: "999px" }}>
              <button
                type="button"
                onClick={() => setHeightUnit("cm")}
                style={{
                  padding: "6px 20px",
                  borderRadius: "999px",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  background: heightUnit === "cm" ? "var(--primary)" : "transparent",
                  color: heightUnit === "cm" ? "#FFFFFF" : "var(--text-muted)",
                  transition: "all 0.2s ease"
                }}
              >
                cm
              </button>
              <button
                type="button"
                onClick={() => setHeightUnit("ft")}
                style={{
                  padding: "6px 20px",
                  borderRadius: "999px",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  background: heightUnit === "ft" ? "var(--primary)" : "transparent",
                  color: heightUnit === "ft" ? "#FFFFFF" : "var(--text-muted)",
                  transition: "all 0.2s ease"
                }}
              >
                ft
              </button>
            </div>
          </div>

          <HorizontalRuler
            value={height}
            min={heightUnit === "cm" ? 100 : 3.2}
            max={heightUnit === "cm" ? 220 : 7.2}
            step={heightUnit === "cm" ? 1 : 0.1}
            unit={heightUnit}
            onChange={setHeight}
          />
        </div>

        <Button
          variant="primary"
          size="lg"
          style={{ width: "100%" }}
          onClick={() => actions.onboardingNext()}
        >
          Continue
        </Button>
      </div>
    );
  }

  // Step 8: Period Duration (1 to 10 Days Vertical Wheel)
  if (step === 8) {
    const PERIOD_DAYS = Array.from({ length: 10 }, (_, i) => ({
      value: i + 1,
      label: String(i + 1)
    }));

    return (
      <div className="v-onboarding-screen view-enter" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "20px 20px 32px" }}>
        <div>
          {renderHeader(5)}
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "26px", fontWeight: "800", margin: "0 0 8px", color: "var(--text)" }}>
            How long does your period usually last?
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 32px" }}>
            Bleeding usually lasts between 3 to 7 days for most people.
          </p>

          <div
            style={{
              background: "var(--surface)",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              padding: "12px",
              maxWidth: "260px",
              margin: "0 auto"
            }}
          >
            <WheelPicker
              items={PERIOD_DAYS}
              value={periodDuration}
              onChange={setPeriodDuration}
              suffix="days"
            />
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          style={{ width: "100%" }}
          onClick={() => actions.onboardingNext()}
        >
          Continue
        </Button>
      </div>
    );
  }

  // Step 9: Cycle Length (21 to 45 Days Vertical Wheel)
  if (step === 9) {
    const CYCLE_DAYS = Array.from({ length: 25 }, (_, i) => ({
      value: 21 + i,
      label: String(21 + i)
    }));

    return (
      <div className="v-onboarding-screen view-enter" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "20px 20px 32px" }}>
        <div>
          {renderHeader(6)}
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "26px", fontWeight: "800", margin: "0 0 8px", color: "var(--text)" }}>
            How long does your cycle usually last?
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 32px" }}>
            Counted from Day 1 of one period to Day 1 of the next period.
          </p>

          <div
            style={{
              background: "var(--surface)",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              padding: "12px",
              maxWidth: "260px",
              margin: "0 auto"
            }}
          >
            <WheelPicker
              items={CYCLE_DAYS}
              value={cycleLength}
              onChange={setCycleLength}
              suffix="days"
            />
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          style={{ width: "100%" }}
          onClick={() => actions.onboardingNext()}
        >
          Continue
        </Button>
      </div>
    );
  }

  // Step 10: Last Period Start Date (Interactive Calendar Picker)
  if (step === 10) {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // Mon = 0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handlePrevMonth = () => {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    };

    const handleNextMonth = () => {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    };

    return (
      <div className="v-onboarding-screen view-enter" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "20px 20px 32px" }}>
        <div>
          {renderHeader(7)}
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "26px", fontWeight: "800", margin: "0 0 8px", color: "var(--text)" }}>
            When did your last period start?
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 20px" }}>
            Select the first day of bleeding from your most recent period.
          </p>

          {/* Calendar Picker Card */}
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              padding: "16px"
            }}
          >
            {/* Month Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <button
                type="button"
                onClick={handlePrevMonth}
                style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: "6px" }}
              >
                <Icon name="chevronLeft" size={18} />
              </button>
              <span style={{ fontWeight: "800", fontSize: "16px" }}>
                {monthNames[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: "6px" }}
              >
                <Icon name="chevronRight" size={18} />
              </button>
            </div>

            {/* Day of Week Labels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", marginBottom: "8px" }}>
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
                <span key={d} style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>
                  {d}
                </span>
              ))}
            </div>

            {/* Date Cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", textAlign: "center" }}>
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const cellDate = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const isSelected = lastPeriodDate === cellDate;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setLastPeriodDate(cellDate)}
                    style={{
                      height: "38px",
                      borderRadius: "50%",
                      border: "none",
                      background: isSelected ? "var(--primary)" : "transparent",
                      color: isSelected ? "#FFFFFF" : "var(--text)",
                      fontWeight: isSelected ? "800" : "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            type="button"
            onClick={() => {
              saveCurrentBaseline();
              actions.onboardingNext();
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "13.5px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "6px"
            }}
          >
            I don't remember exactly
          </button>
          <Button
            variant="primary"
            size="lg"
            style={{ width: "100%" }}
            onClick={() => {
              saveCurrentBaseline();
              actions.onboardingNext();
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // Step 11: Setup & Calculation Loading Progress Screen
  if (step === 11) {
    const radius = 70;
    const circ = 2 * Math.PI * radius;
    const strokeDash = `${(setupProgress / 100) * circ} ${circ}`;

    return (
      <div
        className="v-onboarding-screen view-enter"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          padding: "40px 24px",
          textAlign: "center"
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "24px",
            fontWeight: "800",
            margin: "0 0 10px",
            color: "var(--text)"
          }}
        >
          We're setting up your personal cycle tracker...
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 40px", maxWidth: "320px" }}>
          Personalizing your cycle insights, hormonal rhythms, and health benchmarks.
        </p>

        {/* Circular Progress Ring */}
        <div style={{ position: "relative", width: "180px", height: "180px", margin: "0 auto 40px" }}>
          <svg viewBox="0 0 180 180" width="180" height="180">
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="var(--surface-alt, #F1F1F5)"
              strokeWidth="12"
            />
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="var(--primary, #FF5B99)"
              strokeWidth="12"
              strokeDasharray={strokeDash}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 90 90)"
              style={{ transition: "stroke-dasharray 0.15s ease" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              fontWeight: "900",
              fontFamily: "var(--font-heading)",
              color: "var(--text)"
            }}
          >
            {setupProgress}%
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "280px", textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text)" }}>
            <Icon name="check" size={16} /> <span>Calibrating follicular & luteal phases</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text)" }}>
            <Icon name="check" size={16} /> <span>Securing local health vault</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text)" }}>
            <Icon name="check" size={16} /> <span>Generating evidence-based guidance</span>
          </div>
        </div>
      </div>
    );
  }

  // Step 12: Personalized Completion Screen ("You're All Set! 🎉")
  return (
    <div
      className="v-onboarding-screen view-enter"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex: 1,
        padding: "40px 24px 32px",
        textAlign: "center"
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ marginBottom: "28px" }}>
          <OnboardingCelebrationIllustration size={160} />
        </div>
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "28px",
            fontWeight: "900",
            color: "var(--text)",
            margin: "0 0 10px"
          }}
        >
          You're All Set! 🎉
        </h2>
        <p style={{ fontSize: "14.5px", color: "var(--text-muted)", lineHeight: 1.5, maxWidth: "320px", margin: "0" }}>
          Your personalized cycle tracker is ready to guide you through every phase with complete privacy.
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        style={{ width: "100%" }}
        onClick={() => {
          saveCurrentBaseline();
          actions.finishOnboarding();
        }}
      >
        Go to Dashboard
      </Button>
    </div>
  );
}
