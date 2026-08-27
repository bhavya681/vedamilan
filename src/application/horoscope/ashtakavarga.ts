import { SIGNS } from "@/application/horoscope/vedic-constants";

/**
 * Classical Bhinnashtakavarga / Sarvashtakavarga (BPHS bindu tables).
 * Eight contributors (Sun–Saturn + Lagna). SAV total of the seven planet BAVs ≈ 337.
 * Deterministic — not AI. Does not use Swiss Ephemeris.
 */

const CONTRIBUTORS = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Lagna",
] as const;

const BAV_PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;

type Contributor = (typeof CONTRIBUTORS)[number];
type BavPlanet = (typeof BAV_PLANETS)[number];

/** Houses from each contributor that receive a bindu in that planet's BAV. */
const BAV_TABLES: Record<BavPlanet, Record<Contributor, number[]>> = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11],
    Moon: [3, 6, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus: [6, 7, 12],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna: [3, 4, 6, 10, 11, 12],
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11],
    Moon: [1, 3, 6, 7, 10, 11],
    Mars: [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 2, 4, 7, 8, 10, 11],
    Venus: [3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 11],
    Lagna: [3, 6, 10, 11],
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11],
    Moon: [3, 6, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus: [6, 8, 11, 12],
    Saturn: [1, 4, 7, 8, 9, 10, 11],
    Lagna: [1, 3, 6, 10, 11],
  },
  Mercury: {
    Sun: [5, 6, 9, 11, 12],
    Moon: [2, 4, 6, 8, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter: [6, 8, 11, 12],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna: [1, 2, 4, 6, 8, 10, 11],
  },
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon: [2, 5, 7, 9, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12],
    Lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  Venus: {
    Sun: [8, 11, 12],
    Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars: [3, 4, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11],
    Lagna: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11],
    Moon: [3, 6, 11],
    Mars: [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12],
    Jupiter: [5, 6, 11, 12],
    Venus: [6, 11, 12],
    Saturn: [3, 5, 6, 11],
    Lagna: [1, 3, 4, 6, 10, 11],
  },
};

export const CLASSICAL_BAV_QUOTA: Record<BavPlanet, number> = {
  Sun: 48,
  Moon: 49,
  Mars: 39,
  Mercury: 54,
  Jupiter: 56,
  Venus: 52,
  Saturn: 39,
};

/** Kakshya lords from the start of each rashi, 3°45' each. */
export const KAKSHYA_LORDS = [
  "Saturn",
  "Jupiter",
  "Mars",
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
  "Lagna",
] as const;

export type AshtakaCell = { house: number; sign: string; bindus: number };
export type SavRow = AshtakaCell & { note: string };

export type PrashtaraRow = {
  rn: number;
  sign: string;
  house: number;
  from: Record<Contributor, 0 | 1>;
  bindus: number;
  rekhas: number;
};

export type SignSavRow = {
  rn: number;
  sign: string;
  house: number;
  planets: Record<BavPlanet, number>;
  tot: number;
  note: string;
};

export type AshtakavargaResult = {
  methodology: string;
  source: string;
  lagnaSign: string;
  /** Bindus per house 1–12 from Lagna (Sarvashtakavarga). */
  sarva: SavRow[];
  /** Individual planet BAV by house from Lagna (0–8 bindus). */
  bhinna: Record<string, AshtakaCell[]>;
  /** Sign-wise SAV matrix (RN 1 = Aries) — AstroSage layout. */
  signSav: SignSavRow[];
  /** Contributor-level Prashtara Ashtakavarga per planet. */
  prashtara: Record<string, PrashtaraRow[]>;
  planetTotals: Record<string, number>;
  classicalQuota: Record<string, number>;
  totalBindus: number;
  highlights: string[];
};

function signIdOf(sign: string) {
  const i = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  return i >= 0 ? i : 0;
}

function houseNote(bindus: number) {
  if (bindus >= 30) return "Strong support — favourable for activity in this house";
  if (bindus >= 25) return "Supportive — constructive outcomes more likely";
  if (bindus >= 20) return "Average — mixed results; effort matters";
  return "Sensitive — prefer caution and remedies for this house";
}

function signNote(tot: number) {
  if (tot >= 30) return "Strong rashi";
  if (tot >= 25) return "Supportive rashi";
  if (tot >= 20) return "Average rashi";
  return "Lean rashi";
}

export function kakshyaLordAt(degreeInSign: number): (typeof KAKSHYA_LORDS)[number] {
  const clamped = Math.min(29.999, Math.max(0, degreeInSign));
  const index = Math.min(7, Math.floor(clamped / 3.75));
  return KAKSHYA_LORDS[index] ?? "Saturn";
}

