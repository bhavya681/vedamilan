"use client";

import { useState } from "react";

import { useLocale, useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";

/**
 * Optional per-message translation control.
 * Always preserves the original text; never auto-replaces chat history.
 */
export function TranslateMessageButton({ text }: { text: string }) {
  const t = useT();
  const locale = useLocale();
  const [translated, setTranslated] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function translate() {
    if (translated && !showOriginal) {
      setShowOriginal(true);
      return;
    }
    if (translated && showOriginal) {
      setShowOriginal(false);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLocale: locale }),
      });
      const json = await res.json();
      if (!json.success || !json.data?.translatedText) {
        setError(json.data?.message || t("errors.generic"));
        return;
      }
      setTranslated(json.data.translatedText);
      setShowOriginal(false);
    } catch {
      setError(t("errors.network"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-1 space-y-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-auto px-1 py-0.5 text-xs"
        disabled={busy}
        onClick={() => void translate()}
      >
        {busy
          ? t("common.loading")
          : translated
            ? showOriginal
              ? t("ai.translateMessage")
              : t("ai.showOriginal")
            : t("ai.translateMessage")}
      </Button>
      {translated && !showOriginal ? (
        <div className="border-border/50 bg-muted/40 rounded-lg border px-2.5 py-2 text-sm">
          <p>{translated}</p>
          <p className="text-muted-foreground mt-1 text-[11px]">{t("common.translatedByAi")}</p>
        </div>
      ) : null}
      {error ? <p className="text-destructive text-[11px]">{error}</p> : null}
    </div>
  );
}
