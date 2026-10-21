# CycleSideChick — Design System v3 Specification

**Version:** 3.0.0 (React 18+ & Vite)  
**Target Feeling:** Soft, warm, trustworthy, alive. Blush-and-plum editorial calm, tactile spring motion, layered frosted-glass depth, and zero visual noise.

---

## 1. Foundations & Tokens

### 1.1 Color Grading & Palettes
All color definitions are grounded in warm off-whites, plum ink, berry primary accents, and WCAG 2.2 AA-compliant physiological phase colors.

#### Core Brand Colors
- `--plum`: `#481930` (Light) / `#F8EDF5` (Dark) — deep editorial ink for headings and primary text.
- `--berry`: `#C23168` (Light) / `#EB6FA1` (Dark) — active accent and primary call-to-action tone.
- `--surface`: `#FDF9FA` (Light) / `#1E1926` (Dark) — warm off-white surface; never clinical pure `#FFFFFF` in dark or light.
- `--surface-raised`: `#F6EDF2` (Light) / `#2D253A` (Dark) — elevated card surfaces.

#### Physiological Phase Colors (Light & Dark)
Each phase pairs a background, border, and text color verified $\ge 4.5:1$ contrast:
- **Menstrual (Bleeding):** `--phase-menstrual` (`#E11D48` light / `#FB7185` dark)
- **Follicular (Rising Estrogen):** `--phase-follicular` (`#059669` light / `#34D399` dark)
- **Ovulatory (LH Peak / Fertile):** `--phase-ovulatory` (`#7C3AED` light / `#A78BFA` dark)
- **Luteal (Progesterone):** `--phase-luteal` (`#D97706` light / `#FBBF24` dark)

#### 8 Soft Semantic Tints
1. **Rose:** Warm emotional grounding, comfort check-ins.
2. **Lavender:** Fertile window, reflections, and insights.
3. **Butter:** Pregnancy milestones and restorative nutrition.
4. **Amber:** Reminders, alerts, and cycle transitions.
5. **Sage:** Perimenopause mode, physical rest, and nature.
6. **Mint:** Clinical summaries, privacy ledger, and verified medicine.
7. **Sky:** Hormonal contraception, hydration tracker.
8. **Peach:** Movement, energy tips, and self-care.

---

### 1.2 Editorial Typography
CycleSideChick self-hosts two variable fonts with zero external CDN calls:
- **Display Serif:** `Fraunces` variable (`400 700`, soft serif character with warm optical sizing).
- **Body Sans:** `Manrope` variable (`300 800`, geometric modern sans with high legibility and tabular numerals).

#### Fluid Typographic Scale (`clamp`-based)
```css
--text-display: clamp(2.2rem, 5vw, 3.2rem);
--text-h1: clamp(1.75rem, 3.5vw, 2.25rem);
--text-h2: clamp(1.35rem, 2.5vw, 1.65rem);
--text-h3: clamp(1.1rem, 2vw, 1.25rem);
--text-body: clamp(0.9375rem, 1.5vw, 1rem);
--text-small: 0.875rem;
--text-caption: 0.75rem;
```

---

### 1.3 Layered Depth & Plum Elevations
Shadows avoid neutral grays and use warm plum ambient shadows:
- `--elev-1`: `0 1px 3px rgba(72, 25, 48, 0.08), 0 2px 6px rgba(72, 25, 48, 0.04)` (Cards, chips)
- `--elev-2`: `0 3px 8px rgba(72, 25, 48, 0.08), 0 6px 14px rgba(72, 25, 48, 0.06)` (Raised cards)
- `--elev-3`: `0 6px 16px rgba(72, 25, 48, 0.10), 0 12px 28px rgba(72, 25, 48, 0.08)` (Hero cards)
- `--elev-4`: `0 10px 24px rgba(72, 25, 48, 0.12), 0 20px 44px rgba(72, 25, 48, 0.10)` (Floating pills, toasts)
- `--elev-5`: `0 18px 36px rgba(72, 25, 48, 0.16), 0 32px 72px rgba(72, 25, 48, 0.16)` (Modal dialogs, bottom sheets)

In dark mode, elevated surfaces incorporate a subtle 1px top highlight: `var(--inner-highlight)`.

---

## 2. Component Primitives (`src/components/ui/`)

| Component | Variants / States | Key Features |
|---|---|---|
| `Card` | `base`, `raised`, `hero`, `glass`, `tinted` | Semantic tinting, interactive hover lift, optional header/footer. |
| `Button` | `primary`, `secondary`, `ghost`, `danger`, `pill` (sm, md, lg) | Integrated loading spinner, spring checkmark success morph, min 44px touch target. |
| `ToggleChip` | Unselected, Selected, Disabled, Count badge | Tactile spring bounce, keyboard Space/Enter toggle. |
| `SegmentedControl`| Horizontal options with sliding thumb | Real CSS `translateX` sliding indicator, arrow key navigation. |
| `Slider` | Value range with live bubble | Gradient-filled track, thumb drop shadow, floating value bubble on drag/focus. |
| `WaterCup` | Interactive liquid fill SVG | Fluid wave animation, tap to add cup, long-press to reset with haptic tick. |
| `Toast` | Glass floating status pill | Swipe-down to dismiss gesture, action button, `aria-live="polite"`. |
| `SheetModal` | Mobile bottom sheet / Desktop centered dialog | `useDragToDismiss` pointer gesture, Esc to dismiss, focus trap. |
| `Icon` | 24x24 SVG icons | Replaces all legacy emoji and glyphs (✦, 🌸). |
| `BunnyMascot` | Animated brand mascot | Autonomous keyframe blinking (5.5s), ear tilt on hover/active. |

---

## 3. Motion Language & Timings

All animations adhere to the calm physical spring model:
- **Button / Chip press:** 90–120ms (`--ease-spring`) scale down to `0.96`, release with $\le 6\%$ overshoot.
- **Tab transition:** 220–260ms out-expo opacity + subtle 8px Y translation via View Transitions API.
- **Modal / Sheet entrance:** 320–360ms spring slide-up with subtle scale-up.
- **Cycle Ring on Mount:** 900ms `stroke-dashoffset` draw-in with 600ms numerical count-up.
- **Reduced Motion:** If `prefers-reduced-motion: reduce` or `:root[data-motion="reduced"]`, animations immediately drop to `0.001ms` opacity fades.

---

## 4. Accessibility (WCAG 2.2 AA)

1. **Color Contrast:** All 33 core text and background combinations verified $\ge 4.5:1$ in light and dark modes (see `wcag-contrast-audit-report.md`).
2. **Non-Color Cues:** Continuous period capsules have rounded pill shapes; predicted periods feature dashed borders and diagonal stripes; fertile windows feature star ovulation markers; flow levels have discrete droplet count icons.
3. **Keyboard Nav:** Complete focus trap in `SheetModal`, tab ring indicators (`:focus-visible`), and arrow key selection in `SegmentedControl`.
4. **Touch Targets:** Strict 44×44px minimum target size across all interactive controls.

---

## 5. How to Add a New View

1. **Create the Feature Component:** Create `src/features/{featureName}/{FeatureName}View.jsx`.
2. **Use Primitives:** Assemble the screen using `<Card>`, `<Button>`, `<ToggleChip>`, `<Icon>`, etc. Avoid inline `style="…"`.
3. **Register in Store Actions:** If new actions or tabs are needed, add typed methods to `src/app/actions.js`.
4. **Wire to Shell:** Add the route to `src/app/AppShell.jsx` in the main `<main>` router block.
5. **Add Responsive Layouts:** Define desktop two-pane classes in `src/css/views.css`.
