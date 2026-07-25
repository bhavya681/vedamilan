import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { compatibilityService } from "@/application/rules/compatibility.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const reports = await compatibilityService.listForUser(session.user.id);
    return successResponse({ reports });
  } catch (error) {
    return handleRouteError(error);
  }
}

const bodySchema = z.object({
  candidateUserId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await enforceRateLimit({
      key: `compatibility:compare:${session.user.id}`,
      limit: 20,
      windowSec: 60,
    });
    const body = bodySchema.parse(await request.json());
    const result = await compatibilityService.compare(session.user.id, body.candidateUserId);
    return successResponse(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
