import { requireSession } from "@/lib/auth/session";
import { profileService } from "@/application/profile/profile.service";
import { partnerPreferencesSchema } from "@/lib/validators/profile";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const preferences = await profileService.getPreferences(session.user.id);
    return successResponse(preferences);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const parsed = partnerPreferencesSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ValidationError("Invalid preferences", parsed.error.flatten());
    }
    try {
      const preferences = await profileService.upsertPreferences(session.user.id, parsed.data);
      return successResponse(preferences);
    } catch (error) {
      if (error instanceof Error && error.message.includes("ageMin")) {
        throw new ValidationError(error.message);
      }
      throw error;
    }
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}
