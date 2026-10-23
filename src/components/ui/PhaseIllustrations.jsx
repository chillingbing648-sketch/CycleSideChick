/**
 * CycleSideChick — Anatomical Phase & Brand Illustrations
 * High-fidelity, scalable vector illustrations for the 4 menstrual phases,
 * brand splash, and onboarding celebration.
 */

import React from "react";

/**
 * Uterus & Ovaries Anatomical Vector Illustration
 * Adapts colors, accents, and focal highlights for each cycle phase.
 */
export function UterusPhaseIllustration({ phase = "menstrual", size = 120, className = "" }) {
  // Normalize phase name
  const p = (phase || "").toLowerCase();
  const isMenstrual = p.includes("menstru") || p === "period";
  const isFollicular = p.includes("follicul");
  const isOvulation = p.includes("ovulat") || p.includes("fertile");
  const isLuteal = p.includes("luteal");

  // Phase color accents
  let accentColor = "#FF5B99"; // Menstrual pink
  let glowColor = "rgba(255, 91, 153, 0.15)";
  let badgeText = "Menstrual Phase";

  if (isFollicular) {
    accentColor = "#FF9A3C"; // Follicular orange/amber
    glowColor = "rgba(255, 154, 60, 0.15)";
    badgeText = "Follicular Phase";
  } else if (isOvulation) {
    accentColor = "#20C997"; // Ovulation teal/cyan
    glowColor = "rgba(32, 201, 151, 0.18)";
    badgeText = "Ovulation Phase";
  } else if (isLuteal) {
    accentColor = "#9C27B0"; // Luteal purple
    glowColor = "rgba(156, 39, 176, 0.15)";
    badgeText = "Luteal Phase";
  }

  return (
    <svg
      viewBox="0 0 160 140"
      width={size}
      height={size * (140 / 160)}
      className={`c-phase-illus ${className}`.trim()}
      role="img"
      aria-label={`${badgeText} illustration`}
      style={{ display: "block", margin: "0 auto", overflow: "visible" }}
    >
      <defs>
        {/* Soft background glow */}
        <radialGradient id={`glow-${p}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="1" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
        
        {/* Follicle active glow */}
        <radialGradient id={`eggGlow-${p}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor={accentColor} />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.2" />
        </radialGradient>
      </defs>

      {/* Ambient background disc */}
      <circle cx="80" cy="70" r="62" fill={`url(#glow-${p})`} />

      {/* Fallopian Tubes (Left & Right) */}
      <path
        d="M 58 48 C 42 34 26 38 18 52 C 14 59 18 68 25 67 C 32 66 36 58 46 54"
        fill="none"
        stroke="#F5A3B7"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 102 48 C 118 34 134 38 142 52 C 146 59 142 68 135 67 C 128 66 124 58 114 54"
        fill="none"
        stroke="#F5A3B7"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Ovaries (Left & Right) */}
      {/* Left Ovary */}
      <g>
        <ellipse cx="22" cy="62" rx="10" ry="8" fill="#FFCCD7" stroke="#E68A9E" strokeWidth="2" />
        {isFollicular && (
          // Developing follicles
          <g>
            <circle cx="20" cy="60" r="3" fill="#FF9A3C" />
            <circle cx="25" cy="63" r="2" fill="#FFB74D" />
          </g>
        )}
      </g>

      {/* Right Ovary (Active in ovulation / luteal) */}
      <g>
        <ellipse cx="138" cy="62" rx="10" ry="8" fill="#FFCCD7" stroke="#E68A9E" strokeWidth="2" />
        {isOvulation && (
          // Dominant follicle releasing ovum
          <g>
            <circle cx="138" cy="62" r="7" fill={`url(#eggGlow-${p})`} />
            <circle cx="138" cy="62" r="3.5" fill="#FFFFFF" stroke="#20C997" strokeWidth="1.5" />
            {/* Sparkles */}
            <path d="M 148 50 L 150 46 L 152 50 L 156 52 L 152 54 L 150 58 L 148 54 L 144 52 Z" fill="#20C997" />
          </g>
        )}
        {isLuteal && (
          // Corpus Luteum
          <circle cx="138" cy="62" r="4.5" fill="#FFD54F" stroke="#9C27B0" strokeWidth="1.5" />
        )}
      </g>

      {/* Uterus Body (Pear / Heart Shaped Anatomical Contour) */}
      <path
        d="M 52 45 C 62 48 98 48 108 45 C 114 62 108 85 92 104 C 88 109 85 116 85 124 L 75 124 C 75 116 72 109 68 104 C 52 85 46 62 52 45 Z"
        fill="#FFDCE5"
        stroke="#E68A9E"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Endometrium / Inner Cavity */}
      {isMenstrual ? (
        // Shedding flow droplets inside cavity
        <g>
          <path
            d="M 64 58 C 72 60 88 60 96 58 C 94 72 88 84 80 95 C 72 84 66 72 64 58 Z"
            fill="#FF4081"
            opacity="0.3"
          />
          {/* Menstrual flow droplets */}
          <path d="M 80 70 C 80 70 76 76 76 80 C 76 82.2 77.8 84 80 84 C 82.2 84 84 82.2 84 80 C 84 76 80 70 80 70 Z" fill="#FF5B99" />
          <path d="M 80 94 C 80 94 77 98 77 101 C 77 102.6 78.3 104 80 104 C 81.7 104 83 102.6 83 101 C 83 98 80 94 80 94 Z" fill="#FF5B99" />
        </g>
      ) : isFollicular ? (
        // Thin renewing lining
        <path
          d="M 66 58 C 74 59 86 59 94 58 C 92 70 86 82 80 92 C 74 82 68 70 66 58 Z"
          fill="#FFF3E0"
          stroke="#FF9A3C"
          strokeWidth="1.5"
        />
      ) : isOvulation ? (
        // Fertile receptive lining
        <g>
          <path
            d="M 65 58 C 73 60 87 60 95 58 C 93 72 87 84 80 95 C 73 84 67 72 65 58 Z"
            fill="#E0F7F1"
            stroke="#20C997"
            strokeWidth="1.8"
          />
          <circle cx="80" cy="74" r="2.5" fill="#20C997" />
        </g>
      ) : (
        // Luteal thick plush secretory lining
        <path
          d="M 64 58 C 72 61 88 61 96 58 C 94 74 88 88 80 98 C 72 88 66 74 64 58 Z"
          fill="#F3E5F5"
          stroke="#9C27B0"
          strokeWidth="2"
        />
      )}

      {/* Cute Gentle Face on Uterus (matches the friendly mobile app personality) */}
      <circle cx="72" cy="72" r="2" fill="#5A2E3B" />
      <circle cx="88" cy="72" r="2" fill="#5A2E3B" />
      {/* Soft Smile */}
      <path d="M 77 78 Q 80 81 83 78" fill="none" stroke="#5A2E3B" strokeWidth="1.5" strokeLinecap="round" />
      {/* Rosy Cheeks */}
      <circle cx="68" cy="75" r="3" fill="#FF8CA3" opacity="0.6" />
      <circle cx="92" cy="75" r="3" fill="#FF8CA3" opacity="0.6" />
    </svg>
  );
}

