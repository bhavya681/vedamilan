import { requireSession } from "@/lib/auth/session";
import {
  computeMuhurta,
  computePanchanga,
  localDateToUtc,
} from "@/application/horoscope/panchanga";
import { resolveAyanamsha } from "@/application/horoscope/horoscope.service";
import { profileService } from "@/application/profile/profile.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  activity: z.string().min(1),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  timezone: z.string().optional(),
  ayanamsha: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      date: searchParams.get("date") ?? undefined,
      activity: searchParams.get("activity") || "general",
      latitude: searchParams.get("latitude") ?? undefined,
      longitude: searchParams.get("longitude") ?? undefined,
      timezone: searchParams.get("timezone") ?? undefined,
      ayanamsha: searchParams.get("ayanamsha") ?? undefined,
    });

    if (!parsed.success) {
      throw new ValidationError("Invalid query parameters");
    }

    const { date, activity, latitude, longitude, timezone, ayanamsha } = parsed.data;
    const birth = await profileService.getBirthDetails(session.user.id);
    const lat = latitude ?? birth?.latitude ?? 28.6139;
    const lon = longitude ?? birth?.longitude ?? 77.209;
    const tz = timezone || birth?.timezone || "Asia/Kolkata";
    const siderealMode = resolveAyanamsha(ayanamsha || birth?.ayanamsha);
    const targetDate = localDateToUtc(date, tz);

    if (Number.isNaN(targetDate.getTime())) {
      throw new ValidationError("Invalid date");
    }

    const panchanga = computePanchanga(targetDate, lat, lon, tz, siderealMode);
    const windows = computeMuhurta(targetDate, lat, lon, tz, activity, siderealMode);

    return successResponse({
      windows,
      activity,
      date,
      panchanga,
      location: {
        latitude: lat,
        longitude: lon,
        timezone: tz,
        placeName: birth?.placeName || null,
        source: latitude != null ? "query" : birth?.latitude != null ? "birth" : "default",
      },
      calculation: {
        engine: "swiss-ephemeris",
        zodiac: "sidereal",
        ayanamsha: siderealMode,
        limbsBasis: "sunrise",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
