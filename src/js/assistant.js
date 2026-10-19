/**
 * CycleSideChick — Local On-Device Health Assistant
 * Rule-based, privacy-first Q&A engine that queries the user's local logs.
 * Never diagnoses. Never transmits data. Always cites evidence-based sources.
 */

const ASSISTANT_TOPICS = [
  {
    id: "late-period",
    triggers: ["late", "delayed", "overdue", "missed", "pregnancy"],
    question: "Why is my period late?",
    answer: (S, stats) => {
      const T = typeof TD === "function" ? TD() : Math.floor(Date.now() / 864e5);
      const daysPast = stats.nextPred ? T - stats.nextPred : null;
      let contextNote = "";
      if (daysPast !== null && daysPast > 0) {
        contextNote = `In your records, your period is approximately ${daysPast} day${daysPast > 1 ? "s" : ""} past the estimated start date (${fmt(stats.nextPred)}). `;
      } else {
        contextNote = `Your next period is currently estimated in about ${stats.nextPred ? Math.max(0, stats.nextPred - T) : S.cl} days. `;
      }

      return {
        title: "Understanding a Delayed or Late Period",
        context: contextNote,
        body: `A late period almost always indicates that ovulation occurred later than typical or was temporarily delayed. Ovulation is sensitive to:
        • Acute psychological or physiological stress (elevated cortisol suppresses GnRH release).
        • Travel across time zones or disrupted sleep schedules.
        • Recent viral illnesses, changes in caloric intake, or sudden athletic exertion.
        • Medication shifts or hormonal transitions.`,
        source: "Mayo Clinic & American College of Obstetricians and Gynecologists (ACOG)",
        clinicianAdvice: "If a period is more than 7–10 days past estimate and pregnancy is possible, take a home pregnancy test. If you miss periods for 90 or more days (in the absence of pregnancy), schedule an evaluation with a healthcare provider."
      };
    }
  },
  {
    id: "cramps-pain",
    triggers: ["cramp", "pain", "dysmenorrhea", "ache", "pelvic"],
    question: "Are severe cramps normal?",
    answer: (S, stats) => {
      let maxLoggedPain = 0;
      Object.values(S.logs || {}).forEach(l => {
        if (l.p != null && l.p > maxLoggedPain) maxLoggedPain = l.p;
      });
      const painNote = maxLoggedPain > 0 ? `Your highest logged pain level is ${maxLoggedPain}/10. ` : "";

      return {
        title: "Menstrual Cramps & Pelvic Pain",
        context: painNote,
        body: `Mild to moderate pelvic cramping caused by natural uterine prostaglandins is common. However, severe pain that stops daily activities, radiates intensely into your legs, or does not respond to heating pads or standard OTC pain relievers is NOT something you must simply endure.
        
        Severe dysmenorrhea can indicate secondary conditions such as endometriosis, adenomyosis, or uterine fibroids that benefit from personalized medical management.`,
        source: "ACOG Practice Bulletin No. 224 — Management of Dysmenorrhea and Pelvic Pain",
        clinicianAdvice: "If cramps cause you to miss school, work, or social activities, share your logged pain ratings with a gynecologist. Effective medical options exist."
      };
    }
  },
  {
    id: "cervical-mucus",
    triggers: ["discharge", "mucus", "fluid", "egg white", "wet"],
    question: "What does my cervical fluid mean?",
    answer: (S, stats) => {
      const mode = S.mode || "natural";
      const isFertileTime = (mode === "natural" || mode === "ttc") && stats.fertileStart && stats.fertileEnd;

      return {
        title: "Cervical Fluid & Ovulation Biomarkers",
        context: isFertileTime ? "You are currently near your estimated fertile window in your cycle model." : "Cervical fluid shifts naturally throughout your cycle.",
        body: `Cervical discharge changes in direct response to circulating estrogen and progesterone:
        • Fertile Fluid: Clear, watery, or stretchy like raw egg whites. This indicates high estrogen and creates microscopic channels that nourish sperm.
        • Non-Fertile Fluid: Sticky, creamy, cloudy, or dry. Progesterone thickens this fluid into a protective barrier.
        
        Discharge should typically be clear or white without a foul odor, itching, or burning sensation.`,
        source: "World Health Organization (WHO) — Family Planning Clinical Handbook",
        clinicianAdvice: "If you notice discharge that is yellow-green, frothy, clumpy cottage-cheese texture, or accompanied by itching or odor, seek evaluation for a yeast or bacterial infection."
      };
    }
  },
  {
    id: "birth-control",
    triggers: ["pill", "contraception", "birth control", "iud", "implant"],
    question: "How does birth control affect bleeding?",
    answer: (S, stats) => {
      return {
        title: "Hormonal Contraception & Bleeding Patterns",
        context: S.mode === "contra" ? "You have Hormonal Contraception mode active in CycleSideChick." : "Hormonal birth control modifies your natural cycle.",
        body: `Hormonal contraception (combination pills, patches, rings, injections, implants, and hormonal IUDs) prevents natural ovulation by maintaining steady synthetic hormone levels.
        
        The bleeding that occurs during a placebo pill week is known as 'withdrawal bleeding' caused by synthetic hormone withdrawal—not true physiological menstruation. Breakthrough spotting is common, especially during the first 3 to 6 months of use.`,
        source: "Centers for Disease Control and Prevention (CDC) — Contraceptive Guidance",
        clinicianAdvice: "If breakthrough bleeding persists past 6 months or becomes unexpectedly heavy, speak with your prescribing clinician about adjusting your formulation or dosage."
      };
    }
  },
  {
    id: "perimenopause",
    triggers: ["perimenopause", "hot flash", "night sweat", "menopause", "40s"],
    question: "What are early perimenopause signs?",
    answer: (S, stats) => {
      return {
        title: "Recognizing Perimenopause Transitions",
        context: S.mode === "perimenopause" ? "You have Perimenopause mode active in CycleSideChick." : "Perimenopause typically begins in a woman's 40s.",
        body: `Perimenopause is marked by fluctuating ovarian hormone production:
        • Cycle Variability: Consecutive cycle lengths changing by 7 or more days (shorter or longer).
        • Vasomotor Symptoms: Hot flashes, sudden flushing, or nighttime waking with drenching sweats.
        • Neuroendocrine Shifts: Mood fluctuations, increased anxiety, fatigue, and temporary brain fog.
        • Sleep Disruption: Difficulty falling or staying asleep as progesterone fluctuates.`,
        source: "The Menopause Society (formerly NAMS) — Clinical Guidelines",
        clinicianAdvice: "Discuss persistent sleep disturbances, severe hot flashes, or bleeding that occurs after sexual intercourse with your doctor. Safe hormone and non-hormone therapies can provide significant relief."
      };
    }
  },
  {
    id: "heavy-flow",
    triggers: ["heavy", "bleed", "soak", "clot", "menorrhagia"],
    question: "When should I see a doctor about heavy bleeding?",
    answer: (S, stats) => {
      return {
        title: "Heavy Menstrual Bleeding Red Flags",
        context: "Menstrual flow varies, but clinically excessive blood loss requires medical evaluation.",
        body: `Clinical guidelines define heavy menstrual bleeding as blood loss that impacts physical, emotional, or social quality of life. Key warning signs include:
        • Soaking through a pad or tampon every hour for two or more consecutive hours.
        • Waking up during the night to change protection.
        • Passing blood clots larger than 2.5 cm (the size of a quarter).
        • Bleeding lasting longer than 7 full days.`,
        source: "NICE Clinical Guidelines NG88 — Heavy Menstrual Bleeding: Assessment and Management",
        clinicianAdvice: "Heavy bleeding frequently causes iron deficiency anemia. Use CycleSideChick's Clinician Summary to show your doctor your documented bleeding durations and flow ratings."
      };
    }
  },
  {
    id: "ttc-prep",
    triggers: ["ttc", "pregnant", "conception", "baby", "conceive"],
    question: "How to optimize chances when trying to conceive?",
    answer: (S, stats) => {
      return {
        title: "Optimizing Natural Fertility (TTC)",
        context: S.mode === "ttc" ? "You have Trying to Conceive mode active in CycleSideChick." : "Tracking fertility biomarkers helps identify optimal timing.",
        body: `To optimize natural conception:
        • Focus on the 5 days before ovulation plus ovulation day itself. Having intercourse every 1 to 2 days during this window offers the highest cumulative probability of conception.
        • Watch for peak cervical mucus (clear, slippery, stretchy like raw egg white).
        • Take a daily prenatal supplement with 400–800 mcg of folic acid.
        • Track morning Basal Body Temperature (BBT) to confirm the post-ovulation thermal shift.`,
        source: "American Society for Reproductive Medicine (ASRM) — Committee Opinion",
        clinicianAdvice: "If you are under 35 and have been trying for 12 months (or over 35 and trying for 6 months), schedule a preconception evaluation with a reproductive endocrinologist or OB/GYN."
      };
    }
  }
];

function answerQuestion(query, S, stats) {
  if (!query || !query.trim()) return null;
  const q = query.toLowerCase();

  for (const topic of ASSISTANT_TOPICS) {
    if (topic.triggers.some(t => q.includes(t))) {
      return topic.answer(S, stats);
    }
  }

  // Fallback safe answer
  return {
    title: "Cycle & Reproductive Wellness Insights",
    context: `Based on your logged data (${stats.n} cycles tracked, mode: ${S.mode || "natural"}).`,
    body: `Your question touches on reproductive patterns that vary between individuals. Because cycle lengths and hormonal sensitivity shift naturally, tracking symptoms over multiple cycles provides the clearest personal baseline.
    
    Remember that all predictions generated by CycleSideChick are mathematical estimates for wellness tracking and do not constitute clinical diagnosis.`,
    source: "ACOG & NHS Health Library",
    clinicianAdvice: "If you are experiencing acute pain, unexplained bleeding, or persistent distress, consult a licensed healthcare professional. You can share your exported Clinician Summary with them."
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { ASSISTANT_TOPICS, answerQuestion };
}
