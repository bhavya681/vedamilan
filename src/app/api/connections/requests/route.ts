import { z } from "zod";

import { relationshipService } from "@/application/relationship/relationship.service";
import { requireSession } from "@/lib/auth/session";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  toUserId: z.string().min(1),
  message: z.string().max(250).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = createSchema.parse(await request.json());
    const data = await relationshipService.sendConnectionRequest(
      session.user.id,
      body.toUserId,
      body.message || "",
    );
    return successResponse(data, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
