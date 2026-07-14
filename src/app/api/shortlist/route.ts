import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { matchmakingService } from "@/application/matchmaking/matchmaking.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const shortlist = await matchmakingService.listShortlist(session.user.id);
    return successResponse({ shortlist });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = z
      .object({ targetUserId: z.string().min(1), note: z.string().optional() })
      .parse(await request.json());
    const item = await matchmakingService.shortlist(
      session.user.id,
      body.targetUserId,
      body.note || "",
    );
    return successResponse(item, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
