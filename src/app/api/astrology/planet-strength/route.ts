import { requireSession } from "@/lib/auth/session";
import { planetStrengthService } from "@/application/horoscope/planet-strength";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const data = await planetStrengthService.forUser(session.user.id);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
