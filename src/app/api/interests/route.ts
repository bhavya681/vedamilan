import { z } from "zod";

import { relationshipService } from "@/application/relationship/relationship.service";
import { requireSession } from "@/lib/auth/session";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

const expressSchema = z.object({
  toUserId: z.string().min(1),
});

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const data = await relationshipService.listInterests(session.user.id);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = expressSchema.parse(await request.json());
    const data = await relationshipService.expressInterest(session.user.id, body.toUserId);
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
    const { searchParams } = new URL(request.url);
    const toUserId = searchParams.get("toUserId");
    if (!toUserId) {
      const body = expressSchema.parse(await request.json().catch(() => ({})));
      const data = await relationshipService.undoInterest(session.user.id, body.toUserId);
      return successResponse(data);
    }
    const data = await relationshipService.undoInterest(session.user.id, toUserId);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
