import { requireSession } from "@/lib/auth/session";
import { cloudinaryService } from "@/lib/services/cloudinary";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const form = await request.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "image");
    if (!(file instanceof File)) throw new ValidationError("file is required");

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await cloudinaryService.uploadImage({
      data: buffer,
      folder: kind === "voice" ? "vedamilan/chat/voice" : "vedamilan/chat/media",
      resourceType: kind === "voice" ? "video" : "image",
    });

    return successResponse(
      {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        resourceType: uploaded.resource_type,
        duration: uploaded.duration ?? null,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
