import { requireSession } from "@/lib/auth/session";
import { jaiminiKarakaService } from "@/application/horoscope/jaimini/jaimini.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  convention: z.enum(["sapta", "ashta"]).optional(),
  retrograde: z.enum(["direct", "remaining"]).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      convention: searchParams.get("convention") ?? undefined,
      retrograde: searchParams.get("retrograde") ?? undefined,
    });
    if (!parsed.success) throw new ValidationError("Invalid Jaimini convention");
    const data = await jaiminiKarakaService.forUser(session.user.id, {
      convention: parsed.data.convention,
      retrogradeMode: parsed.data.retrograde,
    });
    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
