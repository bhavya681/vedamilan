import { connectMongo, mongoose } from "@/infrastructure/database/mongodb";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

/**
 * Readiness probe — confirms the process can serve traffic (Mongo reachable).
 * Does not expose environment names, uptime, or dependency diagnostics beyond ok/error.
 */
export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return successResponse(
        { status: "not_ready", checks: { mongo: "missing_config" } },
        {
          status: 503,
        },
      );
    }

    await connectMongo();
    const mongoOk = mongoose.connection.readyState === 1;
    if (!mongoOk) {
      return successResponse({ status: "not_ready", checks: { mongo: "error" } }, { status: 503 });
    }

    return successResponse({ status: "ready", checks: { mongo: "ok" } });
  } catch (error) {
    return handleRouteError(error);
  }
}
