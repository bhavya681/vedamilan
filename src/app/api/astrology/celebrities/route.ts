import { requireSession } from "@/lib/auth/session";
import { getCelebrityStudio } from "@/application/horoscope/celebrity-charts.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const id = new URL(request.url).searchParams.get("id");
    return successResponse(getCelebrityStudio(id));
  } catch (error) {
    return handleRouteError(error);
  }
}
