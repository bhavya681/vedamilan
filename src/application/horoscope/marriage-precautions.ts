/**
 * Marriage precautions from stored D1 placements.
 * Reads houses and existing dosha/yoga tags. Does not recompute ephemeris.
 * Language is classical tendency + boundaries — never a verdict of affair or fate.
 */

import { HOUSE_LORDS, SIGNS } from "@/application/horoscope/vedic-constants";
import { horoscopeService } from "@/application/horoscope/horoscope.service";
import { NotFoundError } from "@/lib/utils/error-handler";

export type PrecautionTheme = "fidelity" | "delay" | "conflict" | "steady";
export type PrecautionSeverity = "note" | "awareness" | "emphasis";

export type PrecautionCard = {
  id: PrecautionTheme;
  title: string;
  classicalLabel: string;
  severity: PrecautionSeverity;
  summary: string;
  indicators: string[];
  precautions: string[];
  canAccept: string[];
  cannotAccept: string[];
};

export type MarriagePrecautions = {
  calculatedFromChart: true;
  overall: {
    tone: PrecautionSeverity;
    headline: string;
    body: string;
  };
  cards: PrecautionCard[];
  boundaries: {
    canAccept: string[];
    cannotAccept: string[];
  };
  disclaimer: string;
};

export type PrecautionPlanet = {
  planet: string;
  sign: string;
  house: number;
};

const MALEFICS = new Set(["Mars", "Saturn", "Rahu", "Ketu", "Sun"]);

function lordOfHouse(lagnaSign: string, house: number): string | null {
  const idx = SIGNS.indexOf(lagnaSign as (typeof SIGNS)[number]);
  if (idx < 0) return null;
  const sign = SIGNS[(idx + house - 1 + 12) % 12];
  if (!sign) return null;
  return HOUSE_LORDS[sign] ?? null;
}

function findPlanet(planets: PrecautionPlanet[], name: string) {
  return planets.find((row) => row.planet === name) ?? null;
}

function occupants(planets: PrecautionPlanet[], house: number) {
  return planets.filter((row) => row.house === house);
}

function sameHouse(a: PrecautionPlanet | null, b: PrecautionPlanet | null) {
  return Boolean(a && b && a.house === b.house);
}

