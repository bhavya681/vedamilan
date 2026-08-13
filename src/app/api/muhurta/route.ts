import { requireSession } from "@/lib/auth/session";
import { computeMuhurta } from "@/application/horoscope/panchanga";
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
    const _session = await requireSession().catch(() => {
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
    const targetDate = new Date(date);

    if (Number.isNaN(targetDate.getTime())) {
      throw new ValidationError("Invalid date");
    }

    const windows = computeMuhurta(
      targetDate,
      latitude ?? 0,
      longitude ?? 0,
      timezone || "Asia/Kolkata",
      activity,
    );

    return successResponse({ windows, activity, date: targetDate.toISOString().split("T")[0] });
  } catch (error) {
    return handleRouteError(error);
  }
}
