"use client";

import { useT } from "@/components/i18n/i18n-provider";
import type { KnowledgeLabel } from "@/domain/numerology";
import { cn } from "@/lib/utils/cn";

const LABEL_KEY: Record<KnowledgeLabel, string> = {
  traditional: "numerology.labels.traditional",
  contemporary: "numerology.labels.contemporary",
  personalized: "numerology.labels.personalized",
};

const TONE: Record<KnowledgeLabel, string> = {
  traditional: "border-saffron/25 bg-saffron/10 text-saffron",
  contemporary: "border-cosmic/25 bg-cosmic/10 text-cosmic",
  personalized: "border-primary/25 bg-primary/10 text-primary",
};

export function KnowledgeLabelBadge({
  label,
  className,
}: {
  label: KnowledgeLabel;
  className?: string;
}) {
  const t = useT();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase",
        TONE[label],
        className,
      )}
      aria-label={label}
    >
      {t(LABEL_KEY[label])}
    </span>
  );
}
