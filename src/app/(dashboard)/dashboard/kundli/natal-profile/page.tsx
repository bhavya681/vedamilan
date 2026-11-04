"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

type NatalKoota = {
  moonSign: string;
  nakshatra: string;
  varna: { label: string; note: string };
  gana: { label: string; note: string };
  nadi: { label: string; note: string };
  yoni: { name: string; emoji: string; energy: string; note: string };
  moonLord: { planet: string; note: string };
  partnerRelative: Array<{ koota: string; note: string }>;
};

function SummaryTile({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-card min-w-0 px-3 py-3 sm:px-4">
      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
        {label}
      </p>
      <p
        className={cn(
          "font-display mt-1.5 text-base leading-tight break-words sm:text-lg",
          accent && "text-gold",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function TemperamentCard({
  index,
  kicker,
  title,
  note,
  tone,
}: {
  index: string;
  kicker: string;
  title: string;
  note: string;
  tone: "gold" | "saffron";
}) {
  return (
    <GlassCard className="relative min-w-0 overflow-hidden">
      <span
        className={cn(
          "font-display pointer-events-none absolute -top-2 right-3 text-7xl leading-none select-none",
          tone === "gold" ? "text-gold/10" : "text-saffron/10",
        )}
        aria-hidden
      >
        {index}
      </span>
      <div className="relative">
        <p
          className={cn(
            "text-[10px] font-semibold tracking-[0.18em] uppercase",
            tone === "gold" ? "text-gold" : "text-saffron",
          )}
        >
          {kicker}
        </p>
        <h3 className="font-display mt-2 text-2xl leading-tight tracking-tight break-words sm:text-3xl">
          {title}
        </h3>
        <div
          className={cn("mt-4 h-px w-12", tone === "gold" ? "bg-gold/45" : "bg-saffron/45")}
          aria-hidden
        />
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{note}</p>
      </div>
    </GlassCard>
  );
}

function DetailCard({
  kicker,
  title,
  note,
  badge,
  leading,
  className,
}: {
  kicker: string;
  title: string;
  note: string;
  badge?: string;
  leading?: ReactNode;
  className?: string;
}) {
  return (
    <GlassCard className={cn("relative flex min-w-0 flex-col overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
            {kicker}
          </p>
          <p className="font-display mt-1 text-xl tracking-tight break-words sm:text-2xl">
            {title}
          </p>
        </div>
        {badge ? (
          <Badge variant="outline" className="shrink-0">
            {badge}
          </Badge>
        ) : null}
      </div>
      {leading ? <div className="mt-4">{leading}</div> : null}
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{note}</p>
    </GlassCard>
  );
}

export default function NatalProfilePage() {
  const [data, setData] = useState<NatalKoota | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/horoscope/vedic-extras")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          setError(json.error?.message || "Unable to load natal profile");
          return;
        }
        setData(json.data.natalKoota);
      })
      .catch(() => setError("Unable to load natal profile"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-w-0 space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Moon-based · Ashta Koota"
        title="Varna & Gana"
        description="Traditional Moon-based temperament markers used in Ashta Koota compatibility, calculated from your Moon sign and nakshatra."
        actions={
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
            <Button asChild variant="secondary" className="min-h-11">
              <Link href={routes.astrologyNakshatra}>Nakshatra</Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <Link href={routes.kundli}>Kundli</Link>
            </Button>
          </div>
        }
      />

      {loading ? <PanelSkeleton lines={6} /> : null}
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
        <div className="space-y-4 sm:space-y-5">
          <GlassCard className="relative overflow-hidden">
            <div
              className="bg-gold/10 pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full blur-3xl"
              aria-hidden
            />
            <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.85fr)] lg:items-center">
              <div className="min-w-0">
                <p className="text-gold text-[10px] font-semibold tracking-[0.18em] uppercase">
                  Your Moon foundation
                </p>
                <h2 className="font-display mt-2 text-2xl leading-tight tracking-tight break-words sm:text-3xl">
                  Moon in {data.moonSign}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Nakshatra <span className="text-foreground/80 font-medium">{data.nakshatra}</span>
                </p>
                <div className="bg-border/50 border-border/60 mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border">
                  <SummaryTile label="Varna" value={data.varna.label} accent />
                  <SummaryTile label="Gana" value={data.gana.label} accent />
                  <SummaryTile label="Nadi" value={data.nadi.label} />
                </div>
              </div>

              <div className="border-border/60 bg-background/40 rounded-2xl border p-4 sm:p-5">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
                  Yoni animal
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <span
                    className="bg-gold/10 border-gold/25 grid h-16 w-16 shrink-0 place-items-center rounded-2xl border text-4xl"
                    role="img"
                    aria-label={data.yoni.name}
                  >
                    {data.yoni.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-2xl leading-tight break-words">
                      {data.yoni.name}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {data.yoni.energy}
                    </Badge>
                  </div>
                </div>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {data.yoni.note}
                </p>
              </div>
            </div>
          </GlassCard>

          <section className="space-y-3">
            <div>
              <h2 className="font-display text-xl tracking-tight sm:text-2xl">Core temperament</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Varna and Gana describe your Moon-led social and emotional style.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <TemperamentCard
                index="01"
                kicker="Varna"
                title={data.varna.label}
                note={data.varna.note}
                tone="gold"
              />
              <TemperamentCard
                index="02"
                kicker="Gana"
                title={data.gana.label}
                note={data.gana.note}
                tone="saffron"
              />
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="font-display text-xl tracking-tight sm:text-2xl">Supporting kootas</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Nadi and Moon lord add pulse and mind-lord context. Your Yoni animal sits above.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailCard kicker="Nadi" title={data.nadi.label} note={data.nadi.note} />
              <DetailCard
                kicker="Moon lord"
                title={data.moonLord.planet}
                note={data.moonLord.note}
              />
            </div>
          </section>

          <GlassCard className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h2 className="font-display text-xl tracking-tight sm:text-2xl">
                  Needs a partner to score
                </h2>
                <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                  Tara, Bhakoot, Vashya, and Graha Maitri are pair-relative. They appear in
                  compatibility, not on this natal page.
                </p>
              </div>
              <Button asChild variant="secondary" className="min-h-11 w-full sm:w-auto">
                <Link href={routes.compatibility}>Open compatibility</Link>
              </Button>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {data.partnerRelative.map((item, index) => (
                <li
                  key={item.koota}
                  className="border-border/50 bg-background/40 flex min-w-0 items-start gap-3 rounded-xl border px-3 py-3"
                >
                  <span className="border-border/60 text-muted-foreground mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-[10px] font-semibold tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{item.koota}</p>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                      {item.note}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>

          <p className="text-muted-foreground text-xs leading-relaxed">
            Calculated from your Kundli. These labels describe you; they do not grade a match until
            a second chart is compared.
          </p>
        </div>
      ) : null}
    </div>
  );
}
