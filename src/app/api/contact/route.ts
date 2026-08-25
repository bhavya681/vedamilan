import { z } from "zod";

import { sendEmail } from "@/lib/emails/send";
import { contactInquiryEmail } from "@/lib/emails/templates";
import { brand } from "@/lib/constants/brand";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, ServiceUnavailableError } from "@/lib/utils/error-handler";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(10).max(4000),
  website: z.string().optional(),
});

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

/** Public contact form — no auth required. */
export async function POST(request: Request) {
  try {
    await enforceRateLimit({
      key: `contact:${clientIp(request)}`,
      limit: 5,
      windowSec: 600,
    });

    const body = schema.parse(await request.json());

    if (body.website?.trim()) {
      return successResponse({ delivered: true });
    }

    const company = body.company.trim() || undefined;
    const template = contactInquiryEmail({
      name: body.name,
      email: body.email,
      company,
      message: body.message,
    });

    const result = await sendEmail({
      to: brand.supportEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: body.email,
    });

    logger.info({ email: body.email, delivered: result.sent }, "Contact inquiry received");

    if (!result.sent && process.env.RESEND_API_KEY?.trim()) {
      throw new ServiceUnavailableError(
        `Unable to send your message right now. Please email ${brand.supportEmail}.`,
      );
    }

    return successResponse({ delivered: result.sent });
  } catch (error) {
    return handleRouteError(error);
  }
}
