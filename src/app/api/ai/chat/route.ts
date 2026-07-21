import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { aiService } from "@/application/ai/ai.service";
import type { VedaAgentKey } from "@/mastra/agents/veda-agents";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

const schema = z.object({
  agent: z
    .enum([
      "ASTROLOGER_GURU",
      "HOROSCOPE",
      "COMPATIBILITY",
      "MARRIAGE_TIMING",
      "RELATIONSHIP_COACH",
      "PROFILE_ANALYSIS",
      "SEARCH",
      "RECOMMENDATION",
      "NOTIFICATION",
      "REPORT",
      "SUPPORT",
    ])
    .default("ASTROLOGER_GURU"),
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
  candidateUserId: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const { searchParams } = new URL(request.url);
    const agent = searchParams.get("agent") as VedaAgentKey | null;
    const conversations = await aiService.listConversations(session.user.id, agent || undefined);
    return successResponse({ conversations });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = schema.parse(await request.json());
    const result = await aiService.chat({
      userId: session.user.id,
      agent: body.agent,
      message: body.message,
      conversationId: body.conversationId,
      candidateUserId: body.candidateUserId,
    });
    return successResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
