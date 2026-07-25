import { z } from "zod";

import { answerProductGuide } from "@/application/ai/guide-chat.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError } from "@/lib/utils/error-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  message: z.string().min(1).max(2000),
});

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

/** Public product-guide chat for the landing page (no auth required). */
export async function POST(request: Request) {
  try {
    await enforceRateLimit({
      key: `ai:guide:${clientIp(request)}`,
      limit: 30,
      windowSec: 60,
    });
    const body = schema.parse(await request.json());
    const answer = answerProductGuide(body.message);
    return successResponse({ answer });
  } catch (error) {
    return handleRouteError(error);
  }
}
