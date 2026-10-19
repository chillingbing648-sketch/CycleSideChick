# CycleSideChick — Clinical Evidence & Reference Architecture

**Document Version:** 2.0.0  
**Status:** Canonical Clinical Reference  
**Last Updated:** October 2026  
**Audience:** Users, Clinicians, Researchers, Open-Source Contributors

---

## 1. Executive Summary & Epistemic Stance

CycleSideChick is an on-device, privacy-preserving menstrual and reproductive health tracking application. The application's mathematical calculations and educational assertions operate under strict clinical governance:

1. **Estimates, Not Diagnoses:** Every calculation produced by the app—including cycle length predictions, period start windows, ovulation estimates, fertile windows, and gestational timelines—is an approximation derived from mathematical heuristics and population averages. The application explicitly disclaims diagnostic authority and contraceptive efficacy.
2. **Harm Reduction & No Contraceptive Reliance:** CycleSideChick never labels any day as "safe" or infertile. The application adheres to American College of Obstetricians and Gynecologists (ACOG) and Faculty of Sexual and Reproductive Healthcare (FSRH) guidance stating that calendar-only tracking cannot reliably identify fertile days for contraceptive purposes.
3. **No Automatic Pregnancy Inference:** A late period triggers questions about cycle variability, stress, travel, or medication changes—never an automated proclamation of pregnancy.
4. **Direct Clinician Pathway:** Any recorded biometric pattern meeting recognized clinical thresholds for abnormal uterine bleeding (AUB), secondary amenorrhea, or severe dysmenorrhea triggers an objective, non-alarmist care alert prompting the user to share the summary with a licensed clinician.

---

## 2. Cycle Length & Mathematical Modeling

### 2.1 Normal Menstrual Cycle Parameters
According to the **International Federation of Gynecology and Obstetrics (FIGO)** Menstrual Disorders Working Group and **ACOG Committee Opinion No. 651** (*Menstruation in Girls and Adolescents: Using the Menstrual Cycle as a Vital Sign*):
- **Normal Cycle Length:** 24 to 38 days in adult reproductive years (21 to 45 days in late adolescence/early reproductive years).
- **Normal Period Duration:** 3 to 8 days.
- **Normal Cycle Variability:** Cycle-to-cycle variation of up to 7–9 days across a 12-month period is clinically typical.

### 2.2 Prediction Algorithm: Recency-Weighted Mean vs. Outlier Median
- **Recency-Weighted Mean:** When cycle history exhibits standard variability without massive disruption, the application calculates an exponentially decaying weighted mean over the last 6 completed cycles ($w_i \in \{6, 5, 4, 3, 2, 1\}$). This gives higher weight to recent endocrine shifts while maintaining historical baseline.
- **Outlier Median Substitution:** If any cycle deviates from the median cycle length by $\ge 10$ days, or if the overall range across the sample exceeds 12 days (suggesting missed cycles, anovulatory episodes, or travel disruption), the engine switches from the mean to the statistical **median**. This prevents isolated 60-day or 15-day episodes from skewing forward-looking predictions.
- **Confidence Scoring:**
  - *Higher Confidence:* $\ge 6$ completed cycles and standard deviation $\le 3.0$ days.
  - *Moderate Confidence:* 3 to 5 completed cycles, or standard deviation between $3.0$ and $5.0$ days.
  - *Low Confidence:* $< 3$ cycles, standard deviation $> 5.0$ days, or significant outliers present.
- **Range Bounds:** Displayed as $\pm \max(1, \text{round}(SD))$, strictly capped at $\pm 7$ days to prevent misleading pseudo-precision.

*Primary Citations:*
- Fraser IS, Critchley HO, Munro MG, Broder M. "A process designed to lead to internationally accepted definitions of abnormalities of menstrual cycle that cause women to seek medical help." *Fertil Steril.* 2007;87(3):466-476.
- Munro MG, Critchley HO, Fraser IS. "The two FIGO systems for normal and abnormal uterine bleeding symptoms and classification of causes of abnormal uterine bleeding in the reproductive years." *Int J Gynaecol Obstet.* 2018;143(3):393-408.
- American College of Obstetricians and Gynecologists. "Menstruation in girls and adolescents: using the menstrual cycle as a vital sign." *Committee Opinion No. 651.* Obstet Gynecol. 2015;126:e143-146. (Reaffirmed 2022).

---

## 3. Ovulation & Fertile Window Estimation

### 3.1 The Biological Fertile Window
Studies by Wilcox et al. (National Institute of Environmental Health Sciences) established that the biological fertile window spans the **6 days ending on the day of ovulation** (5 days prior to ovulation plus the day of ovulation itself). Viable sperm survive in the female reproductive tract under the influence of fertile cervical mucus for up to 5 days, while the ovum remains viable for fertilization for approximately 12 to 24 hours post-ovulation.

