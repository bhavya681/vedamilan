import { billingService } from "@/application/billing/billing.service";
import { handleRouteError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");
    const rawBody = Buffer.from(await request.arrayBuffer());
    const result = await billingService.handleStripeWebhook(rawBody, signature);
    return Response.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
