"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { PageHeader, EmptyState } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { PanelSkeleton } from "@/components/ui/page-skeletons";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { useHoroscope } from "@/hooks/use-horoscope";

function formatDay(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function yearsBetween(start: string, end: string) {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return null;
  return (b - a) / (365.2425 * 24 * 60 * 60 * 1000);
}

function progressInRange(start: string, end: string, now = Date.now()) {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
  return Math.min(1, Math.max(0, (now - a) / (b - a)));
}

function isCurrent(start: string, end: string, now = Date.now()) {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  return Number.isFinite(a) && Number.isFinite(b) && a <= now && now < b;
}

export default function DashaPage() {
  const { data, error, loading } = useHoroscope();
  const periods = useMemo(() => data?.dasha?.periods || [], [data?.dasha?.periods]);
  const maha = useMemo(() => periods.filter((p) => p.level === "MAHA"), [periods]);
  const antarByParent = useMemo(() => {
    const map = new Map<string, typeof periods>();
    for (const p of periods) {
      if (p.level !== "ANTAR" || !p.parentLord) continue;
      const list = map.get(p.parentLord) || [];
      list.push(p);
      map.set(p.parentLord, list);
    }
    return map;
  }, [periods]);

  const currentMaha = maha.find((p) => isCurrent(p.startDate, p.endDate));
  const currentAntar = periods.find(
    (p) =>
      p.level === "ANTAR" &&
      p.parentLord === (currentMaha?.lord || data?.dasha?.currentMaha) &&
      isCurrent(p.startDate, p.endDate),
  );

  const [openLord, setOpenLord] = useState<string | null>(null);
  const [userToggled, setUserToggled] = useState(false);

  const mahaProgress = currentMaha
    ? progressInRange(currentMaha.startDate, currentMaha.endDate)
    : 0;
  const antarProgress = currentAntar
    ? progressInRange(currentAntar.startDate, currentAntar.endDate)
    : 0;

  return (
    <div className="relative space-y-8">
      <PageHeader
        title="Dashas"
        description="Vimshottari Mahadasha and Antardasha timeline — see what period is active and what comes next."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild>
              <Link href={routes.kundli}>Open Kundli</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.astrology}>Astrology home</Link>
            </Button>
          </div>
        }
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {loading ? <PanelSkeleton lines={6} /> : null}

      {!loading && maha.length === 0 ? (
        <EmptyState
          title="No dasha yet"
          description="Generate your kundli to compute the Vimshottari dasha timeline."
          action={
            <Button asChild>
              <Link href={routes.kundli}>Generate kundli</Link>
            </Button>
          }
        />
      ) : null}

      {!loading && maha.length > 0 ? (
        <>
          <section className="border-border/60 grid gap-6 border-y py-6 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
                Current Mahadasha
              </p>
              <p className="font-display text-3xl sm:text-4xl">
                {data?.dasha?.currentMaha || currentMaha?.lord || "—"}
              </p>
              {currentMaha ? (
                <>
                  <p className="text-muted-foreground text-sm">
                    {formatDay(currentMaha.startDate)} – {formatDay(currentMaha.endDate)}
                    {yearsBetween(currentMaha.startDate, currentMaha.endDate) != null ? (
                      <span>
                        {" "}
                        · {yearsBetween(currentMaha.startDate, currentMaha.endDate)!.toFixed(1)} yrs
                      </span>
                    ) : null}
                  </p>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-gold h-full rounded-full transition-[width]"
                      style={{ width: `${Math.round(mahaProgress * 100)}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {Math.round(mahaProgress * 100)}% through this Mahadasha
                  </p>
                </>
              ) : null}
            </div>

            <div className="space-y-3">
              <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
                Current Antardasha
              </p>
              <p className="font-display text-3xl sm:text-4xl">
                {data?.dasha?.currentAntar || currentAntar?.lord || "—"}
              </p>
              {currentAntar ? (
                <>
                  <p className="text-muted-foreground text-sm">
                    {formatDay(currentAntar.startDate)} – {formatDay(currentAntar.endDate)}
                  </p>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full transition-[width]"
                      style={{ width: `${Math.round(antarProgress * 100)}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {Math.round(antarProgress * 100)}% through this Antardasha
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Expand a Mahadasha below to browse Antardasha sub-periods.
                </p>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="font-display text-2xl">Mahadasha timeline</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Tap a period to see its Antardasha sequence.
              </p>
            </div>

            <div className="divide-border/60 border-border/60 divide-y rounded-2xl border">
              {maha.map((p, idx) => {
                const active = isCurrent(p.startDate, p.endDate);
                const open = openLord === p.lord || (!userToggled && openLord === null && active);
                const antars = antarByParent.get(p.lord) || [];
                const yrs = yearsBetween(p.startDate, p.endDate);
                return (
                  <div key={`${p.lord}-${idx}`} className={cn(active && "bg-gold/5")}>
                    <button
                      type="button"
                      className="hover:bg-muted/40 flex w-full items-start justify-between gap-3 px-4 py-4 text-left transition-colors sm:px-5"
                      onClick={() => {
                        setUserToggled(true);
                        setOpenLord(open ? null : p.lord);
                      }}
                      aria-expanded={open}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-lg">{p.lord} Mahadasha</p>
                          {active ? (
                            <span className="bg-gold/20 text-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                              Now
                            </span>
                          ) : null}
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                          {formatDay(p.startDate)} – {formatDay(p.endDate)}
                          {yrs != null ? ` · ${yrs.toFixed(1)} years` : ""}
                        </p>
                      </div>
                      <ChevronDown
                        className={cn(
                          "text-muted-foreground mt-1 h-4 w-4 shrink-0 transition-transform",
                          open && "rotate-180",
                        )}
                        aria-hidden
                      />
                    </button>

                    {open ? (
                      <div className="border-border/50 border-t px-4 pb-4 sm:px-5">
                        {antars.length === 0 ? (
                          <p className="text-muted-foreground py-3 text-sm">
                            No Antardasha rows for this period.
                          </p>
                        ) : (
                          <ul className="mt-2 space-y-1">
                            {antars.map((a, i) => {
                              const antarActive = isCurrent(a.startDate, a.endDate);
                              return (
                                <li
                                  key={`${a.lord}-${i}`}
                                  className={cn(
                                    "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm",
                                    antarActive ? "bg-primary/10" : "hover:bg-muted/30",
                                  )}
                                >
                                  <div>
                                    <p className="font-medium">
                                      {a.lord}
                                      {antarActive ? (
                                        <span className="text-muted-foreground ml-2 text-[10px] font-semibold tracking-wide uppercase">
                                          Active
                                        </span>
                                      ) : null}
                                    </p>
                                    <p className="text-muted-foreground text-[11px]">Antardasha</p>
                                  </div>
                                  <p className="text-muted-foreground shrink-0 text-right text-[11px]">
                                    {formatDay(a.startDate)}
                                    <br />
                                    {formatDay(a.endDate)}
                                  </p>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
