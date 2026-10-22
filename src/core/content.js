/**
 * CycleSideChick — Educational Content Library
 * 22 original evidence-based articles with cited clinical sources.
 * Sources include ACOG, NHS, WHO, NICE, NAMS, ASRM, and Cochrane.
 */

const ARTICLES = [
  {
    id: "cycle-phases",
    title: "The Four Phases of the Menstrual Cycle Explained",
    category: "Cycle Science",
    tags: ["cycle", "phases", "estrogen", "progesterone"],
    readTime: "3 min",
    summary: "How the menstrual, follicular, ovulatory, and luteal phases interact across your endocrine system.",
    body: `The menstrual cycle is orchestrated by an intricate hormonal feedback loop between the hypothalamus, pituitary gland, and ovaries (the HPO axis). 
    
    1. Menstrual Phase (Days 1 to bleeding end): When pregnancy does not occur, progesterone and estrogen levels decline, prompting the uterine endometrium to shed.
    2. Follicular Phase (Overlapping Day 1 to ovulation): Follicle-stimulating hormone (FSH) recruits ovarian follicles, while rising estradiol thickens the uterine lining and promotes vitality.
    3. Ovulatory Window (Around mid-cycle): A sharp surge in luteinizing hormone (LH) triggers the release of a mature oocyte within 24 to 36 hours.
    4. Luteal Phase (Post-ovulation to next period): The ruptured follicle transforms into the corpus luteum, producing progesterone to support a potential pregnancy and stabilize the endometrium.`,
    source: "American College of Obstetricians and Gynecologists (ACOG) — Clinical Guidelines"
  },
  {
    id: "estrogen-progesterone",
    title: "Estrogen & Progesterone: The Endocrine Dance",
    category: "Hormones",
    tags: ["hormones", "estrogen", "progesterone", "mood"],
    readTime: "3 min",
    summary: "Understanding how shifting hormone levels shape energy, mood, and physical sensations.",
    body: `Estrogen and progesterone are the master chemical messengers of reproductive health. Estrogen peaks twice: first right before ovulation (often correlating with higher cognitive clarity and stamina), and a smaller secondary rise in the mid-luteal phase. 

    Progesterone acts as a natural neurosteroid, interacting with GABA receptors in the brain to produce a calming effect, though abrupt premenstrual declines can trigger irritability or sleep disruption. Tracking your cycle helps reveal personal patterns in how you respond to these predictable endocrine shifts.`,
    source: "The Endocrine Society — Reproductive Endocrinology Resource Guide"
  },
  {
    id: "cycle-variability",
    title: "Natural Cycle Variability vs. True Irregularity",
    category: "Cycle Science",
    tags: ["variability", "irregular", "predictions"],
    readTime: "3 min",
    summary: "Why cycles fluctuate by a few days and when variability warrants medical evaluation.",
    body: `It is completely normal for healthy menstrual cycles to vary by several days from month to month. A cycle length between 21 and 35 days is considered typical for adults. Factors such as temporary psychological stress, jet lag, acute illness, intense athletic training, or changes in sleep schedules can shift follicular development and delay ovulation.

    A cycle is generally defined as clinically irregular when the length varies by more than 7 to 9 days between consecutive cycles, or when periods regularly fall outside the 21–35 day window.`,
    source: "National Health Service (NHS) — Period Pain and Irregular Cycles"
  },
  {
    id: "fertile-window",
    title: "Understanding the Estimated Fertile Window",
    category: "Fertility",
    tags: ["fertile", "ovulation", "ttc", "estimates"],
    readTime: "3 min",
    summary: "The biological lifespan of sperm and egg that defines the fertile window.",
    body: `Biologically, conception can only occur during a specific six-day timeframe: the five days preceding ovulation plus the day of ovulation itself. This is because viable sperm can survive in hospitable cervical fluid for up to 5 days, while a released ovum survives for approximately 12 to 24 hours.

    Because cycle lengths vary and ovulation timing shifts, calendar-based estimates are always mathematical approximations. They should never be used as a standalone form of natural contraception.`,
    source: "American Society for Reproductive Medicine (ASRM) — Optimizing Natural Fertility"
  },
  {
    id: "cervical-fluid",
    title: "Cervical Fluid Changes Throughout Your Cycle",
    category: "Fertility",
    tags: ["discharge", "fertility", "ovulation", "cervical mucus"],
    readTime: "3 min",
    summary: "How estrogen transforms cervical mucus to facilitate or impede sperm motility.",
    body: `Cervical mucus undergoes distinct structural changes in response to estrogen levels:
    - Post-period: Scant, dry, or tacky fluid.
    - Mid-follicular: Creamy, lotion-like texture as estrogen climbs.
    - Pre-ovulatory (Peak): Clear, slippery, and stretchy (resembling raw egg whites). This high-estrogen fluid creates microscopic swimming channels that nourish and guide sperm.
    - Post-ovulatory: Promptly reverts to thick, sticky, or dry under the influence of progesterone.`,
    source: "World Health Organization (WHO) — Family Planning: A Global Handbook"
  },
  {
    id: "bbt-tracking",
    title: "Basal Body Temperature (BBT): The Thermal Shift",
    category: "Fertility",
    tags: ["bbt", "temperature", "ovulation", "ttc"],
    readTime: "3 min",
    summary: "Using morning temperature changes to confirm whether ovulation has occurred.",
    body: `Basal Body Temperature is your body's temperature at complete rest. Progesterone produced by the corpus luteum after ovulation has a thermogenic effect, raising waking temperature by approximately 0.4°F to 0.8°F (0.2°C to 0.5°C).

    Because this thermal shift occurs only AFTER ovulation, BBT confirms that an egg has already been released; it does not predict ovulation in advance. For best results, take your temperature immediately upon waking before sitting up or speaking.`,
    source: "ACOG Patient Education — Fertility Awareness-Based Methods"
  },
  {
    id: "lh-test-strips",
    title: "LH Test Strips: Timing and Interpretation",
    category: "Fertility",
    tags: ["lh", "ovulation", "testing", "ttc"],
    readTime: "2 min",
    summary: "Detecting the luteinizing hormone surge that triggers egg release.",
    body: `Ovulation predictor kits (OPKs) detect elevated concentrations of luteinizing hormone in urine. An LH surge typically occurs 24 to 36 hours before follicular rupture.

    Unlike pregnancy tests, an LH test is only positive when the test line is as dark as or darker than the control line. Testing between late morning and early evening often yields clearer results, as LH levels typically enter urine several hours after entering the bloodstream.`,
    source: "ASRM Guidelines — Diagnostic Evaluation of the Ovulatory Cycle"
  },
  {
    id: "dysmenorrhea-cramps",
    title: "Primary vs. Secondary Dysmenorrhea: Understanding Period Pain",
    category: "Pain & Symptoms",
    tags: ["cramps", "pain", "dysmenorrhea"],
    readTime: "3 min",
    summary: "Differentiating ordinary prostaglandin contractions from underlying gynecological conditions.",
    body: `Menstrual cramps (dysmenorrhea) fall into two clinical categories:
    - Primary Dysmenorrhea: Cramping caused by natural prostaglandins produced in the uterine lining, causing muscular contractions. Pain typically begins 1–2 days before or with bleeding and subsides within 48 hours.
    - Secondary Dysmenorrhea: Pain resulting from an anatomical condition, such as endometriosis, adenomyosis, or uterine fibroids. This pain often worsens over time, lasts beyond the period, or resists standard relief methods.`,
    source: "ACOG Practice Bulletin No. 224 — Dysmenorrhea and Pelvic Pain"
  },
  {
    id: "cramp-relief",
    title: "Evidence-Based Cramp Relief: Heat, Nutrition & Movement",
    category: "Care & Self-Care",
    tags: ["cramps", "relief", "warmth", "movement"],
    readTime: "3 min",
    summary: "Systematic review findings on non-pharmacological relief for pelvic tension.",
    body: `Clinical trials consistently highlight several evidence-based non-drug interventions for menstrual discomfort:
    1. Continuous Local Heat: Applying a heating pad or thermal patch (around 40°C / 104°F) increases blood flow and relaxes uterine smooth muscle, performing as effectively as OTC analgesics in multiple controlled trials.
    2. Light Aerobic Movement: Walking or gentle pelvic stretches stimulate endorphin release and reduce inflammatory prostaglandins.
    3. Magnesium & Hydration: Adequate dietary magnesium helps regulate smooth muscle contractions and nerve conduction.`,
    source: "Cochrane Database of Systematic Reviews — Non-Steroidal Anti-Inflammatory Drugs and Complementary Therapies for Dysmenorrhea"
  },
  {
    id: "midcycle-spotting",
    title: "Mid-Cycle Spotting: Normal Variations & When to Investigate",
    category: "Bleeding",
    tags: ["spotting", "bleeding", "flow"],
    readTime: "3 min",
    summary: "Why light bleeding occurs between periods and what patterns to share with a doctor.",
    body: `Light spotting between menstrual periods can occur for several benign physiological reasons:
    - Ovulation Spotting: A brief drop in estrogen around egg release can cause minor endometrial shedding for 12–48 hours.
    - Hormonal Contraception: Breakthrough bleeding is common during the first 3 to 6 months of starting birth control pills, IUDs, or implants.
    - Cervical Sensitivity: Light pink spotting can occur after sexual intercourse or a cervical exam.
    
    Frequent, heavy, or post-menopausal spotting should always be evaluated by a healthcare professional.`,
    source: "Royal College of Obstetricians and Gynaecologists (RCOG) — Abnormal Uterine Bleeding"
  },
  {
    id: "heavy-bleeding",
    title: "Heavy Menstrual Bleeding (Menorrhagia): Key Red Flags",
    category: "Safety",
    tags: ["heavy", "bleeding", "clinician", "safety"],
    readTime: "3 min",
    summary: "Recognizing when flow exceeds typical thresholds and poses an anemia risk.",
    body: `Heavy menstrual bleeding (menorrhagia) affects roughly 1 in 5 women. You should consult a doctor if you experience:
    - Soaking through one or more tampons or pads every hour for two or more consecutive hours.
    - Passing blood clots larger than a quarter (2.5 cm).
    - Bleeding that continues longer than 7 full days.
    - Symptoms of anemia: unusual fatigue, shortness of breath on exertion, dizziness, or pale skin.`,
    source: "National Institute for Health and Care Excellence (NICE) Guideline NG88"
  },
  {
    id: "birth-control-impact",
    title: "How Hormonal Contraception Modifies Your Cycle",
    category: "Contraception",
    tags: ["contraception", "birth control", "pill"],
    readTime: "3 min",
    summary: "The distinction between natural menstruation and withdrawal bleeding.",
    body: `Combined oral contraceptives, patches, and vaginal rings deliver synthetic estrogen and progestin that suppress the pituitary gland from releasing FSH and LH, preventing natural follicular maturation and ovulation.

    The bleeding experienced during the placebo week is not a physiological menstrual period, but a 'withdrawal bleed' triggered by the sudden drop in synthetic hormones. Because ovulation does not occur, fertile-window estimations do not apply to cycles under hormonal contraception.`,
    source: "CDC — U.S. Selected Practice Recommendations for Contraceptive Use"
  },
  {
    id: "late-period-causes",
    title: "Causes of a Late Period Beyond Pregnancy",
    category: "Cycle Science",
    tags: ["late period", "stress", "delayed ovulation"],
    readTime: "3 min",
    summary: "Why ovulation can be delayed by psychological stress, circadian shifts, or illness.",
    body: `When a period arrives later than expected, delayed ovulation is almost always the cause. Common non-pregnancy triggers include:
    - Acute Psychological Stress: Cortisol and CRH can inhibit GnRH release, delaying follicular selection.
    - Circadian and Travel Shifts: Long-haul flights across time zones disrupt melatonin and central endocrine timing.
    - Sudden Dietary or Weight Changes: Caloric deficits trigger evolutionary conservation signals that pause ovulation.
    - Thyroid and Prolactin Variations: Elevated TSH or prolactin can suppress cycle regularity.`,
    source: "Mayo Clinic — Menstrual Cycle: What's Normal, What's Not"
  },
  {
    id: "preconception-health",
    title: "Preconception Essentials: Nutrition, Folic Acid & Timing",
    category: "TTC",
    tags: ["ttc", "preconception", "nutrition"],
    readTime: "3 min",
    summary: "Optimal clinical steps to support conception and early fetal neural development.",
    body: `Clinical organizations emphasize that preconception health begins at least three months prior to attempting conception:
    - Folic Acid: Daily supplementation with 400 mcg of folic acid reduces neural tube defects by up to 70%.
    - Timing Intercourse: Having intercourse every 1 to 2 days during the 5 days leading up to and including ovulation maximizes chances.
    - Hydration and Nutrition: Balanced dietary intake supports healthy cervical fluid and egg quality.`,
    source: "ACOG Committee Opinion No. 762 — Prepregnancy Counseling"
  },
  {
    id: "early-pregnancy",
    title: "First Trimester Milestones & Physiological Shifts",
    category: "Pregnancy",
    tags: ["pregnancy", "first trimester", "hcg"],
    readTime: "3 min",
    summary: "What to expect as human chorionic gonadotropin (hCG) and progesterone rise.",
    body: `The first trimester spans from conception through week 12 of pregnancy. Following implantation, the developing placenta begins secreting human chorionic gonadotropin (hCG), which signals the corpus luteum to maintain high progesterone production.

    Common early sensations include heightened breast tenderness, morning nausea (often triggered by sensory sensitivities), mild fatigue, and increased urinary frequency as blood volume expands.`,
    source: "NHS Pregnancy Guide — The First Trimester"
  },
  {
    id: "perimenopause-overview",
    title: "Understanding Perimenopause: Signs, Hormones & Transition",
    category: "Perimenopause",
    tags: ["perimenopause", "hot flashes", "hormones"],
    readTime: "3 min",
    summary: "Navigating the natural transition leading up to the final menstrual period.",
    body: `Perimenopause is the natural biological transition leading up to menopause (defined as 12 consecutive months without a period). It typically begins in a woman's 40s and is characterized by erratic fluctuations in ovarian follicle responsiveness.

    Rather than a steady decline, estrogen levels frequently spike and plummet unpredictably, causing cycle lengths to swing shorter or longer, alongside vasomotor symptoms, sleep changes, and mood shifts.`,
    source: "The Menopause Society (formerly NAMS) — Perimenopause Overview"
  },
  {
    id: "hot-flashes",
    title: "Managing Vasomotor Symptoms: Hot Flashes & Night Sweats",
    category: "Perimenopause",
    tags: ["hot flashes", "night sweats", "relief"],
    readTime: "3 min",
    summary: "Clinical strategies to support thermoregulation during hormonal transitions.",
    body: `Vasomotor symptoms occur when declining or fluctuating estrogen levels narrow the thermoneutral zone in the hypothalamus, triggering an exaggerated cooling response (vasodilation and sweating).

    Helpful self-care adjustments include dressing in breathable layers (such as natural cotton or bamboo), keeping a fan and cold water near the bed, limiting alcohol and spicy foods before sleep, and practicing paced diaphragmatic breathing during hot flash episodes.`,
    source: "NAMS Position Statement — The 2023 Nonhormone Therapy Position Statement"
  },
  {
    id: "sleep-and-hormones",
    title: "Sleep Quality and the Menstrual Cycle",
    category: "Care & Self-Care",
    tags: ["sleep", "melatonin", "progesterone"],
    readTime: "2 min",
    summary: "How circadian rhythms and progesterone influence REM and deep sleep architecture.",
    body: `Sleep architecture is directly influenced by ovarian hormones. Progesterone and its metabolite allopregnanolone increase non-REM slow-wave sleep. However, during the late luteal phase and early menstruation, sharp drops in progesterone can lead to fragmented sleep or nighttime waking.

    Consistent wake times, evening light dimming, and magnesium-rich evening snacks support sustained melatonin production.`,
    source: "National Sleep Foundation — Sleep in Women"
  },
  {
    id: "pelvic-floor",
    title: "The Pelvic Floor: Relaxation, Stability & Cycle Aches",
    category: "Care & Self-Care",
    tags: ["pelvic floor", "movement", "cramps"],
    readTime: "3 min",
    summary: "Why down-training hypertonic pelvic muscles can significantly relieve period discomfort.",
    body: `The pelvic floor is a hammock of muscles that supports the bladder, uterus, and bowel. During menstruation, inflammatory prostaglandins can cause pelvic floor muscles to tense reflexively (hypertonicity), amplifying cramp sensations.

    Gentle restorative yoga postures—such as Child's Pose, Reclined Butterfly, and Happy Baby—encourage the pelvic floor to lengthen and relax, reducing pressure on surrounding nerve pathways.`,
    source: "Chartered Society of Physiotherapy (CSP) — Pelvic Health Physiotherapy"
  },
  {
    id: "iron-and-energy",
    title: "Iron, Ferritin & Menstrual Vitality",
    category: "Care & Self-Care",
    tags: ["iron", "energy", "nutrition"],
    readTime: "3 min",
    summary: "Protecting oxygen delivery and cellular energy across monthly blood loss.",
    body: `Each milliliter of menstrual blood contains approximately 0.5 mg of elemental iron. Over several cycles, moderate to heavy bleeding can deplete ferritin (the body's stored iron reserve) long before frank hemoglobin anemia appears in blood tests.

    Symptoms of low ferritin include chronic fatigue, brain fog, cold hands, and brittle nails. Pair iron-rich foods (lentils, spinach, lean meats) with vitamin C to enhance intestinal absorption.`,
    source: "World Health Organization (WHO) — Guidelines on Haemoglobin and Ferritin Concentrations"
  },
  {
    id: "pms-vs-pmdd",
    title: "PMS vs. PMDD: Understanding Severity & Support",
    category: "Hormones",
    tags: ["pms", "pmdd", "mood", "mental health"],
    readTime: "3 min",
    summary: "Recognizing Premenstrual Dysphoric Disorder as a severe neuroendocrine reaction.",
    body: `While Premenstrual Syndrome (PMS) involves mild to moderate physical and emotional changes that resolve within days of bleeding starting, Premenstrual Dysphoric Disorder (PMDD) is a severe, disabling condition affecting 3% to 8% of menstruating individuals.

    PMDD is not caused by abnormal hormone levels, but rather an acute neurological vulnerability to normal luteal progesterone fluctuations. If premenstrual mood changes impair work, relationships, or safety, professional clinical care can provide transformative support.`,
    source: "ACOG Clinical Guidelines — Management of Premenstrual Dysphoric Disorder"
  },
  {
    id: "doctor-appointment-prep",
    title: "Preparing for a Gynecological Appointment: Questions & Logs",
    category: "Safety",
    tags: ["doctor", "clinician", "appointment", "records"],
    readTime: "3 min",
    summary: "How to use your CycleSideChick logs to advocate clearly for your care.",
    body: `When discussing reproductive symptoms with a physician, objective longitudinal data is invaluable. Bring along your exported Clinician Summary and be prepared to review:
    - Average cycle length and day-to-day variability.
    - Heaviest bleeding days and pad/tampon saturation rates.
    - Pain severity ratings on a 0–10 scale and whether pain responds to OTC analgesics.
    - Documented symptoms and their correlation with specific cycle days.`,
    source: "ACOG Health Care Guidance — Patient-Centered Gynecologic Care"
  }
];