### 3.2 Luteal Phase Flexibility
In typical textbook depictions, the luteal phase (ovulation to menses) is assumed to be an invariant 14 days. However, population studies (Lenton et al., Crawford et al.) demonstrate that normal luteal phases vary between individuals from 10 to 16 days, though an individual's luteal phase tends to be relatively stable compared to their follicular phase.
- **Default Parameter:** 14 days.
- **Adjustability:** User-configurable from 10 to 16 days based on confirmed ovulation history (e.g., basal body temperature shifts or luteinizing hormone surge tracking).
- **Estimated Ovulation Formula:** $\text{Predicted Cycle Start} - \text{Luteal Length}$.
- **Fertile Window Formula:** $\text{Ovulation} - 5 \text{ days}$ through $\text{Ovulation} + 1 \text{ day}$.
- **Labeling Mandate:** Every mention of ovulation and fertile days in the user interface is preceded or accompanied by the qualifier **"Estimated"**.

*Primary Citations:*
- Wilcox AJ, Weinberg CR, Baird DD. "Timing of sexual intercourse in relation to ovulation — effects on the probability of conception, survival of the pregnancy, and sex of the baby." *N Engl J Med.* 1995;333(23):1517-1521.
- Wilcox AJ, Dunson D, Baird DD. "The timing of the 'fertile window' in the menstrual cycle: day specific estimates from a flexible cervical mucus study." *BMJ.* 2000;321(7271):1259-1262.
- Lenton EA, Landgren BM, Sexton L. "Normal variation in the length of the luteal phase of the menstrual cycle: identification of the short luteal phase." *Br J Obstet Gynaecol.* 1984;91(7):685-689.
- Crawford NM, Pritchard DA, Herring AH, Steiner AZ. "Prospective evaluation of luteal phase length and natural fertility." *Fertil Steril.* 2017;107(3):749-755.
- American Society for Reproductive Medicine (ASRM). "Optimizing natural fertility: a committee opinion." *Fertil Steril.* 2022;117(1):83-94.

---

## 4. Clinical Triggers & "When to Seek Care" Flags

CycleSideChick continuously evaluates the user's logged entries against evidence-based clinical thresholds. When an alert condition is satisfied, the application presents an objective, calming prompt explaining the physiologic significance and advising evaluation by an OB/GYN, primary care physician, or certified nurse-midwife.

| Clinical Trigger | Logic Rule | Evidence / Clinical Source | Clinical Rationale |
| :--- | :--- | :--- | :--- |
| **Prolonged Cycle Absence (Oligomenorrhea / Amenorrhea)** | Current cycle elapsed $>90$ days | ACOG Practice Bulletin No. 136 (*Evaluation of Amenorrhea*); NICE NG88 | Secondary amenorrhea (absence of menses for 90+ days in previously menstruating women) warrants evaluation for endocrine, thyroid, hypothalamic, or anatomic etiologies. |
| **Short Cycle Frequency (Polymenorrhea)** | Successive cycles $<21$ days | FIGO System 1 / ACOG Committee Opinion No. 651 | Regular cycles $<21$ days indicate shortened follicular phase, luteal deficiency, or anovulatory dysfunctional uterine bleeding. |
| **Prolonged Bleeding Duration** | Logged continuous bleeding $>7$ consecutive days | FIGO System 1 / ACOG Practice Bulletin No. 128 | Bleeding exceeding 8 days exceeds normal 95th percentile and risks iron deficiency anemia. |
| **Heavy Menstrual Bleeding (HMB)** | Logged flow categorized as "Very Heavy" or soaking $\ge 1$ pad/tampon/hr for $2+$ consecutive hours | NICE NG88 (*Heavy menstrual bleeding: assessment and management*); ACOG Practice Bulletin No. 128 | Acute blood loss at this rate poses hemodynamic instability risk and warrants rapid clinical assessment. |
| **Severe Dysmenorrhea** | Logged pain $\ge 8 / 10$ or incapacitating pelvic pain | ACOG Committee Opinion No. 760 (*Dysmenorrhea and Endometriosis in the Adolescent*); NICE NG73 | Pain unresponsive to OTC analgesics or disrupting normal activities indicates potential endometriosis, adenomyosis, or pelvic pathology. |
| **Rapid Period Conflict** | Attempted period start $<10$ days from previous period start | Clinical physiological refractory period | True follicular ovulation and menses cannot biological occur 10 days apart; indicates mid-cycle ovulatory spotting, breakthrough bleeding, or logging entry error. |

