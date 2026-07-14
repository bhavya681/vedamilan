import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { matchmakingService } from "@/application/matchmaking/matchmaking.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

const schema = z.object({
  toUserId: z.string().min(1),
  type: z.enum(["LIKE", "SUPER_LIKE", "INTEREST"]).default("LIKE"),
});

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const likes = await matchmakingService.listLikes(session.user.id);
    return successResponse(likes);
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
    const like = await matchmakingService.like(session.user.id, body.toUserId, body.type);
    return successResponse(like, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
