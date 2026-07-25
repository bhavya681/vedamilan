import "server-only";

import {
  DEFAULT_LOCALE,
  MESSAGE_NAMESPACES,
  type AppLocale,
  type MessageNamespace,
} from "@/lib/i18n/locales";
import type { MessageTree } from "@/lib/i18n/translate";

export type { MessageTree } from "@/lib/i18n/translate";

const loaders: Record<MessageNamespace, Record<string, () => Promise<{ default: MessageTree }>>> = {
  common: {
    en: () => import("@/locales/en/common.json"),
    hi: () => import("@/locales/hi/common.json"),
    mr: () => import("@/locales/mr/common.json"),
    es: () => import("@/locales/es/common.json"),
    pt: () => import("@/locales/pt/common.json"),
    fr: () => import("@/locales/fr/common.json"),
    ar: () => import("@/locales/ar/common.json"),
    de: () => import("@/locales/de/common.json"),
    bn: () => import("@/locales/bn/common.json"),
    ta: () => import("@/locales/ta/common.json"),

    sa: () => import("@/locales/sa/common.json"),
  },
  navigation: {
    en: () => import("@/locales/en/navigation.json"),
    hi: () => import("@/locales/hi/navigation.json"),
    mr: () => import("@/locales/mr/navigation.json"),
    es: () => import("@/locales/es/navigation.json"),
    pt: () => import("@/locales/pt/navigation.json"),
    fr: () => import("@/locales/fr/navigation.json"),
    ar: () => import("@/locales/ar/navigation.json"),
    de: () => import("@/locales/de/navigation.json"),
    bn: () => import("@/locales/bn/navigation.json"),
    ta: () => import("@/locales/ta/navigation.json"),

    sa: () => import("@/locales/sa/navigation.json"),
  },
  auth: {
    en: () => import("@/locales/en/auth.json"),
    hi: () => import("@/locales/hi/auth.json"),
    mr: () => import("@/locales/mr/auth.json"),
    es: () => import("@/locales/es/auth.json"),
    pt: () => import("@/locales/pt/auth.json"),
    fr: () => import("@/locales/fr/auth.json"),
    ar: () => import("@/locales/ar/auth.json"),
    de: () => import("@/locales/de/auth.json"),
    bn: () => import("@/locales/bn/auth.json"),
    ta: () => import("@/locales/ta/auth.json"),

    sa: () => import("@/locales/sa/auth.json"),
  },
  settings: {
    en: () => import("@/locales/en/settings.json"),
    hi: () => import("@/locales/hi/settings.json"),
    mr: () => import("@/locales/mr/settings.json"),
    es: () => import("@/locales/es/settings.json"),
    pt: () => import("@/locales/pt/settings.json"),
    fr: () => import("@/locales/fr/settings.json"),
    ar: () => import("@/locales/ar/settings.json"),
    de: () => import("@/locales/de/settings.json"),
    bn: () => import("@/locales/bn/settings.json"),
    ta: () => import("@/locales/ta/settings.json"),

    sa: () => import("@/locales/sa/settings.json"),
  },
  marketing: {
    en: () => import("@/locales/en/marketing.json"),
    hi: () => import("@/locales/hi/marketing.json"),
    mr: () => import("@/locales/mr/marketing.json"),
    es: () => import("@/locales/es/marketing.json"),
    pt: () => import("@/locales/pt/marketing.json"),
    fr: () => import("@/locales/fr/marketing.json"),
    ar: () => import("@/locales/ar/marketing.json"),
    de: () => import("@/locales/de/marketing.json"),
    bn: () => import("@/locales/bn/marketing.json"),
    ta: () => import("@/locales/ta/marketing.json"),

    sa: () => import("@/locales/sa/marketing.json"),
  },
  matches: {
    en: () => import("@/locales/en/matches.json"),
    hi: () => import("@/locales/hi/matches.json"),
    mr: () => import("@/locales/mr/matches.json"),
    es: () => import("@/locales/es/matches.json"),
    pt: () => import("@/locales/pt/matches.json"),
    fr: () => import("@/locales/fr/matches.json"),
    ar: () => import("@/locales/ar/matches.json"),
    de: () => import("@/locales/de/matches.json"),
    bn: () => import("@/locales/bn/matches.json"),
    ta: () => import("@/locales/ta/matches.json"),

    sa: () => import("@/locales/sa/matches.json"),
  },
  compatibility: {
    en: () => import("@/locales/en/compatibility.json"),
    hi: () => import("@/locales/hi/compatibility.json"),
    mr: () => import("@/locales/mr/compatibility.json"),
    es: () => import("@/locales/es/compatibility.json"),
    pt: () => import("@/locales/pt/compatibility.json"),
    fr: () => import("@/locales/fr/compatibility.json"),
    ar: () => import("@/locales/ar/compatibility.json"),
    de: () => import("@/locales/de/compatibility.json"),
    bn: () => import("@/locales/bn/compatibility.json"),
    ta: () => import("@/locales/ta/compatibility.json"),

    sa: () => import("@/locales/sa/compatibility.json"),
  },
  relationship: {
    en: () => import("@/locales/en/relationship.json"),
    hi: () => import("@/locales/hi/relationship.json"),
    mr: () => import("@/locales/mr/relationship.json"),
    es: () => import("@/locales/es/relationship.json"),
    pt: () => import("@/locales/pt/relationship.json"),
    fr: () => import("@/locales/fr/relationship.json"),
    ar: () => import("@/locales/ar/relationship.json"),
    de: () => import("@/locales/de/relationship.json"),
    bn: () => import("@/locales/bn/relationship.json"),
    ta: () => import("@/locales/ta/relationship.json"),

    sa: () => import("@/locales/sa/relationship.json"),
  },
  errors: {
    en: () => import("@/locales/en/errors.json"),
    hi: () => import("@/locales/hi/errors.json"),
    mr: () => import("@/locales/mr/errors.json"),
    es: () => import("@/locales/es/errors.json"),
    pt: () => import("@/locales/pt/errors.json"),
    fr: () => import("@/locales/fr/errors.json"),
    ar: () => import("@/locales/ar/errors.json"),
    de: () => import("@/locales/de/errors.json"),
    bn: () => import("@/locales/bn/errors.json"),
    ta: () => import("@/locales/ta/errors.json"),

    sa: () => import("@/locales/sa/errors.json"),
  },
  ai: {
    en: () => import("@/locales/en/ai.json"),
    hi: () => import("@/locales/hi/ai.json"),
    mr: () => import("@/locales/mr/ai.json"),
    es: () => import("@/locales/es/ai.json"),
    pt: () => import("@/locales/pt/ai.json"),
    fr: () => import("@/locales/fr/ai.json"),
    ar: () => import("@/locales/ar/ai.json"),
    de: () => import("@/locales/de/ai.json"),
    bn: () => import("@/locales/bn/ai.json"),
    ta: () => import("@/locales/ta/ai.json"),

    sa: () => import("@/locales/sa/ai.json"),
  },
  billing: {
    en: () => import("@/locales/en/billing.json"),
    hi: () => import("@/locales/hi/billing.json"),
    mr: () => import("@/locales/mr/billing.json"),
    es: () => import("@/locales/es/billing.json"),
    pt: () => import("@/locales/pt/billing.json"),
    fr: () => import("@/locales/fr/billing.json"),
    ar: () => import("@/locales/ar/billing.json"),
    de: () => import("@/locales/de/billing.json"),
    bn: () => import("@/locales/bn/billing.json"),
    ta: () => import("@/locales/ta/billing.json"),

    sa: () => import("@/locales/sa/billing.json"),
  },
  vedic: {
    en: () => import("@/locales/en/vedic.json"),
    hi: () => import("@/locales/hi/vedic.json"),
    mr: () => import("@/locales/mr/vedic.json"),
    es: () => import("@/locales/es/vedic.json"),
    pt: () => import("@/locales/pt/vedic.json"),
    fr: () => import("@/locales/fr/vedic.json"),
    ar: () => import("@/locales/ar/vedic.json"),
    de: () => import("@/locales/de/vedic.json"),
    bn: () => import("@/locales/bn/vedic.json"),
    ta: () => import("@/locales/ta/vedic.json"),

    sa: () => import("@/locales/sa/vedic.json"),
  },
  pages: {
    en: () => import("@/locales/en/pages.json"),
    hi: () => import("@/locales/hi/pages.json"),
    mr: () => import("@/locales/mr/pages.json"),
    es: () => import("@/locales/es/pages.json"),
    pt: () => import("@/locales/pt/pages.json"),
    fr: () => import("@/locales/fr/pages.json"),
    ar: () => import("@/locales/ar/pages.json"),
    de: () => import("@/locales/de/pages.json"),
    bn: () => import("@/locales/bn/pages.json"),
    ta: () => import("@/locales/ta/pages.json"),

    sa: () => import("@/locales/sa/pages.json"),
  },
  enums: {
    en: () => import("@/locales/en/enums.json"),
    hi: () => import("@/locales/hi/enums.json"),
    sa: () => import("@/locales/sa/enums.json"),
    mr: () => import("@/locales/mr/enums.json"),
    es: () => import("@/locales/es/enums.json"),
    pt: () => import("@/locales/pt/enums.json"),
    fr: () => import("@/locales/fr/enums.json"),
    ar: () => import("@/locales/ar/enums.json"),
    de: () => import("@/locales/de/enums.json"),
    bn: () => import("@/locales/bn/enums.json"),
    ta: () => import("@/locales/ta/enums.json"),
  },
  notifications: {
    en: () => import("@/locales/en/notifications.json"),
    hi: () => import("@/locales/hi/notifications.json"),
    sa: () => import("@/locales/sa/notifications.json"),
    mr: () => import("@/locales/mr/notifications.json"),
    es: () => import("@/locales/es/notifications.json"),
    pt: () => import("@/locales/pt/notifications.json"),
    fr: () => import("@/locales/fr/notifications.json"),
    ar: () => import("@/locales/ar/notifications.json"),
    de: () => import("@/locales/de/notifications.json"),
    bn: () => import("@/locales/bn/notifications.json"),
    ta: () => import("@/locales/ta/notifications.json"),
  },
};

