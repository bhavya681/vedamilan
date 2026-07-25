import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { chatService } from "@/application/chat/chat.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ chatId: string }> }) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const { chatId } = await context.params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;
    const result = await chatService.listMessages(chatId, session.user.id, page, limit);
    await chatService.markRead(chatId, session.user.id);
    return successResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ chatId: string }> }) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await enforceRateLimit({
      key: `chat:send:${session.user.id}`,
      limit: 60,
      windowSec: 60,
    });
    const { chatId } = await context.params;
    const body = z
      .object({
        body: z.string().max(5000).optional(),
        // SYSTEM is server-only — clients may not invent system messages.
        type: z.enum(["TEXT", "IMAGE", "VOICE"]).optional(),
        mediaUrl: z.string().url().optional(),
        mediaPublicId: z.string().max(200).optional(),
        durationSec: z.number().min(0).max(600).optional(),
        clientMessageId: z.string().max(120).optional(),
      })
      .parse(await request.json());

    const message = await chatService.sendMessage({
      chatId,
      senderId: session.user.id,
      ...body,
    });
    return successResponse({ message }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
