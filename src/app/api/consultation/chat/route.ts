import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { virtualAstrologerService } from "@/application/consultation/virtual-astrologer.service";
import { hasActiveSubscription } from "@/application/billing/entitlements";
import { getVirtualAstrologer } from "@/domain/consultation/virtual-astrologers";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const chatSchema = z.object({
  astrologerId: z.string().min(1),
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
  language: z.enum(["en", "hi", "mr", "es", "auto"]).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = chatSchema.parse(await request.json());
    if (!getVirtualAstrologer(body.astrologerId)) {
      throw new ValidationError("Unknown astrologer");
    }

    const premium = await hasActiveSubscription(session.user.id);
    await enforceRateLimit({
      key: `consultation:chat:${session.user.id}`,
      limit: premium ? 40 : 16,
      windowSec: 60,
    });
    await enforceRateLimit({
      key: `consultation:chat:day:${session.user.id}`,
      limit: premium ? 500 : 60,
      windowSec: 60 * 60 * 24,
    });

    const result = await virtualAstrologerService.chat({
      userId: session.user.id,
      astrologerId: body.astrologerId,
      message: body.message,
      conversationId: body.conversationId,
      language: body.language,
      channel: "text",
    });
    return successResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
