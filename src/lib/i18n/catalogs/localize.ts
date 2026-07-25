import type { MessageTree } from "@/lib/i18n/translate";
import { translateKey } from "@/lib/i18n/translate";
import {
  alignmentCodeToKey,
  decisionSummaryCodeFromLabel,
  type AlignmentCode,
  type CompatMoodCode,
  type DecisionSummaryCode,
  type GenderCode,
  type MaritalStatusCode,
} from "@/lib/i18n/catalogs/codes";

type Messages = Record<string, MessageTree>;
type TVars = Record<string, string | number>;

export type TranslateFn = (key: string, vars?: TVars) => string;

export function createTranslateFn(messages: Messages): TranslateFn {
  return (key, vars) => translateKey(messages, key, vars);
}

export function localizeGender(t: TranslateFn, code: string | null | undefined): string {
  const c = (code || "UNDISCLOSED").toUpperCase() as GenderCode;
  return t(`enums.gender.${c}`);
}

export function localizeMaritalStatus(t: TranslateFn, code: string | null | undefined): string {
  if (!code) return t("enums.maritalStatus.UNKNOWN");
  return t(`enums.maritalStatus.${code}`);
}

export function localizeAlignment(t: TranslateFn, code: AlignmentCode | string): string {
  return t(alignmentCodeToKey(code as AlignmentCode));
}

export function localizeDecisionSummary(
  t: TranslateFn,
  codeOrLabel: DecisionSummaryCode | string,
): string {
  const code =
    codeOrLabel.includes("_") || codeOrLabel === codeOrLabel.toLowerCase()
      ? (codeOrLabel as DecisionSummaryCode)
      : decisionSummaryCodeFromLabel(codeOrLabel);
  return t(`compatibility.verdicts.${code}`);
}

export function localizeCompatMood(
  t: TranslateFn,
  code: CompatMoodCode,
): { title: string; blurb: string } {
  return {
    title: t(`compatibility.moods.${code}.title`),
    blurb: t(`compatibility.moods.${code}.blurb`),
  };
}

export function localizeKootaName(t: TranslateFn, koota: string): string {
  const code = koota.replace(/\s+/g, "");
  const key = `compatibility.kootas.${code}`;
  const translated = t(key);
  // If missing, translateKey returns missingTranslation or key — fall back to canonical koota name
  if (
    translated === key ||
    translated.includes("unavailable") ||
    translated === "Content unavailable"
  ) {
    return koota;
  }
  return translated;
}

/** Localize a reason that may be a code (`kootaStrong.Varna`) or legacy English prose. */
export function localizeReasonCode(t: TranslateFn, codeOrText: string, koota?: string): string {
  if (codeOrText.startsWith("kootaStrong.")) {
    const name = codeOrText.slice("kootaStrong.".length);
    return t("compatibility.reasons.kootaStrong", { koota: localizeKootaName(t, name) });
  }
  if (codeOrText.startsWith("kootaAttention.")) {
    const name = codeOrText.slice("kootaAttention.".length);
    return t("compatibility.reasons.kootaAttention", { koota: localizeKootaName(t, name) });
  }
  if (codeOrText.startsWith("manglik.")) {
    return t(`compatibility.reasons.${codeOrText}`);
  }
  if (koota && codeOrText.includes(koota)) {
    // Best-effort: leave legacy English until engines emit codes everywhere
    return codeOrText;
  }
  return codeOrText;
}

export function localizeApiError(
  t: TranslateFn,
  code: string | undefined,
  fallback?: string,
): string {
  if (!code) return fallback || t("errors.generic");
  const key = `errors.codes.${code}`;
  const translated = t(key);
  if (translated === key || translated === t("errors.missingTranslation")) {
    return fallback || t("errors.generic");
  }
  return translated;
}

/**
 * Resolve in-app notification copy from type + data.
 * Falls back to stored English title/body for unknown/legacy notifications.
 */
export function localizeNotification(
  t: TranslateFn,
  note: {
    type?: string;
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
  },
): { title: string; body: string } {
  const type = note.type || "";
  const name = typeof note.data?.senderName === "string" ? note.data.senderName : "";
  const preview = typeof note.data?.preview === "string" ? note.data.preview : "";

  const titleKey = `notifications.types.${type}.title`;
  const bodyKey = `notifications.types.${type}.body`;
  const title = t(titleKey, { name });
  const body = t(bodyKey, { name, preview });

  const missing = t("errors.missingTranslation");
  if (title === titleKey || title === missing) {
    return {
      title: note.title || t("notifications.fallbackTitle"),
      body: note.body || "",
    };
  }
  return { title, body: body === bodyKey || body === missing ? note.body || "" : body };
}
