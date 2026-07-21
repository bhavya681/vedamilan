import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

import { AppError } from "@/lib/utils/error-handler";
import { requireEnvValue } from "@/lib/utils/env";

export type CloudinaryUploadInput = {
  data: string | Buffer;
  folder?: string;
  publicId?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
};

export class CloudinaryService {
  private configured = false;

  isConfigured(): boolean {
    return Boolean(
      (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
    );
  }

  private ensureConfigured(): void {
    if (this.configured) return;

    const cloudName = requireEnvValue(
      process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      "CLOUDINARY_CLOUD_NAME",
    );
    const apiKey = requireEnvValue(process.env.CLOUDINARY_API_KEY, "CLOUDINARY_API_KEY");
    const apiSecret = requireEnvValue(process.env.CLOUDINARY_API_SECRET, "CLOUDINARY_API_SECRET");

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    this.configured = true;
  }

  async uploadImage(input: CloudinaryUploadInput): Promise<UploadApiResponse> {
    this.ensureConfigured();

    const file =
      typeof input.data === "string"
        ? input.data
        : `data:image/png;base64,${input.data.toString("base64")}`;

    try {
      return await cloudinary.uploader.upload(file, {
        folder: input.folder ?? "vedamilan",
        public_id: input.publicId,
        resource_type: input.resourceType ?? "image",
        overwrite: false,
      });
    } catch (error) {
      throw new AppError(
        "CLOUDINARY_UPLOAD_FAILED",
        "Failed to upload asset to Cloudinary",
        502,
        error,
      );
    }
  }

  async deleteAsset(publicId: string, resourceType: "image" | "video" | "raw" = "image") {
    this.ensureConfigured();
    try {
      return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
      throw new AppError(
        "CLOUDINARY_DELETE_FAILED",
        "Failed to delete Cloudinary asset",
        502,
        error,
      );
    }
  }

  getOptimizedUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string | number;
      format?: string;
    },
  ): string {
    this.ensureConfigured();
    return cloudinary.url(publicId, {
      secure: true,
      width: options?.width,
      height: options?.height,
      crop: options?.crop ?? "fill",
      quality: options?.quality ?? "auto",
      fetch_format: options?.format ?? "auto",
    });
  }

  buildTransformUrl(publicId: string, transformation: Record<string, unknown>): string {
    this.ensureConfigured();
    return cloudinary.url(publicId, {
      secure: true,
      ...transformation,
    });
  }
}

export const cloudinaryService = new CloudinaryService();
