"use client";

import { use, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bookmark, BookmarkCheck, ChevronLeft, MessageCircle } from "lucide-react";

import { useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/vedic";
import { ContentLabelBadge } from "@/features/graha-katha/components/content-label";
import { GrahaHero } from "@/features/graha-katha/components/graha-hero";
import { KathaAtmosphere } from "@/features/graha-katha/components/katha-atmosphere";
import { useGraha } from "@/features/graha-katha/hooks/use-graha";
import { useGrahaProgress } from "@/features/graha-katha/hooks/use-graha-progress";
import { routes } from "@/lib/constants/routes";

const StoryChapters = dynamic(
  () => import("@/features/graha-katha/components/story-chapters").then((m) => m.StoryChapters),
  { loading: () => <SectionSkeleton /> },
);

const GrahaNaturePanels = dynamic(
  () =>
    import("@/features/graha-katha/components/graha-nature-panels").then(
      (m) => m.GrahaNaturePanels,
    ),
  { loading: () => <SectionSkeleton /> },
);

const HouseExplorer = dynamic(
  () => import("@/features/graha-katha/components/house-explorer").then((m) => m.HouseExplorer),
  { loading: () => <SectionSkeleton /> },
);

const ChartPlacementPanel = dynamic(
  () =>
    import("@/features/graha-katha/components/chart-placement-panel").then(
      (m) => m.ChartPlacementPanel,
    ),
  { loading: () => <SectionSkeleton /> },
);

function SectionSkeleton() {
  return (
    <div className="skeleton-shimmer border-border/40 h-48 rounded-[1.35rem] border" aria-hidden />
  );
}

export default function GrahaKathaDetailPage({ params }: { params: Promise<{ grahaId: string }> }) {
  const { grahaId } = use(params);
  const t = useT();
  const storyRef = useRef<HTMLElement>(null);
  const { graha, loading, error, valid } = useGraha(grahaId);
  const { progress, markExplored, completeChapter, toggleBookmark } = useGrahaProgress();

  useEffect(() => {
    if (!graha) return;
    markExplored(graha.id);
  }, [graha, markExplored]);

  if (!valid) notFound();

  if (loading || !graha) {
    return (
      <div className="relative space-y-6" aria-busy="true" aria-live="polite">
        <KathaAtmosphere />
        <div className="skeleton-shimmer h-8 w-36 rounded-lg" />
        <div className="skeleton-shimmer h-72 rounded-[1.5rem]" />
        <div className="skeleton-shimmer h-44 rounded-[1.35rem]" />
        <p className="sr-only">Loading Graha content…</p>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>
    );
  }

  const bookmarked = progress.bookmarks.includes(graha.id);
  const askHref = `${routes.aiInsights}?q=${encodeURIComponent(
    `Why is ${graha.englishName} (${graha.sanskritName}) associated with ${graha.tags.slice(0, 3).join(", ")}? Explain traditionally without inventing my chart placements.`,
  )}`;

  return (
    <div className="katha-theme relative min-w-0 space-y-8 pb-[calc(4.5rem+0.5rem)] sm:space-y-10 sm:pb-10 md:pb-8">
      <KathaAtmosphere />

      <div className="katha-fade-up flex min-w-0 flex-wrap items-center justify-between gap-2 sm:gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2 max-w-full gap-1">
          <Link href={routes.grahaKatha} className="min-w-0 truncate">
            <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{t("grahaKatha.backToLibrary")}</span>
          </Link>
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => toggleBookmark(graha.id)}
        >
          {bookmarked ? (
            <BookmarkCheck className="h-4 w-4" aria-hidden />
          ) : (
            <Bookmark className="h-4 w-4" aria-hidden />
          )}
          {bookmarked ? t("grahaKatha.bookmarked") : t("grahaKatha.bookmark")}
        </Button>
      </div>

      <GrahaHero
        graha={graha}
        chartHref="#my-chart"
        onBeginStory={() =>
          storyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      />

      <div className="katha-section-rule" />

      <section ref={storyRef} id="story" className="scroll-mt-24 space-y-4">
        <SectionHeader eyebrow={t("grahaKatha.story")} title={t("grahaKatha.story")} />
        <StoryChapters
          chapters={graha.chapters}
          onChapterView={(chapterId) => completeChapter(graha.id, chapterId)}
        />
      </section>

      <div className="katha-section-rule" />

      <GrahaNaturePanels nature={graha.nature} />

      {graha.specialSections?.map((s) => (
        <section
          key={s.id}
          className="border-border/50 from-card to-rose/5 shadow-soft relative overflow-hidden rounded-[1.35rem] border bg-gradient-to-br p-5 sm:p-7"
        >
          <ContentLabelBadge label={s.label} />
          <h2 className="font-display mt-3 text-2xl">{s.title}</h2>
          <p className="text-muted-foreground mt-2 leading-relaxed">{s.body}</p>
        </section>
      ))}

      <div className="katha-section-rule" />

      <HouseExplorer houses={graha.houses} />

      <section className="space-y-4">
        <SectionHeader eyebrow={t("grahaKatha.remedies")} title={t("grahaKatha.remedies")} />
        <ul className="grid gap-3 md:grid-cols-2">
          {graha.remedies.map((r) => (
            <li
              key={r.id}
              className="katha-panel border-border/50 bg-card/80 shadow-soft rounded-[1.25rem] border p-5"
            >
              <ContentLabelBadge label="remedy" className="mb-2" />
              <h3 className="font-display text-lg">{r.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{r.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <SectionHeader eyebrow={t("grahaKatha.reflections")} title={t("grahaKatha.reflections")} />
        <ul className="space-y-3">
          {graha.reflections.map((r) => (
            <li
              key={r.id}
              className="border-gold/25 bg-gold/5 font-display rounded-xl border-l-[3px] px-4 py-3 text-lg italic sm:text-xl"
            >
              {r.prompt}
            </li>
          ))}
        </ul>
      </section>

      <div className="katha-section-rule" />

      <ChartPlacementPanel graha={graha} />

      <section className="border-border/50 from-card via-card to-cosmic/5 shadow-soft relative min-w-0 overflow-hidden rounded-[1.35rem] border bg-gradient-to-br p-5 sm:p-7">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-cosmic/10 text-cosmic inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <MessageCircle className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-3">
            <h2 className="font-display text-xl">{t("grahaKatha.askAbout")}</h2>
            <ul className="text-muted-foreground space-y-1.5 text-sm break-words">
              <li>
                · Why is {graha.englishName} associated with {graha.tags[0]}?
              </li>
              <li>· What does {graha.englishName} teach traditionally?</li>
              <li>· Show me {graha.englishName}&apos;s meaning in my chart.</li>
            </ul>
            <Button asChild variant="secondary" className="w-full gap-1.5 sm:w-auto">
              <Link href={askHref}>{t("grahaKatha.askAi")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sit above mobile bottom nav — avoid stacking two fixed bars at bottom-0 */}
      <div className="border-border/60 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky-above-bottom-nav fixed inset-x-0 z-30 border-t px-3 py-2.5 backdrop-blur-md md:hidden">
        <Button asChild className="w-full">
          <a href="#my-chart">{t("grahaKatha.stickyChart")}</a>
        </Button>
      </div>
    </div>
  );
}
