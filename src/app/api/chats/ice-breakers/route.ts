import { requireSession } from "@/lib/auth/session";
import { chatService } from "@/application/chat/chat.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const otherUserId = new URL(request.url).searchParams.get("otherUserId");
    if (!otherUserId) {
      return successResponse({
        replies: [
          "I'd love to learn what family means to you day-to-day.",
          "What's a calm weekend ritual you never skip?",
          "Which value do you hope your future home always protects?",
        ],
      });
    }
    const replies = await chatService.iceBreakers(session.user.id, otherUserId);
    return successResponse({ replies });
  } catch (error) {
    return handleRouteError(error);
  }
}
