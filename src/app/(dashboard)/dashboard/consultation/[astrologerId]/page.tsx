"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { BookOpen, Check, Compass, MessageCircle, Mic, ShieldCheck, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ContentReveal } from "@/components/ui/page-skeletons";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { AstrologerPortrait } from "@/features/consultation/components/astrologer-portrait";
import { ASTROLOGER_SYSTEM_META } from "@/features/consultation/system-meta";
import { getVirtualAstrologer } from "@/domain/consultation/virtual-astrologers";
import { VEDIC_AI_DISCLAIMER } from "@/lib/constants/ai-disclaimer";
import { consultationPaths, routes } from "@/lib/constants/routes";

export default function ConsultationAstrologerProfilePage() {
  const params = useParams<{ astrologerId: string }>();
  const astrologer = getVirtualAstrologer(params.astrologerId);
  const { setMode } = useWorkspaceMode();

  useEffect(() => {
    setMode("astrology", { navigate: false });
  }, [setMode]);

  if (!astrologer) {
    return (
      <div className="space-y-4 py-10">
        <p>Astrologer not found.</p>
        <Button asChild variant="outline">
          <Link href={routes.consultation}>Back to Consultation</Link>
        </Button>
      </div>
    );
  }

  const system = ASTROLOGER_SYSTEM_META[astrologer.system];
  const SystemIcon = system.icon;

  return (
    <div className="space-y-10">
      <ContentReveal className="space-y-10">
        <PageHeader
          eyebrow={`${system.label} · Consultation`}
          title={astrologer.displayName}
          description={astrologer.tradition}
          actions={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button asChild>
                <Link href={consultationPaths.chat(astrologer.id)}>
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={consultationPaths.voice(astrologer.id)}>
                  <Mic className="h-4 w-4" />
                  Speak
                </Link>
              </Button>
            </div>
          }
        />

        <section className="border-border/60 from-muted/40 relative overflow-hidden rounded-3xl border bg-gradient-to-br to-transparent p-6 sm:p-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <AstrologerPortrait
                astrologer={astrologer}
                size="xl"
                className="shadow-soft ring-gold/20 !h-36 !w-36 sm:!h-44 sm:!w-44"
              />
              <span className="bg-background/90 text-muted-foreground absolute -right-1 -bottom-1 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase backdrop-blur">
                AI · {astrologer.gender}
              </span>
            </div>
            <div className="max-w-2xl min-w-0 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-muted-foreground flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] uppercase">
                  <Sparkles className="text-gold h-3.5 w-3.5" aria-hidden />
                  {astrologer.title}
                </p>
                <span className="border-gold/25 bg-gold/8 text-gold inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase">
                  <SystemIcon className="h-3 w-3" aria-hidden />
                  {system.label}
                </span>
              </div>
              <p className="font-display text-2xl leading-snug sm:text-3xl">
                “{astrologer.shortBlurb}”
              </p>
              <p className="text-sm leading-relaxed">
                <span className="font-medium">Virtual AI Astrologer</span> — inspired by{" "}
                {astrologer.tradition}. Reads your stored kundli; suggests remedies from classical
                themes when your chart flags them.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {astrologer.biography}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild>
                  <Link href={consultationPaths.chat(astrologer.id)}>Begin consultation</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={consultationPaths.voice(astrologer.id)}>
                    Speak with {astrologer.displayName}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:gap-5 lg:grid-cols-2">
          <div className="border-border/60 from-card/80 to-muted/20 shadow-soft space-y-4 rounded-2xl border bg-gradient-to-br p-5 sm:p-6">
            <h2 className="font-display flex items-center gap-2 text-xl">
              <span className="bg-gold/10 text-gold inline-flex h-8 w-8 items-center justify-center rounded-lg">
                <Compass className="h-4 w-4" aria-hidden />
              </span>
              Approach
            </h2>
            <ul className="grid gap-2.5">
              {astrologer.coreApproach.map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground flex items-start gap-2.5 text-sm leading-relaxed"
                >
                  <Check className="text-gold mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-border/60 from-card/80 to-muted/20 shadow-soft space-y-4 rounded-2xl border bg-gradient-to-br p-5 sm:p-6">
            <h2 className="font-display flex items-center gap-2 text-xl">
              <span className="bg-gold/10 text-gold inline-flex h-8 w-8 items-center justify-center rounded-lg">
                <MessageCircle className="h-4 w-4" aria-hidden />
              </span>
              Explore topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {astrologer.topics.map((topic) => (
                <Link
                  key={topic}
                  href={`${consultationPaths.chat(astrologer.id)}?topic=${encodeURIComponent(topic)}`}
                  className="border-border/60 bg-background/50 hover:border-gold/40 hover:bg-gold/5 rounded-full border px-3 py-1.5 text-xs transition-colors"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
          <div className="border-border/60 from-card/80 to-muted/20 shadow-soft space-y-4 rounded-2xl border bg-gradient-to-br p-5 sm:p-6">
            <h2 className="font-display flex items-center gap-2 text-xl">
              <span className="bg-gold/10 text-gold inline-flex h-8 w-8 items-center justify-center rounded-lg">
                <BookOpen className="h-4 w-4" aria-hidden />
              </span>
              Primary sources
            </h2>
            <ul className="grid gap-2.5">
              {astrologer.primarySources.map((s) => (
                <li key={s} className="text-muted-foreground flex items-start gap-2.5 text-sm">
                  <span className="bg-gold/60 mt-2 h-1 w-1 shrink-0 rounded-full" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-border/60 from-card/80 to-muted/20 shadow-soft space-y-4 rounded-2xl border bg-gradient-to-br p-5 sm:p-6">
            <h2 className="font-display flex items-center gap-2 text-xl">
              <span className="bg-gold/10 text-gold inline-flex h-8 w-8 items-center justify-center rounded-lg">
                <ShieldCheck className="h-4 w-4" aria-hidden />
              </span>
              Remedy style
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {astrologer.remedyStyle}
            </p>
            <div className="border-border/50 bg-background/40 rounded-xl border p-3">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                Limits
              </p>
              <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                {astrologer.limitations.join(" · ")}
              </p>
            </div>
          </div>
        </section>

        <p className="text-muted-foreground text-xs leading-relaxed">{VEDIC_AI_DISCLAIMER}</p>
      </ContentReveal>
    </div>
  );
}
