import { requireSession } from "@/lib/auth/session";
import {
  getVirtualAstrologer,
  listVirtualAstrologers,
} from "@/domain/consultation/virtual-astrologers";
import { VEDIC_AI_DISCLAIMER } from "@/lib/constants/ai-disclaimer";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const { searchParams } = new URL(request.url);
    const astrologerId = searchParams.get("astrologerId");
    if (astrologerId) {
      const astrologer = getVirtualAstrologer(astrologerId);
      if (!astrologer) throw new ValidationError("Unknown astrologer");
      return successResponse({ astrologer, disclaimer: VEDIC_AI_DISCLAIMER });
    }
    return successResponse({
      astrologers: listVirtualAstrologers(),
      disclaimer: VEDIC_AI_DISCLAIMER,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
