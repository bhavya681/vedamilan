"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Clock, Sparkles } from "lucide-react";

import { useT } from "@/components/i18n/i18n-provider";
import type { StoryChapter } from "@/domain/graha-katha/types";
import { ContentLabelBadge } from "@/features/graha-katha/components/content-label";
import { cn } from "@/lib/utils/cn";

function readMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function StoryChapters({
  chapters,
  onChapterView,
  className,
}: {
  chapters: StoryChapter[];
  onChapterView?: (chapterId: string) => void;
  className?: string;
}) {
  const t = useT();
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const [active, setActive] = useState(chapters[0]?.id ?? "");

  useEffect(() => {
    const nodes = chapters
      .map((c) => refs.current[c.id])
      .filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length) return;

    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          const id = visible.target.id.replace("chapter-", "");
          setActive(id);
          if (!seen.has(id)) {
            seen.add(id);
            onChapterView?.(id);
          }
        }
      },
      { rootMargin: "-20% 0px -45% 0px", threshold: [0.35] },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [chapters, onChapterView]);

  const scrollTo = (id: string) => {
    refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeIndex = Math.max(
    0,
    chapters.findIndex((c) => c.id === active),
  );
  const progressPct = chapters.length ? Math.round(((activeIndex + 1) / chapters.length) * 100) : 0;
  const totalMinutes = chapters.reduce((sum, chapter) => sum + readMinutes(chapter.narrative), 0);

  return (
    <div
      className={cn(
        "relative grid min-w-0 gap-6 lg:grid-cols-[minmax(11rem,13.5rem)_minmax(0,1fr)] lg:gap-8",
        className,
      )}
    >
      <aside className="top-4 hidden h-fit min-w-0 lg:sticky lg:block">
        <nav
          className="border-border/50 bg-card/80 shadow-soft max-h-[min(70vh,36rem)] space-y-1 overflow-y-auto rounded-2xl border p-3"
          aria-label="Story chapters"
        >
          <div className="flex items-center justify-between gap-2 px-2 pb-2">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
              Story map
            </p>
            <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px]">
              <Clock className="h-3 w-3" aria-hidden />
              {totalMinutes} min
            </span>
          </div>
          {chapters.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => scrollTo(c.id)}
              className={cn(
                "katha-chip focus-visible:ring-ring w-full rounded-xl px-3 py-2.5 text-left text-sm focus-visible:ring-2 focus-visible:outline-none",
                active === c.id
                  ? "bg-saffron/12 text-foreground shadow-soft font-medium"
                  : "text-muted-foreground hover:bg-muted/50",
              )}
            >
              <span className="text-gold font-display mr-2 text-xs">
                {String(c.number).padStart(2, "0")}
              </span>
              <span className="break-words">{c.title}</span>
            </button>
          ))}
          <div className="bg-muted mx-2 mt-3 h-1 overflow-hidden rounded-full">
            <div
              className="bg-gold h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </nav>
      </aside>

      <div className="min-w-0 space-y-6 sm:space-y-8">
        <div className="border-border/50 from-card via-card to-gold/5 shadow-soft relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-gold flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase">
                <BookOpen className="h-3.5 w-3.5" aria-hidden />
                Story arc
              </p>
              <p className="font-display mt-1 text-lg leading-snug sm:text-2xl">
                {chapters.length} chapters · {totalMinutes} min read
              </p>
            </div>
            <span className="border-gold/25 bg-gold/10 text-gold inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide">
              <Sparkles className="h-3 w-3" aria-hidden />
              Chapter {activeIndex + 1} of {chapters.length}
            </span>
          </div>
          <div className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full">
            <div
              className="from-saffron to-gold h-full rounded-full bg-gradient-to-r transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center gap-1.5" aria-hidden>
            {chapters.map((c, index) => (
              <button
                key={c.id}
                type="button"
                tabIndex={-1}
                onClick={() => scrollTo(c.id)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === activeIndex
                    ? "bg-gold w-6"
                    : index < activeIndex
                      ? "bg-gold/50 w-1.5"
                      : "bg-border w-1.5",
                )}
              />
            ))}
          </div>
        </div>

        <div
          className="border-border/40 bg-background/90 scrollbar-hidden sticky top-0 z-10 -mx-1 flex gap-2 overflow-x-auto px-1 py-2 backdrop-blur-md lg:hidden"
          role="tablist"
        >
          {chapters.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active === c.id}
              onClick={() => scrollTo(c.id)}
              className={cn(
                "max-w-[14rem] shrink-0 truncate rounded-full border px-3.5 py-2 text-xs transition",
                active === c.id
                  ? "border-gold/50 bg-gold/12 text-foreground shadow-soft"
                  : "border-border/60 text-muted-foreground bg-card/60",
              )}
            >
              {String(c.number).padStart(2, "0")}. {c.title}
            </button>
          ))}
        </div>

        {chapters.map((c, index) => {
          const prevChapter = chapters[index - 1];
          const nextChapter = chapters[index + 1];
          const minutes = readMinutes(c.narrative);

          return (
            <article
              key={c.id}
              id={`chapter-${c.id}`}
              ref={(el) => {
                refs.current[c.id] = el;
              }}
              className={cn(
                "border-border/50 bg-card/80 shadow-soft relative min-w-0 scroll-mt-24 overflow-hidden rounded-[1.35rem] border sm:scroll-mt-28",
                "[contain-intrinsic-size:auto_320px] [content-visibility:auto]",
                "transition-[box-shadow,border-color] duration-500 ease-out",
                active === c.id && "ring-gold/20 border-gold/25 ring-1",
              )}
            >
              <span
                className="font-display text-gold/[0.07] pointer-events-none absolute -top-5 right-2 text-[6rem] leading-none select-none sm:-top-8 sm:right-5 sm:text-[9rem]"
                aria-hidden
              >
                {String(c.number).padStart(2, "0")}
              </span>

              <div className="from-gold/12 via-saffron/5 relative bg-gradient-to-r to-transparent px-4 pt-4 sm:px-8 sm:pt-7">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <ContentLabelBadge label="story" />
                    <p className="text-gold text-xs font-semibold tracking-[0.18em] uppercase">
                      Chapter {String(c.number).padStart(2, "0")}
                    </p>
                    <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px]">
                      <Clock className="h-3 w-3" aria-hidden />
                      {minutes} min
                    </span>
                  </div>
                  <span className="text-muted-foreground border-border/50 bg-background/50 rounded-full border px-2 py-0.5 text-[10px] font-medium">
                    {active === c.id ? "Reading now" : "Story"}
                  </span>
                </div>
                <h3 className="font-display mt-3 max-w-[min(100%,42rem)] text-xl text-balance sm:text-3xl">
                  {c.title}
                </h3>
              </div>

              <div className="relative px-4 py-4 sm:px-8 sm:py-5 sm:pb-8">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                  <div className="space-y-5">
                    <div>
                      <p className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wide uppercase">
                        {t("grahaKatha.chapter.theStory")}
                      </p>
                      <p className="text-foreground/90 text-[15px] leading-relaxed sm:text-base">
                        <span className="font-display text-gold float-left mt-0.5 mr-1.5 text-3xl leading-none sm:text-4xl">
                          {c.narrative.charAt(0)}
                        </span>
                        {c.narrative.slice(1)}
                      </p>
                    </div>

                    <div className="border-gold/30 bg-gold/5 rounded-xl border-l-[3px] px-3 py-3 sm:px-4">
                      <p className="text-muted-foreground mb-1 text-[11px] font-semibold tracking-wide uppercase">
                        {t("grahaKatha.chapter.symbolizes")}
                      </p>
                      <p className="font-display text-base leading-snug italic sm:text-xl">
                        {c.symbolizes}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border-cosmic/25 from-cosmic/10 rounded-xl border bg-gradient-to-br to-transparent p-3.5 sm:p-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-cosmic/15 text-cosmic inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
                          <Sparkles className="h-4 w-4" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <ContentLabelBadge label="interpretive" />
                          <p className="font-display mt-1 text-base leading-snug sm:text-lg">
                            Astrological existence
                          </p>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">
                        {c.astrologicalConnection}
                      </p>
                    </div>

                    {c.keyTeaching ? (
                      <div className="border-border/40 bg-muted/20 rounded-xl border p-3.5 text-center sm:p-4">
                        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
                          {t("grahaKatha.chapter.teaching")}
                        </p>
                        <p className="font-display text-saffron mt-1.5 text-lg leading-snug text-balance sm:text-xl">
                          “{c.keyTeaching}”
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="border-border/40 mt-5 flex items-center justify-between gap-2 border-t pt-3">
                  <button
                    type="button"
                    onClick={() => prevChapter && scrollTo(prevChapter.id)}
                    disabled={!prevChapter}
                    className="text-muted-foreground hover:text-foreground inline-flex min-w-0 items-center gap-1.5 rounded-lg px-1 py-1 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-35"
                  >
                    <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="max-w-[8.5rem] truncate sm:max-w-[14rem]">
                      {prevChapter?.title ?? "Start"}
                    </span>
                  </button>
                  <span className="text-muted-foreground shrink-0 text-[10px] tabular-nums">
                    {c.number} / {chapters.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => nextChapter && scrollTo(nextChapter.id)}
                    disabled={!nextChapter}
                    className="text-muted-foreground hover:text-foreground inline-flex min-w-0 items-center gap-1.5 rounded-lg px-1 py-1 text-right text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-35"
                  >
                    <span className="max-w-[8.5rem] truncate sm:max-w-[14rem]">
                      {nextChapter?.title ?? "End"}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
