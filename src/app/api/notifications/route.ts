import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { notificationService } from "@/application/notifications/notification.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await notificationService.ensureWelcome(session.user.id);
    const [notifications, unread] = await Promise.all([
      notificationService.list(session.user.id),
      notificationService.unreadCount(session.user.id),
    ]);
    return successResponse({ notifications, unread });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = z
      .object({
        notificationId: z.string().optional(),
        markAll: z.boolean().optional(),
      })
      .parse(await request.json().catch(() => ({})));
    await notificationService.markRead(
      session.user.id,
      body.markAll ? undefined : body.notificationId,
    );
    return successResponse({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
