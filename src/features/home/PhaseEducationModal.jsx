/**
 * CycleSideChick — Menstrual Phase Education Screen
 * Recreates the 4 dedicated phase screens shown in the reference:
 * - Menstrual Phase (Days 1–5)
 * - Follicular Phase (Days 6–13)
 * - Ovulation Phase (Days 14–16)
 * - Luteal Phase (Days 17–28)
 *
 * Each view includes:
 * - Bespoke anatomical uterus & ovary illustration
 * - Phase timing & hormonal driver badges
 * - "What Happens" biological breakdown
 * - "Common Symptoms" checklist
 * - "Self-Care Guidance" actionable lifestyle tips
 * - Interactive phase switcher pills
 */

import React, { useState } from "react";
import { SheetModal } from "../../components/ui/SheetModal.jsx";
import { Icon } from "../../components/ui/Icon.jsx";
import { UterusPhaseIllustration } from "../../components/ui/PhaseIllustrations.jsx";

const PHASES_DATA = [
  {
    id: "menstrual",
    name: "Menstrual Phase",
    days: "Days 1 – 5",
    hormone: "Estrogen & Progesterone at baseline",
    energy: "Low to reflective",
    whatHappens:
      "When pregnancy has not occurred, the corpus luteum breaks down, causing estrogen and progesterone levels to decline sharply. This hormonal withdrawal signals the spiral arterioles to constrict, causing the nutrient-rich uterine endometrium to shed naturally over 3 to 7 days.",
    symptoms: [
      { name: "Uterine cramps", desc: "Prostaglandin-driven muscular contractions" },
      { name: "Fatigue & low stamina", desc: "Lower metabolic rate and resting estrogen" },
      { name: "Lower back ache", desc: "Referred pelvic inflammation" },
      { name: "Emotional sensitivity", desc: "Neurochemical reset period" }
    ],
    selfCare: [
      { title: "Nourish with Iron & Magnesium", desc: "Replenish iron stores with lentils, leafy greens, dark chocolate, and magnesium-rich pumpkin seeds to relieve cramps." },
      { title: "Gentle Restorative Movement", desc: "Focus on walking, restorative yin yoga, and slow breathing rather than strenuous high-intensity interval training." },
      { title: "Thermal Comfort", desc: "Apply a heating pad to the lower abdomen or take a warm Epsom salt bath to stimulate local blood flow and soothe muscles." }
    ]
  },
  {
    id: "follicular",
    name: "Follicular Phase",
    days: "Days 6 – 13",
    hormone: "Rising Estrogen & FSH",
    energy: "High, optimistic & energetic",
    whatHappens:
      "The pituitary gland secretes Follicle-Stimulating Hormone (FSH), prompting several ovarian follicles to develop. As follicles mature, they secrete increasing quantities of 17β-estradiol. Rising estrogen stimulates the endometrium to regenerate and thicken with dense blood vessels.",
    symptoms: [
      { name: "Surging physical stamina", desc: "Estrogen enhances insulin sensitivity & glycogen storage" },
      { name: "Clearer skin", desc: "Optimal estrogen-to-androgen balance" },
      { name: "Optimistic & social mood", desc: "Elevated serotonin and dopamine receptors" },
      { name: "Gradual moisture increase", desc: "Cervical mucus shifts from dry to creamy" }
    ],
    selfCare: [
      { title: "Strength & High-Energy Training", desc: "Take advantage of heightened endurance for strength training, running, and dynamic social activities." },
      { title: "Fresh, Fiber-Rich Whole Foods", desc: "Cruciferous vegetables (broccoli, cabbage, kale) help the liver metabolize healthy estrogen pathways." },
      { title: "Creative & Collaborative Projects", desc: "Verbal memory, problem-solving, and creative brainstorming peak during this pre-ovulatory window." }
    ]
  },
  {
    id: "ovulation",
    name: "Ovulation Phase",
    days: "Days 14 – 16",
    hormone: "LH Surge & Peak Estrogen",
    energy: "Peak vitality & heightened libido",
    whatHappens:
      "When estradiol reaches a critical concentration threshold, it triggers a positive feedback surge of Luteinizing Hormone (LH) from the pituitary gland. Within 24 to 36 hours of the LH peak, the dominant Graafian follicle ruptures, releasing a mature oocyte into the fallopian tube.",
    symptoms: [
      { name: "Egg-white cervical fluid", desc: "Clear, stretchy, lubricative fluid that nourishes sperm" },
      { name: "Heightened libido", desc: "Evolutionary peak in reproductive arousal" },
      { name: "Mittelschmerz", desc: "Mild one-sided pelvic twinge during follicle rupture" },
      { name: "Subtle breast tenderness", desc: "Transient estrogen spike" }
    ],
    selfCare: [
      { title: "Hydration & Electrolytes", desc: "Peak cervical fluid production requires optimal hydration; drink 2–2.5 liters of clean water and herbal infusions." },
      { title: "High-Impact Peak Workouts", desc: "Your joints and muscles are warm and responsive; excellent time for dance, group fitness, and PR lifts." },
      { title: "Fertility Awareness Check", desc: "If trying to conceive, the 5 days before ovulation plus ovulation day constitute the highest probability window." }
    ]
  },
  {
    id: "luteal",
    name: "Luteal Phase",
    days: "Days 17 – 28",
    hormone: "Progesterone dominance",
    energy: "Calm, winding down, nesting",
    whatHappens:
      "Following ovulation, the collapsed ovarian follicle reorganizes into the endocrine corpus luteum, which pumps out progesterone. Progesterone transforms the uterine lining into a lush secretory bed and raises your basal body temperature by ~0.3°C to 0.5°C.",
    symptoms: [
      { name: "Bloating & fluid retention", desc: "Progesterone slows gastrointestinal motility" },
      { name: "Food cravings (complex carbs)", desc: "Metabolic rate increases by 100–300 kcal/day" },
      { name: "Tender breasts", desc: "Increased glandular tissue vascularity" },
      { name: "Premenstrual mood shifts", desc: "Neurosteroid fluctuations as progesterone dips" }
    ],
    selfCare: [
      { title: "Complex Carbohydrates & B6", desc: "Sweet potatoes, oats, brown rice, and chickpeas support sustained serotonin synthesis without blood sugar crashes." },
      { title: "Prioritize Sleep & Boundaries", desc: "Progesterone promotes sleepiness, but REM cycles can fragment; aim for 8+ hours and wind down earlier." },
      { title: "Calming, Grounding Movement", desc: "Pilates, nature walks, and swimming gently ease water retention and reduce nervous tension." }
    ]
  }
];

