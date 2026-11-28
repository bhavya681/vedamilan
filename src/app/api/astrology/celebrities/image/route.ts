import { z } from "zod";

import { resolveCelebrityImageUrl } from "@/application/horoscope/celebrity-image-lookup.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({ name: searchParams.get("name") ?? undefined });
    if (!parsed.success) throw parsed.error;

    const imageUrl = await resolveCelebrityImageUrl(parsed.data.name);
    return successResponse({ imageUrl }, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch (error) {
    return handleRouteError(error);
  }
}
