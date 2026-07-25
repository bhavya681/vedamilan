import { requireSession } from "@/lib/auth/session";
import { profileService } from "@/application/profile/profile.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { assertSameOriginMutation } from "@/lib/security/csrf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PhotoBody = {
  dataUrl?: string;
  imageUrl?: string;
  makePrimary?: boolean;
};

export async function POST(request: Request) {
  try {
    assertSameOriginMutation(request);
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await enforceRateLimit({
      key: `profile:photos:${session.user.id}`,
      limit: 15,
      windowSec: 60,
    });
    const body = (await request.json()) as PhotoBody;
    const makePrimary = Boolean(body.makePrimary);

    if (body.dataUrl) {
      if (!body.dataUrl.startsWith("data:image/")) {
        throw new ValidationError("Upload a valid image file");
      }
      const result = await profileService.uploadPhoto(session.user.id, body.dataUrl, makePrimary);
      return successResponse(result, { status: 201 });
    }

    if (body.imageUrl) {
      const result = await profileService.addPhotoFromUrl(
        session.user.id,
        body.imageUrl,
        makePrimary,
      );
      return successResponse(result, { status: 201 });
    }

    throw new ValidationError("Provide an image file upload or an HTTPS image link");
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOriginMutation(request);
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");
    if (!publicId) throw new ValidationError("publicId is required");
    const result = await profileService.deletePhoto(session.user.id, publicId);
    return successResponse(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
