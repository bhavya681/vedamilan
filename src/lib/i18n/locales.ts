/**
 * VedaMilan locale registry — scalable without rewriting the app.
 * Calculations stay language-independent; UI/AI use these codes.
 */

export const APP_LOCALES = [
  "en",
  "hi",
  "sa",
  "mr",
  "es",
  "pt",
  "fr",
  "ar",
  "de",
  "bn",
  "ta",
] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

/** Ready for future enablement — not active until translations ship. */
export const FUTURE_LOCALES = [
  "te",
  "gu",
  "kn",
  "ml",
  "pa",
  "ur",
  "ja",
  "ko",
  "id",
  "it",
  "nl",
  "tr",
] as const;

export const DEFAULT_LOCALE: AppLocale = "en";

export const LOCALE_COOKIE = "vedamilan.locale";
export const LOCALE_EXPLICIT_COOKIE = "vedamilan.locale.explicit";
export const LOCALE_HEADER = "x-vedamilan-locale";

export type LocaleMeta = {
  code: AppLocale;
  /** Native endonym for the language selector */
  nativeName: string;
  /** English label for admin / analytics */
  englishName: string;
  /** BCP 47 tag for Intl + HTML lang */
  bcp47: string;
  dir: "ltr" | "rtl";
  /** Default region when user hasn't chosen one */
  defaultRegion: string;
  /** Default display currency suggestion (billing still server-validated) */
  defaultCurrency: string;
  ogLocale: string;
};

export const LOCALE_META: Record<AppLocale, LocaleMeta> = {
  en: {
    code: "en",
    nativeName: "English",
    englishName: "English",
    bcp47: "en-IN",
    dir: "ltr",
    defaultRegion: "IN",
    defaultCurrency: "INR",
    ogLocale: "en_IN",
  },
  hi: {
    code: "hi",
    nativeName: "हिन्दी",
    englishName: "Hindi",
    bcp47: "hi-IN",
    dir: "ltr",
    defaultRegion: "IN",
    defaultCurrency: "INR",
    ogLocale: "hi_IN",
  },
  sa: {
    code: "sa",
    nativeName: "संस्कृतम्",
    englishName: "Sanskrit",
    bcp47: "sa-IN",
    dir: "ltr",
    defaultRegion: "IN",
    defaultCurrency: "INR",
    ogLocale: "sa_IN",
  },
  mr: {
    code: "mr",
    nativeName: "मराठी",
    englishName: "Marathi",
    bcp47: "mr-IN",
    dir: "ltr",
    defaultRegion: "IN",
    defaultCurrency: "INR",
    ogLocale: "mr_IN",
  },
  es: {
    code: "es",
    nativeName: "Español",
    englishName: "Spanish",
    bcp47: "es-ES",
    dir: "ltr",
    defaultRegion: "ES",
    defaultCurrency: "EUR",
    ogLocale: "es_ES",
  },
  pt: {
    code: "pt",
    nativeName: "Português",
    englishName: "Portuguese",
    bcp47: "pt-BR",
    dir: "ltr",
    defaultRegion: "BR",
    defaultCurrency: "USD",
    ogLocale: "pt_BR",
  },
  fr: {
    code: "fr",
    nativeName: "Français",
    englishName: "French",
    bcp47: "fr-FR",
    dir: "ltr",
    defaultRegion: "FR",
    defaultCurrency: "EUR",
    ogLocale: "fr_FR",
  },
  ar: {
    code: "ar",
    nativeName: "العربية",
    englishName: "Arabic",
    bcp47: "ar-AE",
    dir: "rtl",
    defaultRegion: "AE",
    defaultCurrency: "AED",
    ogLocale: "ar_AE",
  },
  de: {
    code: "de",
    nativeName: "Deutsch",
    englishName: "German",
    bcp47: "de-DE",
    dir: "ltr",
    defaultRegion: "DE",
    defaultCurrency: "EUR",
    ogLocale: "de_DE",
  },
  bn: {
    code: "bn",
    nativeName: "বাংলা",
    englishName: "Bengali",
    bcp47: "bn-IN",
    dir: "ltr",
    defaultRegion: "IN",
    defaultCurrency: "INR",
    ogLocale: "bn_IN",
  },
  ta: {
    code: "ta",
    nativeName: "தமிழ்",
    englishName: "Tamil",
    bcp47: "ta-IN",
    dir: "ltr",
    defaultRegion: "IN",
    defaultCurrency: "INR",
    ogLocale: "ta_IN",
  },
};

export const BILLING_CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "CAD", "AUD", "SGD"] as const;

export type BillingCurrency = (typeof BILLING_CURRENCIES)[number];

export const MESSAGE_NAMESPACES = [
  "common",
  "navigation",
  "auth",
  "settings",
  "marketing",
  "matches",
  "compatibility",
  "relationship",
  "errors",
  "ai",
  "billing",
  "vedic",
  "grahaKatha",
  "pages",
  "enums",
  "notifications",
] as const;

export type MessageNamespace = (typeof MESSAGE_NAMESPACES)[number];

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && (APP_LOCALES as readonly string[]).includes(value);
}

export function getLocaleMeta(locale: string): LocaleMeta {
  return LOCALE_META[isAppLocale(locale) ? locale : DEFAULT_LOCALE];
}

export function isRtlLocale(locale: string): boolean {
  return getLocaleMeta(locale).dir === "rtl";
}
