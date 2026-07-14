import Pusher from "pusher";

import { logger } from "@/lib/utils/logger";

let pusher: Pusher | null = null;

export function isPusherConfigured(): boolean {
  return Boolean(
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET &&
    process.env.PUSHER_CLUSTER,
  );
}

export function getPusher(): Pusher | null {
  if (!isPusherConfigured()) return null;
  if (!pusher) {
    pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID as string,
      key: process.env.PUSHER_KEY as string,
      secret: process.env.PUSHER_SECRET as string,
      cluster: process.env.PUSHER_CLUSTER as string,
      useTLS: true,
    });
  }
  return pusher;
}

export async function publishChatEvent(
  chatId: string,
  event: string,
  payload: Record<string, unknown>,
) {
  const client = getPusher();
  if (!client) {
    logger.info({ chatId, event }, "Pusher not configured — event skipped");
    return;
  }
  await client.trigger(`private-chat-${chatId}`, event, payload);
}

export function chatChannelName(chatId: string) {
  return `private-chat-${chatId}`;
}
