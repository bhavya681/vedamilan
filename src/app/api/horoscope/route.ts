import { requireSession } from "@/lib/auth/session";
import { horoscopeService } from "@/application/horoscope/horoscope.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const data = await horoscopeService.getLatest(session.user.id);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const data = await horoscopeService.generateForUser(session.user.id);
    return successResponse(data, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
