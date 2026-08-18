import { z } from "zod";

import { computeCelestialSnapshot } from "@/application/horoscope/celestial-horizon.service";
import { requireSession } from "@/lib/auth/session";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  mode: z.enum(["live", "birth"]).default("live"),
  at: z.string().min(1).max(40).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  timezone: z.string().min(1).max(64).optional(),
  locationLabel: z.string().min(1).max(120).optional(),
  locationSource: z.enum(["birth", "device", "query"]).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await enforceRateLimit({
      key: `celestial-horizon:${session.user.id}`,
      limit: 40,
      windowSec: 60,
    });

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      mode: searchParams.get("mode") || "live",
      at: searchParams.get("at") || undefined,
      latitude: searchParams.get("latitude") || undefined,
      longitude: searchParams.get("longitude") || undefined,
      timezone: searchParams.get("timezone") || undefined,
      locationLabel: searchParams.get("locationLabel") || undefined,
      locationSource: searchParams.get("locationSource") || undefined,
    });
    if (!parsed.success) {
      throw new ValidationError("Invalid celestial query");
    }

    const at = parsed.data.at ? new Date(parsed.data.at) : undefined;
    if (at && Number.isNaN(at.getTime())) {
      throw new ValidationError("Invalid timestamp");
    }

    const data = await computeCelestialSnapshot(session.user.id, {
      mode: parsed.data.mode,
      at,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      timezone: parsed.data.timezone,
      locationLabel: parsed.data.locationLabel,
      locationSource: parsed.data.locationSource,
    });
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
