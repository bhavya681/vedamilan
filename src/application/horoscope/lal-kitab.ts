/**
 * Lal Kitab–inspired house-based readings and everyday upayas.
 * Deterministic from stored kundli planet×house placements.
 * Explain-only reflection — not medical, legal, or financial advice.
 * Inspired by traditional Lal Kitab house emphasis (not a verbatim scripture dump).
 */

export type LalKitabRating = "pakka" | "exalted" | "favorable" | "neutral" | "challenging";

export type LalKitabPlacement = {
  planet: string;
  house: number;
  sign: string;
  rating: LalKitabRating;
  prediction: string;
  sutraNote: string;
  remedy: string;
  avoid: string;
};

export type LalKitabSutraHit = {
  code: string;
  title: string;
  description: string;
  planets: string[];
  house?: number;
  remedy: string;
  severity: "supportive" | "caution" | "info";
};

export type LalKitabRemedyCard = {
  id: string;
  title: string;
  planetaryFactor: string;
  observedTheme: string;
  possibleRemedy: string;
  reason: string;
  durationPractice: string;
  source: "placement" | "sutra" | "dosha";
};

export type ChartPlanetLite = {
  planet: string;
  house: number;
  sign?: string;
};

const HOUSE_THEME: Record<number, string> = {
  1: "self, health vitality, and public image",
  2: "speech, family resources, and accumulated comfort",
  3: "courage, siblings, effort, and short ventures",
  4: "home, motherly comfort, peace of mind, and property themes",
  5: "intelligence, children themes, creative merit, and counsel",
  6: "service, debt/competition themes, and daily discipline",
  7: "partnership, marriage themes, and public dealings",
  8: "longevity themes, sudden change, and hidden effort",
  9: "dharma, fortune, teachers, and long-path blessings",
  10: "karma, career visibility, and public duty",
  11: "gains, networks, and fulfilled ambitions",
  12: "expenditure, foreign/remote themes, and inner withdrawal",
};

/** Pakka ghar / exalted / favourable / challenging house sets (Lal Kitab–style). */
const PLANET_HOUSES: Record<
  string,
  {
    pakka: number[];
    exalted?: number[];
    favorable: number[];
    challenging: number[];
    generalRemedy: string;
    avoid: string;
  }
> = {
  Sun: {
    pakka: [1],
    favorable: [1, 5, 9, 10, 11],
    challenging: [6, 7, 8, 12],
    generalRemedy:
      "Offer water to the rising Sun with gratitude; keep copper vessels clean; serve one’s father/elders respectfully.",
    avoid: "Avoid arrogance in speech and unnecessary heat/arguments on Sundays.",
  },
  Moon: {
    pakka: [4],
    favorable: [1, 2, 3, 4, 7, 11],
    challenging: [6, 8, 12],
    generalRemedy:
      "Keep a calm sleep routine; donate milk/rice or white food respectfully; honour motherly figures.",
    avoid: "Avoid harsh speech at night and neglecting emotional rest.",
  },
  Mars: {
    pakka: [3, 8],
    favorable: [1, 3, 8, 10, 11],
    challenging: [4, 5, 7, 12],
    generalRemedy:
      "Channel heat into constructive physical work or seva on Tuesdays; keep sharp tools organised.",
    avoid: "Avoid impulsive anger and needless quarrels; do not misuse heat/fire carelessly.",
  },
  Mercury: {
    pakka: [7],
    favorable: [1, 2, 4, 6, 7, 10],
    challenging: [3, 8, 12],
    generalRemedy:
      "Feed green fodder to cows if lawful/local custom allows; keep study notes tidy; speak precisely.",
    avoid: "Avoid gossip, cunning speech, and scattered multitasking without completion.",
  },
  Jupiter: {
    pakka: [2, 5, 9, 12],
    favorable: [1, 2, 4, 5, 9, 11, 12],
    challenging: [3, 6, 7, 8, 10],
    generalRemedy:
      "Apply a small turmeric tilak tradition if culturally natural; donate yellow lentils/gram; respect teachers.",
    avoid: "Avoid disrespect to gurus/elders and empty show of piety.",
  },
  Venus: {
    pakka: [2, 7],
    exalted: [12],
    favorable: [2, 3, 4, 7, 11, 12],
    challenging: [1, 6, 9],
    generalRemedy:
      "Keep living spaces clean and bright; respect women in the family; donate white sweets or clothing when able.",
    avoid: "Avoid gemstone ‘quick fixes’; Lal Kitab emphasises conduct over stones.",
  },
  Saturn: {
    pakka: [7, 10, 11],
    favorable: [3, 6, 7, 10, 11],
    challenging: [1, 4, 5, 8, 12],
    generalRemedy:
      "Serve the elderly or labourers with dignity; keep iron tools/utensils in order; practise patience on Saturdays.",
    avoid: "Avoid laziness mixed with bitterness; do not delay rightful duties.",
  },
  Rahu: {
    pakka: [12],
    favorable: [3, 6, 10, 11],
    challenging: [1, 2, 7, 8, 9],
    generalRemedy:
      "Prefer transparency over shortcuts; charity of blue/black cloth or sesame where custom allows; steady breath practice.",
    avoid: "Avoid fear-based rituals and shady speculative schemes.",
  },
  Ketu: {
    pakka: [6],
    favorable: [3, 6, 9, 12],
    challenging: [1, 4, 7],
    generalRemedy:
      "Keep a simple spiritual routine; donate multi-coloured or dog-care seva if lawful/local custom allows; declutter unused items.",
    avoid: "Avoid sudden renunciation that abandons family duty.",
  },
};

