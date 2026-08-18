"use client";

import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from "react";

import { NAKSHATRAS, SIGNS } from "@/application/horoscope/vedic-constants";
import { NAKSHATRA_DETAILS, vimshottariLordOf } from "@/application/horoscope/nakshatra-catalog";
import { stereographicPoint } from "@/application/horoscope/horizon-coordinates";
import type {
  CelestialBody,
  CelestialSnapshot,
} from "@/application/horoscope/celestial-horizon.types";
import { GRAHA_SUMMARIES } from "@/domain/graha-katha/summaries";
import {
  PlanetOrb,
  PlanetOrbDefs,
  planetOrbRadius,
} from "@/features/horoscope/components/planet-orbs";
import { skyStars } from "@/features/horoscope/lib/sky-field";
import { skyLabelAnchor, skyLabelPoint } from "@/features/horoscope/lib/sky-labels";
import { cn } from "@/lib/utils/cn";

const CX = 50;
const CY = 50;
const RH = 38;
const STARS = skyStars();

export const RASHI_SA: Record<string, string> = {
  Aries: "Mesha",
  Taurus: "Vrishabha",
  Gemini: "Mithuna",
  Cancer: "Karka",
  Leo: "Simha",
  Virgo: "Kanya",
  Libra: "Tula",
  Scorpio: "Vrischika",
  Sagittarius: "Dhanu",
  Capricorn: "Makara",
  Aquarius: "Kumbha",
  Pisces: "Meena",
};

export type SkyLayers = {
  zodiac: boolean;
  nakshatra: boolean;
  planets: boolean;
  horizon: boolean;
  houses: boolean;
  constellations: boolean;
};

export type SkyViewMode = "sky" | "vedic" | "learning";
export type HorizonFilter = "all" | "above" | "below";

type HoverState =
  | { kind: "planet"; id: string; x: number; y: number }
  | { kind: "nakshatra"; id: string; x: number; y: number }
  | { kind: "lagna"; x: number; y: number }
  | { kind: "mc"; x: number; y: number }
  | null;

function pathFromPoints(points: Array<{ x: number; y: number }>) {
  if (!points.length) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
}

function nearestEcliptic(snapshot: CelestialSnapshot, lon: number) {
  return snapshot.eclipticPath.reduce((best, p) =>
    Math.abs(p.siderealLongitude - lon) < Math.abs(best.siderealLongitude - lon) ? p : best,
  );
}

export function grahaTitle(planet: string) {
  const row = GRAHA_SUMMARIES.find((g) => g.engineName === planet);
  if (!row) return planet;
  return `${row.englishName} — ${row.id[0]?.toUpperCase()}${row.id.slice(1)}`;
}

function SkyHaloText({
  x,
  y,
  inset = 0,
  children,
  emphasize = false,
  size = "md",
  dy = 0,
  className,
}: {
  x: number;
  y: number;
  inset?: number;
  children: ReactNode;
  emphasize?: boolean;
  size?: "sm" | "md" | "lg";
  dy?: number;
  className?: string;
}) {
  const pt = skyLabelPoint(x, y, inset);
  return (
    <text
      x={pt.x}
      y={pt.y + dy}
      textAnchor={skyLabelAnchor(pt.x)}
      dominantBaseline="middle"
      paintOrder="stroke fill"
      strokeWidth={size === "lg" ? 0.92 : size === "sm" ? 0.64 : 0.78}
      className={cn(
        "stroke-background pointer-events-none",
        emphasize
          ? "fill-primary dark:fill-gold font-semibold"
          : "fill-foreground/90 dark:fill-ivory/92",
        size === "lg" && "text-[2.7px] tracking-wide",
        size === "md" && "text-[2.35px]",
        size === "sm" && "text-[2px]",
        className,
      )}
    >
      {children}
    </text>
  );
}

