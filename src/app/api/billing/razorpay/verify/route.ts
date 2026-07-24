import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { billingService } from "@/application/billing/billing.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

/**
 * Client may only send Razorpay capture tokens.
 * Plan, amount, and ownership are loaded from the server Payment row created at checkout.
 */
export async function POST(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = z
      .object({
        orderId: z.string().min(1),
        paymentId: z.string().min(1),
        signature: z.string().min(1),
      })
      .parse(await request.json());

    const subscription = await billingService.verifyRazorpayPayment({
      userId: session.user.id,
      orderId: body.orderId,
      paymentId: body.paymentId,
      signature: body.signature,
    });
    return successResponse({ subscription });
  } catch (error) {
    return handleRouteError(error);
  }
}
