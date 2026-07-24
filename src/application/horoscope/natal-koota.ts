import { NAKSHATRAS, SIGNS } from "@/application/horoscope/vedic-constants";
import { yoniAnimalForNakshatra, type YoniAnimal } from "@/application/rules/ashta-koota";

const VARNA_LABELS = ["Brahmin", "Kshatriya", "Vaishya", "Shudra"] as const;
const GANA_LABELS = ["Deva", "Manushya", "Rakshasa"] as const;
const NADI_LABELS = ["Adi", "Madhya", "Antya"] as const;

const MOON_LORDS = [
  "Mars",
  "Venus",
  "Mercury",
  "Moon",
  "Sun",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Saturn",
  "Jupiter",
] as const;

function signIndex(sign: string) {
  const idx = SIGNS.indexOf(sign as (typeof SIGNS)[number]);
  return idx >= 0 ? idx : 0;
}

function nakIndex(name: string) {
  const idx = NAKSHATRAS.indexOf(name as (typeof NAKSHATRAS)[number]);
  return idx >= 0 ? idx : 0;
}

export type NatalKootaProfile = {
  moonSign: string;
  nakshatra: string;
  varna: { label: string; note: string };
  gana: { label: string; note: string };
  nadi: { label: string; note: string };
  yoni: YoniAnimal & { note: string };
  moonLord: { planet: string; note: string };
  /** Relative kootas need a partner — shown as informational only */
  partnerRelative: Array<{ koota: string; note: string }>;
};

/**
 * Single-person Ashta-Koota style attributes derived from Moon sign + Moon nakshatra.
 * Pair scoring remains in scoreAshtaKoota — this is the natal profile most apps show.
 */
export function natalKootaFromMoon(input: {
  moonSign: string;
  nakshatra: string;
}): NatalKootaProfile {
  const s = signIndex(input.moonSign);
  const n = nakIndex(input.nakshatra);
  const varna = VARNA_LABELS[s % 4] ?? "Brahmin";
  const gana = GANA_LABELS[n % 3] ?? "Deva";
  const nadi = NADI_LABELS[n % 3] ?? "Adi";
  const yoni = yoniAnimalForNakshatra(input.nakshatra);
  const moonLord = MOON_LORDS[s] ?? "Mars";

  return {
    moonSign: input.moonSign,
    nakshatra: input.nakshatra,
    varna: {
      label: varna,
      note: "Spiritual / social temperament class from Moon sign — used in Varna koota when matching.",
    },
    gana: {
      label: gana,
      note:
        gana === "Deva"
          ? "Devic temperament — harmony-seeking, refined emotional style."
          : gana === "Manushya"
            ? "Human temperament — balanced, practical emotional style."
            : "Rakshasa temperament — intense, protective, strong will.",
    },
    nadi: {
      label: nadi,
      note: "Ayurvedic pulse class from Moon nakshatra — Nadi koota compares partners (same Nadi is sensitive).",
    },
    yoni: {
      ...yoni,
      note: "Instinctive / intimacy nature from Moon nakshatra — Yoni koota compares animal harmony.",
    },
    moonLord: {
      planet: moonLord,
      note: "Lord of the Moon sign — Graha Maitri compares friendship between the two Moon lords.",
    },
    partnerRelative: [
      {
        koota: "Vashya",
        note: "Mutual influence between Moon signs — calculated only when both charts are compared.",
      },
      {
        koota: "Tara",
        note: "Nakshatra count from one Moon to the other — pair-relative auspiciousness.",
      },
      {
        koota: "Bhakoot",
        note: "Moon-sign distance harmony — pair-relative; certain distances are sensitive.",
      },
      {
        koota: "Graha Maitri",
        note: `Your Moon lord is ${moonLord}. Friendship score needs the partner's Moon lord.`,
      },
    ],
  };
}
