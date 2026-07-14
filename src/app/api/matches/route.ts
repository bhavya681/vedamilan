import { requireSession } from "@/lib/auth/session";
import { matchmakingService } from "@/application/matchmaking/matchmaking.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const { searchParams } = new URL(request.url);
    const result = await matchmakingService.search(session.user.id, {
      q: searchParams.get("q") || undefined,
      city: searchParams.get("city") || undefined,
      religion: searchParams.get("religion") || undefined,
      profession: searchParams.get("profession") || undefined,
      education: searchParams.get("education") || undefined,
      language: searchParams.get("language") || undefined,
      manglik: (searchParams.get("manglik") as "ANY" | "NON_MANGLIK" | "MANGLIK") || "ANY",
      minAge: searchParams.get("minAge") ? Number(searchParams.get("minAge")) : undefined,
      maxAge: searchParams.get("maxAge") ? Number(searchParams.get("maxAge")) : undefined,
      minHeightCm: searchParams.get("minHeightCm")
        ? Number(searchParams.get("minHeightCm"))
        : undefined,
      maxHeightCm: searchParams.get("maxHeightCm")
        ? Number(searchParams.get("maxHeightCm"))
        : undefined,
      minCompatibility: searchParams.get("minCompatibility")
        ? Number(searchParams.get("minCompatibility"))
        : undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
    });
    return successResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
