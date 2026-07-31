"use client";

import { useEffect, useRef, useState } from "react";

import { useT } from "@/components/i18n/i18n-provider";
import type { StoryChapter } from "@/domain/graha-katha/types";
import { ContentLabelBadge } from "@/features/graha-katha/components/content-label";
import { cn } from "@/lib/utils/cn";

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
          <p className="text-muted-foreground px-2 pb-2 text-[10px] font-semibold tracking-[0.16em] uppercase">
            Chapters
          </p>
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

        {chapters.map((c) => (
          <article
            key={c.id}
            id={`chapter-${c.id}`}
            ref={(el) => {
              refs.current[c.id] = el;
            }}
            className={cn(
              "border-border/50 bg-card/80 shadow-soft min-w-0 scroll-mt-24 overflow-hidden rounded-[1.35rem] border sm:scroll-mt-28",
              "[contain-intrinsic-size:auto_320px] [content-visibility:auto]",
              "transition-[box-shadow,border-color] duration-500 ease-out",
              active === c.id && "ring-gold/20 border-gold/25 ring-1",
            )}
          >
            <div className="from-gold/10 via-saffron/5 bg-gradient-to-r to-transparent px-4 pt-4 sm:px-8 sm:pt-7">
              <div className="flex flex-wrap items-center gap-3">
                <ContentLabelBadge label="story" />
                <p className="text-gold text-xs font-semibold tracking-[0.18em] uppercase">
                  Chapter {String(c.number).padStart(2, "0")}
                </p>
              </div>
              <h3 className="font-display mt-3 text-xl text-balance sm:text-3xl">{c.title}</h3>
            </div>

            <div className="space-y-5 px-4 py-4 sm:px-8 sm:py-5 sm:pb-8">
              <div>
                <p className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wide uppercase">
                  {t("grahaKatha.chapter.theStory")}
                </p>
                <p className="text-foreground/90 text-[15px] leading-relaxed sm:text-base">
                  {c.narrative}
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

              <div className="border-border/40 bg-muted/20 rounded-xl border p-3 sm:p-4">
                <ContentLabelBadge label="interpretive" className="mb-2" />
                <p className="text-muted-foreground mb-1 text-[11px] font-semibold tracking-wide uppercase">
                  {t("grahaKatha.chapter.astro")}
                </p>
                <p className="text-sm leading-relaxed">{c.astrologicalConnection}</p>
              </div>

              {c.keyTeaching ? (
                <p className="font-display text-saffron text-center text-lg text-balance sm:text-2xl">
                  “{c.keyTeaching}”
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
