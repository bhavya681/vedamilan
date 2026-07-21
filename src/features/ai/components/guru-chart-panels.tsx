"use client";

import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/premium-cards";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/cn";

export type YogaItem = {
  code: string;
  name: string;
  category?: string;
  strength?: number;
  description?: string;
};

export type DashaPeriodItem = {
  lord: string;
  level: string;
  parentLord?: string | null;
  startDate?: string;
  endDate?: string;
};

export type GocharPlanetItem = {
  planet: string;
  sign: string;
  houseFromNatalLagna: number;
  nakshatra: string;
  isRetrograde: boolean;
  note: string;
};

export type ChartPanelsData = {
  hasChart: boolean;
  chartSummary: {
    lagnaSign: string;
    moonSign: string;
    sunSign: string;
    manglikStatus: string;
    planets: Array<{
      planet: string;
      sign: string;
      house: number;
      nakshatra: string;
      dignity?: string | null;
      isRetrograde?: boolean;
    }>;
  } | null;
  rajaYogas: YogaItem[];
  yogas: YogaItem[];
  doshas: Array<{
    code: string;
    name: string;
    present: boolean;
    severity?: string;
    notes?: string;
  }>;
  dasha: {
    currentMaha?: string | null;
    currentAntar?: string | null;
    periods: DashaPeriodItem[];
  } | null;
  gochar: {
    asOf: string;
    transitAscendant: string;
    natalLagna: string;
    highlights: string[];
    planets: GocharPlanetItem[];
  } | null;
};

function formatDay(value?: string | Date | null) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-sm leading-relaxed">{children}</p>;
}

