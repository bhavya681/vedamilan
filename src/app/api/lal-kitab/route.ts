import { requireSession } from "@/lib/auth/session";
import { Horoscope } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { buildLalKitabReport, LAL_KITAB_DISCLAIMER } from "@/application/horoscope/lal-kitab";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, NotFoundError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await connectMongo();
    const chart = await Horoscope.findOne({ userId: session.user.id })
      .sort({ calculatedAt: -1 })
      .lean();
    if (!chart) {
      throw new NotFoundError("Generate your kundli to open Lal Kitab analysis");
    }

    const planets = (chart.planets || []).map((p) => ({
      planet: String(p.planet || ""),
      house: Number(p.house || 0),
      sign: p.sign ? String(p.sign) : undefined,
    }));

    const report = buildLalKitabReport({
      planets,
      doshas: (chart.doshas || []).map((d) => ({
        code: String(d.code || ""),
        present: Boolean(d.present),
        name: d.name ? String(d.name) : undefined,
        notes: d.notes ? String(d.notes) : undefined,
      })),
      lagnaSign: chart.lagnaSign,
    });

    return successResponse({
      ...report,
      disclaimer: LAL_KITAB_DISCLAIMER,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
