"use client";

import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { NumberPlanetIcon } from "@/features/numerology/components/number-planet-icon";
import { KnowledgeLabelBadge } from "@/features/numerology/components/knowledge-label-badge";
import type { NumberProfile } from "@/domain/numerology";
import { useT } from "@/components/i18n/i18n-provider";

const ASPECT_KEYS: Array<{ key: keyof NumberProfile; labelKey: string; section: boolean }> = [
  {
    key: "coreTendencies",
    labelKey: "numerology.mulank.interpretation.coreTendencies",
    section: true,
  },
  { key: "strengths", labelKey: "numerology.mulank.interpretation.strengths", section: true },
  { key: "growthAreas", labelKey: "numerology.mulank.interpretation.growthAreas", section: true },
  { key: "career", labelKey: "numerology.mulank.interpretation.career", section: true },
  {
    key: "relationships",
    labelKey: "numerology.mulank.interpretation.relationships",
    section: true,
  },
  {
    key: "communication",
    labelKey: "numerology.mulank.interpretation.communication",
    section: true,
  },
  { key: "learning", labelKey: "numerology.mulank.interpretation.learning", section: true },
  { key: "remedies", labelKey: "numerology.mulank.interpretation.remedies", section: true },
];

export function NumberDetailSheet({
  profile,
  open,
  onOpenChange,
}: {
  profile: NumberProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  if (!profile) return null;

  const planet = profile.planet;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="border-border/50 flex h-[85vh] max-h-[85vh] flex-col overflow-hidden rounded-t-3xl p-0 md:m-6 md:ml-auto md:h-auto md:max-w-2xl md:rounded-2xl"
      >
        <SheetHeader className="border-border/50 relative shrink-0 border-b px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3 sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <NumberPlanetIcon number={profile.number} planet={planet} size="md" />
              <div className="min-w-0">
                <SheetTitle className="font-display text-xl sm:text-2xl">
                  {planet} · Number {profile.number}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground mt-1 text-sm">
                  {profile.keyword} · {profile.coreEnergy}
                </SheetDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground rounded-full p-2 transition-colors"
              aria-label={t("numerology.masterNumbers.title")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <div className="border-border/50 space-y-5 border-b pb-4">
              <div>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  {t("numerology.mulank.interpretation.coreTendencies")}
                </p>
                <p className="font-display mt-2 text-xl">{profile.coreEnergy}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {planet}
              </Badge>
            </div>

            {ASPECT_KEYS.slice(1).map((aspect) => {
              const blocks = profile[aspect.key] as Array<{ label: string; body: string }>;
              if (!blocks?.length) return null;
              return (
                <section key={aspect.key} className="border-border/50 space-y-3 border-b pb-4">
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    {t(aspect.labelKey)}
                  </p>
                  <ul className="space-y-3">
                    {blocks.map((block, i) => (
                      <li key={`${aspect.key}-${i}`} className="flex flex-col gap-1.5">
                        <KnowledgeLabelBadge label={block.label as never} />
                        <p className="text-sm leading-relaxed">{block.body}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}

            {profile.masterNote ? (
              <section className="space-y-2 pt-2">
                <KnowledgeLabelBadge label="traditional" />
                <p className="text-sm leading-relaxed">{profile.masterNote}</p>
              </section>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
