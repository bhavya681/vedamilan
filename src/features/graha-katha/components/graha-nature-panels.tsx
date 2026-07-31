"use client";

import { useT } from "@/components/i18n/i18n-provider";
import { SectionHeader } from "@/components/ui/vedic";
import type { GrahaNature, LifeDomain } from "@/domain/graha-katha/types";
import { ContentLabelBadge } from "@/features/graha-katha/components/content-label";

const DOMAIN_KEYS: LifeDomain[] = [
  "career",
  "relationships",
  "family",
  "mind",
  "health",
  "spirituality",
  "wealth",
];

export function GrahaNaturePanels({ nature }: { nature: GrahaNature }) {
  const t = useT();

  return (
    <section className="min-w-0 space-y-5 sm:space-y-6">
      <SectionHeader
        eyebrow={t("grahaKatha.understand")}
        title={t("grahaKatha.understand")}
        description={t("grahaKatha.labels.traditional")}
      />
      <ContentLabelBadge label="traditional" />

      <div className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-2">
        <Panel title={t("grahaKatha.nature.core")} body={nature.coreNature} tone="cosmic" />
        <Panel title={t("grahaKatha.nature.lesson")} body={nature.innerLesson} tone="gold" />
        <Panel title={t("grahaKatha.nature.strong")} body={nature.whenStrong} tone="saffron" />
        <Panel
          title={t("grahaKatha.nature.challenged")}
          body={nature.whenChallenged}
          tone="charcoal"
        />
      </div>

      <div className="border-border/50 bg-card/80 shadow-soft rounded-[1.35rem] border p-5 sm:p-6">
        <h3 className="font-display mb-4 text-xl">{t("grahaKatha.nature.represents")}</h3>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {nature.represents.map((item) => (
            <li
              key={item}
              className="border-border/40 bg-muted/25 flex gap-2.5 rounded-xl border px-3 py-2.5 text-sm"
            >
              <span className="bg-gold mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
              <span className="text-muted-foreground leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-display mb-3 text-xl">{t("grahaKatha.nature.domains")}</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DOMAIN_KEYS.map((key) => {
            const body = nature.lifeDomains[key];
            if (!body) return null;
            return (
              <div
                key={key}
                className="katha-panel border-border/50 hover:border-gold/30 bg-card/70 shadow-soft rounded-2xl border p-4"
              >
                <p className="text-saffron text-xs font-semibold tracking-wide uppercase">
                  {t(`grahaKatha.domains.${key}`)}
                </p>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Panel({
  title,
  body,
  tone,
}: {
  title: string;
  body: string;
  tone: "cosmic" | "gold" | "saffron" | "charcoal";
}) {
  const bar =
    tone === "cosmic"
      ? "from-cosmic/30"
      : tone === "gold"
        ? "from-gold/40"
        : tone === "saffron"
          ? "from-saffron/40"
          : "from-foreground/20";

  return (
    <div className="border-border/50 katha-panel bg-card/80 shadow-soft relative min-w-0 overflow-hidden rounded-[1.25rem] border p-4 sm:p-5">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${bar} to-transparent`} />
      <h3 className="font-display text-lg">{title}</h3>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed break-words">{body}</p>
    </div>
  );
}
