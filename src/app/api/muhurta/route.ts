import { requireSession } from "@/lib/auth/session";
import { computeMuhurta, computePanchanga } from "@/application/horoscope/panchanga";
import { profileService } from "@/application/profile/profile.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  date: z.string(),
  activity: z.string().min(1),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  timezone: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      date: searchParams.get("date"),
      activity: searchParams.get("activity") || "general",
      latitude: searchParams.get("latitude"),
      longitude: searchParams.get("longitude"),
      timezone: searchParams.get("timezone"),
    });

    if (!parsed.success) {
      throw new ValidationError("Invalid query parameters");
    }

    const { date, activity, latitude, longitude, timezone } = parsed.data;
    const targetDate = new Date(`${date}T12:00:00`);

    if (Number.isNaN(targetDate.getTime())) {
      throw new ValidationError("Invalid date");
    }

    const birth = await profileService.getBirthDetails(session.user.id);
    const lat = latitude ?? birth?.latitude ?? 28.6139;
    const lon = longitude ?? birth?.longitude ?? 77.209;
    const tz = timezone || birth?.timezone || "Asia/Kolkata";

    const panchanga = computePanchanga(targetDate, lat, lon, tz);
    const windows = computeMuhurta(targetDate, lat, lon, tz, activity);

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
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
