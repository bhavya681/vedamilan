import { requireSession } from "@/lib/auth/session";
import { chartComparisonService } from "@/application/horoscope/chart-comparison";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  partnerUserId: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      partnerUserId: searchParams.get("partnerUserId"),
    });

    if (!parsed.success) {
      throw new ValidationError("partnerUserId is required");
    }

    const { partnerUserId } = parsed.data;

    if (partnerUserId === session.user.id) {
      throw new ValidationError("Cannot compare with yourself");
    }

    const data = await chartComparisonService.compare(session.user.id, partnerUserId);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
