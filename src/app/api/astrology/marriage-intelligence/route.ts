import { requireSession } from "@/lib/auth/session";
import { marriageIntelligenceService } from "@/application/horoscope/marriage-intelligence";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const data = await marriageIntelligenceService.forUser(session.user.id);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
