import { z } from "zod";

import {
  findSimilarCelebrities,
  SIMILARITY_FOCUSES,
} from "@/application/horoscope/celebrity-similarity.service";
import { requireSession } from "@/lib/auth/session";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  focus: z.enum(SIMILARITY_FOCUSES).default("overall"),
  limit: z.coerce.number().int().min(1).max(60).default(24),
  minScore: z.coerce.number().min(0).max(100).default(0),
});

export async function GET(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      focus: searchParams.get("focus") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      minScore: searchParams.get("minScore") ?? undefined,
    });
    if (!parsed.success) throw parsed.error;

    const data = await findSimilarCelebrities(session.user.id, parsed.data);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