export function computeAshtakavarga(input: {
  lagnaSign: string;
  planets: Array<{ planet: string; sign: string; signId?: number }>;
}): AshtakavargaResult {
  const lagnaSignId = signIdOf(input.lagnaSign);
  const positions: Record<string, number> = { Lagna: lagnaSignId };
  for (const p of input.planets) {
    if (!CONTRIBUTORS.includes(p.planet as Contributor) && p.planet !== "Lagna") continue;
    positions[p.planet] = typeof p.signId === "number" ? p.signId : signIdOf(p.sign);
  }

  const prashtara: AshtakavargaResult["prashtara"] = {};
  const bhinna: AshtakavargaResult["bhinna"] = {};

  for (const target of BAV_PLANETS) {
    const table = BAV_TABLES[target];
    const rows: PrashtaraRow[] = [];
    for (let signId = 0; signId < 12; signId += 1) {
      const from = {} as Record<Contributor, 0 | 1>;
      let bindus = 0;
      for (const contrib of CONTRIBUTORS) {
        const fromSignId = positions[contrib];
        if (typeof fromSignId !== "number") {
          from[contrib] = 0;
          continue;
        }
        const houseFromContributor = ((signId - fromSignId + 12) % 12) + 1;
        const houses = table[contrib];
        const hit = houses?.includes(houseFromContributor) ? 1 : 0;
        from[contrib] = hit;
        bindus += hit;
      }
      const house = ((signId - lagnaSignId + 12) % 12) + 1;
      rows.push({
        rn: signId + 1,
        sign: SIGNS[signId] ?? "Aries",
        house,
        from,
        bindus: Math.min(8, bindus),
        rekhas: Math.max(0, 8 - Math.min(8, bindus)),
      });
    }
    prashtara[target] = rows;
    bhinna[target] = [...rows]
      .sort((a, b) => a.house - b.house)
      .map((row) => ({
        house: row.house,
        sign: row.sign,
        bindus: row.bindus,
      }));
  }

  const planetTotals: Record<string, number> = {};
  for (const target of BAV_PLANETS) {
    planetTotals[target] = (prashtara[target] || []).reduce((s, r) => s + r.bindus, 0);
  }

  const signSav: SignSavRow[] = SIGNS.map((sign, signId) => {
    const planets = {} as Record<BavPlanet, number>;
    let tot = 0;
    for (const planet of BAV_PLANETS) {
      const cell = prashtara[planet]?.[signId];
      const val = cell?.bindus ?? 0;
      planets[planet] = val;
      tot += val;
    }
    const house = ((signId - lagnaSignId + 12) % 12) + 1;
    return {
      rn: signId + 1,
      sign,
      house,
      planets,
      tot,
      note: signNote(tot),
    };
  });

  const sarva = Array.from({ length: 12 }, (_, idx) => {
    const house = idx + 1;
    const signId = (lagnaSignId + idx) % 12;
    const bindus = signSav[signId]?.tot ?? 0;
    return {
      house,
      sign: SIGNS[signId] ?? "Aries",
      bindus,
      note: houseNote(bindus),
    };
  });

  const totalBindus = signSav.reduce((s, r) => s + r.tot, 0);
  const strongest = [...sarva].sort((a, b) => b.bindus - a.bindus).slice(0, 3);
  const weakest = [...sarva].sort((a, b) => a.bindus - b.bindus).slice(0, 2);
  const strongSigns = [...signSav].sort((a, b) => b.tot - a.tot).slice(0, 2);

  return {
    methodology:
      "Bindus are not guessed. Each graha and the lagna from your stored kundli are placed in their natal rashis. Classical BPHS contributor tables then award 0 or 1 bindu per rashi. SAV is the sum of the seven planet BAVs (always 337 when all eight contributors exist). Which rashi and house receive those bindus depends entirely on your kundli.",
    source:
      "Natal kundli signs + lagna. Bindu rules are the BPHS tables (fixed). House numbering is from your lagna.",
    lagnaSign: input.lagnaSign,
    sarva,
    bhinna,
    signSav,
    prashtara,
    planetTotals,
    classicalQuota: { ...CLASSICAL_BAV_QUOTA },
    totalBindus,
    highlights: [
      `SAV total ${totalBindus} bindus (classical 337)`,
      ...strongest.map(
        (h) => `House ${h.house} (${h.sign}) is relatively strong with ${h.bindus} SAV bindus`,
      ),
      ...weakest.map(
        (h) => `House ${h.house} (${h.sign}) is relatively soft with ${h.bindus} SAV bindus`,
      ),
      ...strongSigns.map((s) => `${s.sign} (RN ${s.rn}) carries ${s.tot} SAV bindus`),
    ],
  };
}