function searchArticles(query) {
  if (!query || !query.trim()) return ARTICLES;
  const q = query.toLowerCase().trim();
  return ARTICLES.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.summary.toLowerCase().includes(q) ||
    a.tags.some(t => t.toLowerCase().includes(q)) ||
    a.category.toLowerCase().includes(q)
  );
}

function getArticlesByTag(tag) {
  if (!tag) return ARTICLES;
  const t = tag.toLowerCase();
  return ARTICLES.filter(a => a.tags.some(x => x.toLowerCase() === t) || a.category.toLowerCase() === t);
}

function getRecommendedArticles(loggedSymptoms = {}, mode = "natural") {
  const symKeys = Object.keys(loggedSymptoms || {}).map(s => s.toLowerCase());
  const recs = [];

  if (mode === "pregnancy") {
    recs.push(...ARTICLES.filter(a => a.category === "Pregnancy"));
  } else if (mode === "perimenopause") {
    recs.push(...ARTICLES.filter(a => a.category === "Perimenopause"));
  } else if (mode === "ttc") {
    recs.push(...ARTICLES.filter(a => a.category === "Fertility" || a.category === "TTC"));
  } else if (mode === "contra") {
    recs.push(...ARTICLES.filter(a => a.category === "Contraception"));
  }

  if (symKeys.includes("cramps")) recs.push(...ARTICLES.filter(a => a.id === "dysmenorrhea-cramps" || a.id === "cramp-relief"));
  if (symKeys.includes("fatigue")) recs.push(...ARTICLES.filter(a => a.id === "iron-and-energy" || a.id === "sleep-and-hormones"));
  if (symKeys.includes("headache")) recs.push(...ARTICLES.filter(a => a.id === "estrogen-progesterone"));

  // Ensure unique articles
  const seen = new Set();
  const unique = [];
  recs.concat(ARTICLES).forEach(a => {
    if (!seen.has(a.id)) {
      seen.add(a.id);
      unique.push(a);
    }
  });

  return unique.slice(0, 4);
}