function severityFromCount(count: number): PrecautionSeverity {
  if (count >= 4) return "emphasis";
  if (count >= 2) return "awareness";
  return "note";
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function analyzeMarriagePrecautions(input: {
  lagnaSign?: string | null;
  planets?: PrecautionPlanet[] | null;
  manglikStatus?: string | null;
  yogaCodes?: string[] | null;
  doshaCodes?: string[] | null;
}): MarriagePrecautions {
  const lagna = input.lagnaSign || "Aries";
  const planets = (input.planets || []).filter(
    (row) => row.planet && row.house >= 1 && row.house <= 12,
  );
  const seventhLord = lordOfHouse(lagna, 7);
  const sixthLord = lordOfHouse(lagna, 6);
  const eighthLord = lordOfHouse(lagna, 8);
  const venus = findPlanet(planets, "Venus");
  const mars = findPlanet(planets, "Mars");
  const saturn = findPlanet(planets, "Saturn");
  const rahu = findPlanet(planets, "Rahu");
  const ketu = findPlanet(planets, "Ketu");
  const moon = findPlanet(planets, "Moon");
  const seventhLordPlanet = seventhLord ? findPlanet(planets, seventhLord) : null;
  const house7 = occupants(planets, 7);
  const maleficsIn7 = house7.filter((row) => MALEFICS.has(row.planet));
  const manglik = input.manglikStatus === "MANGLIK" || input.manglikStatus === "PARTIAL";
  const kalaSarpa = (input.doshaCodes || []).includes("KALA_SARPA");
  const venusHarmony = (input.yogaCodes || []).includes("VENUS_HARMONY");

  const fidelityFlags: string[] = [];
  if (rahu && (rahu.house === 5 || rahu.house === 7)) {
    fidelityFlags.push(
      `Rahu in house ${rahu.house} — classical texts treat this as restlessness or unconventional desire, not a destined affair.`,
    );
  }
  if (sameHouse(venus, rahu) && venus) {
    fidelityFlags.push(
      `Venus and Rahu together in house ${venus.house} — Shukra–Rahu samyoga. Keep desire and secrecy from mixing.`,
    );
  }
  if (venus && venus.house === 12) {
    fidelityFlags.push("Venus in the 12th — private longing and hidden comfort-seeking.");
  }
  if (seventhLordPlanet?.house === 12) {
    fidelityFlags.push(
      "7th lord in the 12th — distance, privacy, or a life lived partly out of view.",
    );
  }
  if (sameHouse(venus, mars) && venus) {
    fidelityFlags.push(
      `Mars and Venus together in house ${venus.house} — heat in attraction; passion needs a container.`,
    );
  }
  if (rahu?.house === 1 && ketu?.house === 7) {
    fidelityFlags.push(
      "Rahu–Ketu on the 1–7 axis — identity and partnership pull in opposite directions.",
    );
  }
  if (ketu?.house === 1 && rahu?.house === 7) {
    fidelityFlags.push(
      "Rahu in the 7th from Ketu in the 1st — the partner theme can feel foreign or untested.",
    );
  }

  const delayFlags: string[] = [];
  if (manglik) {
    delayFlags.push(
      `Manglik status ${input.manglikStatus} — Kuja dosha. Read as heat and haste, not as a broken marriage.`,
    );
  }
  if (saturn && (saturn.house === 7 || saturn.house === 1)) {
    delayFlags.push(
      `Saturn in house ${saturn.house} — delay, duty, and a partner who needs time to feel safe.`,
    );
  }
  if (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house)) {
    delayFlags.push(
      `7th lord in house ${seventhLordPlanet.house} — classical dusthana placement. Extra care in matching and muhurta.`,
    );
  }
  if (ketu?.house === 7) {
    delayFlags.push("Ketu in the 7th — detachment or a delayed sense of “this is the one.”");
  }
  if (saturn && [2, 4].includes(saturn.house) && !delayFlags.length) {
    delayFlags.push(`Saturn in house ${saturn.house} — family process and timed alliance.`);
  }

  const conflictFlags: string[] = [];
  if (mars?.house === 7) {
    conflictFlags.push("Mars in the 7th — sharp speech and quick temper in close quarters.");
  }
  if (maleficsIn7.length >= 2) {
    conflictFlags.push(
      `More than one malefic in the 7th (${maleficsIn7.map((row) => row.planet).join(", ")}) — high-conflict weather.`,
    );
  }
  if (saturn?.house === 7 && mars) {
    conflictFlags.push(
      "Saturn on the alliance house with Mars active — cold plus heat; repair must be deliberate.",
    );
  }
  if (sixthLord && house7.some((row) => row.planet === sixthLord)) {
    conflictFlags.push(
      "6th lord occupies the 7th — dispute, debt, or rivalry can leak into marriage.",
    );
  }
  if (eighthLord && house7.some((row) => row.planet === eighthLord)) {
    conflictFlags.push(
      "8th lord occupies the 7th — intensity, control, and hidden power struggles.",
    );
  }
  if (moon && [6, 8].includes(moon.house)) {
    conflictFlags.push(
      `Moon in house ${moon.house} — emotional weather turns stormy under pressure.`,
    );
  }
  if (kalaSarpa) {
    conflictFlags.push(
      "Kaal Sarp present — transformative pressure; do not confuse intensity with intimacy.",
    );
  }

  const fidelity: PrecautionCard = {
    id: "fidelity",
    title: "Fidelity and restlessness",
    classicalLabel: "Rahu–Shukra / 5–7–12 themes",
    severity: severityFromCount(fidelityFlags.length),
    summary:
      fidelityFlags.length > 0
        ? "The chart shows restlessness around desire and privacy. That is a call for transparency — not a prediction of betrayal."
        : "No strong classical flags for hidden desire. Still treat honesty as a daily practice, not an assumption.",
    indicators: fidelityFlags,
    precautions: [
      "Name attraction early, before it becomes a secret.",
      "Do not use work travel, late nights, or private chats as a second life.",
      "If the marriage feels dull, repair it inside the marriage — curiosity is not a license to stray.",
      "Choose a partner who can talk about jealousy without humiliation.",
    ],
    canAccept: [
      "A partner with a full inner life and friends of every gender.",
      "Slow trust, and the need to earn it again after a rupture of honesty.",
      "Unconventional backgrounds if values and fidelity are explicit.",
    ],
    cannotAccept: [
      "Secret second relationships, emotional or physical.",
      "Contempt when you ask for clarity about time, money, or phones.",
      "A rule that “what they do not know will not hurt them.”",
    ],
  };

  const delay: PrecautionCard = {
    id: "delay",
    title: "Delay, mismatch, hard seasons",
    classicalLabel: "Kuja / Shani / dusthana 7th-lord themes",
    severity: severityFromCount(delayFlags.length),
    summary:
      delayFlags.length > 0
        ? "The chart leans toward later timing or a partner who does not match the first picture. Patience is a skill here, not a punishment."
        : "Timing looks ordinary. Still do not rush a match to satisfy family pressure or loneliness.",
    indicators: delayFlags,
    precautions: [
      "Confirm muhurta and family process; do not treat haste as romance.",
      "If Manglik, match with care and a counsellor — do not self-reject.",
      "Watch for “almost right” matches that need you to shrink.",
      "Give a courtship enough ordinary days: illness, money talk, and in-laws.",
    ],
    canAccept: [
      "A later marriage than peers if the person is kind and consistent.",
      "A partner from a different place or community if respect is mutual.",
      "Quiet love that grows after the wedding more than before it.",
    ],
    cannotAccept: [
      "Being rushed into a match to “fix” a dosha.",
      "A partner who isolates you from friends or work “for the family.”",
      "Chronic contempt dressed up as “this is just how marriage is.”",
    ],
  };

  const conflict: PrecautionCard = {
    id: "conflict",
    title: "Conflict and toxic weather",
    classicalLabel: "Malefics in 7 / 6–8 links",
    severity: severityFromCount(conflictFlags.length),
    summary:
      conflictFlags.length > 0
        ? "The chart can run hot or cold in close partnership. That is a warning to choose repair skills — and to leave cruelty."
        : "No stacked malefic load on the 7th. Still refuse humiliation; a calm chart does not make abuse impossible.",
    indicators: conflictFlags,
    precautions: [
      "Learn one repair script: pause, name the fact, ask for a redo.",
      "Do not argue when hungry, drunk, or in front of children as sport.",
      "If fights include threats, isolation, or hitting, leave the chart out of it and get help.",
      "Prefer a partner who can apologise without a counter-attack.",
    ],
    canAccept: [
      "Disagreement and raised voices that end in repair the same day.",
      "A partner who needs solitude after conflict, if they return.",
      "Family pressure that you face together, not against each other.",
    ],
    cannotAccept: [
      "Physical harm, sexual coercion, or financial control.",
      "Humiliation, silent treatment used as punishment, or tracking without consent.",
      "A demand that you abandon work, faith, or children to keep the peace.",
    ],
  };

  const supports: string[] = [];
  if (venusHarmony)
    supports.push("Venus harmony yoga is present — a softening factor for alliance.");
  if (findPlanet(planets, "Jupiter")?.house === 7) {
    supports.push("Jupiter in the 7th — counsel, dignity, and a preference for fair dealing.");
  }

  const cards = [fidelity, delay, conflict];
  const worst = cards.reduce<PrecautionSeverity>((max, card) => {
    const rank = { note: 0, awareness: 1, emphasis: 2 };
    return rank[card.severity] > rank[max] ? card.severity : max;
  }, "note");

  const headline =
    worst === "emphasis"
      ? "Your chart asks for firm boundaries in marriage."
      : worst === "awareness"
        ? "Your chart asks for awareness, not fear."
        : "Your chart is relatively quiet on marriage trouble — stay awake anyway.";

  const body =
    supports.length > 0
      ? `${supports.join(" ")} Use the cards below as a checklist, not a sentence.`
      : "These readings are tendencies from the stored Kundli. Character, muhurta, and how you treat each other still decide the house.";

  const steady: PrecautionCard = {
    id: "steady",
    title: "What a good marriage still requires",
    classicalLabel: "Desh–kaal–patra · character over yoga",
    severity: "note",
    summary:
      "Even a clean 7th house does not replace consent, money talk, and kindness. Yogas describe weather. You still steer.",
    indicators: supports,
    precautions: [
      "Discuss children, money, care of parents, and faith before you lock a date.",
      "Watch how they treat service staff and their own mother or father.",
      "Keep one trusted friend who can tell you if the match is shrinking you.",
    ],
    canAccept: [
      "Imperfection, difference, and a partner who is still becoming.",
      "Love that is loyal more than theatrical.",
    ],
    cannotAccept: [
      "A future that requires you to disappear.",
      "Any yoga used as an excuse for harm.",
    ],
  };

  return {
    calculatedFromChart: true,
    overall: { tone: worst, headline, body },
    cards: [...cards, steady],
    boundaries: {
      canAccept: unique(cards.flatMap((card) => card.canAccept)).slice(0, 8),
      cannotAccept: unique(cards.flatMap((card) => card.cannotAccept)).slice(0, 8),
    },
    disclaimer:
      "Classical yogas describe tendencies, not destiny. This page does not predict an extra-marital affair, a toxic marriage, or a failed one. If you are unsafe, seek help in the world — not another chart.",
  };
}

export class MarriagePrecautionsService {
  async forUser(userId: string): Promise<MarriagePrecautions> {
    const latest = await horoscopeService.getLatest(userId);
    if (!latest?.horoscope) throw new NotFoundError("Generate kundli first");
    const chart = latest.horoscope;
    const planets = (chart.planets ?? []).map((row) => ({
      planet: String(row.planet || ""),
      sign: String(row.sign || ""),
      house: Number(row.house) || 0,
    }));
    return analyzeMarriagePrecautions({
      lagnaSign: chart.lagnaSign,
      planets,
      manglikStatus: chart.manglikStatus,
      yogaCodes: (chart.yogas ?? []).map((yoga) => String(yoga.code || "")),
      doshaCodes: (chart.doshas ?? [])
        .filter((dosha) => dosha.present)
        .map((dosha) => String(dosha.code || "")),
    });
  }
}

export const marriagePrecautionsService = new MarriagePrecautionsService();
