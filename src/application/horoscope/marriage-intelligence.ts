import { Dasha, Horoscope } from "@/infrastructure/database/models";
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

export type MarriageIntelSection = {
  id: string;
  title: string;
  points: string[];
  calculation: string[];
};

export type MarriageIntelligence = {
  calculatedFromChart: true;
  sections: MarriageIntelSection[];
  agreements: string[];
  differences: string[];
  synthesis: string;
};

type Planet = {
  planet: string;
  sign: string;
  house: number;
  longitude?: number;
  dignity?: string | null;
};

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
    const [chart, dasha] = await Promise.all([
      Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      Dasha.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
    ]);
    if (!chart) throw new NotFoundError("Generate kundli first");

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
    try {
      const gochar = await computeGocharForUser(userId);
      const hits = (gochar.planets || []).filter(
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

    const bnnHits = matchBnnThemes(detectBnnPatterns(planets), planets, lagnaSign).filter(
      (h) => h.theme === "relationships",
    );

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

    const dashaSection: MarriageIntelSection = {
      id: "dasha",
      title: "Dasha",
      points: [
        dasha?.currentMaha
          ? `Current Mahadasha ${dasha.currentMaha}${dasha.currentAntar ? `, Antardasha ${dasha.currentAntar}` : ""}.`
          : "Vimshottari dasha not stored — generate kundli.",
        lord7 && dasha?.currentMaha === lord7
          ? "Current Mahadasha is the 7th lord — partnership themes may be more noticeable in this period."
          : "Current Mahadasha is not the 7th lord.",
        venus && dasha?.currentMaha === "Venus"
          ? "Venus Mahadasha is traditionally associated with relationship emphasis."
          : "Venus is not the current Mahadasha lord.",
        dk && dasha?.currentMaha === dk.row.planet
          ? `Current Mahadasha is the Darakaraka (${dk.row.planet}).`
          : "Current Mahadasha is not the Darakaraka.",
      ],
      calculation: [`Maha = ${dasha?.currentMaha ?? "—"}`, `Antar = ${dasha?.currentAntar ?? "—"}`],
    };

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

    const synthesis = `Marriage Intelligence combines Parashari (7th house / 7th lord / Venus / Jupiter), Jaimini (AK / DK), Navamsa, Vimshottari dasha, gochar, and BNN relationship patterns. No single layer decides marriage. Where systems agree, confidence in that theme is higher; where they differ, read each on its own terms.`;

    const overall: MarriageIntelSection = {
      id: "synthesis",
      title: "Overall synthesis",
      points: [synthesis, ...agreements.slice(0, 3), ...differences.slice(0, 2)],
      calculation: [
        "Layers compared: Parashari, Jaimini, DK, D9, dasha, transit, BNN.",
        "No layer is allowed to determine marriage alone.",
      ],
    };

    return {
      calculatedFromChart: true,
      sections: [parashari, jaimini, dara, navamsa, dashaSection, transit, bnn, overall],
      agreements,
      differences,
      synthesis,
    };
  }
}

export const marriageIntelligenceService = new MarriageIntelligenceService();
