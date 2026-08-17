import { Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { NotFoundError } from "@/lib/utils/error-handler";
import {
  computeCharaKarakas,
  type CharaKarakaOptions,
  type CharaKarakaResult,
  type KarakaPlanetInput,
} from "./chara-karaka";
import {
  interpretAmatyakaraka,
  interpretAtmakaraka,
  interpretDarakaraka,
  interpretKaraka,
  karakaRelationshipMap,
  type AmatyaCareer,
  type DaraPartnership,
  type KarakaMapEdge,
  type KarakaProfile,
  type KarakamshaSnapshot,
} from "./jaimini-interpreter";

export type JaiminiLab = {
  calculatedFromChart: true;
  karakas: CharaKarakaResult;
  profiles: KarakaProfile[];
  atmakaraka: { profile: KarakaProfile | null; karakamsha: KarakamshaSnapshot };
  amatyakaraka: AmatyaCareer | null;
  darakaraka: DaraPartnership | null;
  map: KarakaMapEdge[];
  lagnaSign: string;
};

type StoredPlanet = KarakaPlanetInput & { nakshatra?: string };

function asPlanets(raw: unknown): StoredPlanet[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((p) => ({
    planet: String(p.planet ?? ""),
    sign: String(p.sign ?? ""),
    house: Number(p.house ?? 0),
    longitude: Number(p.longitude),
    isRetrograde: Boolean(p.isRetrograde),
    dignity: p.dignity ?? null,
    nakshatra: p.nakshatra ? String(p.nakshatra) : undefined,
  }));
}

export class JaiminiKarakaService {
  async forUser(userId: string, options: CharaKarakaOptions = {}): Promise<JaiminiLab> {
    await connectMongo();
    const chart = await Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean();
    if (!chart) throw new NotFoundError("Generate kundli first");

    const planets = asPlanets(chart.planets);
    if (!planets.some((p) => Number.isFinite(p.longitude))) {
      throw new NotFoundError("This kundli has no exact longitudes — regenerate kundli");
    }

    const lagnaSign = String(chart.lagnaSign || "Aries");
    const shadbala = chart.shadbala as { lagnaLongitude?: number } | null | undefined;
    const lagna = {
      lagnaSign,
      lagnaDegree: typeof chart.lagnaDegree === "number" ? chart.lagnaDegree : null,
      lagnaLongitude: typeof shadbala?.lagnaLongitude === "number" ? shadbala.lagnaLongitude : null,
    };

    const karakas = computeCharaKarakas(planets, options);
    return {
      calculatedFromChart: true,
      karakas,
      profiles: karakas.rows.map((row) => interpretKaraka(row)),
      atmakaraka: interpretAtmakaraka(karakas, planets, lagna),
      amatyakaraka: interpretAmatyakaraka(karakas),
      darakaraka: interpretDarakaraka(karakas, planets, lagnaSign, lagna),
      map: karakaRelationshipMap(karakas),
      lagnaSign,
    };
  }

  async compareKarakas(
    userId: string,
    partnerUserId: string,
    options: CharaKarakaOptions = {},
  ): Promise<{
    user: CharaKarakaResult;
    partner: CharaKarakaResult;
    signals: string[];
  }> {
    await connectMongo();
    const [userChart, partnerChart] = await Promise.all([
      Horoscope.findOne({ userId }).sort({ calculatedAt: -1 }).lean(),
      Horoscope.findOne({ userId: partnerUserId }).sort({ calculatedAt: -1 }).lean(),
    ]);
    if (!userChart) throw new NotFoundError("Generate kundli first");
    if (!partnerChart) throw new NotFoundError("Partner kundli not found");

    const user = computeCharaKarakas(asPlanets(userChart.planets), options);
    const partner = computeCharaKarakas(asPlanets(partnerChart.planets), options);
    const signals: string[] = [];

    const uAk = user.byCode.AK;
    const pAk = partner.byCode.AK;
    const uDk = user.byCode.DK;
    const pDk = partner.byCode.DK;
    if (uAk && pAk && uAk.planet === pAk.planet) {
      signals.push(`Both charts share Atmakaraka ${uAk.planet} — similar core-life significator.`);
    }
    if (uDk && pAk && uDk.planet === pAk.planet) {
      signals.push(
        `Your Darakaraka is the partner's Atmakaraka (${uDk.planet}) — traditionally read as a strong Jaimini partnership echo.`,
      );
    }
    if (pDk && uAk && pDk.planet === uAk.planet) {
      signals.push(
        `Partner's Darakaraka is your Atmakaraka (${uAk.planet}) — a reciprocal Jaimini echo.`,
      );
    }
    if (uDk && pDk && uDk.planet === pDk.planet) {
      signals.push(`Both charts share Darakaraka ${uDk.planet}.`);
    }
    if (uAk && pAk && uAk.sign === pAk.sign) {
      signals.push(`Atmakarakas occupy the same sign (${uAk.sign}).`);
    }
    if (!signals.length) {
      signals.push(
        "No overlapping AK/DK planet or sign in this pair under the selected convention. This does not imply incompatibility — Parashari and Ashta Koota remain the primary matching layer.",
      );
    }

    return { user, partner, signals };
  }
}

export const jaiminiKarakaService = new JaiminiKarakaService();
