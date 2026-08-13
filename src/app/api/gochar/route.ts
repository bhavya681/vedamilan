import { computeGocharForUser, computeGocharAtDate } from "@/application/horoscope/gochar.service";
import { requireSession } from "@/lib/auth/session";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  date: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await enforceRateLimit({
      key: `gochar:${session.user.id}`,
      limit: 30,
      windowSec: 60,
    });

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      date: searchParams.get("date"),
    });

    if (!parsed.success) {
      throw new ValidationError("Invalid query parameters");
    }

    const { date } = parsed.data;
    const asOf = date ? new Date(date) : new Date();

    if (Number.isNaN(asOf.getTime())) {
      throw new ValidationError("Invalid date");
    }

    const data = date
      ? await computeGocharAtDate(session.user.id, asOf)
      : await computeGocharForUser(session.user.id);

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
