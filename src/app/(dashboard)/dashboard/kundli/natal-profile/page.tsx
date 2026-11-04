"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  BookOpen,
  Flame,
  HeartHandshake,
  Moon,
  MoonStar,
  Orbit,
  Scale,
  Shield,
  Sparkles,
  Sprout,
  Star,
  Users,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { planetSymbol } from "@/features/horoscope/components/planet-symbols";
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

type TraitMeta = {
  icon: LucideIcon;
  chip: string;
  wash: string;
};

const FALLBACK_META: TraitMeta = {
  icon: Sparkles,
  chip: "border-border/60 bg-muted/40 text-muted-foreground",
  wash: "border-border/60 bg-muted/20",
};

const VARNA_META: Record<string, TraitMeta> = {
  Brahmin: {
    icon: BookOpen,
    chip: "border-gold/30 bg-gold/10 text-gold",
    wash: "border-gold/25 bg-gold/[0.04]",
  },
  Kshatriya: {
    icon: Shield,
    chip: "border-rose/30 bg-rose/10 text-rose",
    wash: "border-rose/25 bg-rose/[0.04]",
  },
  Vaishya: {
    icon: Scale,
    chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    wash: "border-emerald-500/20 bg-emerald-500/[0.04]",
  },
  Shudra: {
    icon: Sprout,
    chip: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    wash: "border-amber-500/20 bg-amber-500/[0.04]",
  },
};

const GANA_META: Record<string, TraitMeta> = {
  Deva: {
    icon: Sparkles,
    chip: "border-gold/30 bg-gold/10 text-gold",
    wash: "border-gold/25 bg-gold/[0.04]",
  },
  Manushya: {
    icon: Users,
    chip: "border-sky-500/30 bg-sky-500/10 text-sky-500",
    wash: "border-sky-500/20 bg-sky-500/[0.04]",
  },
  Rakshasa: {
    icon: Flame,
    chip: "border-rose/30 bg-rose/10 text-rose",
    wash: "border-rose/25 bg-rose/[0.04]",
  },
};

const NADI_META: Record<string, TraitMeta> = {
  Adi: {
    icon: Waves,
    chip: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    wash: "border-amber-500/20 bg-amber-500/[0.04]",
  },
  Madhya: {
    icon: Activity,
    chip: "border-sky-500/30 bg-sky-500/10 text-sky-500",
    wash: "border-sky-500/20 bg-sky-500/[0.04]",
  },
  Antya: {
    icon: Wind,
    chip: "border-violet-500/30 bg-violet-500/10 text-violet-500",
    wash: "border-violet-500/20 bg-violet-500/[0.04]",
  },
};

const YONI_META: TraitMeta = {
  icon: HeartHandshake,
  chip: "border-rose/30 bg-rose/10 text-rose",
  wash: "border-rose/20 bg-rose/[0.03]",
};

const MOON_LORD_META: TraitMeta = {
  icon: MoonStar,
  chip: "border-gold/30 bg-gold/10 text-gold",
  wash: "border-gold/20 bg-gold/[0.03]",
};

const PARTNER_ICON: Record<string, LucideIcon> = {
  Vashya: HeartHandshake,
  Tara: Star,
  Bhakoot: Moon,
  "Graha Maitri": Orbit,
};

function SummaryTile({ meta, label, value }: { meta: TraitMeta; label: string; value: string }) {
  const Icon = meta.icon;
  return (
    <div className={cn("min-w-0 rounded-2xl border px-3 py-3", meta.wash)}>
      <p className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </p>
      <p className="font-display mt-1.5 text-xl break-words sm:text-2xl">{value}</p>
    </div>
  );
}

