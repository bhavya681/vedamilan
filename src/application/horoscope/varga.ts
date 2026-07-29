import { SIGNS } from "@/application/horoscope/vedic-constants";
import { longitudeToNavamsaSign } from "@/application/horoscope/navamsa";

/** Supported Parashari divisional charts (Vargas). */
export type VargaId = 1 | 2 | 3 | 4 | 7 | 9 | 10 | 11 | 12 | 16 | 20 | 24 | 27 | 30 | 40 | 45 | 60;

export type VargaMeta = {
  id: VargaId;
  code: string;
  name: string;
  theme: string;
};

/** Important charts shown in the Kundli Charts hub (order matters). */
export const IMPORTANT_VARGAS: VargaMeta[] = [
  {
    id: 1,
    code: "D1",
    name: "Rashi (D1)",
    theme: "Primary birth chart — body, personality, life events.",
  },
  { id: 2, code: "D2", name: "Hora (D2)", theme: "Wealth capacity and resources." },
  { id: 3, code: "D3", name: "Drekkana (D3)", theme: "Siblings, courage, short initiatives." },
  { id: 4, code: "D4", name: "Chaturthamsa (D4)", theme: "Property, home, fortune foundations." },
  { id: 7, code: "D7", name: "Saptamsa (D7)", theme: "Children and creative progeny themes." },
  { id: 9, code: "D9", name: "Navamsha (D9)", theme: "Marriage, dharma, and planetary strength." },
  { id: 10, code: "D10", name: "Dasamsa (D10)", theme: "Career, status, and public karma." },
  { id: 11, code: "D11", name: "Rudramsa (D11)", theme: "Gains, labha, and second-wind success." },
  { id: 12, code: "D12", name: "Dwadamsa (D12)", theme: "Parents and ancestral themes." },
  { id: 16, code: "D16", name: "Shodasamsa (D16)", theme: "Vehicles, comforts, and luxuries." },
  { id: 20, code: "D20", name: "Vimsamsa (D20)", theme: "Spiritual practice and upasana." },
  { id: 24, code: "D24", name: "Chaturvimsamsa (D24)", theme: "Learning, education, and skills." },
  { id: 27, code: "D27", name: "Bhamsa (D27)", theme: "Strengths and innate capacities." },
  { id: 30, code: "D30", name: "Trimsamsa (D30)", theme: "Evils, health vigilance, and friction." },
  {
    id: 60,
    code: "D60",
    name: "Shashtiamsa (D60)",
    theme: "Fine karmic detail — classical fine-print chart.",
  },
];

function normLong(longitude: number) {
  return ((longitude % 360) + 360) % 360;
}

function signParts(longitude: number) {
  const norm = normLong(longitude);
  const signId = Math.floor(norm / 30);
  const degInSign = norm % 30;
  return { signId, degInSign };
}

function isOddSign(signId: number) {
  return signId % 2 === 0; // Aries=0 odd in 1-based zodiac
}

function isMovable(signId: number) {
  return signId % 3 === 0;
}

function isFixed(signId: number) {
  return signId % 3 === 1;
}

function partIndex(degInSign: number, divisions: number) {
  const size = 30 / divisions;
  return Math.min(divisions - 1, Math.floor(degInSign / size + 1e-12));
}

function result(signId: number) {
  const id = ((signId % 12) + 12) % 12;
  return { sign: SIGNS[id] ?? "Aries", signId: id };
}

/**
 * Map sidereal longitude → sign in a Parashari varga (D-chart).
 * D9 uses the existing classical Navamsha mapper for consistency.
 */
