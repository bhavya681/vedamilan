import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { chatService } from "@/application/chat/chat.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ chatId: string }> }) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const { chatId } = await context.params;
    const body = z.object({ isTyping: z.boolean() }).parse(await request.json());
    await chatService.setTyping(chatId, session.user.id, body.isTyping);
    return successResponse({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
