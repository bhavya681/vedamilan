import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslateFn, type TranslateFn } from "@/lib/i18n/catalogs/localize";
import type { AppLocale } from "@/lib/i18n/locales";

/** Server Components / route handlers — load messages once per request locale. */
export async function getServerT(locale?: AppLocale): Promise<{
  locale: AppLocale;
  t: TranslateFn;
}> {
  const resolved = locale || (await getRequestLocale());
  const messages = await getMessages(resolved);
  return { locale: resolved, t: createTranslateFn(messages) };
}