function TraitCard({
  meta,
  kicker,
  title,
  note,
  badge,
  leading,
  featured = false,
}: {
  meta: TraitMeta;
  kicker: string;
  title: string;
  note: string;
  badge?: string;
  leading?: ReactNode;
  featured?: boolean;
}) {
  const Icon = meta.icon;
  return (
    <GlassCard className={cn("relative flex min-w-0 flex-col overflow-hidden", meta.wash)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {leading ?? (
            <span
              className={cn(
                "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border",
                meta.chip,
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
              {kicker}
            </p>
            <p
              className={cn(
                "font-display mt-1 tracking-tight break-words",
                featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
              )}
            >
              {title}
            </p>
          </div>
        </div>
        {badge ? (
          <Badge variant="outline" className="shrink-0">
            {badge}
          </Badge>
        ) : null}
      </div>
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

  const varnaMeta = data ? (VARNA_META[data.varna.label] ?? FALLBACK_META) : FALLBACK_META;
  const ganaMeta = data ? (GANA_META[data.gana.label] ?? FALLBACK_META) : FALLBACK_META;
  const nadiMeta = data ? (NADI_META[data.nadi.label] ?? FALLBACK_META) : FALLBACK_META;

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
          <GlassCard className="border-gold/25 from-gold/10 via-card to-card relative overflow-hidden bg-gradient-to-br">
            <div className="bg-gold/10 pointer-events-none absolute -top-20 -right-14 h-52 w-52 rounded-full blur-3xl" />
            <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <span className="border-gold/30 bg-gold/12 text-gold grid h-14 w-14 shrink-0 place-items-center rounded-2xl border sm:h-16 sm:w-16">
                  <MoonStar className="h-6 w-6 sm:h-7 sm:w-7" />
                </span>
                <div className="min-w-0">
                  <p className="text-gold/90 text-[10px] font-semibold tracking-[0.16em] uppercase">
                    Moon foundation
                  </p>
                  <p className="font-display mt-1 text-3xl tracking-tight break-words sm:text-4xl">
                    Moon in {data.moonSign}
                  </p>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                    <Star className="h-3.5 w-3.5 shrink-0" />
                    {data.nakshatra}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:min-w-[19rem]">
                <SummaryTile meta={varnaMeta} label="Varna" value={data.varna.label} />
                <SummaryTile meta={ganaMeta} label="Gana" value={data.gana.label} />
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
              <TraitCard
                meta={varnaMeta}
                kicker="Varna"
                title={data.varna.label}
                note={data.varna.note}
                featured
              />
              <TraitCard
                meta={ganaMeta}
                kicker="Gana"
                title={data.gana.label}
                note={data.gana.note}
                featured
              />
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="font-display text-xl tracking-tight sm:text-2xl">Supporting kootas</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Nadi, Yoni, and Moon lord add pulse, instinct, and mind-lord context.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <TraitCard
                meta={nadiMeta}
                kicker="Nadi"
                title={data.nadi.label}
                note={data.nadi.note}
              />
              <TraitCard
                meta={YONI_META}
                kicker="Yoni"
                title={data.yoni.name}
                note={data.yoni.note}
                badge={data.yoni.energy}
                leading={
                  <span className="border-rose/30 bg-rose/10 grid h-11 w-11 shrink-0 place-items-center rounded-2xl border text-2xl">
                    <span aria-hidden>{data.yoni.emoji}</span>
                  </span>
                }
              />
              <TraitCard
                meta={MOON_LORD_META}
                kicker="Moon lord"
                title={data.moonLord.planet}
                note={data.moonLord.note}
                leading={
                  <span className="border-gold/30 bg-gold/10 text-gold grid h-11 w-11 shrink-0 place-items-center rounded-2xl border text-2xl">
                    <span aria-hidden>{planetSymbol(data.moonLord.planet)}</span>
                  </span>
                }
              />
            </div>
          </section>

          <GlassCard className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="bg-primary/10 text-primary grid h-11 w-11 shrink-0 place-items-center rounded-2xl">
                  <HeartHandshake className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-xl tracking-tight sm:text-2xl">
                    Needs a partner to score
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Tara, Bhakoot, Vashya, and Graha Maitri are pair-relative. They appear in
                    compatibility, not on this natal page.
                  </p>
                </div>
              </div>
              <Button asChild variant="secondary" className="min-h-11 w-full sm:w-auto">
                <Link href={routes.compatibility}>Open compatibility</Link>
              </Button>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {data.partnerRelative.map((item) => {
                const Icon = PARTNER_ICON[item.koota] ?? Orbit;
                return (
                  <li
                    key={item.koota}
                    className="border-border/50 bg-background/40 flex min-w-0 items-start gap-3 rounded-xl border px-3 py-3"
                  >
                    <span className="bg-muted/60 text-muted-foreground grid h-8 w-8 shrink-0 place-items-center rounded-lg">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{item.koota}</p>
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        {item.note}
                      </p>
                    </div>
                  </li>
                );
              })}
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
