import { requireSession } from "@/lib/auth/session";
import { profileService } from "@/application/profile/profile.service";
import { profileUpdateSchema } from "@/lib/validators/profile";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const bundle = await profileService.getProfileBundle(session.user.id, {
      name: session.user.name,
      email: session.user.email,
    });
    return successResponse(bundle);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = profileUpdateSchema.parse(await request.json());
    const profile = await profileService.updateProfile(session.user.id, body);
    return successResponse(profile);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  return PATCH(request);
}
