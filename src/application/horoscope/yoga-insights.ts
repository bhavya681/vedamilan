export type YogaInsight = {
  meaning: string;
  whenActivates: string;
  watchFor: string;
  lifeAreas: string[];
};

const BY_CODE: Record<string, YogaInsight> = {
  RAJA_YOGA: {
    meaning:
      "A Raja Yoga forms when kendra (angular) and trikona (trinal) lords associate — classically linked with recognition, authority, and outer achievement.",
    whenActivates:
      "Often more noticeable when the yoga-forming planets' Mahadasha or Antardasha runs, or when Gochar of those lords activates the yoga houses.",
    watchFor:
      "Career visibility, leadership invitations, and public responsibility — results still depend on overall chart strength and current dasha.",
    lifeAreas: ["Career", "Status", "Leadership"],
  },
  GAJAKESARI: {
    meaning:
      "Gajakesari Yoga arises when Jupiter occupies a kendra from the Moon — traditionally linked with wisdom, prosperity, and dignified speech.",
    whenActivates:
      "Stronger during Jupiter or Moon periods, and when transit Jupiter supports the Moon or the yoga house.",
    watchFor: "Learning, counsel, reputation, and steady material growth themes.",
    lifeAreas: ["Wealth", "Wisdom", "Reputation"],
  },
  BUDHADITYA: {
    meaning:
      "Budhaditya Yoga is Sun–Mercury conjunction — intellect, communication, and analytical skill themes.",
    whenActivates:
      "Often highlighted in Sun or Mercury dasha/antardasha, and during Mercury/Sun transits over the yoga sign.",
    watchFor: "Writing, study, business communication, and decision clarity.",
    lifeAreas: ["Career", "Intellect", "Communication"],
  },
  DHARMA_KARMA: {
    meaning: "Dharma-Karma Adhipati Yoga links 9th and 10th lords — purpose meeting vocation.",
    whenActivates: "When either lord's period runs, or when Gochar connects the 9th/10th axis.",
    watchFor: "Meaningful work, mentors, and duty that feels aligned with values.",
    lifeAreas: ["Career", "Dharma", "Fortune"],
  },
  GURU_BHAVA: {
    meaning: "Supportive Jupiter placement — growth, guidance, and optimism themes.",
    whenActivates: "Jupiter Mahadasha/Antardasha and Jupiter Gochar over key houses.",
    watchFor: "Teachers, expansion, and ethical opportunities.",
    lifeAreas: ["Growth", "Guidance"],
  },
  VENUS_HARMONY: {
    meaning: "Venus support for relationships, aesthetics, and comfort.",
    whenActivates: "Venus periods and Venus/Jupiter transits to relationship houses.",
    watchFor: "Partnership ease, creativity, and harmony at home.",
    lifeAreas: ["Relationships", "Comfort", "Creativity"],
  },
  MOON_OWN: {
    meaning: "Moon in its own sign — emotional steadiness and self-nourishment.",
    whenActivates: "Moon periods and supportive lunar Gochar.",
    watchFor: "Mental peace, family bonding, and intuitive clarity.",
    lifeAreas: ["Mind", "Health", "Home"],
  },
  RUCHAKA_HINT: {
    meaning: "Mars strength hint (Ruchaka-like) — courage, drive, and initiative.",
    whenActivates: "Mars dasha and activating Mars transits.",
    watchFor: "Bold action, competition, and physical vitality — temper impulsiveness.",
    lifeAreas: ["Courage", "Career", "Energy"],
  },
  LAGNA_SET: {
    meaning: "Ascendant is established — the chart's reference for houses and timing.",
    whenActivates: "Always foundational; Lagna lord periods colour identity and vitality.",
    watchFor: "Self-presentation, health routines, and life direction.",
    lifeAreas: ["Identity", "Vitality"],
  },
};