/* ==========================================================================
   Care, Comfort & Compassionate Companion System
   ========================================================================== */

const REASSURANCE_MESSAGES = [
  "You don't have to be productive every single day. Rest is allowed.",
  "Your experience is your own. There's no single right way to feel during your cycle.",
  "Small acts of care count, even when that's all you can manage today.",
  "You can listen to your body without having to explain everything it feels.",
  "Your cycle is information about your body, not a measure of your worth.",
  "It's okay to feel different today than you did last week. Hormones naturally ebb and flow.",
  "Giving yourself grace is a valid and powerful form of wellness.",
  "You deserve comfort, quiet, and spaces where you don't have to be 'on'.",
  "There is nothing wrong with you for needing more downtime right now.",
  "Every cycle is unique. Comparing yourself to rigid averages only creates unnecessary worry.",
  "Be proud of the small ways you showed up for yourself today.",
  "Resting before you reach complete exhaustion is a learned, compassionate skill.",
  "Your feelings don't need a medical justification to be real and valid.",
  "Breathe in ease, exhale expectation. You are doing enough.",
  "Your comfort matters just as much as your commitments.",
  "Cycles are living rhythms, not factory schedules. Variance is completely natural."
];

function getReassuranceMessage(idx = 0) {
  const i = Math.abs(idx) % REASSURANCE_MESSAGES.length;
  return REASSURANCE_MESSAGES[i];
}

