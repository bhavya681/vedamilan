import { z } from "zod";

import { Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { requireSession } from "@/lib/auth/session";
import { APP_LOCALES, BILLING_CURRENCIES, UI_I18N_ENABLED, isAppLocale } from "@/lib/i18n/locales";
import { successResponse } from "@/lib/utils/api-response";
import { handleRouteError, UnauthorizedError, ValidationError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

const localizationSchema = z.object({
  language: z.enum(APP_LOCALES),
  region: z.string().trim().min(2).max(8),
  timezone: z.string().trim().min(2).max(64),
  dateFormat: z.enum(["locale", "DMY", "MDY", "YMD"]),
  timeFormat: z.enum(["12h", "24h"]),
  currency: z.enum(BILLING_CURRENCIES),
  aiLanguage: z
    .union([z.enum(APP_LOCALES), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v == null ? null : v)),
});

export async function GET() {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    await connectMongo();
    const profile = await Profile.findOne({ userId: session.user.id, status: "ACTIVE" }).lean();
    const localization = {
      language:
        UI_I18N_ENABLED && isAppLocale(profile?.localization?.language)
          ? profile?.localization?.language
          : "en",
      region: profile?.localization?.region || "IN",
      timezone: profile?.localization?.timezone || "Asia/Kolkata",
      dateFormat: profile?.localization?.dateFormat || "locale",
      timeFormat: profile?.localization?.timeFormat || "12h",
      currency: profile?.localization?.currency || "INR",
      aiLanguage: profile?.localization?.aiLanguage || null,
    };
    return successResponse({ localization });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession().catch(() => {
      throw new UnauthorizedError();
    });
    const body = await request.json();
    const parsed = localizationSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Invalid language & region preferences");

    const localization = {
      ...parsed.data,
      language: UI_I18N_ENABLED ? parsed.data.language : "en",
    };

    await connectMongo();
    // Preference updates must never reactivate suspended/deleted accounts.
    const updated = await Profile.findOneAndUpdate(
      { userId: session.user.id },
      {
        $set: {
          localization,
        },
        $setOnInsert: {
          userId: session.user.id,
        },
      },
      { upsert: true, new: true },
    ).lean();

    return successResponse({
      localization: updated?.localization,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
