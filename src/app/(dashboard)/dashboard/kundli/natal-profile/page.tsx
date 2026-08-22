"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

const VARNA_TONE: Record<string, string> = {
  Brahmin: "border-[#D4AF37]/35 bg-[#D4AF37]/8",
  Kshatriya: "border-rose/35 bg-rose/8",
  Vaishya: "border-emerald-500/35 bg-emerald-500/8",
  Shudra: "border-amber-500/35 bg-amber-500/8",
};

const GANA_TONE: Record<string, string> = {
  Deva: "border-[#D4AF37]/35 bg-[#D4AF37]/8",
  Manushya: "border-sky-500/35 bg-sky-500/8",
  Rakshasa: "border-rose/35 bg-rose/8",
};

const NADI_TONE: Record<string, string> = {
  Adi: "border-amber-500/30 bg-amber-500/8",
  Madhya: "border-sky-500/30 bg-sky-500/8",
  Antya: "border-violet-500/30 bg-violet-500/8",
};

function TraitCard({
  kicker,
  title,
  note,
  tone,
  featured = false,
}: {
  kicker: string;
  title: string;
  note: string;
  tone?: string;
  featured?: boolean;
}) {
  return (
    <GlassCard className={cn("flex min-w-0 flex-col gap-2", tone)}>
      <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
        {kicker}
      </p>
      <p className={cn("font-display tracking-tight", featured ? "text-3xl sm:text-4xl" : "text-2xl")}>
        {title}
      </p>
      <p className="text-muted-foreground text-sm leading-relaxed">{note}</p>
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
        description="Your guna attributes from Moon sign and Moon nakshatra — the same factors most Vedic apps show before a match is scored."
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
          <GlassCard className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-end">
            <div className="min-w-0">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
                Foundation
              </p>
              <p className="font-display mt-2 text-2xl tracking-tight sm:text-3xl lg:text-4xl">
                Moon {data.moonSign}
              </p>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">{data.nakshatra}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className={cn("rounded-xl border px-3 py-2.5", VARNA_TONE[data.varna.label])}>
                <p className="text-muted-foreground text-[10px] tracking-[0.14em] uppercase">Varna</p>
                <p className="font-display mt-1 text-lg sm:text-xl">{data.varna.label}</p>
              </div>
              <div className={cn("rounded-xl border px-3 py-2.5", GANA_TONE[data.gana.label])}>
                <p className="text-muted-foreground text-[10px] tracking-[0.14em] uppercase">Gana</p>
                <p className="font-display mt-1 text-lg sm:text-xl">{data.gana.label}</p>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-3 md:grid-cols-2">
            <TraitCard
              kicker="Varna"
              title={data.varna.label}
              note={data.varna.note}
              tone={VARNA_TONE[data.varna.label]}
              featured
            />
            <TraitCard
              kicker="Gana"
              title={data.gana.label}
              note={data.gana.note}
              tone={GANA_TONE[data.gana.label]}
              featured
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <TraitCard
              kicker="Nadi"
              title={data.nadi.label}
              note={data.nadi.note}
              tone={NADI_TONE[data.nadi.label]}
            />
            <GlassCard className="flex min-w-0 flex-col gap-2">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
                Yoni
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl" aria-hidden>
                  {data.yoni.emoji}
                </span>
                <p className="font-display text-2xl tracking-tight">{data.yoni.name}</p>
                <Badge variant="outline">{data.yoni.energy}</Badge>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{data.yoni.note}</p>
            </GlassCard>
            <TraitCard
              kicker="Moon lord"
              title={data.moonLord.planet}
              note={data.moonLord.note}
            />
          </div>

          <GlassCard className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-xl sm:text-2xl">Needs a partner to score</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Tara, Bhakoot, Vashya, and Graha Maitri are pair-relative. They appear in
                  compatibility, not on this natal page.
                </p>
              </div>
              <Button asChild variant="secondary" className="min-h-11 w-full sm:w-auto">
                <Link href={routes.compatibility}>Open compatibility</Link>
              </Button>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {data.partnerRelative.map((item) => (
                <li key={item.koota} className="border-border/50 min-w-0 rounded-xl border px-3 py-3">
                  <p className="font-medium">{item.koota}</p>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{item.note}</p>
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
