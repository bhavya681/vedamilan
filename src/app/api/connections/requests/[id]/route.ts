import { z } from "zod";

import { relationshipService } from "@/application/relationship/relationship.service";
import { requireSession } from "@/lib/auth/session";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

const actionSchema = z.object({
  action: z.enum(["accept", "decline", "withdraw"]),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const { id } = await params;
    if (!id) throw new ValidationError("Request id required");
    const body = actionSchema.parse(await request.json());

    if (body.action === "accept") {
      const data = await relationshipService.acceptRequest(session.user.id, id);
      return successResponse(data);
    }
    if (body.action === "decline") {
      const data = await relationshipService.declineRequest(session.user.id, id);
      return successResponse(data);
    }
    const data = await relationshipService.withdrawRequest(session.user.id, id);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
