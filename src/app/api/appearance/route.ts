import { requireSession } from "@/lib/auth/session";
import { Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { appearancePreferencesSchema } from "@/lib/validators/appearance";
import { normalizeAppearance } from "@/lib/appearance/dom";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await connectMongo();
    const profile = await Profile.findOne({ userId: session.user.id }).lean();
    const appearance = normalizeAppearance(
      (profile as { appearance?: Record<string, unknown> } | null)?.appearance as never,
    );
    return successResponse(appearance);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = appearancePreferencesSchema.parse(await request.json());
    const appearance = normalizeAppearance(body);
    await connectMongo();
    await Profile.findOneAndUpdate(
      { userId: session.user.id },
      { $set: { appearance } },
      { upsert: true, setDefaultsOnInsert: true },
    );
    return successResponse(appearance);
  } catch (error) {
    return handleRouteError(error);
  }
}