/**
 * Brand Logo Icon with Stylized Cycle Water Droplet
 * Used in Splash Screen, Headers, and Mascot areas.
 */
export function BrandDropletLogo({ size = 80, className = "" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`c-brand-logo ${className}`.trim()}
      role="img"
      aria-label="CycleSideChick Logo"
      style={{ display: "inline-block" }}
    >
      <defs>
        <linearGradient id="dropletBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7EA9"/>
          <stop offset="50%" stopColor="#FF5B99"/>
          <stop offset="100%" stopColor="#E83F7D"/>
        </linearGradient>
        <radialGradient id="dropletBlush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB3CD" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#FFB3CD" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Soft circular pastel background */}
      <circle cx="50" cy="50" r="47" fill="#FFF5F8" stroke="#FFE0EB" strokeWidth="2" />

      {/* Kawaii Droplet Silhouette */}
      <path
        d="M 50 14 C 50 14 24 44 24 62 C 24 76.5 35.5 87 50 87 C 64.5 87 76 76.5 76 62 C 76 44 50 14 50 14 Z"
        fill="url(#dropletBrandGrad)"
      />

      {/* Specular soft light highlights */}
      <path
        d="M 36 46 C 31 53 31 63 36 71"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.65"
      />
      <circle cx="34" cy="42" r="2.2" fill="#FFFFFF" opacity="0.8" />

      {/* Sweet Smiling Eyes */}
      <path
        d="M 40 60 C 41.5 57 44.5 57 46 60"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M 54 60 C 55.5 57 58.5 57 60 60"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Rosy Blushing Cheeks */}
      <ellipse cx="37" cy="65" rx="4.5" ry="3" fill="#FFA5C3" opacity="0.9" />
      <ellipse cx="63" cy="65" rx="4.5" ry="3" fill="#FFA5C3" opacity="0.9" />

      {/* Tiny Sweet Smile */}
      <path
        d="M 47.5 65.5 Q 50 68 52.5 65.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Cute Little Heart Accent */}
      <path
        d="M 68 28 C 66 26 63 27 63 29 C 63 31 66 34 68 35 C 70 34 73 31 73 29 C 73 27 70 26 68 28 Z"
        fill="#FFD6E5"
      />
    </svg>
  );
}