const BY_CATEGORY: Record<string, YogaInsight> = {
  CAREER: {
    meaning: "This combination leans toward vocation, status, and outer achievement themes.",
    whenActivates:
      "Often during dashas of the yoga planets or 10th-house lords, and supportive career Gochar.",
    watchFor: "Professional openings and public visibility.",
    lifeAreas: ["Career"],
  },
  WEALTH: {
    meaning: "This combination leans toward resources, speech, and prosperity themes.",
    whenActivates: "During related planetary periods and beneficial Jupiter/Venus transits.",
    watchFor: "Income streams and value-building habits.",
    lifeAreas: ["Wealth"],
  },
  MARRIAGE: {
    meaning: "This combination leans toward partnership and emotional bonding themes.",
    whenActivates: "Venus/Jupiter/7th-lord periods and relationship-house Gochar.",
    watchFor: "Partnership timing and harmony practices.",
    lifeAreas: ["Relationships"],
  },
  HEALTH: {
    meaning: "This combination leans toward vitality and mind-body balance.",
    whenActivates: "Lagna/Moon periods and health-sensitive Gochar.",
    watchFor: "Routine, rest, and preventive care — not medical diagnosis.",
    lifeAreas: ["Health"],
  },
  GENERAL: {
    meaning: "A supportive chart factor recorded by the rule engine.",
    whenActivates: "When related planetary periods or transits emphasize this theme.",
    watchFor: "Integrate with dasha and Gochar rather than treating as a standalone prediction.",
    lifeAreas: ["General"],
  },
};

export function insightForYoga(input: {
  code?: string;
  name: string;
  category?: string;
  description?: string;
  currentMaha?: string | null;
  currentAntar?: string | null;
}): YogaInsight & { activationNow: string; engineNote: string } {
  const base =
    (input.code && BY_CODE[input.code]) ||
    (input.category && BY_CATEGORY[input.category]) ||
    BY_CATEGORY.GENERAL!;

  const dashaBits = [input.currentMaha, input.currentAntar].filter(Boolean).join(" / ");
  const activationNow = dashaBits
    ? `Current period: ${dashaBits}. Compare whether yoga planets or related house lords match this dasha — activation is more likely when they do.`
    : "Generate dasha to compare yoga planets with the current Mahadasha / Antardasha.";

  return {
    ...base,
    meaning: input.description?.trim() || base.meaning,
    activationNow,
    engineNote:
      "Calculated from your Kundli by the rule engine — AI may explain, not invent, yogas.",
  };
}

export function insightForDosha(input: {
  code: string;
  name: string;
  present: boolean;
  severity?: string;
  notes?: string;
  currentMaha?: string | null;
}): YogaInsight & { activationNow: string; engineNote: string; statusLabel: string } {
  const map: Record<string, YogaInsight> = {
    MANGLIK: {
      meaning:
        "Manglik Dosha is indicated when Mars occupies classical sensitive houses (1, 2, 4, 7, 8, 12) — traditionally discussed for partnership timing and assertiveness.",
      whenActivates:
        "More discussed during Mars periods and when Mars Gochar hits relationship houses. Cancellation factors and chart context matter.",
      watchFor:
        "Channel Mars constructively — discipline, exercise, clear communication. Not a medical or marriage verdict by itself.",
      lifeAreas: ["Partnership", "Energy", "Courage"],
    },
    KALA_SARPA: {
      meaning:
        "Kaal Sarp involves all classical planets lying on one side of the Rahu–Ketu axis — traditionally linked with intensity and transformative chapters.",
      whenActivates:
        "Often felt more during Rahu/Ketu periods or strong node transits. Not every chart with nodes is Kaal Sarp.",
      watchFor: "Patience, grounding routines, and avoiding fear-based conclusions.",
      lifeAreas: ["Transformation", "Timing"],
    },
    PITRA: {
      meaning: "Pitra themes relate to ancestral / lineage indicators in classical notes.",
      whenActivates:
        "Discussed when related planetary combinations and family-house timing coincide.",
      watchFor: "Respectful remembrance and family duty — cultural guidance, not fate.",
      lifeAreas: ["Family", "Lineage"],
    },
  };

  const base = map[input.code] || {
    meaning: input.notes || `${input.name} was evaluated by the dosha rule engine.`,
    whenActivates: "Review during related planetary dashas and Gochar.",
    watchFor: "Use as context with the full chart — not a standalone fear label.",
    lifeAreas: ["General"],
  };

  const dashaBits = input.currentMaha ? `Current Mahadasha: ${input.currentMaha}.` : "";
  return {
    ...base,
    meaning: input.notes?.trim() || base.meaning,
    activationNow: input.present
      ? `${dashaBits} This factor is currently flagged present (${input.severity || "noted"}).`
      : `${dashaBits} Not flagged as present in the current engine pass.`,
    engineNote: "Deterministic dosha scan from your stored planets — not AI invention.",
    statusLabel: input.present ? `Present · ${input.severity || "noted"}` : "Not present",
  };
}