const SPECIAL_HOUSE_NOTES: Partial<Record<string, Partial<Record<number, string>>>> = {
  Sun: {
    1: "In the 1st (often Pakka), Surya supports vitality and leadership when ego stays humble.",
    7: "In the 7th, partnership heat rises — balance authority with fairness in agreements.",
    10: "In the 10th, career visibility strengthens through honest karma.",
  },
  Moon: {
    4: "In the 4th Pakka ghar, Chandra supports peace of mind and domestic steadiness.",
    7: "In the 7th, emotional needs colour partnership — clarity prevents mood-driven decisions.",
    8: "In the 8th, mind may feel restless; grounding routines help.",
  },
  Mars: {
    3: "In the 3rd Pakka theme, courage and effort rise — use them constructively.",
    7: "In the 7th, assertiveness in marriage/business needs soft skill, not force.",
    8: "In the 8th Pakka theme, endurance and research energy can be productive.",
  },
  Mercury: {
    7: "In the 7th Pakka ghar, Budha traditionally protects clarity in dealings and health themes of speech/nerves when kept pure.",
    6: "In the 6th, analytical skill aids service and problem-solving.",
  },
  Jupiter: {
    2: "In the 2nd Pakka theme, speech and family dharma benefit from truthful counsel.",
    5: "In the 5th, wisdom and guidance themes expand.",
    9: "In the 9th, fortune grows through right conduct and teachers.",
    7: "In the 7th, counsel partnerships carefully — over-advice can strain bonds.",
  },
  Venus: {
    7: "In the 7th Pakka theme, Shukra supports partnership grace when mutual respect is kept.",
    12: "In the 12th (classically strong for Venus in many Lal Kitab notes), comfort and artistic ease may rise with humility.",
    6: "In the 6th (traditionally strained for Venus), keep relationships free of petty conflict and debts of affection.",
  },
  Saturn: {
    10: "In the 10th Pakka theme, Shani rewards slow, honest career building.",
    11: "In the 11th, gains come through patience and networks of duty.",
    1: "In the 1st, life may feel heavier early — discipline becomes the ally.",
  },
};

function ratingFor(planet: string, house: number): LalKitabRating {
  const conf = PLANET_HOUSES[planet];
  if (!conf) return "neutral";
  if (conf.exalted?.includes(house)) return "exalted";
  if (conf.pakka.includes(house)) return "pakka";
  if (conf.challenging.includes(house)) return "challenging";
  if (conf.favorable.includes(house)) return "favorable";
  return "neutral";
}

