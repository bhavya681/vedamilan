import { z } from "zod";

import { relationshipService } from "@/application/relationship/relationship.service";
import { requireSession } from "@/lib/auth/session";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

const schema = z.object({
  blockedId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = schema.parse(await request.json());
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
