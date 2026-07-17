"use client";

import Link from "next/link";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";
import { useHoroscope } from "@/hooks/use-horoscope";

function ChartPage({
  title,
  description,
  pick,
}: {
  title: string;
  description: string;
  pick: "chartNorth" | "chartSouth" | "chartEast";
}) {
  const { data, error, loading } = useHoroscope();
  const chart = data?.horoscope?.[pick];

  return (
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="VedaMilan AI"
        title={title}
        description={description}
        actions={
          <Button asChild variant="secondary">
            <Link href={routes.kundli}>Back to kundli</Link>
          </Button>
        }
      />
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
      {!loading && !chart ? (
        <EmptyState
          title="No chart layout yet"
          description="Generate your kundli to render this style."
          action={
            <Button asChild>
              <Link href={routes.kundli}>Generate kundli</Link>
            </Button>
          }
        />
      ) : (
        <GlassCard className="overflow-x-auto">
          <pre className="text-muted-foreground max-w-full text-xs whitespace-pre-wrap sm:text-sm">
            {JSON.stringify(chart, null, 2)}
          </pre>
          <p className="text-muted-foreground mt-4 text-xs">
            Lagna {data?.horoscope?.lagnaSign} · Moon {data?.horoscope?.moonSign} · Sun{" "}
            {data?.horoscope?.sunSign}
          </p>
        </GlassCard>
      )}
    </div>
  );
}

export default function SouthChartPage() {
  return (
    <ChartPage
      title="South Indian Chart"
      description="Stored south-Indian house layout"
      pick="chartSouth"
    />
  );
}
