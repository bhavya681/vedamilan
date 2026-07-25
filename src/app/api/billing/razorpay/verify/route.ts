import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { billingService } from "@/application/billing/billing.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";
import { assertSameOriginMutation } from "@/lib/security/csrf";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { recordSecurityEvent, clientIpFromRequest } from "@/lib/security/security-log";

export const dynamic = "force-dynamic";

/**
 * Client may only send Razorpay capture tokens.
 * Plan, amount, and ownership are loaded from the server Payment row created at checkout.
 */
export async function POST(request: Request) {
  try {
    assertSameOriginMutation(request);
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await enforceRateLimit({
      key: `billing:verify:${session.user.id}`,
      limit: 20,
      windowSec: 60,
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
    await recordSecurityEvent({
      action: "billing.razorpay_verified",
      resource: "payment",
      resourceId: body.orderId,
      actorUserId: session.user.id,
      severity: "INFO",
      ipAddress: clientIpFromRequest(request),
      userAgent: request.headers.get("user-agent"),
    });
    return successResponse({ subscription });
  } catch (error) {
    return handleRouteError(error);
  }
}