function ratingLabel(r: LalKitabRating): string {
  switch (r) {
    case "pakka":
      return "Pakka ghar support";
    case "exalted":
      return "Classically strong house";
    case "favorable":
      return "Generally supportive";
    case "challenging":
      return "Needs upaya / care";
    default:
      return "Mixed / situational";
  }
}

function planetsInHouse(planets: ChartPlanetLite[], house: number): string[] {
  return planets.filter((p) => p.house === house).map((p) => p.planet);
}

function findPlanet(planets: ChartPlanetLite[], name: string) {
  return planets.find((p) => p.planet === name);
}

/** Apply a curated set of Lal Kitab–style combination sutras to the chart. */
export function applyLalKitabSutras(planets: ChartPlanetLite[]): LalKitabSutraHit[] {
  const hits: LalKitabSutraHit[] = [];
  const byHouse = new Map<number, string[]>();
  for (const p of planets) {
    if (!p.house || p.house < 1 || p.house > 12) continue;
    const list = byHouse.get(p.house) || [];
    list.push(p.planet);
    byHouse.set(p.house, list);
  }

  for (const [house, names] of byHouse) {
    const set = new Set(names);
    if (set.has("Sun") && set.has("Saturn")) {
      hits.push({
        code: "SUN_SATURN_COMBUST_THEME",
        title: "Surya–Shani together (blind Sun theme)",
        description: `Sun and Saturn share house ${house}. Lal Kitab notes often warn that authority and delay clash — clarity of duty prevents bitterness.`,
        planets: ["Sun", "Saturn"],
        house,
        remedy:
          "Serve elders/labourers; keep Sunday discipline gentle; do not fight authority with stubborn coldness.",
        severity: "caution",
      });
    }
    if (set.has("Mars") && set.has("Saturn")) {
      hits.push({
        code: "MARS_SATURN_HEAT",
        title: "Mangal–Shani together (heat + delay)",
        description: `Mars and Saturn share house ${house}. Effort can feel blocked or sharp — channel into structured hard work, not conflict.`,
        planets: ["Mars", "Saturn"],
        house,
        remedy:
          "Tuesday/Saturday constructive labour or seva; keep tools/iron orderly; cool the temper before decisions.",
        severity: "caution",
      });
    }
    if (set.has("Moon") && set.has("Mars")) {
      hits.push({
        code: "MOON_MARS_EMOTION",
        title: "Chandra–Mangal together",
        description: `Moon and Mars in house ${house} can heighten emotional drive — protect domestic peace with pause before reaction.`,
        planets: ["Moon", "Mars"],
        house,
        remedy:
          "Cooling milk/rice dana tradition if natural; evening calm routine; avoid heated speech at home.",
        severity: "caution",
      });
    }
    if (set.has("Venus") && set.has("Rahu")) {
      hits.push({
        code: "VENUS_RAHU_COMFORT",
        title: "Shukra–Rahu together",
        description: `Venus with Rahu in house ${house} may confuse comfort and desire — keep relationships transparent.`,
        planets: ["Venus", "Rahu"],
        house,
        remedy:
          "Prefer clean white surroundings; avoid shady shortcuts in love/money; donate white items when able.",
        severity: "caution",
      });
    }
    if (set.has("Jupiter") && set.has("Rahu")) {
      hits.push({
        code: "JUPITER_RAHU_GURU_CHANDAL",
        title: "Guru–Rahu together (wisdom distortion caution)",
        description: `Jupiter with Rahu in house ${house} asks for honest teachers and careful belief — avoid hollow spiritual show.`,
        planets: ["Jupiter", "Rahu"],
        house,
        remedy: "Respect true teachers; yellow dana with humility; verify advice before acting.",
        severity: "caution",
      });
    }
    if (set.has("Mercury") && names.length === 1) {
      // alone mercury in 7 already covered by placement; skip
    }
    // Friendly clusters (supportive)
    if (set.has("Jupiter") && set.has("Moon")) {
      hits.push({
        code: "JUPITER_MOON_Gaja",
        title: "Guru–Chandra together (supportive counsel)",
        description: `Jupiter and Moon in house ${house} often support wise emotional guidance when ego stays soft.`,
        planets: ["Jupiter", "Moon"],
        house,
        remedy: "Keep a gratitude journal; gentle mantra or study with a mentor.",
        severity: "supportive",
      });
    }
    if (set.has("Venus") && set.has("Mercury") && house === 7) {
      hits.push({
        code: "VENUS_MERCURY_7",
        title: "Shukra–Budha in 7th (Pakka alliance)",
        description:
          "Venus and Mercury in the 7th reinforce partnership communication — honesty keeps the grace.",
        planets: ["Venus", "Mercury"],
        house: 7,
        remedy: "Speak kindly with partners; keep agreements written and fair.",
        severity: "supportive",
      });
    }
  }

  const mercury = findPlanet(planets, "Mercury");
  if (mercury?.house === 7) {
    hits.push({
      code: "MERCURY_PAKKA_7",
      title: "Budha in 7th Pakka ghar",
      description:
        "Lal Kitab famously treats the 7th as Mercury’s Pakka ghar — clarity in dealings and care of speech/health routines is emphasised.",
      planets: ["Mercury"],
      house: 7,
      remedy:
        "Keep speech clean; green charity/fodder tradition if lawful; organise contracts carefully.",
      severity: "supportive",
    });
  }

  const moon = findPlanet(planets, "Moon");
  const venus = findPlanet(planets, "Venus");
  if (moon && venus && Math.abs(moon.house - venus.house) === 6) {
    hits.push({
      code: "MOON_VENUS_OPPOSITION",
      title: "Chandra–Shukra opposition axis",
      description:
        "Moon and Venus facing across the chart can strain comfort vs emotion — protect eyesight rest and tender speech in the family.",
      planets: ["Moon", "Venus"],
      remedy: "Rest eyes; white/milk dana traditions if natural; keep evenings gentle at home.",
      severity: "caution",
    });
  }

  // Empty 1 / 7 info
  if (!planets.some((p) => p.house === 1)) {
    hits.push({
      code: "EMPTY_LAGNA_HOUSE",
      title: "1st house empty of planets",
      description:
        "No planet sits in the 1st from Lagna in this chart view — personality themes lean more on Lagna lord and Moon than on a guest planet.",
      planets: [],
      house: 1,
      remedy: "Strengthen daily routine and Lagna-lord weekday discipline.",
      severity: "info",
    });
  }

  return hits;
}