*Primary Citations:*
- National Institute for Health and Care Excellence (NICE). "Heavy menstrual bleeding: assessment and management." *NICE guideline [NG88].* Published March 2018, updated May 2021.
- American College of Obstetricians and Gynecologists. "Diagnosis of abnormal uterine bleeding in reproductive-aged women." *Practice Bulletin No. 128.* Obstet Gynecol. 2012;120:197-206. (Reaffirmed 2021).
- American College of Obstetricians and Gynecologists. "Dysmenorrhea and endometriosis in the adolescent." *Committee Opinion No. 760.* Obstet Gynecol. 2018;132:e249-258.

---

## 5. Mode-Specific Clinical Guidance

### 5.1 Natural Cycling Mode
Designed for individuals tracking unmedicated ovulatory cycles. Computes cycle averages, standard deviations, estimated follicular/luteal phases, and fertile windows.

### 5.2 Irregular Cycles Mode
Designed for individuals with PCOS (Polycystic Ovary Syndrome), thyroid disorders, or athletic hypothalamic amenorrhea.
- **Suppression:** The fertile window and ovulation marker are completely suppressed because fixed-window calendar calculations are medically invalid for irregular cycles and create false reassurance or distress.
- **Display:** Focuses on logging symptom frequency, bleeding duration, and cycle interval spreads.

### 5.3 Hormonal Contraception Mode
Designed for users on combined oral contraceptives (COCP), progestin-only pills (POP), implants (Nexplanon), hormonal IUDs (Mirena/Kyleena), rings, or patches.
- **Physiological Reality:** Endogenous ovulation is suppressed; regular bleeding on combined methods is a hormone-withdrawal bleed, not physiological menses. Users with hormonal IUDs or progestin-only methods often experience amenorrhea or unpredictable spotting.
- **Suppression:** All ovulation predictions, phase arcs (luteal/follicular), and fertile windows are deactivated.
- **Features:** Medication intake adherence, withdrawal bleeding tracker, spotting trends, and progestogenic side-effect monitoring (mood, breast tenderness, headaches).

*Primary Citation:*
- Faculty of Sexual and Reproductive Healthcare (FSRH). "FSRH Clinical Guideline: Combined Hormonal Contraception." *BMJ Sex Reprod Health.* 2019;45(Suppl 1):1-93.

### 5.4 Trying to Conceive (TTC) Mode
Highlights estimated fertile window, LH surge logging (+/-), cervical mucus categorization (egg-white, watery, creamy, sticky), and basal body temperature (BBT) biphasic shifts. Recommends intercourse timing during the 2–3 days preceding estimated ovulation.

*Primary Citation:*
- American Society for Reproductive Medicine (ASRM). "Optimizing natural fertility: a committee opinion." *Fertil Steril.* 2022;117(1):83-94.

### 5.5 Pregnancy Mode
- **Gestational Age Calculation:** Based on clinical standard **Naegele's Rule** (40 weeks / 280 days from the first day of the Last Menstrual Period [LMP]).
- **Estimated Due Date (EDD):** $\text{LMP} + 280 \text{ days}$.
- **Trimester Milestones:**
  - *First Trimester:* Weeks 1 through 13.
  - *Second Trimester:* Weeks 14 through 27.
  - *Third Trimester:* Weeks 28 through 40+.
- **Suppression:** Suppresses cycle length, fertile window, and period predictions. Displays gestational week, trimester progress, and recommended prenatal clinical check-in checkpoints.

*Primary Citation:*
- American College of Obstetricians and Gynecologists. "Method for estimating the due date." *Committee Opinion No. 700.* Obstet Gynecol. 2017;129:e150-154. (Reaffirmed 2022).

### 5.6 Perimenopause Mode
Designed for individuals aged 35–55 transitioning toward menopause (defined as 12 consecutive months of amenorrhea without other pathology).
- **Framework:** Based on the **STRAW+10 (Stages of Reproductive Aging Workshop)** criteria.
- **Characteristics Tracked:** Cycle variability ($>7$ days persistent difference in length between consecutive cycles), skipped cycles, vasomotor symptoms (hot flashes, night sweats), sleep architecture disruptions, and mood fluctuations.
- **Suppression:** De-emphasizes fertile window forecasting; elevates symptom trajectory visualization and clinician consultation summaries.

*Primary Citation:*
- Harlow SD, Gass M, Hall JE, et al. "Executive summary of the Stages of Reproductive Aging Workshop + 10: addressing the unfinished agenda of staging reproductive aging." *Menopause.* 2012;19(4):387-395.
- The Menopause Society (formerly NAMS). "The 2023 nonhormone therapy position statement of The Menopause Society." *Menopause.* 2023;30(6):573-590.

---

