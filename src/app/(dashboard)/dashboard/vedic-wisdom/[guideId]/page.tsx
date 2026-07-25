"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ContentReveal } from "@/components/ui/page-skeletons";
import { WisdomPortrait } from "@/features/wisdom/components/wisdom-portrait";
import { getWisdomGuide } from "@/domain/wisdom/guides";
import { WISDOM_AI_DISCLAIMER } from "@/lib/constants/wisdom-disclaimer";
import { routes } from "@/lib/constants/routes";

export default function WisdomGuideProfilePage() {
  const params = useParams<{ guideId: string }>();
  const guide = getWisdomGuide(params.guideId);

  if (!guide) {
    return (
      <div className="space-y-4 py-10">
        <p>Guide not found.</p>
        <Button asChild variant="outline">
          <Link href={routes.vedicWisdom}>Back to Vedic Wisdom</Link>
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
                <Link href={`${routes.vedicWisdom}/${guide.id}/chat`}>Start Text Conversation</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`${routes.vedicWisdom}/${guide.id}/voice`}>
                  Speak with {guide.displayName}
                </Link>
              </Button>
            </div>
          }
        />

        <section className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
          <WisdomPortrait guide={guide} size="xl" className="shrink-0" />
          <div className="max-w-2xl space-y-4">
            <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
              {guide.role} · {guide.era}
            </p>
            {guide.sanskritName ? (
              <p className="font-display text-muted-foreground text-xl">{guide.sanskritName}</p>
            ) : null}
            <p className="font-display text-2xl leading-snug sm:text-3xl">
              “{guide.shortPhilosophy}”
            </p>
            <p className="text-sm leading-relaxed">
              <span className="font-medium">AI Wisdom Guide</span> — inspired by the teachings and
              texts traditionally associated with {guide.displayName}. This is an AI interpretation
              for reflection, not the historical figure speaking.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">{guide.biography}</p>
          </div>
        </section>

        <section className="border-border/60 space-y-3 border-y py-6">
          <h2 className="font-display text-xl">Known for</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {guide.knownFor.map((item) => (
              <li key={item} className="text-sm">
                · {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl">Explore topics</h2>
          <div className="flex flex-wrap gap-2">
            {guide.topics.map((topic) => (
              <Link
                key={topic}
                href={`${routes.vedicWisdom}/${guide.id}/chat?topic=${encodeURIComponent(topic)}`}
                className="border-border/60 hover:border-foreground/25 rounded-md border px-3 py-1.5 text-sm transition-colors"
              >
                {topic}
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl">Core teachings</h2>
          <ul className="space-y-2">
            {guide.coreTeachings.map((t) => (
              <li key={t} className="text-sm leading-relaxed">
                · {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
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
            <Link href={`${routes.vedicWisdom}/${guide.id}/chat`}>Begin Conversation</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`${routes.vedicWisdom}/${guide.id}/voice`}>
              Speak with {guide.displayName}
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={routes.vedicWisdom}>Back to library</Link>
          </Button>
        </div>

        <p className="text-muted-foreground max-w-3xl text-xs leading-relaxed">
          {WISDOM_AI_DISCLAIMER}
        </p>
      </ContentReveal>
    </div>
  );
}
