import { requireSession } from "@/lib/auth/session";
import { aiService } from "@/application/ai/ai.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const data = await aiService.insightsBundle(session.user.id);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
