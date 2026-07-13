import { requireSession } from "@/lib/auth/session";
import { profileService } from "@/application/profile/profile.service";
import { birthDetailsSchema } from "@/lib/validators/profile";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const birthDetails = await profileService.getBirthDetails(session.user.id);
    return successResponse(birthDetails);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = birthDetailsSchema.parse(await request.json());
    const birthDetails = await profileService.upsertBirthDetails(session.user.id, body);
    return successResponse(birthDetails);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}
