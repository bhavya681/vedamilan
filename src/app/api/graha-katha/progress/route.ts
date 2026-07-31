import { requireSession } from "@/lib/auth/session";
import { grahaProgressService } from "@/application/graha-katha/progress.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const progress = await grahaProgressService.getForUser(session.user.id);
    return successResponse({ progress });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = (await request.json()) as {
      exploreGrahaId?: string;
      completeChapter?: { grahaId: string; chapterId: string };
      toggleBookmark?: string;
      saveInsight?: string;
    };
    if (
      !body.exploreGrahaId &&
      !body.completeChapter &&
      !body.toggleBookmark &&
      !body.saveInsight
    ) {
      throw new ValidationError("No progress update provided");
    }
    const progress = await grahaProgressService.patch(session.user.id, body);
    return successResponse({ progress });
  } catch (error) {
    return handleRouteError(error);
  }
}