const FULL_CYCLE_CARE_GUIDES = {
  menstrual: {
    key: "menstrual",
    phaseName: "Menstrual Phase",
    theme: "Comfort & Gentleness",
    badgeColor: "tint-rose",
    focus: "Nourishment, warmth, and permission to slow down",
    suggestions: [
      "Warm compresses or a heating pad used safely across pelvis or lower back",
      "Restorative stretching, gentle walking, or cozy horizontal rest as comfortable",
      "Hydration and regular, warm, nourishing iron-rich meals (lentils, leafy greens, broths)",
      "Comfortable, non-binding waistbands and soft breathable clothing",
      "Keeping period supplies accessible and prepared"
    ],
    journalPrompt: "What would make today a little easier?",
    biology: "Estrogen and progesterone are at baseline levels as the endometrium sheds. Natural prostaglandins can cause muscle contractions and cramping.",
    selfCareTip: "Honor your body's request for deeper sleep and slower mornings."
  },
  follicular: {
    key: "follicular",
    phaseName: "Follicular Phase",
    theme: "Fresh Starts & Exploration",
    badgeColor: "tint-sage",
    focus: "Curiosity, renewal, and exploring routines that feel good",
    suggestions: [
      "Explore routines, creative interests, and light planning that feel inspiring",
      "Optional movement, social catch-ups, or hobbies without pressure to perform",
      "Fresh, colorful meals with fiber, healthy fats, and probiotic fermented foods",
      "Take note of changing energy and mood without assuming every day will be high-energy"
    ],
    journalPrompt: "What would I like to make room for this week?",
    biology: "FSH prompts ovarian follicle growth, and estrogen steadily rises, supporting natural vitality for many (though individual experience varies widely).",
    selfCareTip: "Notice what brings you genuine curiosity this week without forcing productivity."
  },
  fertile: {
    key: "fertile",
    phaseName: "Around Ovulation",
    theme: "Body Awareness & Presence",
    badgeColor: "tint-lavender",
    focus: "Listening to sensations and understanding natural cycle variability",
    suggestions: [
      "Notice cervical fluid changes (becoming clearer, more slippery or egg-white)",
      "Observe any subtle pelvic sensations (mittelschmerz) or shifts in sociability",
      "Support energy with antioxidant-rich berries, seeds, and steady hydration",
      "Remember: calendar predictions are mathematical estimates, never contraceptive guarantees"
    ],
    journalPrompt: "What changes, if any, have I noticed in my body?",
    biology: "Estrogen peaks to trigger an LH surge, prompting the release of an egg. Ovulation timing naturally shifts from cycle to cycle.",
    selfCareTip: "Enjoy natural vitality while honoring your personal boundaries."
  },
  luteal: {
    key: "luteal",
    phaseName: "Luteal Phase",
    theme: "Support & Preparation",
    badgeColor: "tint-peach",
    focus: "Grounded nesting, stress support, and thoughtful preparation",
    suggestions: [
      "Assemble a gentle period-preparation checklist (supplies, cozy layers, heat wrap)",
      "Prioritize winding-down evening routines and steady blood sugar meals with magnesium",
      "Notice recurring mood, appetite, skin, or energy patterns with self-compassion",
      "Set gentle personal boundaries and decline optional social demands if drained"
    ],
    journalPrompt: "What support would feel helpful over the next few days?",
    biology: "The corpus luteum secretes progesterone, calming the nervous system but potentially creating sensitivity as levels shift before menstruation.",
    selfCareTip: "Give yourself permission to turn inward and protect your evening peace."
  },
  uncertain: {
    key: "uncertain",
    phaseName: "Everyday Wellbeing",
    theme: "Unconditional Self-Kindness",
    badgeColor: "tint-sky",
    focus: "Body trust, self-compassion, and unconditional everyday care",
    suggestions: [
      "When cycle history is new or irregular, we never guess your phase with false certainty",
      "Practice everyday comfort: staying hydrated, gentle stretching, and nourishing meals",
      "Check in with how your body feels today rather than what a calendar expects",
      "Keep logging dates and symptoms—your personal patterns will emerge naturally over time"
    ],
    journalPrompt: "How am I treating myself today, and what kindness can I offer my body right now?",
    biology: "Cycles naturally fluctuate in response to stress, travel, illness, sleep, or individual physiology. Your wellbeing does not depend on a rigid calendar label.",
    selfCareTip: "Offer your body gentleness today. You do not need a label to practice self-care."
  }
};