export function GuruChartPanels({
  data,
  className,
}: {
  data: ChartPanelsData | null;
  className?: string;
}) {
  if (!data) {
    return (
      <GlassCard className={cn("space-y-2", className)}>
        <EmptyHint>Loading chart panels…</EmptyHint>
      </GlassCard>
    );
  }

  const rajaList = data.rajaYogas.length ? data.rajaYogas : data.yogas.slice(0, 5);

  return (
    <div className={cn("space-y-4", className)}>
      {data.chartSummary ? (
        <GlassCard className="overflow-hidden p-0">
          <div className="from-navy via-navy to-cosmic text-ivory bg-gradient-to-br px-4 py-4 sm:px-5">
            <p className="text-gold/90 text-[11px] font-medium tracking-[0.18em] uppercase">
              Natal snapshot
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                ["Lagna", data.chartSummary.lagnaSign],
                ["Moon", data.chartSummary.moonSign],
                ["Sun", data.chartSummary.sunSign],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white/5 px-2 py-3 backdrop-blur-sm">
                  <p className="text-ivory/55 text-[10px] tracking-wide uppercase">{label}</p>
                  <p className="font-display mt-1 text-base sm:text-lg">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-ivory/60 mt-3 text-center text-[11px]">
              Manglik · {data.chartSummary.manglikStatus}
            </p>
          </div>
        </GlassCard>
      ) : null}

      <GlassCard className="p-0">
        <Tabs defaultValue="yogas" className="w-full">
          <div className="border-border/40 border-b px-3 pt-3 sm:px-4">
            <TabsList className="mb-0 flex h-auto w-full [scrollbar-width:none] justify-start gap-1 overflow-x-auto bg-transparent p-0 [&::-webkit-scrollbar]:hidden">
              {(
                [
                  ["yogas", "Yogas"],
                  ["dasha", "Dasha"],
                  ["gochar", "Gochar"],
                  ["planets", "Planets"],
                ] as const
              ).map(([value, label]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="data-[state=active]:bg-gold/15 data-[state=active]:text-foreground shrink-0 rounded-full px-3 py-1.5 text-xs"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="yogas" className="mt-0 space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">Raja & auspicious yogas</h3>
              <Badge variant="secondary">{rajaList.length}</Badge>
            </div>
            {rajaList.length ? (
              <ul className="space-y-3">
                {rajaList.map((y) => (
                  <li
                    key={y.code}
                    className="border-border/40 from-background to-muted/20 rounded-2xl border bg-gradient-to-br p-3.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{y.name}</p>
                      {y.category ? <Badge variant="outline">{y.category}</Badge> : null}
                    </div>
                    {typeof y.strength === "number" ? (
                      <div className="mt-2.5 space-y-1">
                        <div className="text-muted-foreground flex justify-between text-[11px]">
                          <span>Strength</span>
                          <span>{y.strength}%</span>
                        </div>
                        <Progress value={y.strength} className="h-1.5" />
                      </div>
                    ) : null}
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                      {y.description || "Classical supportive combination."}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyHint>
                {data.hasChart
                  ? "No Raja-style yogas flagged yet — ask the Guru for a deeper house-lord reading."
                  : "Generate kundli to reveal yogas."}
              </EmptyHint>
            )}

            {data.doshas?.some((d) => d.present) ? (
              <div className="border-border/40 mt-2 rounded-2xl border p-3">
                <p className="text-xs font-semibold tracking-wide uppercase">Dosha notes</p>
                <ul className="mt-2 space-y-1.5 text-xs">
                  {data.doshas
                    .filter((d) => d.present)
                    .map((d) => (
                      <li key={d.code} className="text-muted-foreground">
                        <span className="text-foreground font-medium">{d.name}</span>
                        {d.severity ? ` · ${d.severity}` : ""} {d.notes ? `— ${d.notes}` : ""}
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="dasha" className="mt-0 space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg">Vimshottari Dasha</h3>
              {data.dasha?.currentMaha ? (
                <Badge className="bg-gold/20 text-foreground hover:bg-gold/20">
                  {data.dasha.currentMaha}
                  {data.dasha.currentAntar ? ` / ${data.dasha.currentAntar}` : ""}
                </Badge>
              ) : null}
            </div>
            {data.dasha?.periods?.length ? (
              <ul className="space-y-1">
                {data.dasha.periods.slice(0, 10).map((p, i) => (
                  <li
                    key={`${p.lord}-${p.level}-${i}`}
                    className="hover:bg-muted/40 flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.lord}</p>
                      <p className="text-muted-foreground text-[11px]">
                        {p.level}
                        {p.parentLord ? ` · under ${p.parentLord}` : ""}
                      </p>
                    </div>
                    <p className="text-muted-foreground shrink-0 text-right text-[11px]">
                      {formatDay(p.startDate)}
                      <br />
                      {formatDay(p.endDate)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyHint>Dasha timeline appears after kundli generation.</EmptyHint>
            )}
          </TabsContent>

          <TabsContent value="gochar" className="mt-0 space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg">Gochar</h3>
              {data.gochar ? <Badge variant="outline">{formatDay(data.gochar.asOf)}</Badge> : null}
            </div>
            {data.gochar ? (
              <>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Transit Asc ~{" "}
                  <span className="text-foreground font-medium">
                    {data.gochar.transitAscendant}
                  </span>
                  {" · "}Natal Lagna{" "}
                  <span className="text-foreground font-medium">{data.gochar.natalLagna}</span>
                </p>
                <ul className="space-y-2">
                  {data.gochar.highlights.map((h) => (
                    <li
                      key={h}
                      className="border-border/40 bg-muted/20 rounded-xl border px-3 py-2 text-xs leading-relaxed"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {data.gochar.planets.slice(0, 9).map((p) => (
                    <div
                      key={p.planet}
                      className="border-border/40 rounded-xl border px-2.5 py-2.5"
                      title={p.note}
                    >
                      <p className="text-sm font-medium">
                        {p.planet}
                        {p.isRetrograde ? <span className="text-gold ml-1 text-xs">℞</span> : null}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">
                        {p.sign} · H{p.houseFromNatalLagna}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyHint>
                Gochar needs birth place + kundli. Save birth details to unlock live transits.
              </EmptyHint>
            )}
          </TabsContent>

          <TabsContent value="planets" className="mt-0 space-y-3 p-4">
            <h3 className="font-display text-lg">Natal planets</h3>
            {data.chartSummary?.planets?.length ? (
              <div className="grid grid-cols-2 gap-2">
                {data.chartSummary.planets.map((p) => (
                  <div
                    key={p.planet}
                    className="border-border/40 rounded-xl border px-2.5 py-2.5 text-xs"
                  >
                    <p className="text-sm font-medium">
                      {p.planet}
                      {p.isRetrograde ? " ℞" : ""}
                    </p>
                    <p className="text-muted-foreground mt-0.5">
                      {p.sign} · House {p.house}
                    </p>
                    <p className="text-muted-foreground">{p.nakshatra}</p>
                    {p.dignity ? (
                      <p className="text-gold/90 mt-1 text-[10px]">{p.dignity}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyHint>Generate kundli to view natal planets.</EmptyHint>
            )}
          </TabsContent>
        </Tabs>
      </GlassCard>
    </div>
  );
}
