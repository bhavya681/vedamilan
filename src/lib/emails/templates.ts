import { brand } from "@/lib/constants/brand";

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

function wrapHtml(title: string, body: string, lang = "en"): string {
  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#0B1426;font-family:Georgia,'Times New Roman',serif;color:#FAF6F0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0B1426;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#121C30;border:1px solid rgba(201,162,39,0.35);border-radius:16px;padding:32px;">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#C9A227;">${brand.name}</p>
                <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#FAF6F0;">${title}</h1>
                ${body}
                <p style="margin:28px 0 0;font-size:12px;color:rgba(250,246,240,0.65);">
                  ${brand.legalName} · ${brand.supportEmail}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function welcomeEmail(name: string, locale = "en"): EmailTemplate {
  const subject = `Welcome to ${brand.name}`;
  const text = `Namaste ${name},\n\nWelcome to ${brand.name}. Your journey toward meaningful connection begins now.\n\nVisit your dashboard to complete your profile and generate your Vedic chart.\n\nWith warmth,\nThe ${brand.name} Team`;
  const html = wrapHtml(
    `Welcome, ${name}`,
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:rgba(250,246,240,0.9);">
      Your account is ready. Complete your profile, generate your Vedic chart, and let our AI relationship intelligence find compatible partners aligned with your values and destiny.
    </p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard" style="display:inline-block;margin-top:8px;padding:12px 20px;background:linear-gradient(135deg,#C9A227,#1F4E68);color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;">
      Open dashboard
    </a>`,
    locale,
  );
  return { subject, html, text };
}

export function passwordResetEmail(name: string, resetUrl: string, locale = "en"): EmailTemplate {
  const subject = `Reset your ${brand.name} password`;
  const text = `Namaste ${name},\n\nWe received a request to reset your password.\n\nOpen this link to continue: ${resetUrl}\n\nIf you did not request this, you can ignore this email.`;
  const html = wrapHtml(
    "Reset your password",
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:rgba(250,246,240,0.9);">
      Namaste ${name}, use the secure link below to choose a new password. This link expires soon for your protection.
    </p>
    <a href="${resetUrl}" style="display:inline-block;margin-top:8px;padding:12px 20px;background:#1F4E68;color:#FAF6F0;text-decoration:none;border-radius:999px;font-weight:700;">
      Reset password
    </a>`,
    locale,
  );
  return { subject, html, text };
}

export function emailVerificationEmail(name: string, verifyUrl: string): EmailTemplate {
  const subject = `Verify your ${brand.name} email`;
  const text = `Namaste ${name},\n\nPlease verify your email address:\n${verifyUrl}\n\nIf you did not create an account, you can ignore this email.`;
  const html = wrapHtml(
    "Verify your email",
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:rgba(250,246,240,0.9);">
      Namaste ${name}, confirm your email to secure your account.
    </p>
    <a href="${verifyUrl}" style="display:inline-block;margin-top:8px;padding:12px 20px;background:#1F4E68;color:#FAF6F0;text-decoration:none;border-radius:999px;font-weight:700;">
      Verify email
    </a>`,
  );
  return { subject, html, text };
}

export function emailOtpTemplate(email: string, otp: string, purpose: string): EmailTemplate {
  const subject = `Your ${brand.name} verification code`;
  const text = `Your ${purpose} code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`;
  const html = wrapHtml(
    "Verification code",
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:rgba(250,246,240,0.9);">
      Use this code for <strong>${purpose}</strong> on the account <strong>${email}</strong>.
    </p>
    <p style="margin:0;font-size:28px;letter-spacing:0.2em;font-weight:700;color:#C9A227;">${otp}</p>
    <p style="margin:16px 0 0;font-size:13px;color:rgba(250,246,240,0.65);">Expires in 10 minutes.</p>`,
  );
  return { subject, html, text };
}