export function buildLalKitabPlacements(planets: ChartPlanetLite[]): LalKitabPlacement[] {
  const order = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  const out: LalKitabPlacement[] = [];

  for (const name of order) {
    const p = findPlanet(planets, name);
    if (!p || !p.house) continue;
    const conf = PLANET_HOUSES[name];
    if (!conf) continue;
    const house = p.house;
    const rating = ratingFor(name, house);
    const theme = HOUSE_THEME[house] || "life themes";
    const special = SPECIAL_HOUSE_NOTES[name]?.[house];
    const prediction =
      special ||
      `${name} in the ${house}th house colours ${theme}. Lal Kitab reads this by house first — ${ratingLabel(rating).toLowerCase()}.`;

    out.push({
      planet: name,
      house,
      sign: p.sign || "—",
      rating,
      prediction,
      sutraNote: `${name}: ${ratingLabel(rating)} in house ${house}${
        conf.pakka.includes(house) ? " (Pakka ghar)" : ""
      }.`,
      remedy: conf.generalRemedy,
      avoid: conf.avoid,
    });
  }

  return out;
}

export function buildLalKitabRemedies(input: {
  placements: LalKitabPlacement[];
  sutras: LalKitabSutraHit[];
  doshas?: Array<{ code: string; present?: boolean; name?: string; notes?: string }>;
}): LalKitabRemedyCard[] {
  const cards: LalKitabRemedyCard[] = [];

  for (const pl of input.placements) {
    if (pl.rating !== "challenging" && pl.rating !== "pakka" && pl.rating !== "exalted") continue;
    // Always surface challenging; also surface pakka/exalted as supportive practice cards lightly
    if (pl.rating === "challenging") {
      cards.push({
        id: `place-${pl.planet}-${pl.house}`,
        title: `${pl.planet} in ${pl.house}th — upaya`,
        planetaryFactor: `${pl.planet} · house ${pl.house} (${pl.sign})`,
        observedTheme: pl.prediction,
        possibleRemedy: pl.remedy,
        reason: pl.sutraNote,
        durationPractice: "40 days steady practice, then review with chart context",
        source: "placement",
      });
    }
  }

  for (const s of input.sutras) {
    if (s.severity === "info") continue;
    cards.push({
      id: `sutra-${s.code}`,
      title: s.title,
      planetaryFactor: s.planets.join(" + ") || "Chart pattern",
      observedTheme: s.description,
      possibleRemedy: s.remedy,
      reason: `Lal Kitab–style combination sutra${s.house ? ` (house ${s.house})` : ""}`,
      durationPractice:
        s.severity === "caution"
          ? "Begin within a week; sustain 40–90 days"
          : "Ongoing supportive habit",
      source: "sutra",
    });
  }

  for (const d of input.doshas || []) {
    if (!d.present) continue;
    const code = d.code.toUpperCase().replace(/KAAL_SARPA/i, "KALA_SARPA");
    if (code === "MANGLIK" || code.includes("MANGLIK")) {
      cards.push({
        id: "dosha-manglik",
        title: "Manglik theme — Mars heat",
        planetaryFactor: "Mars on marriage-sensitive houses",
        observedTheme: d.notes || "Partnership assertiveness and timing themes",
        possibleRemedy:
          "Tuesday constructive seva or disciplined physical routine; keep speech cool in partnerships.",
        reason: "Classical Manglik / Mars house theme mapped from your engine-flagged chart",
        durationPractice: "Weekly Tuesday practice; review before major relationship decisions",
        source: "dosha",
      });
    }
    if (code === "KALA_SARPA" || code.includes("SARPA")) {
      cards.push({
        id: "dosha-kala-sarpa",
        title: "Kaal Sarp axis theme",
        planetaryFactor: "Rahu–Ketu axis enclosing classical planets",
        observedTheme: d.notes || "Intensity and transformative pacing themes",
        possibleRemedy:
          "Steady mantra/meditation; charity on Rahu/Ketu-sensitive weekdays; avoid fear rituals.",
        reason: "Engine-flagged Kaal Sarp pattern — Lal Kitab style emphasises grounding conduct",
        durationPractice: "40–90 days consistent practice",
        source: "dosha",
      });
    }
  }

  // Deduplicate by id
  const seen = new Set<string>();
  return cards.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

export function buildLalKitabReport(input: {
  planets: ChartPlanetLite[];
  doshas?: Array<{ code: string; present?: boolean; name?: string; notes?: string }>;
  lagnaSign?: string | null;
}) {
  const planets = (input.planets || []).filter(
    (p) => p.planet && typeof p.house === "number" && p.house >= 1 && p.house <= 12,
  );
  const placements = buildLalKitabPlacements(planets);
  const sutras = applyLalKitabSutras(planets);
  const remedies = buildLalKitabRemedies({
    placements,
    sutras,
    doshas: input.doshas,
  });

  const challenging = placements.filter((p) => p.rating === "challenging").length;
  const strong = placements.filter((p) => p.rating === "pakka" || p.rating === "exalted").length;

  return {
    lagnaSign: input.lagnaSign || null,
    placements,
    sutras,
    remedies,
    summary: `Lal Kitab house scan: ${placements.length} planets mapped · ${strong} Pakka/strong · ${challenging} needing care · ${sutras.filter((s) => s.severity !== "info").length} active combination sutras.`,
    methodology:
      "Lal Kitab-inspired reading emphasises planet×house (not sign alone), Pakka ghar, combination sutras, and everyday upayas. Calculated from your stored kundli houses. Reflection only — not medical, legal, or financial advice. Confirm serious decisions with a qualified astrologer.",
  };
}

export const LAL_KITAB_DISCLAIMER =
  "Traditional Lal Kitab–inspired house predictions and everyday upayas for reflection only. Not medical, legal, or financial advice. Remedies emphasise conduct and charity — never invent gemstone or harmful rituals.";
