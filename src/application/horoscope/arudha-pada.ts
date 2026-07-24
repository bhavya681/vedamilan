import { HOUSE_LORDS, SIGNS } from "@/application/horoscope/vedic-constants";

/**
 * Classical Arudha Pada: count as many signs from the house as the lord is from the house.
 * Special: if lord is in the house or 7th from it, Arudha is 10th from the house (Jaimini convention used here).
 */
export function arudhaPadaSign(houseSign: string, lordSign: string): string {
  const h = SIGNS.indexOf(houseSign as (typeof SIGNS)[number]);
  const l = SIGNS.indexOf(lordSign as (typeof SIGNS)[number]);
  if (h < 0 || l < 0) return houseSign;
  const offset = (l - h + 12) % 12;
  // Lord in same or 7th → Arudha in 10th from house
  if (offset === 0 || offset === 6) {
    return SIGNS[(h + 9) % 12] ?? houseSign;
  }
  return SIGNS[(h + offset) % 12] ?? houseSign;
}

export function signOfHouseFromLagna(lagnaSign: string, house: number): string {
  const i = SIGNS.indexOf(lagnaSign as (typeof SIGNS)[number]);
  const base = i >= 0 ? i : 0;
  return SIGNS[(base + house - 1) % 12] ?? "Aries";
}

export function lordOfSign(sign: string): string {
  return HOUSE_LORDS[sign as (typeof SIGNS)[number]] ?? "Mars";
}

export type ArudhaMap = {
  arudhaLagna: string;
  arudhaSeventh: string;
  lagnaSign: string;
  seventhSign: string;
  lagnaLordSign: string | null;
  seventhLordSign: string | null;
};

export function computeArudhaMap(input: {
  lagnaSign: string;
  planets: Array<{ planet: string; sign: string }>;
}): ArudhaMap {
  const lagnaSign = input.lagnaSign;
  const seventhSign = signOfHouseFromLagna(lagnaSign, 7);
  const lagnaLord = lordOfSign(lagnaSign);
  const seventhLord = lordOfSign(seventhSign);
  const lagnaLordSign = input.planets.find((p) => p.planet === lagnaLord)?.sign || null;
  const seventhLordSign = input.planets.find((p) => p.planet === seventhLord)?.sign || null;

  return {
    lagnaSign,
    seventhSign,
    lagnaLordSign,
    seventhLordSign,
    arudhaLagna: lagnaLordSign ? arudhaPadaSign(lagnaSign, lagnaLordSign) : lagnaSign,
    arudhaSeventh: seventhLordSign ? arudhaPadaSign(seventhSign, seventhLordSign) : seventhSign,
  };
}

/** Relative house of B from A (1 = conjunction). */
export function relativeHouseBetween(fromSign: string, toSign: string): number {
  const a = SIGNS.indexOf(fromSign as (typeof SIGNS)[number]);
  const b = SIGNS.indexOf(toSign as (typeof SIGNS)[number]);
  if (a < 0 || b < 0) return 1;
  return ((b - a + 12) % 12) + 1;
}

export type ArudhaAxisClass = "supportive" | "challenging" | "neutral";

export function classifyArudhaAxis(
  fromAl: string,
  toA7: string,
): {
  relativeHouse: number;
  classification: ArudhaAxisClass;
  label: string;
} {
  const h = relativeHouseBetween(fromAl, toA7);
  // 1/7, 4/10, 3/11, 5/9 supportive; 2/12, 6/8 challenging
  if ([1, 7, 4, 10, 3, 11, 5, 9].includes(h)) {
    return {
      relativeHouse: h,
      classification: "supportive",
      label: `${h}th from Arudha Lagna — potentially supportive perception dynamic`,
    };
  }
  if ([2, 12, 6, 8].includes(h)) {
    return {
      relativeHouse: h,
      classification: "challenging",
      label: `${h}th from Arudha Lagna — potentially challenging perception dynamic`,
    };
  }
  return {
    relativeHouse: h,
    classification: "neutral",
    label: `${h}th from Arudha Lagna — mixed perception dynamic`,
  };
}
