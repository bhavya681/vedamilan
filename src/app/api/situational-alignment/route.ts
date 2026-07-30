import { requireSession } from "@/lib/auth/session";
import { situationalAlignmentService } from "@/application/compatibility/situational-alignment.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const { searchParams } = new URL(request.url);
    const withUser = searchParams.get("with")?.trim();
    const profile = await situationalAlignmentService.getForUser(session.user.id);
    const catalog = situationalAlignmentService.catalog();
    if (withUser) {
      const comparison = await situationalAlignmentService.compare(session.user.id, withUser);
      return successResponse({ catalog, profile, ...comparison });
    }
    return successResponse({ catalog, profile });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = (await request.json()) as { answers?: Record<string, unknown>; clear?: boolean };
    if (body.clear) {
      const profile = await situationalAlignmentService.clear(session.user.id);
      return successResponse({
        catalog: situationalAlignmentService.catalog(),
        profile,
      });
    }
    if (!body.answers || typeof body.answers !== "object") {
      throw new ValidationError("answers required");
    }
    const profile = await situationalAlignmentService.upsert(session.user.id, body.answers);
    return successResponse({
      catalog: situationalAlignmentService.catalog(),
      profile,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
