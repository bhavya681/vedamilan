import { requireSession } from "@/lib/auth/session";
import { matchmakingService } from "@/application/matchmaking/matchmaking.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, NotFoundError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const { userId } = await context.params;
    const candidate = await matchmakingService.getCandidate(session.user.id, userId);
    if (!candidate) throw new NotFoundError("Profile not found");
    return successResponse({ profile: candidate });
  } catch (error) {
    return handleRouteError(error);
  }
}
