import { logger } from "@/lib/utils/logger";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * Sends transactional email via Resend HTTP API.
 * No-ops (with a warn) when RESEND_API_KEY is unset so local/dev stays usable.
 */
export async function sendEmail(input: SendEmailInput): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM || "VedaMilan AI <noreply@vedamilan.ai>";

  if (!apiKey) {
    logger.warn({ to: input.to, subject: input.subject }, "Email skipped — RESEND_API_KEY not set");
    return { sent: false };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    logger.error(
      { status: response.status, to: input.to, subject: input.subject, body: body.slice(0, 200) },
      "Resend email failed",
    );
    return { sent: false };
  }

  logger.info({ to: input.to, subject: input.subject }, "Transactional email sent");
  return { sent: true };
}
