import { z } from "zod";

import { relationshipService } from "@/application/relationship/relationship.service";
import { requireSession } from "@/lib/auth/session";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

const blockSchema = z.object({
  blockedId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

const unblockSchema = z.object({
  blockedId: z.string().min(1),
});

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const blocks = await relationshipService.listBlocked(session.user.id);
    return successResponse({ blocks });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = blockSchema.parse(await request.json());
    const data = await relationshipService.blockUser(
      session.user.id,
      body.blockedId,
      body.reason || "",
    );
    return successResponse(data, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = unblockSchema.parse(await request.json());
    const data = await relationshipService.unblockUser(session.user.id, body.blockedId);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
