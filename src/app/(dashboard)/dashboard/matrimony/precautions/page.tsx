"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type PrecautionSeverity = "note" | "awareness" | "emphasis";

type PrecautionCard = {
  id: string;
  title: string;
  classicalLabel: string;
  severity: PrecautionSeverity;
  summary: string;
  indicators: string[];
  precautions: string[];
  canAccept: string[];
  cannotAccept: string[];
};

type Lab = {
  overall: { tone: PrecautionSeverity; headline: string; body: string };
  cards: PrecautionCard[];
  boundaries: { canAccept: string[]; cannotAccept: string[] };
  disclaimer: string;
};

const TONE: Record<PrecautionSeverity, string> = {
  note: "border-border/60",
  awareness: "border-amber-500/40",
  emphasis: "border-rose/40",
};

const TONE_BADGE: Record<PrecautionSeverity, string> = {
  note: "border-border bg-muted/40",
  awareness: "border-amber-500/40 bg-amber-500/10",
  emphasis: "border-rose/40 bg-rose/10",
};

function ListBlock({ title, items, danger }: { title: string; items: string[]; danger?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className="min-w-0">
      <p
        className={cn(
          "text-[10px] font-semibold tracking-[0.14em] uppercase",
          danger ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {title}
      </p>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}

function ThemeCard({ card }: { card: PrecautionCard }) {
  return (
    <GlassCard className={cn("space-y-4", TONE[card.severity])}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-muted-foreground text-[10px] tracking-[0.16em] uppercase">
            {card.classicalLabel}
          </p>
          <h2 className="font-display mt-1 text-2xl tracking-tight">{card.title}</h2>
        </div>
        <Badge className={cn("border capitalize", TONE_BADGE[card.severity])}>
          {card.severity}
        </Badge>
      </div>
      <p className="text-sm leading-relaxed">{card.summary}</p>
      {card.indicators.length > 0 ? (
        <div>
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
            From your chart
          </p>
          <ul className="text-muted-foreground mt-2 space-y-1.5 text-sm leading-relaxed">
            {card.indicators.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <ListBlock title="Precautions" items={card.precautions} />
      <div className="grid gap-4 md:grid-cols-2">
        <ListBlock title="You can accept" items={card.canAccept} />
        <ListBlock title="Do not accept" items={card.cannotAccept} danger />
      </div>
    </GlassCard>
  );
}

export default function MatrimonyPrecautionsPage() {
  const { setMode } = useWorkspaceMode();
  const [data, setData] = useState<Lab | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMode("matrimony", { navigate: false });
  }, [setMode]);

  useEffect(() => {
    void fetch("/api/matrimony/marriage-precautions")
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load marriage precautions");
          return;
        }
        setData(json.data);
      })
      .catch(() => setError("Unable to load marriage precautions"))
      .finally(() => setLoading(false));
  }, []);

  const fidelity = data?.cards.find((card) => card.id === "fidelity");
  const delay = data?.cards.find((card) => card.id === "delay");
  const conflict = data?.cards.find((card) => card.id === "conflict");
  const steady = data?.cards.find((card) => card.id === "steady");

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Self-chart · not a verdict"
        title="Marriage precautions"
        description="Classical flags for restlessness, delay, and conflict — then what you can live with, and what you must not."
        actions={
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <Button asChild variant="secondary" className="min-h-11">
              <Link href={routes.marriageGuru}>Marriage Guru</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <Link href={routes.compatibility}>Compatibility</Link>
            </Button>
          </div>
        }
      />

      {loading ? <PanelSkeleton lines={8} /> : null}
      {error ? (
        <EmptyState
          title="Chart required"
          description={error}
          action={
            <Button asChild>
              <Link href={routes.kundli}>Generate Kundli</Link>
            </Button>
          }
        />
      ) : null}

      {data ? (
        <>
          <GlassCard className={cn("space-y-2", TONE[data.overall.tone])}>
            <Badge className={cn("border capitalize", TONE_BADGE[data.overall.tone])}>
              {data.overall.tone}
            </Badge>
            <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
              {data.overall.headline}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{data.overall.body}</p>
          </GlassCard>

          <Tabs defaultValue="fidelity">
            <TabsList>
              <TabsTrigger value="fidelity">Fidelity</TabsTrigger>
              <TabsTrigger value="delay">Delay</TabsTrigger>
              <TabsTrigger value="conflict">Conflict</TabsTrigger>
              <TabsTrigger value="boundaries">Accept / refuse</TabsTrigger>
            </TabsList>

            <TabsContent value="fidelity">
              {fidelity ? <ThemeCard card={fidelity} /> : null}
            </TabsContent>
            <TabsContent value="delay">{delay ? <ThemeCard card={delay} /> : null}</TabsContent>
            <TabsContent value="conflict">
              {conflict ? <ThemeCard card={conflict} /> : null}
            </TabsContent>
            <TabsContent value="boundaries" className="space-y-4">
              <GlassCard className="space-y-4">
                <h2 className="font-display text-2xl tracking-tight">
                  What marriage may ask of you
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Drawn from the three themes above. Keep the refusals even if the yogas look quiet.
                </p>
                <div className="grid gap-5 md:grid-cols-2">
                  <ListBlock title="You can accept" items={data.boundaries.canAccept} />
                  <ListBlock title="Do not accept" items={data.boundaries.cannotAccept} danger />
                </div>
              </GlassCard>
              {steady ? <ThemeCard card={steady} /> : null}
            </TabsContent>
          </Tabs>

          <p className="text-muted-foreground text-xs leading-relaxed">{data.disclaimer}</p>
        </>
      ) : null}
    </div>
  );
}
