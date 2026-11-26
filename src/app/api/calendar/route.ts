import { requireSession } from "@/lib/auth/session";
import { lifeCalendarService } from "@/application/calendar/life-calendar.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await enforceRateLimit({ key: `calendar:${session.user.id}`, limit: 30, windowSec: 60 });
    const data = await lifeCalendarService.forUser(session.user.id);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