## 6. Comprehensive Educational Content Cross-Reference

Every educational article embedded in CycleSideChick (`src/js/content.js`) is peer-reviewed against current clinical guidelines and explicitly cites its evidence base:

| ID | Title | Primary Source | Secondary Source |
| :--- | :--- | :--- | :--- |
| `phase-phases` | Four Phases of Your Menstrual Cycle | ACOG Committee Opinion No. 651 | Endocrine Society Clinical Guidelines |
| `phase-fertile` | Understanding Your Estimated Fertile Window | Wilcox et al., NEJM 1995 | ASRM Practice Committee 2022 |
| `phase-ovulation` | Signs Your Body Is Preparing to Ovulate | ASRM Natural Fertility Guidelines | Stirnemann et al., BMJ 2013 |
| `phase-luteal` | The Luteal Phase & Progesterone | Lenton et al., Br J Obstet Gynaecol | Crawford et al., Fertil Steril 2017 |
| `sym-cramps` | Why Menstrual Cramps Happen (Dysmenorrhea) | ACOG Committee Opinion No. 760 | NICE NG73 (Endometriosis) |
| `sym-headache` | Hormonal Headaches & Menstrual Migraines | International Headache Society (ICHD-3) | American Migraine Foundation |
| `sym-bloating` | Why Bloating Happens Before Your Period | American Gastroenterological Association | ACOG Patient FAQs: PMS |
| `sym-fatigue` | Cycle Fatigue & Sleep Quality | National Sleep Foundation | NAMS Sleep Architecture Studies |
| `sym-acne` | Hormonal Breakouts & Androgens | American Academy of Dermatology | Endocrine Society Guidelines |
| `mode-pill` | Tracking While on Hormonal Contraception | FSRH UK Clinical Guidelines 2019 | WHO Selected Practice Recommendations |
| `mode-pcos` | Irregular Cycles & PCOS Basics | Rotterdam ESHRE/ASRM Consensus | Monash International PCOS Guidelines |
| `mode-ttc` | Optimizing Intercourse Timing | ASRM Natural Fertility Committee 2022 | Stanford Medicine Fertility Resources |
| `mode-preg` | First Trimester Overview & Milestones | ACOG Committee Opinion No. 700 | NHS Antenatal Care Guidelines |
| `mode-peri` | Recognizing Perimenopause Signals | STRAW+10 Criteria (Harlow et al.) | The Menopause Society 2023 |
| `data-privacy` | Reproductive Data Privacy & Your Rights | EFF Digital Privacy Guidelines | US HHS Reproductive Health Guidance |
| `care-hmb` | What Counts as Abnormally Heavy Bleeding? | NICE Guideline NG88 | ACOG Practice Bulletin No. 128 |
| `care-amenorrhea` | When Your Period Doesn't Arrive | ACOG Practice Bulletin No. 136 | Endocrine Society Hypothalamic Reviews |
| `care-prepare` | Preparing for Your Gynecological Appointment | ACOG Patient Resource Series | NHS Women's Health Strategy |
| `sym-discharge` | Cervical Mucus Patterns Through the Cycle | Billings Ovulation Method Research | WHO Laboratory Manual |
| `sym-bbt` | Basal Body Temperature: How It Works | ASRM Fertility Evaluation Guidelines | Frank-Herrmann et al., Hum Reprod 2007 |
| `sym-breast` | Cyclic Mastalgia & Hormonal Swings | Mayo Clinic Clinical Reviews | NICE Clinical Knowledge Summaries |
| `lifestyle-iron` | Menstruation & Iron Balance | WHO Serum Ferritin Guidelines | CDC Recommendations on Anemia |

---

## 7. Clinician Summary Export Format

When a user prints or copies their Clinician Summary, CycleSideChick synthesizes raw logs into standard clinical terminology formatted to fit clinical triage workflow:
1. **Patient Biometric Baseline:** Total recorded cycles, cycle length median and standard deviation, minimum and maximum observed lengths.
2. **Current Cycle Status:** Cycle Day, active phase estimate, days elapsed since last menses.
3. **Bleeding Metrics:** Mean bleeding duration, incidence of heavy flow days, spotting episodes between cycles.
4. **Symptom Phenotype:** Top recorded symptoms by frequency and peak severity (e.g., "Pelvic pain: 14 days recorded, max score 8/10").
5. **Care Alert Flags:** Any triggered safety threshold (amenorrhea $>90$ days, continuous bleeding $>7$ days, heavy soaking) displayed prominently with exact timestamp history.
6. **Medication & Supplement Adherence:** Self-reported oral contraceptive pills, NSAIDs, or supplements.

This format eliminates subjective recall bias during medical consultations while keeping patient data strictly on their personal hardware.
