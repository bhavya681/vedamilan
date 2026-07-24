"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";

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
    <div className="relative space-y-6">
      <PageHeader
        eyebrow="Moon-based · Ashta Koota attributes"
        title="Varna, Gana & more"
        description="Your personal guna attributes from Moon sign and Moon nakshatra — the same factors most Vedic apps show before matching."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={routes.nakshatra}>Nakshatra</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.kundli}>Kundli</Link>
            </Button>
          </div>
        }
      />

      <p className="text-muted-foreground text-xs">
        Calculated from your Kundli · Pair scores (Tara, Bhakoot, etc.) appear in Matrimony
        compatibility — not here.
      </p>

      {loading ? <PanelSkeleton lines={5} /> : null}
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
        <div className="space-y-4">
          <GlassCard className="space-y-2">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">Foundation</p>
            <p className="font-display text-2xl">
              Moon {data.moonSign} · {data.nakshatra}
            </p>
          </GlassCard>

          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["Varna", data.varna.label, data.varna.note],
                ["Gana", data.gana.label, data.gana.note],
                ["Nadi", data.nadi.label, data.nadi.note],
                ["Moon lord", data.moonLord.planet, data.moonLord.note],
              ] as const
            ).map(([title, label, note]) => (
              <GlassCard key={title} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-xl">{title}</h2>
                  <Badge variant="secondary">{label}</Badge>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{note}</p>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl">Yoni</h2>
              <Badge variant="outline">
                {data.yoni.emoji} {data.yoni.name}
              </Badge>
            </div>
            <p className="text-sm font-medium">{data.yoni.energy}</p>
            <p className="text-muted-foreground text-sm leading-relaxed">{data.yoni.note}</p>
          </GlassCard>

          <GlassCard className="space-y-3">
            <h2 className="font-display text-xl">Needs a partner to score</h2>
            <ul className="space-y-2 text-sm">
              {data.partnerRelative.map((item) => (
                <li key={item.koota} className="border-border/40 rounded-lg border px-3 py-2">
                  <p className="font-medium">{item.koota}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    {item.note}
                  </p>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      ) : null}
    </div>
  );
}
