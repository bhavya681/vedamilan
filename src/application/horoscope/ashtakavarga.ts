import { SIGNS } from "@/application/horoscope/vedic-constants";

/**
 * Classical Sarvashtakavarga / Bhinnashtakavarga-style bindu contributions.
 * BAV: 0–8 bindus per house from 8 contributors (Sun–Saturn + Lagna).
 * SAV: sum of the seven planet BAV tables (classical total ≈ 337).
 * Deterministic teaching tables — not AI. Max SAV per house ≤ 56.
 */

/** Houses from the contributor that receive a bindu in SAV aggregation. */
const SAV_CONTRIB: Record<string, number[]> = {
  Sun: [1, 2, 4, 7, 8, 9, 10, 11],
  Moon: [3, 6, 10, 11],
  Mars: [1, 2, 4, 7, 8, 9, 10, 11],
  Mercury: [3, 5, 6, 9, 10, 11, 12],
  Jupiter: [1, 2, 3, 4, 7, 9, 10, 11],
  Venus: [1, 2, 3, 4, 5, 8, 9, 11],
  Saturn: [3, 5, 6, 11],
  Lagna: [1, 2, 4, 5, 7, 8, 9, 10, 11],
};

/**
 * Per-planet BAV: for each target planet, which houses FROM EACH contributor get bindus.
 * Simplified classical subset used by many teaching apps — labeled as engine v1.
 */
const BAV_OWN: Record<string, number[]> = {
  Sun: [1, 2, 4, 7, 8, 9, 10, 11],
  Moon: [3, 6, 10, 11],
  Mars: [1, 2, 4, 7, 8, 9, 10, 11],
  Mercury: [3, 5, 6, 9, 10, 11, 12],
  Jupiter: [1, 2, 3, 4, 7, 9, 10, 11],
  Venus: [1, 2, 3, 4, 5, 8, 9, 11],
  Saturn: [3, 5, 6, 11],
};

export type AshtakavargaResult = {
  methodology: string;
  lagnaSign: string;
  /** Bindus per house 1–12 from Lagna (Sarvashtakavarga = sum of 7 BAVs). */
  sarva: Array<{ house: number; sign: string; bindus: number; note: string }>;
  /** Individual planet BAV totals by house from Lagna (0–8 bindus). */
  bhinna: Record<string, Array<{ house: number; sign: string; bindus: number }>>;
  /** Sum of each planet's 12 BAV houses (classical totals near 337 combined). */
  planetTotals: Record<string, number>;
  /** Grand total of SAV bindus (classical ≈ 337). */
  totalBindus: number;
  highlights: string[];
};

function signIdOf(sign: string) {
  const i = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  return i >= 0 ? i : 0;
}

function houseNote(bindus: number) {
  if (bindus >= 30) return "Strong support — auspicious for activity in this house";
  if (bindus >= 25) return "Supportive — constructive outcomes more likely";
  if (bindus >= 20) return "Average — mixed results; effort matters";
  return "Sensitive — prefer caution and remedies for this house";
}

const BAV_PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"] as const;

export function computeAshtakavarga(input: {
  lagnaSign: string;
  planets: Array<{ planet: string; sign: string; signId?: number }>;
}): AshtakavargaResult {
  const lagnaSignId = signIdOf(input.lagnaSign);
  const positions: Record<string, number> = { Lagna: lagnaSignId };
  for (const p of input.planets) {
    if (!(p.planet in SAV_CONTRIB) && p.planet !== "Lagna") continue;
    positions[p.planet] = typeof p.signId === "number" ? p.signId : signIdOf(p.sign);
  }

  const bhinna: AshtakavargaResult["bhinna"] = {};
  for (const target of BAV_PLANETS) {
    const row = Array.from({ length: 12 }, () => 0);
    const ownHouses = BAV_OWN[target]!;
    const targetSign = positions[target];
    if (typeof targetSign !== "number") continue;
    for (const [contrib, fromSignId] of Object.entries(positions)) {
      const table = contrib === target ? ownHouses : SAV_CONTRIB[contrib] || ownHouses;
      for (const h of table) {
        const signId = (fromSignId + (h - 1)) % 12;
        const houseFromLagna = ((signId - lagnaSignId + 12) % 12) + 1;
        row[houseFromLagna - 1]! += 1;
      }
    }
    bhinna[target] = row.map((raw, idx) => ({
      house: idx + 1,
      sign: SIGNS[(lagnaSignId + idx) % 12] ?? "Aries",
      bindus: Math.min(8, raw),
    }));
  }

  const planetTotals: Record<string, number> = {};
  for (const target of BAV_PLANETS) {
    planetTotals[target] = (bhinna[target] || []).reduce((s, c) => s + c.bindus, 0);
  }

  const sav = Array.from({ length: 12 }, (_, idx) =>
    BAV_PLANETS.reduce((sum, planet) => sum + (bhinna[planet]?.[idx]?.bindus ?? 0), 0),
  );

  const sarva = sav.map((bindus, idx) => {
    const house = idx + 1;
    const signId = (lagnaSignId + idx) % 12;
    return {
      house,
      sign: SIGNS[signId] ?? "Aries",
      bindus,
      note: houseNote(bindus),
    };
  });

  const totalBindus = sav.reduce((s, n) => s + n, 0);
  const strongest = [...sarva].sort((a, b) => b.bindus - a.bindus).slice(0, 3);
  const weakest = [...sarva].sort((a, b) => a.bindus - b.bindus).slice(0, 2);

  return {
    methodology:
      "Bhinnashtakavarga uses 8 contributors (Sun–Saturn + Lagna), 0–8 bindus per house. Sarvashtakavarga is the sum of the seven planet BAVs (classical total ≈ 337). Engine v1 teaching tables — directional, comparable to JHora / AstroSage layout.",
    lagnaSign: input.lagnaSign,
    sarva,
    bhinna,
    planetTotals,
    totalBindus,
    highlights: [
      `SAV total ${totalBindus} bindus (classical reference ≈ 337)`,
      ...strongest.map(
        (h) => `House ${h.house} (${h.sign}) is relatively strong with ${h.bindus} SAV bindus`,
      ),
      ...weakest.map(
        (h) => `House ${h.house} (${h.sign}) is relatively soft with ${h.bindus} SAV bindus`,
      ),
    ],
  };
}