const CYCLE_EXPLAINED_CARDS = [
  {
    id: "phase-biology",
    category: "Endocrine Science",
    badgeColor: "tint-lavender",
    title: "How Cycle Phases Really Work",
    summary: "The rhythmic dance between the brain and ovaries across four distinct hormonal stages.",
    content: "The menstrual cycle is guided by communication between the hypothalamus, pituitary gland, and ovaries (the HPO axis). Estrogen prompts uterine lining growth and follicular maturation; progesterone stabilizes the lining and supports nervous system calm. Cycle length and phase lengths vary naturally month to month.",
    source: "American College of Obstetricians and Gynecologists (ACOG)"
  },
  {
    id: "bodily-changes",
    category: "Physiology",
    badgeColor: "tint-rose",
    title: "Bodily Sensations & Unique Variations",
    summary: "Why cramping, cervical fluid shifts, and energy changes feel different for everyone.",
    content: "Menstrual cramps result from localized prostaglandins causing uterine muscle contractions. Cervical mucus shifts from creamy to slippery and egg-white around ovulation. Because hormone receptor sensitivity differs, there is no single 'normal' way to feel. Listening to your own patterns is the most accurate benchmark.",
    source: "National Health Service (NHS)"
  },
  {
    id: "tracking-limits",
    category: "Self-Advocacy",
    badgeColor: "tint-sky",
    title: "What Tracking Can & Cannot Tell You",
    summary: "Understanding the difference between mathematical calendar forecasts and clinical certainty.",
    content: "Period tracker dates are mathematical models based on past history and population averages. They are helpful for noticing trends, planning ahead, and self-advocacy with doctors. However, calendar estimates cannot confirm exact ovulation or reliably prevent pregnancy without clinical biomarkers.",
    source: "American Society for Reproductive Medicine (ASRM)"
  },
  {
    id: "myths-debunked",
    category: "Health Literacy",
    badgeColor: "tint-butter",
    title: "Common Cycle Misconceptions",
    summary: "Debunking the rigid 28-day cycle myth and unrealistic expectations.",
    content: "Only about 13% of people have exact 28-day cycles; normal adult cycles range from 21 to 35 days. Ovulation does not always happen on day 14. PMS is not 'imaginary'—it reflects biological sensitivities to shifting neurosteroids. Recognizing this removes unnecessary guilt and self-blame.",
    source: "World Health Organization (WHO) Reproductive Health"
  },
  {
    id: "clinical-guidance",
    category: "Safety & Care",
    badgeColor: "tint-amber",
    title: "When Symptoms Deserve Medical Care",
    summary: "Clear clinical red flags to discuss with a physician or gynecologist.",
    content: "Consult a healthcare provider if: bleeding regularly soaks through 2+ pads/tampons per hour; period pain reaches severe levels (8+/10) that resist OTC medication or disrupt basic life; bleeding lasts more than 7–8 days consecutively; or your period is absent for 90+ days without pregnancy. Severe pain is never something you must silently endure.",
    source: "ACOG Clinical Practice Guidelines"
  }
];

