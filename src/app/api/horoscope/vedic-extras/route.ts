import { requireSession } from "@/lib/auth/session";
import { horoscopeService } from "@/application/horoscope/horoscope.service";
import { computeAshtakavarga } from "@/application/horoscope/ashtakavarga";
import {
  buildMoonChart,
  buildNavamsaNorthChart,
  buildSunChart,
} from "@/application/horoscope/chart-variants";
import { natalKootaFromMoon } from "@/application/horoscope/natal-koota";
import { insightForDosha, insightForYoga } from "@/application/horoscope/yoga-insights";
import { partitionYogas } from "@/application/horoscope/yoga-filters";
import {
  detectDoshas,
  detectManglik,
  detectYogas,
  type ChartPlanet,
} from "@/application/horoscope/chart-builder";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, NotFoundError, UnauthorizedError } from "@/lib/utils/error-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await enforceRateLimit({
      key: `vedic-extras:${session.user.id}`,
      limit: 40,
      windowSec: 60,
    });

    const data = await horoscopeService.getLatest(session.user.id);
    const h = data?.horoscope as
      | {
          lagnaSign: string;
          lagnaDegree?: number;
          moonSign: string;
          sunSign: string;
          planets?: ChartPlanet[];
          yogas?: Array<{
            code: string;
            name: string;
            category: string;
            strength: number;
            description: string;
          }>;
          doshas?: Array<{
            code: string;
            name: string;
            present: boolean;
            severity: string;
            notes: string;
          }>;
          chartNorth?: unknown;
          shadbala?: { lagnaLongitude?: number };
        }
      | null
      | undefined;
    if (!h) throw new NotFoundError("Generate your kundli first");

    const planets = (h.planets || []) as ChartPlanet[];
    const moon = planets.find((p) => p.planet === "Moon");
    const moonNak = moon?.nakshatra || "Ashwini";
    const currentMaha = data?.dasha?.currentMaha || null;
    const currentAntar = data?.dasha?.currentAntar || null;

    const liveYogas =
      planets.length && h.lagnaSign ? detectYogas(planets, h.lagnaSign) : h.yogas || [];
    const manglik = planets.length ? detectManglik(planets) : { status: "UNKNOWN" as const };
    const liveDoshas =
      planets.length && manglik.status !== "UNKNOWN"
        ? detectDoshas(planets, manglik.status)
        : h.doshas || [];

    const yogas = liveYogas.map((y) => ({
      ...y,
      insight: insightForYoga({
        code: y.code,
        name: y.name,
        category: y.category,
        description: y.description,
        currentMaha,
        currentAntar,
      }),
    }));
    const { rajaYogas, otherYogas } = partitionYogas(yogas);

    const doshas = liveDoshas.map((d) => ({
      ...d,
      insight: insightForDosha({
        code: d.code,
        name: d.name,
        present: d.present,
        severity: d.severity,
        notes: d.notes,
        currentMaha,
      }),
    }));

    return successResponse({
      currentMaha,
      currentAntar,
      yogas,
      rajaYogas,
      otherYogas,
      doshas,
      natalKoota: natalKootaFromMoon({ moonSign: h.moonSign, nakshatra: moonNak }),
      ashtakavarga: computeAshtakavarga({ lagnaSign: h.lagnaSign, planets }),
      charts: {
        d1North: h.chartNorth,
        moon: buildMoonChart(planets),
        sun: buildSunChart(planets),
        navamsa: buildNavamsaNorthChart({
          planets,
          lagnaSign: h.lagnaSign,
          lagnaDegree: h.lagnaDegree,
          lagnaLongitude: h.shadbala?.lagnaLongitude,
        }),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