export function CelestialSkyMap({
  snapshot,
  layers,
  viewMode,
  selected,
  filter,
  onSelect,
  onNakshatra,
  onLagna,
  fill = false,
  className,
}: {
  snapshot: CelestialSnapshot;
  layers: SkyLayers;
  viewMode: SkyViewMode;
  selected: string | null;
  filter: HorizonFilter;
  onSelect: (planet: string | null) => void;
  onNakshatra?: (name: string) => void;
  onLagna?: () => void;
  fill?: boolean;
  className?: string;
}) {
  const learning = viewMode === "learning";
  const vedic = viewMode === "vedic" || learning;
  const ecliptic = snapshot.eclipticPath.map((p) =>
    stereographicPoint(p.altitude, p.azimuth, CX, CY, RH),
  );
  const visiblePlanets = snapshot.planets.filter((p) => {
    const above = p.aboveHorizon ?? p.altitude > 0;
    if (filter === "above") return above;
    if (filter === "below") return !above;
    return true;
  });

  const [hover, setHover] = useState<HoverState>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const drag = useRef<{ id: number; x: number; y: number; panX: number; panY: number } | null>(
    null,
  );
  const pinch = useRef<{ d: number; k: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const svgRef = useRef<SVGSVGElement>(null);

  function onPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    if (pointers.current.size === 1) {
      drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, panX: view.x, panY: view.y };
    } else if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const a = pts[0];
      const b = pts[1];
      if (a && b) {
        pinch.current = {
          d: Math.hypot(b.x - a.x, b.y - a.y),
          k: view.k,
        };
      }
      drag.current = null;
    }
  }

  function onPointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (pinch.current && pointers.current.size >= 2) {
      const pts = [...pointers.current.values()];
      const a = pts[0];
      const b = pts[1];
      if (!a || !b) return;
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      const next = Math.min(
        2.6,
        Math.max(0.8, pinch.current.k * (d / Math.max(1, pinch.current.d))),
      );
      setView((v) => ({ ...v, k: next }));
      return;
    }
    const active = drag.current;
    if (!active || active.id !== e.pointerId) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const dx = ((e.clientX - active.x) / rect.width) * 100;
    const dy = ((e.clientY - active.y) / rect.height) * 100;
    setView((v) => ({
      ...v,
      x: Math.max(-28, Math.min(28, active.panX + dx)),
      y: Math.max(-28, Math.min(28, active.panY + dy)),
    }));
  }

  function onPointerUp(e: ReactPointerEvent<SVGSVGElement>) {
    pointers.current.delete(e.pointerId);
    if (drag.current?.id === e.pointerId) drag.current = null;
    if (pointers.current.size < 2) pinch.current = null;
  }

  function onWheel(e: ReactWheelEvent<SVGSVGElement>) {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    setView((v) => ({ ...v, k: Math.min(2.6, Math.max(0.8, v.k * factor)) }));
  }

  const hoverCard = useMemo(() => {
    if (!hover) return null;
    if (hover.kind === "planet") {
      const body = snapshot.planets.find((p) => p.planet === hover.id);
      if (!body) return null;
      return {
        x: hover.x,
        y: hover.y,
        title: grahaTitle(body.planet),
        lines: [
          `${body.degreeInSign} ${body.sign}`,
          `${body.nakshatra} · pada ${body.nakshatraPada}`,
          body.aboveHorizon ? "Above horizon" : "Below horizon",
          body.isRetrograde ? "Retrograde" : null,
        ].filter(Boolean) as string[],
      };
    }
    if (hover.kind === "nakshatra") {
      const meta = nakshatraHint(hover.id);
      return {
        x: hover.x,
        y: hover.y,
        title: meta.name,
        lines: [`Ruler ${meta.lord}`, `Deity ${meta.deity || "—"}`, `Symbol ${meta.symbol || "—"}`],
      };
    }
    if (hover.kind === "lagna") {
      return {
        x: hover.x,
        y: hover.y,
        title: "Lagna · rising",
        lines: [
          `${snapshot.ascendant.sign} ${snapshot.ascendant.degreeInSign}`,
          `${snapshot.ascendant.nakshatra} · pada ${snapshot.ascendant.nakshatraPada}`,
          "Eastern horizon",
        ],
      };
    }
    if (!snapshot.midheaven) return null;
    return {
      x: hover.x,
      y: hover.y,
      title: "Midheaven · MC",
      lines: [
        `${snapshot.midheaven.sign} ${snapshot.midheaven.degreeInSign}`,
        `${snapshot.midheaven.nakshatra} · pada ${snapshot.midheaven.nakshatraPada}`,
      ],
    };
  }, [hover, snapshot]);

  const lagnaPt = stereographicPoint(
    snapshot.ascendant.altitude,
    snapshot.ascendant.azimuth,
    CX,
    CY,
    RH,
  );
  const mcPt = snapshot.midheaven
    ? stereographicPoint(snapshot.midheaven.altitude, snapshot.midheaven.azimuth, CX, CY, RH)
    : null;

  return (
    <div
      className={cn(
        "relative",
        fill && "flex h-full min-h-0 w-full items-center justify-center",
        className,
      )}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className={cn(
          "touch-none outline-none [&_g]:outline-none [&_g]:focus:outline-none",
          fill
            ? "h-full max-h-full w-full max-w-full"
            : "mx-auto h-auto max-h-[min(78vh,44rem)] w-full max-w-[min(100%,44rem)] lg:max-w-[min(100%,48rem)]",
        )}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Explore your Vedic sky. Ascendant ${snapshot.ascendant.sign} ${snapshot.ascendant.degreeInSign}.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <defs>
          <radialGradient id="nh-sky" cx="50%" cy="42%" r="62%">
            <stop
              offset="0%"
              className="[stop-color:color-mix(in_srgb,var(--muted)_55%,transparent)] dark:[stop-color:#152038]"
            />
            <stop
              offset="100%"
              className="[stop-color:color-mix(in_srgb,var(--background)_92%,var(--muted))] dark:[stop-color:#070b14]"
            />
          </radialGradient>
          <PlanetOrbDefs />
        </defs>
        <circle cx={CX} cy={CY} r="49" fill="url(#nh-sky)" />
        <g
          transform={`translate(${50 + view.x} ${50 + view.y}) scale(${view.k}) translate(-50 -50)`}
        >
          {STARS.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              className="fill-foreground/40 dark:fill-ivory/70"
              opacity={s.o}
            />
          ))}

          {layers.horizon ? (
            <>
              <circle
                cx={CX}
                cy={CY}
                r={RH}
                className="fill-background/25 stroke-border dark:stroke-gold/40 dark:fill-[#10182a]/80"
                strokeWidth="0.4"
              />
              <line
                x1="12"
                y1={CY}
                x2="88"
                y2={CY}
                className="stroke-border/70 dark:stroke-ivory/18"
                strokeWidth="0.22"
              />
              <line
                x1={CX}
                y1="12"
                x2={CX}
                y2="88"
                className="stroke-border/70 dark:stroke-ivory/18"
                strokeWidth="0.22"
              />
              {(
                [
                  ["N", 0],
                  ["E", 90],
                  ["S", 180],
                  ["W", 270],
                ] as const
              ).map(([label, az]) => {
                const rim = stereographicPoint(0, az, CX, CY, RH);
                const caption = label === "E" ? "Rising" : label === "W" ? "Setting" : null;
                return (
                  <g key={label}>
                    <SkyHaloText
                      x={rim.x}
                      y={rim.y}
                      inset={4.1}
                      emphasize={label === "E"}
                      size="lg"
                      dy={caption ? -1.35 : 0}
                    >
                      {label}
                    </SkyHaloText>
                    {caption ? (
                      <SkyHaloText
                        x={rim.x}
                        y={rim.y}
                        inset={4.1}
                        emphasize={label === "E"}
                        size="sm"
                        dy={1.4}
                      >
                        {caption}
                      </SkyHaloText>
                    ) : null}
                  </g>
                );
              })}
            </>
          ) : null}

          {layers.constellations
            ? SIGNS.map((sign, i) => {
                const samples = [0, 10, 20].map((off) => {
                  const lon = i * 30 + off;
                  const sample = nearestEcliptic(snapshot, lon);
                  return stereographicPoint(sample.altitude, sample.azimuth, CX, CY, RH);
                });
                return (
                  <path
                    key={`const-${sign}`}
                    d={pathFromPoints(samples)}
                    className="stroke-foreground/20 dark:stroke-ivory/20 fill-none"
                    strokeWidth="0.18"
                  />
                );
              })
            : null}

          {layers.zodiac ? (
            <path
              d={`${pathFromPoints(ecliptic)} Z`}
              className="stroke-primary/45 dark:stroke-gold/45 fill-none"
              strokeWidth="0.32"
            />
          ) : null}

          {layers.nakshatra
            ? NAKSHATRAS.map((name, i) => {
                const boundaryLon = i * (360 / 27);
                const midLon = boundaryLon + 360 / 54;
                const tickSample = nearestEcliptic(snapshot, boundaryLon);
                const midSample = nearestEcliptic(snapshot, midLon);
                const tick = stereographicPoint(
                  tickSample.altitude,
                  tickSample.azimuth,
                  CX,
                  CY,
                  RH,
                );
                const pt = stereographicPoint(midSample.altitude, midSample.azimuth, CX, CY, RH);
                const isMoon = name === snapshot.moonNakshatra;
                const isLagna = name === snapshot.ascendant.nakshatra;
                return (
                  <g
                    key={name}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer"
                    onMouseEnter={() => setHover({ kind: "nakshatra", id: name, x: pt.x, y: pt.y })}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => onNakshatra?.(name)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onNakshatra?.(name);
                      }
                    }}
                  >
                    <circle cx={pt.x} cy={pt.y} r="3.1" className="fill-transparent" />
                    <circle cx={tick.x} cy={tick.y} r="0.32" className="fill-muted-foreground/40" />
                    {isMoon ? (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="2.4"
                        className="stroke-primary/70 dark:stroke-gold/70 fill-none"
                        strokeWidth="0.2"
                      />
                    ) : null}
                    <SkyHaloText
                      x={pt.x}
                      y={pt.y}
                      inset={2.15}
                      size="sm"
                      emphasize={isLagna || isMoon}
                      className={
                        isLagna || isMoon ? undefined : "fill-foreground/70 dark:fill-ivory/75"
                      }
                    >
                      {name.replace("Purva ", "P.").replace("Uttara ", "U.")}
                    </SkyHaloText>
                  </g>
                );
              })
            : null}

          {layers.zodiac
            ? SIGNS.map((sign, i) => {
                const sample = nearestEcliptic(snapshot, i * 30 + 15);
                const pt = stereographicPoint(sample.altitude, sample.azimuth, CX, CY, RH);
                const isLagna = sign === snapshot.ascendant.sign;
                const inset = isLagna ? 8.6 : 6.1;
                const sa = RASHI_SA[sign];
                return (
                  <g key={sign}>
                    {vedic && sa ? (
                      <SkyHaloText
                        x={pt.x}
                        y={pt.y}
                        inset={inset}
                        size="sm"
                        dy={-1.55}
                        emphasize={isLagna}
                      >
                        {sa}
                      </SkyHaloText>
                    ) : null}
                    <SkyHaloText
                      x={pt.x}
                      y={pt.y}
                      inset={inset}
                      size={isLagna ? "lg" : "md"}
                      dy={vedic && sa ? 1.25 : 0}
                      emphasize={isLagna}
                    >
                      {sign}
                    </SkyHaloText>
                  </g>
                );
              })
            : null}

          {layers.houses
            ? Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
                const lon = snapshot.ascendant.longitude + (house - 1) * 30 + 15;
                const sidereal = ((lon % 360) + 360) % 360;
                const sample = nearestEcliptic(snapshot, sidereal);
                const pt = stereographicPoint(sample.altitude, sample.azimuth, CX, CY, RH * 0.62);
                return (
                  <SkyHaloText key={house} x={pt.x} y={pt.y} inset={1.2} size="sm">
                    H{house}
                  </SkyHaloText>
                );
              })
            : null}

          <line
            x1={CX}
            y1={CY}
            x2={lagnaPt.x}
            y2={lagnaPt.y}
            className="stroke-primary/50 dark:stroke-gold/45"
            strokeWidth="0.28"
            strokeDasharray="0.7 0.55"
          />
          <g
            role="button"
            tabIndex={0}
            className="cursor-pointer"
            onMouseEnter={() => setHover({ kind: "lagna", x: lagnaPt.x, y: lagnaPt.y })}
            onMouseLeave={() => setHover(null)}
            onClick={() => onLagna?.()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") e.preventDefault();
            }}
          >
            <circle
              cx={lagnaPt.x}
              cy={lagnaPt.y}
              r="2.05"
              className="fill-primary dark:fill-gold"
            />
            <SkyHaloText x={lagnaPt.x} y={lagnaPt.y} inset={11} emphasize size="lg" dy={-1.7}>
              {snapshot.ascendant.sign}
            </SkyHaloText>
            <SkyHaloText x={lagnaPt.x} y={lagnaPt.y} inset={11} emphasize size="sm" dy={1.55}>
              Lagna
            </SkyHaloText>
            {learning ? (
              <SkyHaloText x={lagnaPt.x} y={lagnaPt.y} inset={12.4} size="sm" dy={3.6}>
                What is rising
              </SkyHaloText>
            ) : null}
          </g>

          {mcPt ? (
            <g
              role="button"
              tabIndex={0}
              className="cursor-pointer"
              onMouseEnter={() => setHover({ kind: "mc", x: mcPt.x, y: mcPt.y })}
              onMouseLeave={() => setHover(null)}
            >
              <circle
                cx={mcPt.x}
                cy={mcPt.y}
                r="1.15"
                className="fill-muted-foreground dark:fill-ivory/80"
              />
              <SkyHaloText x={mcPt.x} y={mcPt.y} inset={4.4} size="sm" dy={-2.15}>
                MC
              </SkyHaloText>
            </g>
          ) : null}

          {layers.planets
            ? visiblePlanets.map((p) => (
                <PlanetMark
                  key={p.planet}
                  body={p}
                  selected={selected === p.planet}
                  onSelect={onSelect}
                  onHover={(next) => setHover(next)}
                />
              ))
            : null}

          {learning ? (
            <SkyHaloText x={CX} y={92.6} inset={0} size="sm">
              Center is zenith. Outer circle is the horizon. East is rising.
            </SkyHaloText>
          ) : null}
        </g>
      </svg>

      {hoverCard ? (
        <div
          className="border-border/70 bg-background/95 pointer-events-none absolute z-10 hidden min-w-[9.5rem] rounded-lg border px-2.5 py-2 text-left shadow-sm md:block"
          style={{
            left: `${Math.min(72, Math.max(4, hoverCard.x))}%`,
            top: `${Math.min(78, Math.max(4, hoverCard.y))}%`,
            transform: "translate(-10%, -120%)",
          }}
        >
          <p className="text-[11px] font-semibold tracking-wide">{hoverCard.title}</p>
          {hoverCard.lines.map((line) => (
            <p key={line} className="text-muted-foreground text-[10px] leading-snug">
              {line}
            </p>
          ))}
        </div>
      ) : null}
      <div className="absolute right-2 bottom-2">
        <button
          type="button"
          className="border-border/70 bg-background/80 text-muted-foreground hover:text-foreground rounded-md border px-2 py-1 text-[10px] tracking-wide uppercase"
          onClick={() => {
            setView({ x: 0, y: 0, k: 1 });
            setHover(null);
          }}
        >
          Reset sky
        </button>
      </div>
    </div>
  );
}

