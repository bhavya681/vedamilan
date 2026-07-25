import { describe, expect, it } from "vitest";

import { getMessages } from "@/lib/i18n/get-messages";
import { translateKey } from "@/lib/i18n/translate";
import { formatLocalizedCurrency, formatLocalizedDate } from "@/lib/i18n/format";
import { formatVedicTerm } from "@/lib/i18n/glossary";
import { APP_LOCALES, DEFAULT_LOCALE, isAppLocale, isRtlLocale } from "@/lib/i18n/locales";
import { negotiateBrowserLocale, stripLocaleFromPathname, withLocalePrefix } from "@/lib/i18n/path";

describe("i18n locales", () => {
  it("recognizes launch locales and RTL for Arabic", () => {
    expect(isAppLocale("hi")).toBe(true);
    expect(isAppLocale("sa")).toBe(true);
    expect(isAppLocale("xx")).toBe(false);
    expect(isRtlLocale("ar")).toBe(true);
    expect(isRtlLocale("en")).toBe(false);
    expect(DEFAULT_LOCALE).toBe("en");
  });

  it("strips and prefixes locale paths", () => {
    expect(stripLocaleFromPathname("/hi/dashboard/matches")).toEqual({
      locale: "hi",
      pathname: "/dashboard/matches",
    });
    expect(withLocalePrefix("es", "/login")).toBe("/es/login");
    expect(withLocalePrefix("en", "/")).toBe("/en");
  });

  it("negotiates Accept-Language", () => {
    expect(negotiateBrowserLocale("hi-IN,hi;q=0.9,en;q=0.8")).toBe("hi");
    expect(negotiateBrowserLocale("de-DE,de;q=0.9")).toBe("de");
    expect(negotiateBrowserLocale("sa-IN,sa;q=0.9")).toBe("sa");
    expect(negotiateBrowserLocale(null)).toBe("en");
  });
});

describe("i18n messages", () => {
  it("loads english namespaces and falls back for missing keys", async () => {
    const en = await getMessages("en");
    expect(translateKey(en, "common.save")).toBe("Save");
    expect(translateKey(en, "settings.languageRegion")).toContain("Language");
    const missing = translateKey(en, "common.doesNotExist");
    expect(missing).not.toBe("common.doesNotExist");
  });

  it("merges hindi overlays without dropping english fallbacks", async () => {
    const hi = await getMessages("hi");
    expect(translateKey(hi, "common.save")).toBe("सहेजें");
    expect(translateKey(hi, "common.appName")).toBe("VedaMilan AI");
  });

  it("loads sanskrit overlays", async () => {
    const sa = await getMessages("sa");
    expect(translateKey(sa, "common.save")).toBe("रक्षतु");
    expect(translateKey(sa, "navigation.kundli")).toBe("कुण्डली");
    expect(translateKey(sa, "common.appName")).toBe("VedaMilan AI");
  });

  it("covers all launch locales without throwing", async () => {
    for (const locale of APP_LOCALES) {
      const messages = await getMessages(locale);
      expect(translateKey(messages, "navigation.kundli")).toBeTruthy();
    }
  });
});

describe("i18n formatters & glossary", () => {
  it("formats dates and currency with Intl", () => {
    const date = new Date("2026-07-12T10:00:00Z");
    expect(formatLocalizedDate(date, "en", { dateFormat: "DMY" })).toContain("2026");
    expect(formatLocalizedCurrency(999, "en", "INR")).toMatch(/999|₹/);
  });

  it("keeps canonical Vedic terms", () => {
    expect(formatVedicTerm("kundli", "es")).toContain("Kundli");
    expect(formatVedicTerm("kundli", "es")).toContain("védica");
  });
});
