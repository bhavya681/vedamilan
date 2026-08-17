import { requireSession } from "@/lib/auth/session";
import { computePanchanga } from "@/application/horoscope/panchanga";
import { profileService } from "@/application/profile/profile.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  date: z.string().optional(),
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
      latitude: searchParams.get("latitude"),
      longitude: searchParams.get("longitude"),
      timezone: searchParams.get("timezone"),
    });

    if (!parsed.success) {
      throw new ValidationError("Invalid query parameters");
    }

    const { date, latitude, longitude, timezone } = parsed.data;
    const targetDate = date ? new Date(`${date}T12:00:00`) : new Date();

    if (Number.isNaN(targetDate.getTime())) {
      throw new ValidationError("Invalid date");
    }

    const birth = await profileService.getBirthDetails(session.user.id);
    const lat = latitude ?? birth?.latitude ?? 28.6139;
    const lon = longitude ?? birth?.longitude ?? 77.209;
    const tz = timezone || birth?.timezone || "Asia/Kolkata";

    const panchanga = computePanchanga(targetDate, lat, lon, tz);

    return successResponse({
      ...panchanga,
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