export function PhaseEducationModal({ initialPhase = "menstrual", isOpen = true, onClose }) {
  const [activePhaseId, setActivePhaseId] = useState(
    initialPhase.toLowerCase().includes("follicul")
      ? "follicular"
      : initialPhase.toLowerCase().includes("ovulat") || initialPhase.toLowerCase().includes("fertile")
      ? "ovulation"
      : initialPhase.toLowerCase().includes("luteal")
      ? "luteal"
      : "menstrual"
  );

  const phase = PHASES_DATA.find(p => p.id === activePhaseId) || PHASES_DATA[0];

  return (
    <SheetModal
      isOpen={isOpen}
      onClose={onClose}
      title={phase.name}
      maxWidth="500px"
      className="v-phase-education-sheet"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Phase Selector Chips */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "6px",
            background: "var(--surface-alt, #F1F1F5)",
            padding: "4px",
            borderRadius: "999px"
          }}
        >
          {PHASES_DATA.map(p => {
            const isSelected = p.id === activePhaseId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePhaseId(p.id)}
                style={{
                  padding: "8px 4px",
                  borderRadius: "999px",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "11px",
                  cursor: "pointer",
                  background: isSelected ? "var(--primary, #FF5B99)" : "transparent",
                  color: isSelected ? "#FFFFFF" : "var(--text-muted)",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                  textAlign: "center"
                }}
              >
                {p.id.charAt(0).toUpperCase() + p.id.slice(1, 4)}
              </button>
            );
          })}
        </div>

        {/* Anatomical Illustration Card */}
        <div
          style={{
            background: "var(--surface-tint, #FFF0F5)",
            borderRadius: "24px",
            padding: "24px 16px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "1px solid var(--berry-border, #FED4E4)"
          }}
        >
          <UterusPhaseIllustration phase={phase.id} size={150} />
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "800",
                padding: "4px 12px",
                borderRadius: "999px",
                background: "var(--primary)",
                color: "#FFFFFF"
              }}
            >
              {phase.days}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "600",
                padding: "4px 12px",
                borderRadius: "999px",
                background: "var(--surface)",
                color: "var(--text)",
                border: "1px solid var(--border)"
              }}
            >
              {phase.hormone}
            </span>
          </div>
        </div>

        {/* Section 1: What Happens */}
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "20px",
            padding: "18px",
            border: "1px solid var(--border)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Icon name="sparkle" size={17} />
            <b style={{ fontSize: "15px", color: "var(--text)" }}>What Happens</b>
          </div>
          <p style={{ margin: 0, fontSize: "13.5px", lineHeight: 1.6, color: "var(--text-muted)" }}>
            {phase.whatHappens}
          </p>
        </div>

        {/* Section 2: Common Symptoms */}
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "20px",
            padding: "18px",
            border: "1px solid var(--border)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Icon name="activity" size={17} />
            <b style={{ fontSize: "15px", color: "var(--text)" }}>Common Symptoms</b>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
            {phase.symptoms.map(s => (
              <div
                key={s.name}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  background: "var(--surface-soft)"
                }}
              >
                <div style={{ color: "var(--primary)", marginTop: "2px" }}>
                  <Icon name="check" size={15} />
                </div>
                <div>
                  <b style={{ fontSize: "13.5px", display: "block", color: "var(--text)" }}>{s.name}</b>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Self-Care Guidance */}
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "20px",
            padding: "18px",
            border: "1px solid var(--border)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Icon name="heart" size={17} />
            <b style={{ fontSize: "15px", color: "var(--text)" }}>Self-Care Guidance</b>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {phase.selfCare.map(c => (
              <div key={c.title} style={{ paddingLeft: "10px", borderLeft: "3px solid var(--primary)" }}>
                <b style={{ fontSize: "13.5px", display: "block", color: "var(--text)", marginBottom: "2px" }}>
                  {c.title}
                </b>
                <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SheetModal>
  );
}
