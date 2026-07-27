"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { MessageCircle, Mic, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ContentReveal } from "@/components/ui/page-skeletons";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { WisdomPortrait } from "@/features/wisdom/components/wisdom-portrait";
import { getWisdomGuide } from "@/domain/wisdom/guides";
import { WISDOM_AI_DISCLAIMER } from "@/lib/constants/wisdom-disclaimer";
import { routes } from "@/lib/constants/routes";

export default function WisdomGuideProfilePage() {
  const params = useParams<{ guideId: string }>();
  const guide = getWisdomGuide(params.guideId);
  const { setMode } = useWorkspaceMode();

  useEffect(() => {
    setMode("wisdom", { navigate: false });
  }, [setMode]);

  if (!guide) {
    return (
      <div className="space-y-4 py-10">
        <p>Guide not found.</p>
        <Button asChild variant="outline">
          <Link href={routes.vedicWisdom}>Back to Rishi Sage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <ContentReveal className="space-y-10">
        <PageHeader
          title={guide.displayName}
          description={guide.domain}
          actions={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button asChild>
                <Link href={`${routes.vedicWisdom}/${guide.id}/chat`}>
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`${routes.vedicWisdom}/${guide.id}/voice`}>
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
              <WisdomPortrait
                guide={guide}
                size="xl"
                className="shadow-soft ring-gold/20 !h-36 !w-36 sm:!h-44 sm:!w-44"
              />
              <span className="bg-background/90 text-muted-foreground absolute -right-1 -bottom-1 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase backdrop-blur">
                AI guide
              </span>
            </div>
            <div className="max-w-2xl space-y-4">
              <p className="text-muted-foreground flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] uppercase">
                <Sparkles className="text-gold h-3.5 w-3.5" aria-hidden />
                {guide.role} · {guide.era}
              </p>
              {guide.sanskritName ? (
                <p className="font-display text-muted-foreground text-xl">{guide.sanskritName}</p>
              ) : null}
              <p className="font-display text-2xl leading-snug sm:text-3xl">
                “{guide.shortPhilosophy}”
              </p>
              <p className="text-sm leading-relaxed">
                <span className="font-medium">AI Wisdom Guide</span> — inspired by teachings and
                texts traditionally associated with {guide.displayName}. Reflective interpretation,
                not the historical figure speaking.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">{guide.biography}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild>
                  <Link href={`${routes.vedicWisdom}/${guide.id}/chat`}>Begin conversation</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`${routes.vedicWisdom}/${guide.id}/voice`}>
                    Speak with {guide.displayName}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="border-border/60 space-y-3 rounded-2xl border p-5">
            <h2 className="font-display text-xl">Known for</h2>
            <ul className="grid gap-2">
              {guide.knownFor.map((item) => (
                <li key={item} className="text-muted-foreground text-sm leading-relaxed">
                  · {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-border/60 space-y-3 rounded-2xl border p-5">
            <h2 className="font-display text-xl">Explore topics</h2>
            <div className="flex flex-wrap gap-2">
              {guide.topics.map((topic) => (
                <Link
                  key={topic}
                  href={`${routes.vedicWisdom}/${guide.id}/chat?topic=${encodeURIComponent(topic)}`}
                  className="border-border/60 hover:border-gold/40 hover:bg-gold/5 rounded-full border px-3 py-1.5 text-sm transition-colors"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl">Core teachings</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {guide.coreTeachings.map((t) => (
              <li
                key={t}
                className="border-border/50 bg-card/40 rounded-2xl border px-4 py-3 text-sm leading-relaxed"
              >
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-border/60 space-y-3 rounded-2xl border p-5">
          <h2 className="font-display text-xl">Sources & tradition</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Knowledge traditions used to shape this AI guide:
          </p>
          <ul className="space-y-1 text-sm">
            {guide.primarySources.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Limitations: {guide.limitations.join(" · ")}
          </p>
        </section>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href={`${routes.vedicWisdom}/${guide.id}/chat`}>Chat now</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`${routes.vedicWisdom}/${guide.id}/voice`}>Speak</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={routes.vedicWisdom}>Back to Rishi Sabha</Link>
          </Button>
        </div>

        <p className="text-muted-foreground max-w-3xl text-xs leading-relaxed">
          {WISDOM_AI_DISCLAIMER}
        </p>
      </ContentReveal>
    </div>
  );
}
