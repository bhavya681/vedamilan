import { requireSession } from "@/lib/auth/session";
import { getPusher, isPusherConfigured } from "@/infrastructure/realtime/pusher";
import { ForbiddenError, UnauthorizedError, handleRouteError } from "@/lib/utils/error-handler";
import { Chat } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    if (!isPusherConfigured()) {
      return Response.json(
        { success: false, error: { message: "Pusher not configured" } },
        { status: 503 },
      );
    }

    const form = await request.formData();
    const socketId = String(form.get("socket_id") || "");
    const channel = String(form.get("channel_name") || "");
    if (!socketId || !channel.startsWith("private-chat-")) {
      throw new ForbiddenError("Invalid channel");
    }

    const chatId = channel.replace("private-chat-", "");
    await connectMongo();
    const chat = await Chat.findById(chatId).lean();
    if (!chat?.participantIds.includes(session.user.id)) {
      throw new ForbiddenError("Not allowed for this channel");
    }

    const pusher = getPusher()!;
    const auth = pusher.authorizeChannel(socketId, channel);
    return Response.json(auth);
  } catch (error) {
    return handleRouteError(error);
  }
}
