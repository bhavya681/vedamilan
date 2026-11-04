"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Bot, CalendarDays, MessageCircle, Mic, Orbit, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ContentReveal } from "@/components/ui/page-skeletons";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import {
  AstrologerPortrait,
  AstrologerTile,
} from "@/features/consultation/components/astrologer-portrait";
import { ASTROLOGER_FILTERS, ASTROLOGER_SYSTEM_META } from "@/features/consultation/system-meta";
import {
  listVirtualAstrologers,
  type AstrologerSystem,
} from "@/domain/consultation/virtual-astrologers";
import { VEDIC_AI_DISCLAIMER } from "@/lib/constants/ai-disclaimer";
import { consultationPaths, routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

export default function ConsultationPage() {
  const { setMode } = useWorkspaceMode();
  const [filter, setFilter] = useState<"all" | AstrologerSystem>("all");
  const all = useMemo(() => listVirtualAstrologers(), []);
  const stats = useMemo(
    () => [
      {
        icon: Bot,
        label: "AI masters",
        value: String(all.length),
        detail: "Distinct tradition lenses",
      },
      {
        icon: Orbit,
        label: "Kundli-aware",
        value: "Your chart",
        detail: "No invented placements",
      },
      {
        icon: Mic,
        label: "Consult modes",
        value: "Chat + voice",
        detail: "Text or spoken guidance",
      },
    ],
    [all.length],
  );
  const astrologers = useMemo(() => {
    if (filter === "all") return all;
    return all.filter((a) => a.system === filter);
  }, [all, filter]);

  useEffect(() => {
    setMode("astrology", { navigate: false });
  }, [setMode]);

  return (
    <div className="min-w-0 space-y-8 sm:space-y-10">
      <ContentReveal className="min-w-0 space-y-8 sm:space-y-10">
        <PageHeader
          eyebrow="Astrology · Consultation"
          title="Virtual AI Astrologers"
          description="Chat or speak with fusion AI masters — Rahu Guru, Guru Orbit, Budha Byte, and more — each reading your stored kundli through a distinct Vedic tradition."
          actions={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={routes.aiInsights}>
                  <Sparkles className="h-4 w-4" aria-hidden />
                  AI Guru
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full sm:w-auto">
                <Link href={routes.bookConsultation}>
                  <CalendarDays className="h-4 w-4" aria-hidden />
                  Human booking soon
                </Link>
              </Button>
            </div>
          }
        />

        <section className="border-gold/20 from-card/90 via-muted/20 shadow-soft relative min-w-0 overflow-hidden rounded-[1.75rem] border bg-gradient-to-br to-transparent">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="bg-gold/20 absolute -top-24 -right-16 h-72 w-72 rounded-full blur-3xl" />
            <div className="bg-cosmic/20 absolute -bottom-28 left-1/3 h-64 w-64 rounded-full blur-3xl" />
            <div className="border-gold/10 absolute top-1/2 right-8 hidden h-64 w-64 -translate-y-1/2 rounded-full border lg:block" />
            <div className="border-gold/10 absolute top-1/2 right-16 hidden h-44 w-44 -translate-y-1/2 rounded-full border lg:block" />
          </div>

          <div className="relative grid min-w-0 gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-10 lg:p-9">
            <div className="min-w-0 space-y-4 sm:space-y-5">
              <p className="text-gold/85 flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {all.length} AI masters · one kundli
              </p>
              <h2 className="font-display max-w-2xl text-[1.9rem] leading-[1.08] tracking-tight text-balance sm:text-4xl">
                One chart. A council of tradition lenses.
              </h2>
              <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
                Choose the interpretive style that fits your question — Parashara for structure, KP
                for timing, Nadi for pattern threads, or remedies for practical upayas. Every answer
                stays anchored to your calculated chart.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="border-gold/25 bg-gold/8 text-gold inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                  <Bot className="h-3.5 w-3.5" aria-hidden />
                  Stylized AI, not real people
                </span>
                <span className="border-border/60 bg-background/60 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                  <Orbit className="h-3.5 w-3.5" aria-hidden />
                  Chart-grounded readings
                </span>
              </div>
              <div className="grid gap-2 pt-1 sm:grid-cols-3">
                {stats.map(({ icon: Icon, label, value, detail }) => (
                  <div
                    key={label}
                    className="border-border/50 bg-background/55 flex min-w-0 items-start gap-2.5 rounded-xl border p-3 backdrop-blur-sm"
                  >
                    <span className="bg-gold/10 text-gold mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-sm leading-tight">{value}</p>
                      <p className="text-muted-foreground mt-0.5 text-[10px] font-medium tracking-[0.12em] uppercase">
                        {label}
                      </p>
                      <p className="text-muted-foreground mt-1 hidden text-[11px] leading-snug xl:block">
                        {detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden min-w-0 sm:block">
              <div className="mx-auto grid max-w-sm grid-cols-3 gap-2.5">
                {all.slice(0, 6).map((astrologer, index) => (
                  <Link
                    key={astrologer.id}
                    href={consultationPaths.astrologer(astrologer.id)}
                    className={cn(
                      "border-border/55 bg-card/75 hover:border-gold/40 hover:bg-gold/5 group flex min-w-0 flex-col items-center gap-2 rounded-2xl border p-2.5 text-center transition-colors",
                      index === 0 && "border-gold/35 bg-gold/8",
                    )}
                  >
                    <AstrologerPortrait
                      astrologer={astrologer}
                      size="sm"
                      className="!h-12 !w-12 sm:!h-14 sm:!w-14"
                    />
                    <span className="w-full min-w-0">
                      <span className="font-display block truncate text-[11px] leading-tight font-semibold sm:text-xs">
                        {astrologer.displayName}
                      </span>
                      <span className="text-muted-foreground mt-0.5 block truncate text-[9px] tracking-wide uppercase">
                        {ASTROLOGER_SYSTEM_META[astrologer.system].shortLabel}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
              <p className="text-muted-foreground mt-3 text-center text-[10px] tracking-[0.16em] uppercase">
                Tap a master to explore the tradition
              </p>
            </div>
          </div>
        </section>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-gold/80 text-[10px] font-semibold tracking-[0.18em] uppercase">
                Council roster
              </p>
              <h2 className="font-display mt-1 text-2xl tracking-tight sm:text-3xl">
                Choose a tradition lens
              </h2>
            </div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {astrologers.length} of {all.length} masters
            </p>
          </div>

          <div
            className="scrollbar-hidden -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible"
            role="group"
            aria-label="Filter astrologers by tradition"
          >
            {ASTROLOGER_FILTERS.map((f) => {
              const active = filter === f.id;
              const count =
                f.id === "all" ? all.length : all.filter((a) => a.system === f.id).length;
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
                    active
                      ? "border-gold/50 bg-gold/10 text-foreground shadow-soft"
                      : "border-border/60 text-muted-foreground hover:border-gold/30 hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", active && "text-gold")} aria-hidden />
                  {f.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                      active ? "bg-gold/15 text-gold" : "bg-muted/60 text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {astrologers.map((a) => (
              <AstrologerTile key={a.id} astrologer={a} />
            ))}
          </div>

          {!astrologers.length ? (
            <div className="border-border/50 bg-card/60 rounded-2xl border px-6 py-12 text-center">
              <p className="font-display text-xl">No masters in this tradition yet</p>
              <p className="text-muted-foreground mt-2 text-sm">
                Choose all traditions to meet the full council.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => setFilter("all")}
              >
                Show all masters
              </Button>
            </div>
          ) : null}
        </section>

        <div className="border-gold/20 from-card/80 via-muted/20 flex flex-col gap-3 rounded-2xl border bg-gradient-to-br to-transparent p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span className="bg-gold/10 text-gold inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <MessageCircle className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg">Not sure which tradition fits?</p>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                Start with AI Guru for a general chart overview, then bring the specific question to
                a tradition specialist.
              </p>
            </div>
          </div>
          <Button asChild variant="secondary" className="w-full shrink-0 gap-1.5 sm:w-auto">
            <Link href={routes.aiInsights}>
              Open AI Guru
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">{VEDIC_AI_DISCLAIMER}</p>
      </ContentReveal>
    </div>
  );
}
