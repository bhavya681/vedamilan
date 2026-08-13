import { requireSession } from "@/lib/auth/session";
import { computePanchanga } from "@/application/horoscope/panchanga";
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
    const _session = await requireSession().catch(() => {
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
    const targetDate = date ? new Date(date) : new Date();

    if (Number.isNaN(targetDate.getTime())) {
      throw new ValidationError("Invalid date");
    }

    const panchanga = computePanchanga(
      targetDate,
      latitude ?? 0,
      longitude ?? 0,
      timezone || "Asia/Kolkata",
    );

    return successResponse(panchanga);
  } catch (error) {
    return handleRouteError(error);
  }
}
