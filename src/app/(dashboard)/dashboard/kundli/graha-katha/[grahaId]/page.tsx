"use client";

import { use, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  Flame,
  House,
  MessageCircle,
  Orbit,
  Quote,
  ScrollText,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

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

function JourneyNav({
  items,
}: {
  items: Array<{ href: string; label: string; icon: LucideIcon }>;
}) {
  return (
    <nav
      aria-label="Sections on this page"
      className="scrollbar-hidden -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 py-1"
    >
      {items.map(({ href, label, icon: Icon }) => (
        <a
          key={href}
          href={href}
          className="border-border/50 bg-card/75 hover:border-gold/40 hover:bg-gold/5 inline-flex min-h-10 shrink-0 snap-start items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors"
        >
          <Icon className="text-gold h-4 w-4" aria-hidden />
          {label}
        </a>
      ))}
    </nav>
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

      <JourneyNav
        items={[
          { href: "#story", label: t("grahaKatha.story"), icon: ScrollText },
          { href: "#understand", label: t("grahaKatha.understand"), icon: Orbit },
          { href: "#houses", label: t("grahaKatha.houses"), icon: House },
          { href: "#remedies", label: t("grahaKatha.remedies"), icon: Flame },
          { href: "#reflections", label: t("grahaKatha.reflections"), icon: Quote },
          { href: "#my-chart", label: t("grahaKatha.myChart"), icon: Sparkles },
        ]}
      />

      <div className="katha-section-rule" />

      <section ref={storyRef} id="story" className="scroll-mt-24 space-y-4">
        <SectionHeader
          icon={ScrollText}
          eyebrow={t("grahaKatha.labels.story")}
          title={t("grahaKatha.story")}
        />
        <StoryChapters
          chapters={graha.chapters}
          onChapterView={(chapterId) => completeChapter(graha.id, chapterId)}
        />
      </section>

      <div className="katha-section-rule" />

      <div id="understand" className="scroll-mt-24">
        <GrahaNaturePanels nature={graha.nature} />
      </div>

      {graha.specialSections?.map((s) => (
        <section
          key={s.id}
          className="border-border/50 from-card to-rose/5 shadow-soft relative overflow-hidden rounded-[1.35rem] border bg-gradient-to-br p-5 sm:p-7"
        >
          <div className="flex flex-wrap items-center gap-2">
            <ContentLabelBadge label={s.label} />
            <span className="bg-gold/10 text-gold inline-flex h-7 w-7 items-center justify-center rounded-lg">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
            </span>
          </div>
          <h2 className="font-display mt-3 text-2xl">{s.title}</h2>
          <p className="text-muted-foreground mt-2 leading-relaxed">{s.body}</p>
        </section>
      ))}

      <div className="katha-section-rule" />

      <div id="houses" className="scroll-mt-24">
        <HouseExplorer houses={graha.houses} />
      </div>

      <section id="remedies" className="scroll-mt-24 space-y-4">
        <SectionHeader
          icon={Flame}
          eyebrow={t("grahaKatha.labels.remedy")}
          title={t("grahaKatha.remedies")}
        />
        <ul className="grid gap-3 md:grid-cols-2">
          {graha.remedies.map((r) => (
            <li
              key={r.id}
              className="katha-panel border-border/50 bg-card/80 shadow-soft group hover:border-gold/35 rounded-[1.25rem] border p-5 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <ContentLabelBadge label="remedy" className="mb-2" />
                <span className="bg-gold/10 text-gold inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                  <Flame className="h-4 w-4" aria-hidden />
                </span>
              </div>
              <h3 className="font-display text-lg">{r.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{r.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="reflections" className="scroll-mt-24 space-y-4">
        <SectionHeader
          icon={Quote}
          eyebrow={t("grahaKatha.labels.reflection")}
          title={t("grahaKatha.reflections")}
        />
        <ul className="grid gap-3 sm:grid-cols-2">
          {graha.reflections.map((r) => (
            <li
              key={r.id}
              className="border-gold/25 bg-gold/5 flex items-start gap-3 rounded-xl border-l-[3px] px-4 py-3"
            >
              <Quote className="text-gold/60 mt-1 h-4 w-4 shrink-0" aria-hidden />
              <p className="font-display text-lg leading-snug italic sm:text-xl">{r.prompt}</p>
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
        <Button asChild className="w-full gap-2">
          <a href="#my-chart">
            <Sparkles className="h-4 w-4" aria-hidden />
            {t("grahaKatha.stickyChart")}
          </a>
        </Button>
      </div>
    </div>
  );
}
