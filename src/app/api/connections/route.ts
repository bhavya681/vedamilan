import { z } from "zod";

import { relationshipService } from "@/application/relationship/relationship.service";
import { requireSession } from "@/lib/auth/session";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("with");
    if (otherUserId) {
      const state = await relationshipService.getState(session.user.id, otherUserId);
      return successResponse(state);
    }
    const hub = await relationshipService.listConnectionsHub(session.user.id);
    return successResponse(hub);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = z.object({ otherUserId: z.string().min(1) }).parse(await request.json());
    const data = await relationshipService.removeConnection(session.user.id, body.otherUserId);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