function deepMerge(base: MessageTree, overlay: MessageTree): MessageTree {
  const out: MessageTree = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof out[key] === "object" &&
      out[key] !== null
    ) {
      out[key] = deepMerge(out[key] as MessageTree, value as MessageTree);
    } else if (typeof value === "string" && value.trim()) {
      out[key] = value;
    }
  }
  return out;
}

async function loadNamespace(locale: AppLocale, ns: MessageNamespace): Promise<MessageTree> {
  const loadEn = loaders[ns].en;
  if (!loadEn) throw new Error(`Missing English messages for namespace: ${ns}`);
  const enMod = await loadEn();
  const en = enMod.default;
  if (locale === DEFAULT_LOCALE) return en;
  try {
    const loadLoc = loaders[ns][locale];
    if (!loadLoc) return en;
    const locMod = await loadLoc();
    return deepMerge(en, locMod.default);
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[i18n] Missing locale messages: ${locale}/${ns}`);
    }
    return en;
  }
}

/** Server-only message loader — do not import from Client Components. */
export async function getMessages(
  locale: AppLocale,
): Promise<Record<MessageNamespace, MessageTree>> {
  const entries = await Promise.all(
    MESSAGE_NAMESPACES.map(async (ns) => [ns, await loadNamespace(locale, ns)] as const),
  );
  return Object.fromEntries(entries) as Record<MessageNamespace, MessageTree>;
}
