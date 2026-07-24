import { SIGNS } from "@/application/horoscope/vedic-constants";

/**
 * Classical Sarvashtakavarga / Bhinnashtakavarga-style bindu contributions.
 * Tables: houses (1–12) counted from each contributor's rashi that receive a bindu.
 * Deterministic — not AI. Max SAV per house is typically ≤ 56.
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
  /** Bindus per house 1–12 from Lagna (Sarvashtakavarga) */
  sarva: Array<{ house: number; sign: string; bindus: number; note: string }>;
  /** Individual planet BAV totals by house from Lagna */
  bhinna: Record<string, Array<{ house: number; sign: string; bindus: number }>>;
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

  const sav = Array.from({ length: 12 }, () => 0);
  for (const [name, fromSignId] of Object.entries(positions)) {
    const houses = SAV_CONTRIB[name];
    if (!houses) continue;
    for (const h of houses) {
      const signId = (fromSignId + (h - 1)) % 12;
      const houseFromLagna = ((signId - lagnaSignId + 12) % 12) + 1;
      sav[houseFromLagna - 1]! += 1;
    }
  }

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

  const bhinna: AshtakavargaResult["bhinna"] = {};
  for (const target of Object.keys(BAV_OWN)) {
    const row = Array.from({ length: 12 }, () => 0);
    const ownHouses = BAV_OWN[target]!;
    const targetSign = positions[target];
    if (typeof targetSign !== "number") continue;
    // Own planet contributions from all SAV contributors into this planet's BAV using own table relative to each contributor
    for (const [contrib, fromSignId] of Object.entries(positions)) {
      if (contrib === "Lagna" && !(contrib in SAV_CONTRIB)) continue;
      const table = contrib === target ? ownHouses : SAV_CONTRIB[contrib] || ownHouses;
      for (const h of table) {
        const signId = (fromSignId + (h - 1)) % 12;
        const houseFromLagna = ((signId - lagnaSignId + 12) % 12) + 1;
        row[houseFromLagna - 1]! += 1;
      }
    }
    bhinna[target] = row.map((bindus, idx) => ({
      house: idx + 1,
      sign: SIGNS[(lagnaSignId + idx) % 12] ?? "Aries",
      bindus,
    }));
  }

  const strongest = [...sarva].sort((a, b) => b.bindus - a.bindus).slice(0, 3);
  const weakest = [...sarva].sort((a, b) => a.bindus - b.bindus).slice(0, 2);

  return {
    methodology:
      "Classical Sarvashtakavarga bindu contribution (Sun–Saturn + Lagna). Engine v1 — deterministic tables, not AI.",
    lagnaSign: input.lagnaSign,
    sarva,
    bhinna,
    highlights: [
      ...strongest.map(
        (h) => `House ${h.house} (${h.sign}) is relatively strong with ${h.bindus} bindus`,
      ),
      ...weakest.map(
        (h) => `House ${h.house} (${h.sign}) is relatively soft with ${h.bindus} bindus`,
      ),
    ],
  };
}
