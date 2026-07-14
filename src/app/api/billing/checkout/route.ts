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
        planCode: z.string().min(1),
        provider: z.enum(["STRIPE", "RAZORPAY"]).default("RAZORPAY"),
      })
      .parse(await request.json());

    const result = await billingService.createCheckout({
      userId: session.user.id,
      email: session.user.email,
      planCode: body.planCode,
      provider: body.provider,
    });
    return successResponse(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