export function longitudeToVargaSign(
  longitude: number,
  varga: VargaId,
): { sign: string; signId: number } {
  if (varga === 1) {
    const { signId } = signParts(longitude);
    return result(signId);
  }
  if (varga === 9) {
    return longitudeToNavamsaSign(longitude);
  }

  const { signId, degInSign } = signParts(longitude);

  // D2 Hora — only Cancer / Leo
  if (varga === 2) {
    const firstHalf = degInSign < 15;
    if (isOddSign(signId)) {
      return firstHalf ? result(4) : result(3); // Leo / Cancer
    }
    return firstHalf ? result(3) : result(4);
  }

  // D3 Drekkana
  if (varga === 3) {
    if (degInSign < 10) return result(signId);
    if (degInSign < 20) return result(signId + 4);
    return result(signId + 8);
  }

  // D4 Chaturthamsa — 7.5° parts → 1st / 4th / 7th / 10th from occupied sign
  if (varga === 4) {
    const p = partIndex(degInSign, 4);
    return result(signId + p * 3);
  }

  // D7 Saptamsa — odd from self, even from 7th
  if (varga === 7) {
    const p = partIndex(degInSign, 7);
    const start = isOddSign(signId) ? signId : signId + 6;
    return result(start + p);
  }

  // D10 Dasamsa — odd from self, even from 9th
  if (varga === 10) {
    const p = partIndex(degInSign, 10);
    const start = isOddSign(signId) ? signId : signId + 8;
    return result(start + p);
  }

  // D11 Rudramsa / Labhamsa — odd from self, even from 7th
  if (varga === 11) {
    const p = partIndex(degInSign, 11);
    const start = isOddSign(signId) ? signId : signId + 6;
    return result(start + p);
  }

  // D12 Dwadamsa — always from occupied sign
  if (varga === 12) {
    const p = partIndex(degInSign, 12);
    return result(signId + p);
  }

  // D16 Shodasamsa — movable→Aries, fixed→Leo, dual→Sagittarius
  if (varga === 16) {
    const p = partIndex(degInSign, 16);
    const start = isMovable(signId) ? 0 : isFixed(signId) ? 4 : 8;
    return result(start + p);
  }

  // D20 Vimsamsa — movable→Aries, fixed→Sagittarius, dual→Leo
  if (varga === 20) {
    const p = partIndex(degInSign, 20);
    const start = isMovable(signId) ? 0 : isFixed(signId) ? 8 : 4;
    return result(start + p);
  }

  // D24 Chaturvimsamsa — odd→Leo, even→Cancer
  if (varga === 24) {
    const p = partIndex(degInSign, 24);
    const start = isOddSign(signId) ? 4 : 3;
    return result(start + p);
  }

  // D27 Bhamsa / Nakshatramsa — from occupied sign
  if (varga === 27) {
    const p = partIndex(degInSign, 27);
    return result(signId + p);
  }

  // D30 Trimsamsa — classical unequal lords (odd vs even signs)
  if (varga === 30) {
    if (isOddSign(signId)) {
      if (degInSign < 5) return result(0); // Mars → Aries
      if (degInSign < 10) return result(10); // Saturn → Aquarius
      if (degInSign < 18) return result(8); // Jupiter → Sagittarius
      if (degInSign < 25) return result(2); // Mercury → Gemini
      return result(6); // Venus → Libra
    }
    if (degInSign < 5) return result(1); // Venus → Taurus
    if (degInSign < 12) return result(5); // Mercury → Virgo
    if (degInSign < 20) return result(11); // Jupiter → Pisces
    if (degInSign < 25) return result(9); // Saturn → Capricorn
    return result(7); // Mars → Scorpio
  }

  // D40 Khavedamsa — odd→Aries, even→Libra
  if (varga === 40) {
    const p = partIndex(degInSign, 40);
    const start = isOddSign(signId) ? 0 : 6;
    return result(start + p);
  }

  // D45 Akshavedamsa — movable→Aries, fixed→Leo, dual→Sagittarius
  if (varga === 45) {
    const p = partIndex(degInSign, 45);
    const start = isMovable(signId) ? 0 : isFixed(signId) ? 4 : 8;
    return result(start + p);
  }

  // D60 Shashtiamsa — from occupied sign, 0.5° parts
  if (varga === 60) {
    const p = partIndex(degInSign, 60);
    return result(signId + p);
  }

  return result(signId);
}

export function resolveLagnaLongitude(input: {
  lagnaSign: string;
  lagnaDegree?: number | null;
  lagnaLongitude?: number | null;
}): { longitude: number; note?: string } {
  if (typeof input.lagnaLongitude === "number" && !Number.isNaN(input.lagnaLongitude)) {
    return { longitude: input.lagnaLongitude };
  }
  const sid = SIGNS.indexOf(input.lagnaSign as (typeof SIGNS)[number]);
  const signId = sid >= 0 ? sid : 0;
  const deg =
    typeof input.lagnaDegree === "number" && !Number.isNaN(input.lagnaDegree)
      ? ((input.lagnaDegree % 30) + 30) % 30
      : 15;
  return {
    longitude: signId * 30 + deg,
    note:
      typeof input.lagnaDegree === "number"
        ? undefined
        : "Lagna degree approximated at mid-sign (15°) — regenerate kundli for higher precision.",
  };
}