function PlanetMark({
  body,
  selected,
  onSelect,
  onHover,
}: {
  body: CelestialBody;
  selected: boolean;
  onSelect: (planet: string | null) => void;
  onHover: (next: HoverState) => void;
}) {
  const pt = stereographicPoint(body.altitude, body.azimuth, CX, CY, RH);
  const r = planetOrbRadius(body.planet);
  const label = `${body.planet}, ${body.degreeInSign} ${body.sign}, ${body.nakshatra} Nakshatra, ${body.aboveHorizon ? "above horizon" : "below horizon"}.`;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      className="outline-none"
      style={{ cursor: "pointer", outline: "none" }}
      opacity={(body.aboveHorizon ?? body.altitude > 0) ? 1 : 0.42}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onSelect(selected ? null : body.planet)}
      onMouseEnter={() => onHover({ kind: "planet", id: body.planet, x: pt.x, y: pt.y })}
      onMouseLeave={() => onHover(null)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(selected ? null : body.planet);
        }
      }}
    >
      {body.status === "rising" || body.status === "near-rising" ? (
        <circle
          cx={pt.x}
          cy={pt.y}
          r={r + 1.05}
          className="stroke-primary dark:stroke-gold"
          fill="none"
          strokeWidth="0.16"
          opacity="0.7"
        />
      ) : null}
      <PlanetOrb planet={body.planet} cx={pt.x} cy={pt.y} selected={selected} />
      <SkyHaloText x={pt.x} y={pt.y} inset={r + 2.85} size="sm">
        {body.planet}
      </SkyHaloText>
    </g>
  );
}

export function nakshatraHint(name: string) {
  const d = NAKSHATRA_DETAILS[name];
  return {
    name,
    deity: d?.deity,
    symbol: d?.symbol,
    lord: vimshottariLordOf(name),
  };
}
