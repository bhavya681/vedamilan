import { requireSession } from "@/lib/auth/session";
import { profileService } from "@/application/profile/profile.service";
import { horoscopeService } from "@/application/horoscope/horoscope.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  calculateBhagyank,
  calculateMulank,
  calculationTrace,
  dateToNumerologyInput,
  NUMEROLOGY_NUMBERS,
  NUMBER_PROFILES,
  getCombinationOrGeneric,
  type NumberId,
  type NumerologyDateInput,
} from "@/domain/numerology";
import type { ChartPlanet } from "@/application/horoscope/chart-builder";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Public, lightweight card data for numbers 1-9. */
function numberCards() {
  return (Object.keys(NUMEROLOGY_NUMBERS) as unknown as NumberId[]).map((n) => {
    const profile = NUMBER_PROFILES[n];
    return {
      number: n,
      planet: profile.planet,
      keyword: profile.keyword,
      coreEnergy: profile.coreEnergy,
    };
  });
}

/**
 * Find the user's natal placement of the planet associated with a numerology number.
 * Returns null if the planet isn't in the chart or there's no chart.
 */
function findPlanetInChart(planets: ChartPlanet[] | undefined, planet: string) {
  if (!planets?.length) return null;
  const found = planets.find((p) => p.planet === planet);
  if (!found) return null;
  return {
    planet: found.planet,
    sign: found.sign,
    house: found.house,
    nakshatra: found.nakshatra,
    dignity: found.dignity ?? null,
    isRetrograde: found.isRetrograde,
    longitude: found.longitude,
  };
}

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });

    await enforceRateLimit({
      key: `numerology:${session.user.id}`,
      limit: 40,
      windowSec: 60,
    });

    const birthDetails = await profileService.getBirthDetails(session.user.id);

    if (!birthDetails || !birthDetails.birthDate) {
      return successResponse({
        hasDob: false,
        numberCards: numberCards(),
      });
    }

    const input: NumerologyDateInput = dateToNumerologyInput(new Date(birthDetails.birthDate));
    const mulank = calculateMulank(input.day);
    const bhagyank = calculateBhagyank(input.day, input.month, input.year);
    const trace = calculationTrace(input.day, input.month, input.year);

    const mulankPlanet = NUMEROLOGY_NUMBERS[mulank as NumberId].planet;
    const bhagyankPlanet = NUMEROLOGY_NUMBERS[bhagyank as NumberId].planet;

    // Try to enrich with Kundli context — the astrology engine is the
    // single source of truth for planetary positions; numerology never
    // calculates them itself.
    let horoscope: Awaited<ReturnType<typeof horoscopeService.getLatest>> | null = null;
    let mulankPlacement = null;
    let bhagyankPlacement = null;
    try {
      horoscope = await horoscopeService.getLatest(session.user.id);
      if (horoscope) {
        const planets = (horoscope.horoscope?.planets || []) as ChartPlanet[] | undefined;
        mulankPlacement = findPlanetInChart(planets, mulankPlanet);
        bhagyankPlacement = findPlanetInChart(planets, bhagyankPlanet);
      }
    } catch {
      // Horoscope not generated yet — Kundli context is optional
    }

    return successResponse({
      hasDob: true,
      dateDisplay: trace.dateDisplay,
      day: input.day,
      month: input.month,
      year: input.year,
      mulank,
      bhagyank,
      mulankPlanet,
      bhagyankPlanet,
      calculationTrace: {
        mulank: trace.mulank,
        bhagyank: trace.bhagyank,
      },
      kundli: horoscope
        ? {
            hasChart: true,
            lagnaSign: horoscope.horoscope?.lagnaSign ?? null,
            moonSign: horoscope.horoscope?.moonSign ?? null,
            sunSign: horoscope.horoscope?.sunSign ?? null,
            mulankPlanetPlacement: mulankPlacement,
            bhagyankPlanetPlacement: bhagyankPlacement,
          }
        : {
            hasChart: false,
          },
      numberCards: numberCards(),
      combination: getCombinationOrGeneric(mulank as NumberId, bhagyank as NumberId),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
