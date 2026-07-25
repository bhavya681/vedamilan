import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { wisdomService } from "@/application/wisdom/wisdom.service";
import { hasActiveSubscription } from "@/application/billing/entitlements";
import {
  WISDOM_CATEGORIES,
  WISDOM_GUIDES,
  getWisdomGuide,
  listFeaturedSages,
  listRelationshipGuides,
} from "@/domain/wisdom/guides";
import { WISDOM_AI_DISCLAIMER } from "@/lib/constants/wisdom-disclaimer";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const { searchParams } = new URL(request.url);
    const guideId = searchParams.get("guideId");
    if (guideId) {
      const guide = getWisdomGuide(guideId);
      if (!guide) throw new ValidationError("Unknown guide");
      return successResponse({ guide, disclaimer: WISDOM_AI_DISCLAIMER });
    }
    return successResponse({
      categories: WISDOM_CATEGORIES,
      guides: WISDOM_GUIDES,
      featuredSages: listFeaturedSages(),
      relationshipGuides: listRelationshipGuides(),
      daily: wisdomService.dailyReflection(),
      disclaimer: WISDOM_AI_DISCLAIMER,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

const chatSchema = z.object({
  guideId: z.string().min(1),
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
  topic: z.string().max(120).optional(),
  includeLifeContext: z.boolean().optional(),
});

const councilSchema = z.object({
  mode: z.literal("council"),
  message: z.string().min(1).max(4000),
  guideIds: z.array(z.string()).min(2).max(3),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = await request.json();
    const premium = await hasActiveSubscription(session.user.id);
    await enforceRateLimit({
      key: `wisdom:chat:${session.user.id}`,
      limit: premium ? 30 : 12,
      windowSec: 60,
    });
    await enforceRateLimit({
      key: `wisdom:chat:day:${session.user.id}`,
      limit: premium ? 400 : 40,
      windowSec: 60 * 60 * 24,
    });

    if (body?.mode === "council") {
      const parsed = councilSchema.parse(body);
      const result = await wisdomService.askTheSages({
        userId: session.user.id,
        message: parsed.message,
        guideIds: parsed.guideIds,
      });
      return successResponse(result);
    }

    const parsed = chatSchema.parse(body);
    if (!getWisdomGuide(parsed.guideId)) {
      throw new ValidationError("Unknown guide");
    }
    const result = await wisdomService.chat({
      userId: session.user.id,
      guideId: parsed.guideId,
      message: parsed.message,
      conversationId: parsed.conversationId,
      topic: parsed.topic,
      includeLifeContext: parsed.includeLifeContext,
    });
    return successResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
