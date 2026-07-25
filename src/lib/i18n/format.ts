import { getLocaleMeta, type BillingCurrency } from "@/lib/i18n/locales";

export type DateFormatPreference = "locale" | "DMY" | "MDY" | "YMD";
export type TimeFormatPreference = "12h" | "24h";

export function formatLocalizedDate(
  value: Date | string | number,
  locale: string,
  options?: {
    dateFormat?: DateFormatPreference;
    dateStyle?: Intl.DateTimeFormatOptions["dateStyle"];
  },
) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const bcp47 = getLocaleMeta(locale).bcp47;
  const pref = options?.dateFormat || "locale";

  if (pref === "locale") {
    return new Intl.DateTimeFormat(bcp47, {
      dateStyle: options?.dateStyle || "long",
    }).format(date);
  }

  const day = date.getDate();
  const month = date.toLocaleString(bcp47, { month: "long" });
  const year = date.getFullYear();
  if (pref === "MDY") return `${month} ${day}, ${year}`;
  if (pref === "YMD") return `${year} ${month} ${day}`;
  return `${day} ${month} ${year}`;
}

export function formatLocalizedTime(
  value: Date | string | number,
  locale: string,
  timeFormat: TimeFormatPreference = "12h",
) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(getLocaleMeta(locale).bcp47, {
    hour: "numeric",
    minute: "2-digit",
    hour12: timeFormat === "12h",
  }).format(date);
}

export function formatLocalizedNumber(value: number, locale: string) {
  return new Intl.NumberFormat(getLocaleMeta(locale).bcp47).format(value);
}

export function formatLocalizedCurrency(
  amount: number,
  locale: string,
  currency: BillingCurrency | string,
) {
  try {
    return new Intl.NumberFormat(getLocaleMeta(locale).bcp47, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "INR" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}
