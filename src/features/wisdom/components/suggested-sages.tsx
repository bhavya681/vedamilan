"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RishiSageTile } from "@/features/wisdom/components/wisdom-portrait";
import { LIFE_NEED_QUESTIONS } from "@/domain/wisdom/life-prompts";
import { LIFE_NEEDS, type LifeNeedId } from "@/domain/wisdom/sage-alignment";
import type { WisdomGuide } from "@/domain/wisdom/guides";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type AlignmentPayload = {
  need: LifeNeedId;
  context: {
    hasChart: boolean;
    moonSign: string | null;
    nakshatra: string | null;
    gana: string | null;
    varna: string | null;
    currentMaha: string | null;
    currentAntar: string | null;
  };
  suggestions: Array<{
    guide: WisdomGuide;
    score: number;
    reasons: string[];
  }>;
};

export function SuggestedSages({ onSpotlight }: { onSpotlight?: (ids: string[]) => void }) {
  const [need, setNeed] = useState<LifeNeedId | null>(null);
  const [data, setData] = useState<AlignmentPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const query = need ? `?need=${need}` : "";
    setLoading(true);
    void fetch(`/api/wisdom${query}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success) return;
        const alignment = json.data.alignment as AlignmentPayload | undefined;
        if (!alignment) return;
        setData(alignment);
        if (!need) setNeed(alignment.need);
        onSpotlight?.(alignment.suggestions.slice(0, 3).map((row) => row.guide.id));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [need, onSpotlight]);

  const picks = useMemo(() => data?.suggestions.slice(0, 3) ?? [], [data]);
  const councilHref = useMemo(() => {
    const params = new URLSearchParams();
    if (need) {
      params.set("need", need);
      params.set("q", LIFE_NEED_QUESTIONS[need]);
    }
    if (picks.length) params.set("ids", picks.map((row) => row.guide.id).join(","));
    const query = params.toString();
    return query ? `${routes.askTheSages}?${query}` : routes.askTheSages;
  }, [need, picks]);

  const contextLine = data
    ? [
        data.context.moonSign ? `Moon ${data.context.moonSign}` : null,
        data.context.nakshatra,
        data.context.gana ? `${data.context.gana} gana` : null,
        data.context.currentMaha ? `${data.context.currentMaha} Mahadasha` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl min-w-0">
          <p className="text-gold/80 text-[10px] font-semibold tracking-[0.18em] uppercase">
            For your life
          </p>
          <h2 className="font-display mt-1 text-2xl tracking-tight sm:text-3xl">
            Start with what you are facing
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Pick an area of life. Chart tags only refine the suggestion — they never decide for you.
            This is practical counsel, not destiny.
          </p>
          {contextLine ? (
            <p className="text-muted-foreground mt-2 text-xs">{contextLine}</p>
          ) : data && !data.context.hasChart ? (
            <p className="text-muted-foreground mt-2 text-xs">
              Add birth details to align the sabha with your Kundli.{" "}
              <Link href={routes.birthDetails} className="underline">
                Open birth details
              </Link>
            </p>
          ) : null}
        </div>
        <Button asChild variant="secondary" className="min-h-11 w-full sm:w-auto">
          <Link href={councilHref}>Ask these sages</Link>
        </Button>
      </div>

      <div className="scrollbar-hidden -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch]">
        {LIFE_NEEDS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setNeed(item.id)}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-3.5 py-1.5 text-left text-xs transition-colors",
              need === item.id
                ? "border-gold/40 bg-gold/15 text-foreground"
                : "border-border/55 text-muted-foreground hover:border-gold/30 hover:text-foreground",
            )}
          >
            <span className="block font-semibold tracking-wide">{item.label}</span>
            <span className="text-muted-foreground hidden sm:block">{item.hint}</span>
          </button>
        ))}
      </div>

      {loading && picks.length === 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border-border/55 bg-card space-y-4 rounded-2xl border p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="h-5 w-32 max-w-full rounded-full" />
                  <Skeleton className="h-3 w-full rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-4/5 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-xl sm:w-20 sm:flex-none" />
                <Skeleton className="h-9 flex-1 rounded-xl sm:w-20 sm:flex-none" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {picks.map((row) => (
            <div key={row.guide.id} className="min-w-0">
              <RishiSageTile guide={row.guide} reason={row.reasons[0]} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
