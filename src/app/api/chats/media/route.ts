import { requireSession } from "@/lib/auth/session";
import { cloudinaryService } from "@/lib/services/cloudinary";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VOICE_BYTES = 10 * 1024 * 1024;

const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VOICE_MIME = new Set([
  "audio/webm",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
  "audio/wav",
  "video/webm",
]);

function sniffImage(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return true;
  }
  // GIF
  if (
    buffer.subarray(0, 6).toString("ascii") === "GIF87a" ||
    buffer.subarray(0, 6).toString("ascii") === "GIF89a"
  ) {
    return true;
  }
  // WEBP (RIFF....WEBP)
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return true;
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await enforceRateLimit({
      key: `chat:media:${session.user.id}`,
      limit: 20,
      windowSec: 60,
    });

    const form = await request.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "image");
    if (!(file instanceof File)) throw new ValidationError("file is required");
    if (kind !== "image" && kind !== "voice") {
      throw new ValidationError("kind must be image or voice");
    }

    const maxBytes = kind === "voice" ? MAX_VOICE_BYTES : MAX_IMAGE_BYTES;
    if (file.size <= 0 || file.size > maxBytes) {
      throw new ValidationError(
        kind === "voice"
          ? "Voice file must be between 1 byte and 10MB"
          : "Image must be between 1 byte and 5MB",
      );
    }

    const mime = (file.type || "").toLowerCase();
    if (kind === "image" && !IMAGE_MIME.has(mime)) {
      throw new ValidationError("Image must be JPEG, PNG, WEBP, or GIF");
    }
    if (kind === "voice" && !VOICE_MIME.has(mime)) {
      throw new ValidationError("Unsupported voice format");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (kind === "image" && !sniffImage(buffer)) {
      throw new ValidationError("File content does not match an allowed image type");
    }

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
