import { connectMongo, mongoose } from "@/infrastructure/database/mongodb";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

/** Liveness probe — process is up. Avoid leaking environment / uptime details. */
export async function GET() {
  try {
    let mongo: "ok" | "error" | "skipped" = "skipped";
    if (process.env.MONGODB_URI) {
      try {
        await connectMongo();
        mongo = mongoose.connection.readyState === 1 ? "ok" : "error";
      } catch {
        mongo = "error";
      }
    }

    return successResponse({
      status: mongo === "error" ? "degraded" : "ok",
      checks: { mongo },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
