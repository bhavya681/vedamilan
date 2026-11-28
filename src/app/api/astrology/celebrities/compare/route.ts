import { z } from "zod";

import { compareCelebrityWithUser } from "@/application/horoscope/celebrity-comparison.service";
import { SIMILARITY_FOCUSES } from "@/application/horoscope/celebrity-similarity.service";
import { requireSession } from "@/lib/auth/session";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  id: z.string().min(1),
  focus: z.enum(SIMILARITY_FOCUSES).default("overall"),
});

export async function GET(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      id: searchParams.get("id") ?? undefined,
      focus: searchParams.get("focus") ?? undefined,
    });
    if (!parsed.success) throw parsed.error;

    const data = await compareCelebrityWithUser(session.user.id, parsed.data.id, parsed.data.focus);
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