/**
 * Onboarding Completion Celebration Illustration
 * Matches the reference screen "You're All Set! 🎉" with phone & checkmark.
 */
export function OnboardingCelebrationIllustration({ size = 180, className = "" }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`c-celebration-illus ${className}`.trim()}
      role="img"
      aria-label="Celebration illustration"
      style={{ display: "block", margin: "0 auto" }}
    >
      <defs>
        <radialGradient id="celGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF0F5" stopOpacity="1" />
          <stop offset="100%" stopColor="#FFF0F5" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="100" r="90" fill="url(#celGlow)" />

      {/* Floating Sparkles & Hearts */}
      <path d="M 40 45 L 43 38 L 46 45 L 53 48 L 46 51 L 43 58 L 40 51 L 33 48 Z" fill="#FF5B99" />
      <path d="M 160 50 L 162 45 L 164 50 L 169 52 L 164 54 L 162 59 L 160 54 L 155 52 Z" fill="#FF9A3C" />
      <path d="M 155 140 L 157 136 L 159 140 L 163 142 L 159 144 L 157 148 L 155 144 L 151 142 Z" fill="#20C997" />

      {/* Hearts */}
      <path
        d="M 38 120 C 35 116 30 116 28 120 C 26 124 30 128 34 132 L 38 136 L 42 132 C 46 128 50 124 48 120 C 46 116 41 116 38 120 Z"
        fill="#FF5B99"
        opacity="0.8"
      />
      <path
        d="M 168 95 C 166 92 162 92 160 95 C 158 98 162 101 165 104 L 168 107 L 171 104 C 174 101 178 98 176 95 C 174 92 170 92 168 95 Z"
        fill="#9C27B0"
        opacity="0.8"
      />

      {/* Phone Body */}
      <rect x="68" y="32" width="64" height="116" rx="14" fill="#FFFFFF" stroke="#29252A" strokeWidth="3" />
      {/* Phone Screen */}
      <rect x="74" y="44" width="52" height="92" rx="8" fill="#FFF0F5" />
      {/* Dynamic island */}
      <rect x="90" y="38" width="20" height="3" rx="1.5" fill="#29252A" />

      {/* Large Checkmark Badge on Phone */}
      <circle cx="100" cy="85" r="20" fill="#FF5B99" />
      <path
        d="M 91 85 L 97 91 L 109 79"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
