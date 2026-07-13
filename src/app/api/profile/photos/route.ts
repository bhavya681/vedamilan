import { requireSession } from "@/lib/auth/session";
import { profileService } from "@/application/profile/profile.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = (await request.json()) as { dataUrl?: string; makePrimary?: boolean };
    if (!body.dataUrl || !body.dataUrl.startsWith("data:image/")) {
      throw new ValidationError("Expected dataUrl as a base64 image data URI");
    }
    const result = await profileService.uploadPhoto(
      session.user.id,
      body.dataUrl,
      Boolean(body.makePrimary),
    );
    return successResponse(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
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
