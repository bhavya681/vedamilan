import { connectMongo, mongoose } from "@/infrastructure/database/mongodb";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

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
      service: "vedamilan-ai",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV ?? "development",
      checks: { mongo },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
