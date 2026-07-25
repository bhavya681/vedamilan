"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { LanguageSelector } from "@/components/i18n/language-selector";
import { persistLocaleChoice } from "@/components/i18n/locale-navigation";
import { useI18n } from "@/components/i18n/i18n-provider";
import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatLocalizedCurrency,
  formatLocalizedDate,
  formatLocalizedTime,
} from "@/lib/i18n/format";
import {
  APP_LOCALES,
  BILLING_CURRENCIES,
  LOCALE_META,
  type AppLocale,
  type BillingCurrency,
} from "@/lib/i18n/locales";

type LocalizationState = {
  language: AppLocale;
  region: string;
  timezone: string;
  dateFormat: "locale" | "DMY" | "MDY" | "YMD";
  timeFormat: "12h" | "24h";
  currency: BillingCurrency;
  aiLanguage: AppLocale | null;
};

const REGION_OPTIONS = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "SG", label: "Singapore" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "ES", label: "Spain" },
  { value: "BR", label: "Brazil" },
];

const TIMEZONE_OPTIONS = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Madrid",
  "America/New_York",
  "America/Los_Angeles",
  "America/Toronto",
  "Australia/Sydney",
];

export default function LanguageRegionSettingsPage() {
  const { t, locale } = useI18n();
  const [form, setForm] = useState<LocalizationState>({
    language: locale,
    region: "IN",
    timezone: "Asia/Kolkata",
    dateFormat: "locale",
    timeFormat: "12h",
    currency: "INR",
    aiLanguage: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/settings/locale")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        const loc = json.data.localization;
        setForm({
          language: loc.language || locale,
          region: loc.region || "IN",
          timezone: loc.timezone || "Asia/Kolkata",
          dateFormat: loc.dateFormat || "locale",
          timeFormat: loc.timeFormat || "12h",
          currency: loc.currency || "INR",
          aiLanguage: loc.aiLanguage || null,
        });
      })
      .catch(() => undefined);
  }, [locale]);

  const preview = useMemo(() => {
    const now = new Date();
    return {
      date: formatLocalizedDate(now, form.language, { dateFormat: form.dateFormat }),
      time: formatLocalizedTime(now, form.language, form.timeFormat),
      money: formatLocalizedCurrency(999, form.language, form.currency),
    };
  }, [form]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/locale", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || t("errors.generic"));
        return;
      }
      persistLocaleChoice(form.language);
      setMessage(t("settings.saved"));
      if (form.language !== locale) {
        window.setTimeout(() => {
          window.location.assign(`/${form.language}/dashboard/settings/language`);
        }, 400);
      }
    } catch {
      setError(t("errors.network"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("settings.languageRegion")}
        description={t("settings.languageRegionDescription")}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.appLanguage")}</CardTitle>
          <CardDescription>{t("settings.appLanguageHint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LanguageSelector
            onChanged={(code) => setForm((prev) => ({ ...prev, language: code }))}
          />
          <p className="text-muted-foreground text-sm">{t("settings.birthDataUnchanged")}</p>
        </CardContent>
      </Card>

      <form onSubmit={(e) => void save(e)} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.regionLabel")}</CardTitle>
            <CardDescription>{t("settings.regionHint")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("settings.regionLabel")}</Label>
              <Select
                value={form.region}
                onValueChange={(value) => setForm((prev) => ({ ...prev, region: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGION_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.timezoneLabel")}</Label>
              <Select
                value={form.timezone}
                onValueChange={(value) => setForm((prev) => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">{t("settings.timezoneHint")}</p>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.dateFormat")}</Label>
              <Select
                value={form.dateFormat}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    dateFormat: value as LocalizationState["dateFormat"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="locale">{t("settings.dateFormatLocale")}</SelectItem>
                  <SelectItem value="DMY">{t("settings.dateFormatDmy")}</SelectItem>
                  <SelectItem value="MDY">{t("settings.dateFormatMdy")}</SelectItem>
                  <SelectItem value="YMD">{t("settings.dateFormatYmd")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.timeFormat")}</Label>
              <Select
                value={form.timeFormat}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    timeFormat: value as LocalizationState["timeFormat"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">{t("settings.time12h")}</SelectItem>
                  <SelectItem value="24h">{t("settings.time24h")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.currencyLabel")}</Label>
              <Select
                value={form.currency}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, currency: value as BillingCurrency }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">{t("settings.currencyHint")}</p>
            </div>
            <div className="space-y-2">
              <Label>{t("settings.aiLanguage")}</Label>
              <Select
                value={form.aiLanguage || "same"}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    aiLanguage: value === "same" ? null : (value as AppLocale),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="same">{t("settings.aiLanguageSame")}</SelectItem>
                  {APP_LOCALES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {LOCALE_META[code].nativeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">{t("settings.aiLanguageHint")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.previewDate")}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-1 text-sm">
            <p>
              {preview.date} · {preview.time}
            </p>
            <p>
              {preview.money} — {t("common.pricesVary")}
            </p>
          </CardContent>
        </Card>

        {error ? (
          <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-2xl border px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="border-gold/30 bg-gold/5 text-foreground rounded-2xl border px-4 py-3 text-sm">
            {message}
          </div>
        ) : null}

        <Button type="submit" disabled={loading}>
          {loading ? t("common.saving") : t("common.save")}
        </Button>
      </form>
    </div>
  );
}
