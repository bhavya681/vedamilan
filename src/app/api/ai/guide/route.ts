import { z } from "zod";

import { answerProductGuide } from "@/application/ai/guide-chat.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

const schema = z.object({
  message: z.string().min(1).max(2000),
});

/** Public product-guide chat for the landing page (no auth required). */
export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const answer = answerProductGuide(body.message);
    return successResponse({ answer });
  } catch (error) {
    return handleRouteError(error);
  }
}
