"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { formatVedicTerm, type VedicTermId } from "@/lib/i18n/glossary";
import { translateKey, type MessageTree } from "@/lib/i18n/translate";
import {
  getLocaleMeta,
  isRtlLocale,
  type AppLocale,
  type MessageNamespace,
} from "@/lib/i18n/locales";

type Messages = Record<MessageNamespace, MessageTree>;

type I18nContextValue = {
  locale: AppLocale;
  dir: "ltr" | "rtl";
  messages: Messages;
  t: (key: string, vars?: Record<string, string | number>) => string;
  vedic: (termId: VedicTermId) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: AppLocale;
  messages: Messages;
  children: ReactNode;
}) {
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translateKey(messages, key, vars),
    [messages],
  );

  const vedic = useCallback((termId: VedicTermId) => formatVedicTerm(termId, locale), [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir: getLocaleMeta(locale).dir,
      messages,
      t,
      vedic,
    }),
    [locale, messages, t, vedic],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

export function useT() {
  return useI18n().t;
}

export function useLocale(): AppLocale {
  return useI18n().locale;
}

export function useIsRtl() {
  return isRtlLocale(useLocale());
}
