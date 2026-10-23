/**
 * CycleSideChick — Curated Care & Humor Message Catalogue
 * Version: 1.0.0
 * 
 * Rules:
 * 1. Humor targets recipient's support mission ONLY. Never jokes about the person's body, pain, bleeding, or emotions.
 * 2. No stereotyping by phase.
 * 3. No unrequested medical advice or boundary-crossing.
 * 4. Deterministic message selection ensures idempotency across retries.
 */

export const MESSAGE_CATALOGUE_VERSION = "1.0.0";

export const CARE_MESSAGE_CATALOGUE = {
  // Category 1: Practical Care
  practical: [
    {
      id: "prac_01",
      title: "Supportive Check-In",
      body: "A warm cup of tea, a fresh glass of water, or preparing a comforting meal can make a world of difference today."
    },
    {
      id: "prac_02",
      title: "Quiet Care Action",
      body: "Check if any household chores or errands can be handled without needing to be asked."
    },
    {
      id: "prac_03",
      title: "Gentle Hydration & Comfort",
      body: "Offering a refill of water or having a warm blanket or heating pad ready is a lovely gesture today."
    },
    {
      id: "prac_04",
      title: "Thoughtful Nourishment",
      body: "Nutritious, warm food and easy snacks provide steady comfort. Ask if you can grab something delicious."
    }
  ],

  // Category 2: Listening & Emotional Support
  listening: [
    {
      id: "list_01",
      title: "Gentle Presence",
      body: "Simply being present and listening with warmth is one of the most reassuring gifts you can give."
    },
    {
      id: "list_02",
      title: "Listening First",
      body: "Validate how they are feeling without trying to fix everything. An attentive ear speaks volumes."
    },
    {
      id: "list_03",
      title: "Space & Reassurance",
      body: "Remind them that you are there whenever they need you, with no pressure to talk or explain."
    }
  ],

  // Category 3: Comfort & Rest
  comfort: [
    {
      id: "comf_01",
      title: "Rest Is Priority",
      body: "Encourage restful downtime today. Help create a calm, cozy, and relaxing space."
    },
    {
      id: "comf_02",
      title: "Low-Pressure Day",
      body: "Offer to postpone non-essential plans or handle evening commitments so they can unwind comfortably."
    },
    {
      id: "comf_03",
      title: "Cozy Space Check",
      body: "A quiet room, dimmed lights, and soft comfort go a long way when body energy is winding down."
    }
  ],

  // Category 4: Affection & Reassurance
  affection: [
    {
      id: "aff_01",
      title: "Sending Warmth",
      body: "A sweet text or gentle hug can brighten their day. Let them know they are cherished and appreciated."
    },
    {
      id: "aff_02",
      title: "Appreciation Check-In",
      body: "Take a second to send a quick supportive note. Even small tokens of care build deep safety."
    }
  ],

  // Category 5: Lighthearted Support Missions (Targeting the recipient's responsibility)
  humor: [
    {
      id: "hum_01",
      title: "Your care mission just dropped.",
      body: "Ask what would make today easier. Snacks are a possible side quest; listening is the main quest."
    },
    {
      id: "hum_02",
      title: "Listening mode: ON.",
      body: "Unsolicited solution mode: OFF. Ask what kind of support would actually help today."
    },
    {
      id: "hum_03",
      title: "Companion Mission Objective:",
      body: "Locate a warm drink, secure the cozy blanket, and ask if any tasks need taking off their hands."
    },
    {
      id: "hum_04",
      title: "Care Directive: Level 1",
      body: "No questions that require heavy decision-making. Offer two simple, lovely choices instead."
    },
    {
      id: "hum_05",
      title: "Special Support Alert",
      body: "Your superpower today is being low-friction, high-comfort, and very generous with snacks."
    }
  ]
};

/**
 * Deterministic hash calculation (DJB2) for reproducible selection
 */
export function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Deterministically select a supportive message for an event
 * @param {Object} options
 * @param {string} options.relationshipId
 * @param {string} options.eventType
 * @param {string} options.dateKey (e.g. YYYY-MM-DD)
 * @param {boolean} options.allowHumor
 * @param {string} [options.preferredCategory]
 * @returns {{ id: string, title: string, body: string, category: string }}
 */
export function selectCuratedMessage({
  relationshipId = "default",
  eventType = "status_synced",
  dateKey = new Date().toISOString().slice(0, 10),
  allowHumor = true,
  preferredCategory = null
}) {
  const categories = ["practical", "listening", "comfort", "affection"];
  if (allowHumor) {
    categories.push("humor");
  }

  const cat = preferredCategory && CARE_MESSAGE_CATALOGUE[preferredCategory]
    ? preferredCategory
    : categories[hashString(`${relationshipId}:${eventType}:${dateKey}:cat`) % categories.length];

  const pool = CARE_MESSAGE_CATALOGUE[cat] || CARE_MESSAGE_CATALOGUE.practical;
  const index = hashString(`${relationshipId}:${eventType}:${dateKey}:msg`) % pool.length;
  const msg = pool[index];

  return {
    ...msg,
    category: cat,
    catalogueVersion: MESSAGE_CATALOGUE_VERSION
  };
}

/**
 * Generates generic lock-screen notification preview (privacy-preserving)
 */
export function getGenericLockScreenNotification() {
  return {
    title: "CycleSideChick Companion",
    body: "Your cycle companion shared an update. Open to see how you can offer support today."
  };
}
