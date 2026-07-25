import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { WisdomJournal } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await connectMongo();
    const entries = await WisdomJournal.find({ userId: session.user.id, status: "ACTIVE" })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return successResponse({ entries });
  } catch (error) {
    return handleRouteError(error);
  }
}

const schema = z.object({
  guideId: z.string().optional(),
  guideName: z.string().max(120).optional(),
  category: z
    .enum(["Marriage", "Career", "Personal Growth", "Family", "Relationships", "Other"])
    .default("Other"),
  question: z.string().max(2000).optional(),
  insight: z.string().min(1).max(12000),
  reflection: z.string().max(4000).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = schema.parse(await request.json());
    await connectMongo();
    const entry = await WisdomJournal.create({
      userId: session.user.id,
      guideId: body.guideId || null,
      guideName: body.guideName || "",
      category: body.category,
      question: body.question || "",
      insight: body.insight,
      reflection: body.reflection || "",
    });
    return successResponse({ entry });
  } catch (error) {
    return handleRouteError(error);
  }
}
