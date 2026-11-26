import { requireSession } from "@/lib/auth/session";
import { lifeCalendarService } from "@/application/calendar/life-calendar.service";
import { localDateToUtc } from "@/application/horoscope/panchanga";
import type { VedicEventCategory } from "@/application/calendar/vedic-events.service";
import { profileService } from "@/application/profile/profile.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const categories = [
  "transit",
  "retrograde",
  "conjunction",
  "lunar",
  "eclipse",
  "panchanga",
] as const;

const querySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  timezone: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  ayanamsha: z.enum(["LAHIRI", "RAMAN", "KRISHNAMURTI", "FAGAN_BRADLEY"]).optional(),
  include: z.string().optional(),
  dailyDays: z.coerce.number().int().min(1).max(31).optional(),
});

function currentLocalDate(timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await enforceRateLimit({ key: `calendar:${session.user.id}`, limit: 30, windowSec: 60 });

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      timezone: searchParams.get("timezone") ?? undefined,
      latitude: searchParams.get("latitude") ?? undefined,
      longitude: searchParams.get("longitude") ?? undefined,
      ayanamsha: searchParams.get("ayanamsha") ?? undefined,
      include: searchParams.get("include") ?? undefined,
      dailyDays: searchParams.get("dailyDays") ?? undefined,
    });
    if (!parsed.success) {
      throw new ValidationError("Invalid calendar query parameters");
    }

    const birth = await profileService.getBirthDetails(session.user.id);
    const timezone = parsed.data.timezone || birth?.timezone || "Asia/Kolkata";
    const fromDate = parsed.data.from ?? currentLocalDate(timezone);
    const toDate = parsed.data.to ?? addDays(fromDate, 90);
    if (toDate < fromDate) {
      throw new ValidationError("Calendar end date must be after the start date");
    }

    let include: VedicEventCategory[] | undefined;
    if (parsed.data.include) {
      const requested = parsed.data.include.split(",").filter(Boolean);
      const invalid = requested.filter(
        (item) => !categories.includes(item as (typeof categories)[number]),
      );
      if (invalid.length > 0) {
        throw new ValidationError(`Unknown astrology event category: ${invalid.join(", ")}`);
      }
      include = requested as VedicEventCategory[];
    }

    const data = await lifeCalendarService.forUser(session.user.id, {
      astrologyEvents: {
        from: localDateToUtc(fromDate, timezone),
        to: new Date(localDateToUtc(addDays(toDate, 1), timezone).getTime() - 1),
        latitude: parsed.data.latitude ?? birth?.latitude ?? 28.6139,
        longitude: parsed.data.longitude ?? birth?.longitude ?? 77.209,
        timezone,
        ayanamsha: parsed.data.ayanamsha || birth?.ayanamsha || "LAHIRI",
        include,
        dailyDays: parsed.data.dailyDays ?? 14,
      },
    });
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