function getCareSuggestions(S, dateStr) {
  const L = (S.logs && S.logs[dateStr]) || {};
  const dismissed = S.careDismissed || {};
  const checkin = (S.careCheckin && S.careCheckin[dateStr]) || {};
  const syms = Object.keys(L.sy || {}).map(s => s.toLowerCase());
  const pain = +(L.p || 0);
  const mood = L.m;
  const feeling = checkin.feeling || "";

  const allSuggestions = [];

  // Rule 1: Cramps / Pelvic Pain
  if (syms.includes("cramps") || pain >= 4) {
    allSuggestions.push({
      id: "care-cramps-warmth",
      category: "Warmth & Comfort",
      categoryColor: "rose",
      icon: "flame",
      title: "Soothing Pelvic Warmth",
      desc: "Warmth increases local blood flow and relaxes uterine smooth muscle. A heating pad, hot water bottle, or warm bath used safely can ease cramp tension.",
      actionLabel: "Add to Care Kit",
      kitId: "heat"
    });
  }

  // Rule 2: Fatigue / Low Energy
  if (syms.includes("fatigue") || L.en === "low" || feeling === "tired") {
    allSuggestions.push({
      id: "care-fatigue-rest",
      category: "Rest & Recovery",
      categoryColor: "lavender",
      icon: "moon",
      title: "Permission to Slow Down",
      desc: "Fatigue is your body's clear request to conserve energy. Postpone optional demands today and grant yourself a 20-minute horizontal pause without guilt.",
      actionLabel: "Add to Care Kit",
      kitId: "rest"
    });
  }

  // Rule 3: Stress / Overwhelm
  if (syms.includes("stress") || feeling === "stressed" || mood === 3) {
    allSuggestions.push({
      id: "care-stress-breath",
      category: "Mindfulness & Calm",
      categoryColor: "sage",
      icon: "sparkle",
      title: "2-Minute Gentle Breath Reset",
      desc: "When overwhelmed, taking slow 4-second breaths activates the parasympathetic nervous system. Soften your jaw, drop your shoulders, and inhale gently.",
      actionLabel: "Add to Care Kit",
      kitId: "stretch"
    });
  }

  // Rule 4: Headache
  if (syms.includes("headache")) {
    allSuggestions.push({
      id: "care-headache-hydration",
      category: "Nourishment & Ease",
      categoryColor: "sky",
      icon: "water",
      title: "Cool Compress & Hydration",
      desc: "Hormonal shifts and tension can trigger headaches. Sip a tall glass of cool water, dim overhead screens, and rest a damp cool cloth across your forehead.",
      actionLabel: "Add to Care Kit",
      kitId: "tea"
    });
  }

  // Rule 5: Bloating / Digestive Sensitivity
  if (syms.includes("bloating")) {
    allSuggestions.push({
      id: "care-bloating-comfort",
      category: "Gentle Digestion",
      categoryColor: "butter",
      icon: "heart",
      title: "Loose Clothing & Warm Peppermint",
      desc: "Progesterone can slow digestion and cause fluid retention. Switch into soft, non-binding waistbands and enjoy a warm cup of herbal tea.",
      actionLabel: "Add to Care Kit",
      kitId: "clothes"
    });
  }

  // Rule 6: Sensitive / Tender Feelings
  if (feeling === "sensitive" || feeling === "tender" || mood === 4) {
    allSuggestions.push({
      id: "care-sensitive-space",
      category: "Emotional Care",
      categoryColor: "peach",
      icon: "user",
      title: "Emotional Buffer & Validating Space",
      desc: "Your feelings are real and deserve gentle room. Protect your energy, listen to comforting music, and consider reaching out to someone who validates you.",
      actionLabel: "Add to Care Kit",
      kitId: "talk"
    });
  }

  // Rule 7: General / Everyday Wellbeing Default
  allSuggestions.push({
    id: "care-daily-nourish",
    category: "Everyday Care",
    categoryColor: "sage",
    icon: "sun",
    title: "Small Act of Everyday Kindness",
    desc: "Pause for one slow, deep breath. Drink a glass of water, gently roll your shoulders back, and remind yourself that you are doing the best you can.",
    actionLabel: "Add to Care Kit",
    kitId: "fresh-air"
  });

  allSuggestions.push({
    id: "care-journal-prompt",
    category: "Self-Reflection",
    categoryColor: "lavender",
    icon: "book",
    title: "Quiet Moment in My Journal",
    desc: "Writing for just two minutes helps externalize busy thoughts. Capture one feeling or one thing you are grateful for today.",
    actionLabel: "Open My Journal",
    kitId: "journal"
  });

  // Filter out dismissed suggestions
  const filtered = allSuggestions.filter(s => !dismissed[s.id]);
  return filtered.slice(0, 3);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ARTICLES, searchArticles, getArticlesByTag, getRecommendedArticles,
    REASSURANCE_MESSAGES, getReassuranceMessage, FULL_CYCLE_CARE_GUIDES,
    CYCLE_EXPLAINED_CARDS, getCareSuggestions
  };
}

export {
  ARTICLES, searchArticles, getArticlesByTag, getRecommendedArticles,
  REASSURANCE_MESSAGES, getReassuranceMessage, FULL_CYCLE_CARE_GUIDES,
  CYCLE_EXPLAINED_CARDS, getCareSuggestions
};
