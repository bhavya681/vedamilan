import { requireSession } from "@/lib/auth/session";
import { matchmakingService } from "@/application/matchmaking/matchmaking.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const visitors = await matchmakingService.listVisitors(session.user.id);
    return successResponse({ visitors });
  } catch (error) {
    return handleRouteError(error);
  }
}
