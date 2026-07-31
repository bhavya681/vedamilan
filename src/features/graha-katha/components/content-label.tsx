"use client";

import { useT } from "@/components/i18n/i18n-provider";
import type { ContentLabel } from "@/domain/graha-katha/types";
import { cn } from "@/lib/utils/cn";

const KEY: Record<ContentLabel, string> = {
  traditional: "grahaKatha.labels.traditional",
  story: "grahaKatha.labels.story",
  interpretive: "grahaKatha.labels.interpretive",
  remedy: "grahaKatha.labels.remedy",
  reflection: "grahaKatha.labels.reflection",
  chart: "grahaKatha.labels.chart",
};

const TONE: Record<ContentLabel, string> = {
  traditional: "border-cosmic/25 bg-cosmic/8 text-cosmic",
  story: "border-gold/35 bg-gold/10 text-[color:var(--foreground)]",
  interpretive: "border-saffron/30 bg-saffron/10 text-saffron",
  remedy:
    "border-[color:var(--emerald)]/25 bg-[color:var(--emerald)]/10 text-[color:var(--emerald)]",
  reflection: "border-rose/30 bg-rose/10 text-rose",
  chart: "border-primary/30 bg-primary/10 text-primary",
};

export function ContentLabelBadge({
  label,
  className,
}: {
  label: ContentLabel;
  className?: string;
}) {
  const t = useT();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase transition-[border-color,background-color,transform] duration-200 ease-out",
        TONE[label],
        className,
      )}
    >
      {t(KEY[label])}
    </span>
  );
}
