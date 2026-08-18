import { BirthDetails, Dasha, Horoscope, Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { NotFoundError } from "@/lib/utils/error-handler";
import { SIGNS } from "@/application/horoscope/vedic-constants";
import { longitudeToNavamsaSign } from "@/application/horoscope/navamsa";
import { buildNavamsaChart, navamsaPlanet } from "@/application/horoscope/navamsa-chart";
import { seventhLord } from "@/application/rules/shukra-milan";
import { computeGocharForUser } from "@/application/horoscope/gochar.service";
import { computeCharaKarakas } from "@/application/horoscope/jaimini/chara-karaka";
import { interpretDarakaraka } from "@/application/horoscope/jaimini/jaimini-interpreter";
import { detectBnnPatterns, matchBnnThemes } from "@/application/horoscope/bnn/bnn-patterns";
import {
  applyDeshKaalPatra,
  inferCountryFromPlace,
} from "@/application/horoscope/marriage-desh-kaal";
import type { MarriageDeshKaalRead } from "@/application/horoscope/marriage-desh-kaal";
import { buildDeshKaalPatra } from "@/application/rules/life-events-calendar";
import { predictSelfTiming } from "@/application/rules/timing-prediction";

export type MarriageIntelSection = {
  id: string;
  title: string;
  points: string[];
  calculation: string[];
};

export type MarriageIntelWindow = {
  label: string;
  range: string;
  role: string;
  startDate?: string;
  endDate?: string;
  dashaRange?: string;
  ageYears?: number | null;
  likelihood?: "likely" | "possible" | "not-yet" | "later" | "already-settled";
  note?: string;
};

export type MarriageIntelligence = {
  calculatedFromChart: true;
  sections: MarriageIntelSection[];
  agreements: string[];
  differences: string[];
  synthesis: string;
  windows: MarriageIntelWindow[];
  deshKaal: MarriageDeshKaalRead;
};

type Planet = {
  planet: string;
  sign: string;
  house: number;
  longitude?: number;
  dignity?: string | null;
};

export type StoredDashaPeriod = {
  lord: string;
  startDate: Date | string;
  endDate: Date | string;
  level: string;
  parentLord?: string | null;
};

function asDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function fmtMonthYear(date: Date) {
  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function fmtRange(start: Date, end: Date) {
  return `${fmtMonthYear(start)} – ${fmtMonthYear(end)}`;
}

function covers(period: StoredDashaPeriod, now: Date) {
  return asDate(period.startDate) <= now && asDate(period.endDate) > now;
}

function partnershipLords(seventhLord: string, darakaraka: string | null) {
  return new Set(
    [seventhLord, "Venus", "Jupiter", darakaraka].filter((n): n is string => Boolean(n)),
  );
}

function partnershipRole(lord: string, seventhLordName: string, darakaraka: string | null) {
  if (lord === seventhLordName) return "7th-lord";
  if (darakaraka && lord === darakaraka) return "Darakaraka";
  if (lord === "Venus") return "Venus";
  if (lord === "Jupiter") return "Jupiter";
  return null;
}

/** Dated Vimshottari partnership windows only — never a wedding-day claim. */
export function partnershipDashaWindows(input: {
  periods: StoredDashaPeriod[];
  currentMaha: string | null;
  currentAntar: string | null;
  seventhLord: string;
  darakaraka: string | null;
  now?: Date;
}): { points: string[]; windows: MarriageIntelWindow[]; calculation: string[] } {
  const now = input.now ?? new Date();
  const relevant = partnershipLords(input.seventhLord, input.darakaraka);
  const emptyCalc = [
    `Maha = ${input.currentMaha ?? "—"}`,
    `Antar = ${input.currentAntar ?? "—"}`,
    "Dated periods = 0",
  ];
  const periods = input.periods.filter((p) => {
    const start = asDate(p.startDate);
    const end = asDate(p.endDate);
    return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime());
  });
  if (!periods.length) {
    return { points: [], windows: [], calculation: emptyCalc };
  }

  const maha = periods.filter((p) => p.level === "MAHA");
  const antar = periods.filter((p) => p.level === "ANTAR");
  const currentMaha =
    maha.find((p) => covers(p, now) && (!input.currentMaha || p.lord === input.currentMaha)) ??
    maha.find((p) => covers(p, now));
  const currentAntar =
    antar.find((p) => covers(p, now) && (!input.currentAntar || p.lord === input.currentAntar)) ??
    antar.find((p) => covers(p, now));

  const drafts: Array<MarriageIntelWindow & { start: number }> = [];
  const seen = new Set<string>();

  const pushWindow = (label: string, start: Date, end: Date, role: string) => {
    if (seen.has(label)) return;
    seen.add(label);
    drafts.push({
      label,
      range: fmtRange(start, end),
      role,
      start: start.getTime(),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
  };

  if (currentMaha) {
    const role = relevant.has(currentMaha.lord)
      ? `Current ${partnershipRole(currentMaha.lord, input.seventhLord, input.darakaraka) ?? "partnership"} Mahadasha`
      : "Current Mahadasha";
    pushWindow(
      `${currentMaha.lord} Mahadasha`,
      asDate(currentMaha.startDate),
      asDate(currentMaha.endDate),
      role,
    );
  }

  if (currentAntar) {
    const parent = currentAntar.parentLord || currentMaha?.lord || "—";
    const antarLordRelevant = relevant.has(currentAntar.lord);
    const antarParentRelevant = relevant.has(parent);
    const why = antarLordRelevant
      ? partnershipRole(currentAntar.lord, input.seventhLord, input.darakaraka)
      : antarParentRelevant
        ? partnershipRole(parent, input.seventhLord, input.darakaraka)
        : null;
    pushWindow(
      `${parent}–${currentAntar.lord} Antardasha`,
      asDate(currentAntar.startDate),
      asDate(currentAntar.endDate),
      why ? `Current ${why} Antardasha` : "Current Antardasha",
    );
  }

  for (const period of maha) {
    if (!relevant.has(period.lord)) continue;
    if (asDate(period.endDate) <= now) continue;
    const role = partnershipRole(period.lord, input.seventhLord, input.darakaraka);
    const isCurrent = currentMaha?.lord === period.lord && covers(period, now);
    pushWindow(
      `${period.lord} Mahadasha`,
      asDate(period.startDate),
      asDate(period.endDate),
      `${isCurrent ? "Current" : "Upcoming"} ${role} Mahadasha`,
    );
  }

  drafts.sort((a, b) => a.start - b.start);
  const windows = drafts.map(({ start: _start, ...rest }) => rest);
  const points = windows.map((w) => `${w.role}: ${w.label} · ${w.range}.`);
  if (windows.length) {
    points.push(
      "These dates are Vimshottari periods from the natal Moon. They mark when partnership karma is classically read — not a wedding day.",
    );
  }

  return {
    points,
    windows,
    calculation: [
      `Maha = ${input.currentMaha ?? currentMaha?.lord ?? "—"}`,
      `Antar = ${input.currentAntar ?? currentAntar?.lord ?? "—"}`,
      `Dated periods = ${periods.length}`,
      `Partnership windows = ${windows.length}`,
    ],
  };
}

function asPlanets(raw: unknown): Planet[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((p) => ({
    planet: String(p.planet ?? ""),
    sign: String(p.sign ?? ""),
    house: Number(p.house ?? 0),
    longitude: typeof p.longitude === "number" ? p.longitude : undefined,
    dignity: p.dignity ?? null,
  }));
}

export class MarriageIntelligenceService {
  async forUser(userId: string): Promise<MarriageIntelligence> {
    await connectMongo();
    const [chart, dasha, birth, profileActive, profileAny] = await Promise.all([
      Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      BirthDetails.findOne({ userId }).sort({ updatedAt: -1 }).lean(),
      Profile.findOne({ userId, status: "ACTIVE" }).lean(),
      Profile.findOne({ userId }).lean(),
    ]);
    if (!chart) throw new NotFoundError("Generate kundli first");
    const profile = profileActive || profileAny;

    const planets = asPlanets(chart.planets);
    const lagnaSign = String(chart.lagnaSign || "Aries");
    const shadbala = chart.shadbala as { lagnaLongitude?: number } | null | undefined;
    const lagnaLongitude =
      typeof shadbala?.lagnaLongitude === "number" ? shadbala.lagnaLongitude : null;
    const lagnaDegree = typeof chart.lagnaDegree === "number" ? chart.lagnaDegree : null;
    const seventhSign =
      SIGNS[(SIGNS.indexOf(lagnaSign as (typeof SIGNS)[number]) + 6) % 12] ?? "Libra";
    const lord7 = seventhLord(lagnaSign);
    const lord7Planet = planets.find((p) => p.planet === lord7);
    const venus = planets.find((p) => p.planet === "Venus");
    const jupiter = planets.find((p) => p.planet === "Jupiter");
    const occupants7 = planets.filter((p) => p.house === 7);

    const karakas = computeCharaKarakas(
      planets.filter((p) => typeof p.longitude === "number") as Array<
        Planet & { longitude: number }
      >,
    );
    const dk = interpretDarakaraka(karakas, planets, lagnaSign, { lagnaDegree, lagnaLongitude });

    const withLong = planets.filter((p) => typeof p.longitude === "number") as Array<
      Planet & { longitude: number }
    >;
    const d9 = withLong.length
      ? buildNavamsaChart({
          planets: withLong,
          lagnaSign,
          lagnaDegree,
          lagnaLongitude,
        })
      : null;
    const venusD9 = d9 ? navamsaPlanet(d9, "Venus") : null;
    const dkD9 = dk ? longitudeToNavamsaSign(dk.row.longitude) : null;

    let transit7: string | null = null;
    let gocharSnap: Awaited<ReturnType<typeof computeGocharForUser>> | null = null;
    try {
      gocharSnap = await computeGocharForUser(userId);
      const hits = (gocharSnap.planets || []).filter(
        (p) =>
          ["Jupiter", "Saturn", "Venus"].includes(p.planet) &&
          (p.houseFromNatalLagna === 7 || p.sign === seventhSign),
      );
      transit7 = hits.length
        ? hits
            .map(
              (p) =>
                `Transit ${p.planet} in ${p.sign} (house ${p.houseFromNatalLagna} from natal lagna)`,
            )
            .join("; ")
        : "No current Jupiter, Saturn, or Venus transit in the natal 7th sign/house.";
    } catch {
      transit7 = "Gochar unavailable.";
    }

    let bnnHits: ReturnType<typeof matchBnnThemes> = [];
    try {
      bnnHits = matchBnnThemes(detectBnnPatterns(planets), planets, lagnaSign).filter(
        (h) => h.theme === "relationships",
      );
    } catch {
      bnnHits = [];
    }

    const parashari: MarriageIntelSection = {
      id: "parashari",
      title: "Parashari indicators",
      points: [
        `7th house is ${seventhSign}, lord ${lord7}${lord7Planet ? ` in ${lord7Planet.sign} (house ${lord7Planet.house})` : ""}.`,
        occupants7.length
          ? `Occupants of the 7th: ${occupants7.map((p) => p.planet).join(", ")}.`
          : "No graha occupies the 7th house in this D1.",
        venus
          ? `Venus in ${venus.sign}, house ${venus.house}${venus.dignity ? ` (${venus.dignity})` : ""}.`
          : "Venus placement missing.",
        jupiter
          ? `Jupiter in ${jupiter.sign}, house ${jupiter.house}.`
          : "Jupiter placement missing.",
      ],
      calculation: [`Lagna = ${lagnaSign}`, `7th sign = ${seventhSign}`, `7th lord = ${lord7}`],
    };

    const jaimini: MarriageIntelSection = {
      id: "jaimini",
      title: "Jaimini indicators",
      points: karakas.byCode.AK
        ? [
            `Convention: ${karakas.conventionLabel}.`,
            `Atmakaraka ${karakas.byCode.AK.planet} in ${karakas.byCode.AK.sign}.`,
            karakas.byCode.DK
              ? `Darakaraka ${karakas.byCode.DK.planet} in ${karakas.byCode.DK.sign}, house ${karakas.byCode.DK.house}.`
              : "Darakaraka unavailable.",
          ]
        : ["Jaimini karakas could not be computed — regenerate kundli."],
      calculation: karakas.rows.map(
        (r) => `${r.abbreviation} = ${r.planet} ${r.degree.formatted} ${r.sign}`,
      ),
    };

    const dara: MarriageIntelSection = {
      id: "darakaraka",
      title: "Darakaraka",
      points: dk
        ? [dk.partnerArchetype, dk.disclaimer, ...dk.strengths.slice(0, 2)]
        : ["Darakaraka not available."],
      calculation: dk
        ? [
            `DK = ${dk.row.planet}`,
            `Degree = ${dk.row.degree.formatted}`,
            `Sign = ${dk.row.sign}`,
            `House = ${dk.row.house}`,
            `Convention = ${karakas.conventionLabel}`,
          ]
        : [],
    };

    const navamsa: MarriageIntelSection = {
      id: "navamsa",
      title: "Navamsa (D9)",
      points: d9
        ? [
            `D9 lagna ${d9.lagnaSign}.`,
            venusD9
              ? `Venus in D9: ${venusD9.sign}, house ${venusD9.house}.`
              : "Venus D9 not computed.",
            dkD9 ? `Darakaraka's D9 sign: ${dkD9.sign}.` : "DK D9 not computed.",
          ]
        : ["Navamsa needs exact longitudes — regenerate kundli."],
      calculation: d9 ? [`D9 lagna = ${d9.lagnaSign}`, ...d9.notes] : [],
    };

    const periods = Array.isArray(dasha?.periods) ? (dasha.periods as StoredDashaPeriod[]) : [];
    const dashaRead = partnershipDashaWindows({
      periods,
      currentMaha: dasha?.currentMaha ?? null,
      currentAntar: dasha?.currentAntar ?? null,
      seventhLord: lord7,
      darakaraka: dk?.row.planet ?? null,
    });

    let timingWindows: Array<MarriageIntelWindow & { startDate: string; endDate: string }> = [];
    try {
      const timing = predictSelfTiming({
        periods,
        gocharPlanets: gocharSnap?.planets,
        gocharHighlights: gocharSnap?.highlights,
        manglikStatus: chart.manglikStatus || "UNKNOWN",
        seventhLord: lord7,
        currentMaha: dasha?.currentMaha || null,
        currentAntar: dasha?.currentAntar || null,
        birthDate: birth?.birthDate || profile?.dateOfBirth || null,
      });
      timingWindows = (timing.bestMarriageWindows || [])
        .filter((w) => w.startDate && w.endDate)
        .map((w) => ({
          label: w.dashaLabel || w.label,
          range: w.window,
          role: w.label,
          startDate: w.startDate as string,
          endDate: w.endDate as string,
        }));
    } catch {
      timingWindows = [];
    }

    const seenKeys = new Set<string>();
    const datedWindows: Array<MarriageIntelWindow & { startDate: string; endDate: string }> = [];
    for (const w of [...dashaRead.windows, ...timingWindows]) {
      if (!w.startDate || !w.endDate) continue;
      const key = `${w.label}|${w.startDate}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      datedWindows.push({
        label: w.label,
        range: w.range,
        role: w.role,
        startDate: w.startDate,
        endDate: w.endDate,
      });
    }

    const birthDate = birth?.birthDate || profile?.dateOfBirth || null;
    const city = birth?.placeName || profile?.city || null;
    const country = inferCountryFromPlace(profile?.country, birth?.placeName || profile?.city);
    const pillars = buildDeshKaalPatra({
      birthDate,
      city,
      country,
    });

    const deshKaal = applyDeshKaalPatra({
      windows: datedWindows,
      birthDate,
      city,
      country,
      maritalStatus: profile?.maritalStatus || null,
      gender: profile?.gender || null,
    });
    deshKaal.placeNote = pillars.placeNote;
    deshKaal.timeNote = pillars.timeNote;
    deshKaal.vesselNote = pillars.vesselNote;

    const transit: MarriageIntelSection = {
      id: "transit",
      title: "Transit",
      points: [transit7 || "Transit snapshot unavailable."],
      calculation: ["Gochar vs natal 7th sign/house for Jupiter, Saturn, Venus only."],
    };

    const bnn: MarriageIntelSection = {
      id: "bnn",
      title: "BNN patterns",
      points: bnnHits.length
        ? bnnHits.flatMap((h) => h.patterns.map((p) => p.evidence))
        : [
            "No documented BNN relationship pattern matched. Advanced Nadi combinations are not invented.",
          ],
      calculation: bnnHits.flatMap((h) => h.patterns.map((p) => `${p.kind}: ${p.id}`)),
    };

    const agreements: string[] = [];
    const differences: string[] = [];
    if (dk?.seventhHouse.dkInSeventh && occupants7.some((p) => p.planet === dk.row.planet)) {
      agreements.push(
        "Darakaraka occupies the Parashari 7th — Jaimini and Parashari point at the same house.",
      );
    }
    if (dk?.seventhHouse.dkIsSeventhLord) {
      agreements.push(
        "Darakaraka is also the 7th lord — Jaimini DK and Parashari 7th lord coincide.",
      );
    }
    if (dk && dasha?.currentMaha === dk.row.planet && dasha.currentMaha === lord7) {
      agreements.push("Current Mahadasha is both 7th lord and Darakaraka.");
    }
    if (dk && venus && dk.row.planet !== "Venus" && venus.house !== 7 && dk.row.house !== 7) {
      differences.push(
        "Venus, DK, and the 7th house do not share a single planet/house — systems describe partnership from different angles. Treat that as complementary, not contradictory.",
      );
    }
    if (!agreements.length) {
      agreements.push(
        "No exact overlap between DK, 7th lord, and current dasha. Multiple systems are describing the same life area from different rules.",
      );
    }

    const synthesis = `Marriage Intelligence combines Desh–Kaal–Patra (${deshKaal.placeLabel}, age ${deshKaal.ageYears ?? "unknown"}) with Parashari, Jaimini, Navamsa, Vimshottari dasha, gochar, and BNN. Dasha dates mark partnership seasons; country and age decide whether marriage is practical in that season. No layer names a wedding day.`;

    const overall: MarriageIntelSection = {
      id: "synthesis",
      title: "Overall synthesis",
      points: [synthesis, ...agreements.slice(0, 3), ...differences.slice(0, 2)],
      calculation: [
        "Layers compared: Desh–Kaal–Patra, Parashari, Jaimini, DK, D9, dasha, transit, BNN.",
        "No layer is allowed to determine a wedding day.",
      ],
    };

    return {
      calculatedFromChart: true,
      sections: [parashari, jaimini, dara, navamsa, transit, bnn, overall],
      agreements,
      differences,
      synthesis,
      windows: deshKaal.windows,
      deshKaal,
    };
  }
}

export const marriageIntelligenceService = new MarriageIntelligenceService();
