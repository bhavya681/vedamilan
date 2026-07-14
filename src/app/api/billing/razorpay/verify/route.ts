import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { billingService } from "@/application/billing/billing.service";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

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
        planCode: z.string().min(1),
      })
      .parse(await request.json());

    const subscription = await billingService.verifyRazorpayPayment({
      userId: session.user.id,
      ...body,
    });
    return successResponse({ subscription });
  } catch (error) {
    return handleRouteError(error);
  }
}
