"use client";

import { useDeferredValue, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Search } from "lucide-react";

import { useT } from "@/components/i18n/i18n-provider";
import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getGrahaSummary,
  listComparePairs,
  listGrahaSummaries,
  searchGrahaSummaries,
} from "@/domain/graha-katha";
import { GrahaLibraryGrid } from "@/features/graha-katha/components/graha-library-grid";
import { KathaAtmosphere } from "@/features/graha-katha/components/katha-atmosphere";
import { LearningProgressBar } from "@/features/graha-katha/components/learning-progress-bar";
import { useGrahaProgress } from "@/features/graha-katha/hooks/use-graha-progress";
import { routes } from "@/lib/constants/routes";

const CompareTeaser = dynamic(
  () => import("@/features/graha-katha/components/compare-teaser").then((m) => m.CompareTeaser),
  {
    ssr: false,
    loading: () => (
      <div className="border-border/40 bg-muted/20 h-36 animate-pulse rounded-2xl" aria-hidden />
    ),
  },
);

export default function GrahaKathaLibraryPage() {
  const t = useT();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const { progress } = useGrahaProgress();
  const all = listGrahaSummaries();
  const grahas = searchGrahaSummaries(deferredQuery);
  const continueGraha = progress.lastGrahaId ? getGrahaSummary(progress.lastGrahaId) : null;

  return (
    <div className="katha-theme relative min-w-0 space-y-6 pb-6 sm:space-y-8 sm:pb-8">
      <KathaAtmosphere />

      <div className="katha-fade-up min-w-0 space-y-2 sm:space-y-3">
        <PageHeader
          className="mb-2 sm:mb-3"
          eyebrow={t("grahaKatha.eyebrow")}
          title={t("grahaKatha.title")}
          description={t("grahaKatha.libraryDescription")}
          actions={
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href={routes.kundli}>{t("grahaKatha.chart.openKundli")}</Link>
            </Button>
          }
        />

        <p className="font-display text-muted-foreground max-w-2xl text-lg italic sm:text-2xl">
          {t("grahaKatha.subtitle")}
        </p>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          {t("grahaKatha.visualGuide")}
        </p>
      </div>

      <div className="katha-section-rule" />

      <LearningProgressBar
        exploredCount={progress.exploredGrahaIds.length}
        total={all.length}
        continueId={continueGraha?.id}
        continueName={continueGraha?.englishName}
      />

      <div className="relative max-w-lg">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          aria-hidden
        />
        <label className="sr-only" htmlFor="graha-search">
          {t("grahaKatha.searchPlaceholder")}
        </label>
        <Input
          id="graha-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("grahaKatha.searchPlaceholder")}
          autoComplete="off"
          className="border-border/60 bg-card/80 shadow-soft h-11 rounded-xl pl-10"
        />
      </div>

      <GrahaLibraryGrid grahas={grahas} exploredIds={progress.exploredGrahaIds} />

      <div className="katha-section-rule" />

      <CompareTeaser pairs={listComparePairs()} title={t("grahaKatha.compare")} />
    </div>
  );
}
