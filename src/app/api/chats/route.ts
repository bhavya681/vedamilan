import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { chatService } from "@/application/chat/chat.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const chats = await chatService.listChats(session.user.id);
    return successResponse({ chats });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = z.object({ otherUserId: z.string().min(1) }).parse(await request.json());
    const chat = await chatService.getOrCreateChat(session.user.id, body.otherUserId);
    return successResponse({ chat }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
