"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { MessageCircle, Mic, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ContentReveal } from "@/components/ui/page-skeletons";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { AstrologerPortrait } from "@/features/consultation/components/astrologer-portrait";
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

  return (
    <div className="space-y-10">
      <ContentReveal className="space-y-10">
        <PageHeader
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
            <div className="max-w-2xl space-y-4">
              <p className="text-muted-foreground flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] uppercase">
                <Sparkles className="text-gold h-3.5 w-3.5" aria-hidden />
                {astrologer.title}
              </p>
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

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="border-border/60 space-y-3 rounded-2xl border p-5">
            <h2 className="font-display text-xl">Approach</h2>
            <ul className="grid gap-2">
              {astrologer.coreApproach.map((item) => (
                <li key={item} className="text-muted-foreground text-sm leading-relaxed">
                  · {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-border/60 space-y-3 rounded-2xl border p-5">
            <h2 className="font-display text-xl">Explore topics</h2>
            <div className="flex flex-wrap gap-2">
              {astrologer.topics.map((topic) => (
                <Link
                  key={topic}
                  href={`${consultationPaths.chat(astrologer.id)}?topic=${encodeURIComponent(topic)}`}
                  className="border-border/60 hover:border-gold/40 rounded-full border px-3 py-1.5 text-xs transition-colors"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
          <div className="border-border/60 space-y-3 rounded-2xl border p-5">
            <h2 className="font-display text-xl">Primary sources</h2>
            <ul className="grid gap-2">
              {astrologer.primarySources.map((s) => (
                <li key={s} className="text-muted-foreground text-sm">
                  · {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-border/60 space-y-3 rounded-2xl border p-5">
            <h2 className="font-display text-xl">Remedy style</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {astrologer.remedyStyle}
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Limits: {astrologer.limitations.join(" · ")}
            </p>
          </div>
        </section>

        <p className="text-muted-foreground text-xs leading-relaxed">{VEDIC_AI_DISCLAIMER}</p>
      </ContentReveal>
    </div>
  );
}
