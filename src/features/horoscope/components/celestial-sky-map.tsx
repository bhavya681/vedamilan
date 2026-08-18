"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from "react";

import { useReducedMotion } from "framer-motion";

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
import { NakshatraGlyph } from "@/features/horoscope/components/nakshatra-glyph";
import {
  asterismFor,
  asterismHaloStars,
  clampHoverBox,
  placeAsterism,
} from "@/features/horoscope/lib/nakshatra-asterisms";
import {
  SKY_PAN,
  SKY_VIEW_MAX,
  SKY_VIEW_MIN,
  skyNebulae,
  skyStars,
  viewToFocusPoint,
  zoomAroundPoint,
} from "@/features/horoscope/lib/sky-field";
import { skyLabelAnchor, skyLabelPoint } from "@/features/horoscope/lib/sky-labels";
import { cn } from "@/lib/utils/cn";

const CX = 50;
const CY = 50;
const RH = 38;
const STARS = skyStars(180, 17);
const NEBULAE = skyNebulae();

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

function nakshatraFigure(name: string, snapshot: CelestialSnapshot, size: number) {
  const i = NAKSHATRAS.indexOf(name as (typeof NAKSHATRAS)[number]);
  if (i < 0) return null;
  const start = i * (360 / 27);
  const points = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const sample = nearestEcliptic(snapshot, start + t * (360 / 27));
    return stereographicPoint(sample.altitude, sample.azimuth, CX, CY, RH);
  });
  const mid = points[2];
  const end = points[4];
  const begin = points[0];
  if (!mid || !end || !begin) return null;
  const placed = placeAsterism(
    mid,
    { x: end.x - begin.x, y: end.y - begin.y },
    asterismFor(name),
    size,
  );
  const cx = placed.stars.reduce((s, p) => s + p.x, 0) / Math.max(1, placed.stars.length);
  const cy = placed.stars.reduce((s, p) => s + p.y, 0) / Math.max(1, placed.stars.length);
  return {
    d: pathFromPoints(points),
    placed,
    halo: asterismHaloStars({ x: cx, y: cy }, size, 11 + Math.max(0, i)),
    name,
    symbol: NAKSHATRA_DETAILS[name]?.symbol?.split(" / ")[0] || "",
    detail: NAKSHATRA_DETAILS[name],
    cx,
    cy,
  };
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
  focusNakshatra = null,
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
  focusNakshatra?: string | null;
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const restView = useRef({ x: 0, y: 0, k: 1 });
  const leaveTimer = useRef<number | null>(null);
  const panRaf = useRef<number | null>(null);
  const [hoverBox, setHoverBox] = useState({ left: 8, top: 8 });
  const reduceMotion = useReducedMotion();

  function commitView(next: { x: number; y: number; k: number }) {
    restView.current = next;
    setView(next);
  }

  function setZoom(next: number) {
    setView((v) => {
      const updated = { ...v, k: Math.min(SKY_VIEW_MAX, Math.max(SKY_VIEW_MIN, next)) };
      restView.current = updated;
      return updated;
    });
  }

  function beginInspect(next: HoverState) {
    if (!next) return;
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setHover(next);
  }

  function endInspect() {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => {
      setHover(null);
      leaveTimer.current = null;
    }, 80);
  }

  function panTo(next: { x: number; y: number; k: number }) {
    if (panRaf.current) window.cancelAnimationFrame(panRaf.current);
    if (reduceMotion) {
      commitView(next);
      return;
    }
    const from = restView.current;
    const started = performance.now();
    const dur = 280;
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / dur);
      const e = 1 - (1 - t) ** 3;
      const frame = {
        x: from.x + (next.x - from.x) * e,
        y: from.y + (next.y - from.y) * e,
        k: from.k + (next.k - from.k) * e,
      };
      setView(frame);
      if (t < 1) {
        panRaf.current = window.requestAnimationFrame(tick);
        return;
      }
      panRaf.current = null;
      restView.current = next;
    };
    panRaf.current = window.requestAnimationFrame(tick);
  }

  const snapshotRef = useRef(snapshot);
  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    return () => {
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
      if (panRaf.current) window.cancelAnimationFrame(panRaf.current);
    };
  }, []);

  useEffect(() => {
    if (!focusNakshatra) return;
    const snap = snapshotRef.current;
    const i = NAKSHATRAS.indexOf(focusNakshatra as (typeof NAKSHATRAS)[number]);
    if (i < 0) return;
    const sample = nearestEcliptic(snap, i * (360 / 27) + 360 / 54);
    const pt = stereographicPoint(sample.altitude, sample.azimuth, CX, CY, RH);
    panTo(viewToFocusPoint(pt.x, pt.y, restView.current.k));
    // Keep the user's zoom; only pan the selected nakshatra to centre.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNakshatra]);

  function onPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    if (panRaf.current) {
      window.cancelAnimationFrame(panRaf.current);
      panRaf.current = null;
      restView.current = view;
    }
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
      const nextK = Math.min(
        SKY_VIEW_MAX,
        Math.max(SKY_VIEW_MIN, pinch.current.k * (d / Math.max(1, pinch.current.d))),
      );
      setView((v) => {
        const updated = { ...v, k: nextK };
        restView.current = updated;
        return updated;
      });
      return;
    }
    const active = drag.current;
    if (!active || active.id !== e.pointerId) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const dx = ((e.clientX - active.x) / rect.width) * 100;
    const dy = ((e.clientY - active.y) / rect.height) * 100;
    setView(() => {
      const updated = {
        x: Math.max(-SKY_PAN, Math.min(SKY_PAN, active.panX + dx)),
        y: Math.max(-SKY_PAN, Math.min(SKY_PAN, active.panY + dy)),
        k: view.k,
      };
      restView.current = updated;
      return updated;
    });
  }

  function onPointerUp(e: ReactPointerEvent<SVGSVGElement>) {
    pointers.current.delete(e.pointerId);
    if (drag.current?.id === e.pointerId) drag.current = null;
    if (pointers.current.size < 2) pinch.current = null;
  }

  function onWheel(e: ReactWheelEvent<SVGSVGElement>) {
    e.preventDefault();
    if (panRaf.current) {
      window.cancelAnimationFrame(panRaf.current);
      panRaf.current = null;
    }
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const visX = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const visY = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 100;
    const factor = e.deltaY > 0 ? 0.9 : 1.12;
    setView((v) => {
      const px = 50 + (visX - 50 - v.x) / v.k;
      const py = 50 + (visY - 50 - v.y) / v.k;
      const next = zoomAroundPoint(v, px, py, v.k * factor);
      restView.current = next;
      return next;
    });
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
          `Alt ${body.altitude.toFixed(1)}° · Az ${body.azimuth.toFixed(1)}°`,
          `House ${body.houseFromCurrentLagna} from lagna`,
          body.dignity ? `Dignity · ${body.dignity}` : null,
          body.aboveHorizon ? "Above horizon" : "Below horizon",
          body.status === "rising" || body.status === "near-rising"
            ? "Near the eastern rise"
            : null,
          body.isRetrograde ? "Retrograde" : null,
        ].filter(Boolean) as string[],
      };
    }
    if (hover.kind === "nakshatra") {
      const meta = nakshatraHint(hover.id);
      const extra = NAKSHATRA_DETAILS[hover.id];
      return {
        x: hover.x,
        y: hover.y,
        title: meta.name,
        lines: [
          `Ruler ${meta.lord}`,
          `Deity ${meta.deity || "—"}`,
          `Symbol ${meta.symbol || "—"}`,
          extra?.gana ? `${extra.gana} gana · ${extra.element}` : null,
          extra?.qualities?.length ? extra.qualities.join(" · ") : null,
        ].filter(Boolean) as string[],
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

  useLayoutEffect(() => {
    if (!hover) return;
    const svg = svgRef.current;
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!svg || !wrap) return;
    const visX = (hover.x - 50) * view.k + 50 + view.x;
    const visY = (hover.y - 50) * view.k + 50 + view.y;
    const rect = wrap.getBoundingClientRect();
    const ctm = svg.getScreenCTM();
    let px = (visX / 100) * rect.width;
    let py = (visY / 100) * rect.height;
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = visX;
      pt.y = visY;
      const screen = pt.matrixTransform(ctm);
      px = screen.x - rect.left;
      py = screen.y - rect.top;
    }
    setHoverBox(
      clampHoverBox(
        px,
        py,
        card?.offsetWidth || 196,
        card?.offsetHeight || 102,
        wrap.clientWidth,
        wrap.clientHeight,
      ),
    );
  }, [hover, hoverCard, view.x, view.y, view.k]);

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

  const focusedNak = useMemo(() => {
    const name = focusNakshatra || (hover?.kind === "nakshatra" ? hover.id : null);
    if (!name) return null;
    return nakshatraFigure(name, snapshot, focusNakshatra === name ? 24 : 16.5);
  }, [focusNakshatra, hover, snapshot]);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative overflow-visible",
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
          <radialGradient id="nh-sky" cx="48%" cy="38%" r="68%">
            <stop offset="0%" stopColor="#1c2d52" />
            <stop offset="42%" stopColor="#10192e" />
            <stop offset="100%" stopColor="#070b14" />
          </radialGradient>
          <radialGradient id="nh-glow-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="nh-milky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b9c7ff" stopOpacity="0" />
            <stop offset="45%" stopColor="#e8dcc0" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#8b6ad4" stopOpacity="0" />
          </linearGradient>
          <filter id="nh-star-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="0.35" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <PlanetOrbDefs />
        </defs>
        <circle cx={CX} cy={CY} r="49" fill="url(#nh-sky)" />
        <ellipse
          cx="50"
          cy="52"
          rx="38"
          ry="11"
          fill="url(#nh-milky)"
          transform="rotate(-28 50 52)"
        />
        {NEBULAE.map((n, i) => (
          <ellipse
            key={i}
            cx={n.cx}
            cy={n.cy}
            rx={n.rx}
            ry={n.ry}
            fill={n.fill}
            opacity={n.o}
            transform={`rotate(${n.rot} ${n.cx} ${n.cy})`}
          />
        ))}
        <g
          transform={`translate(${50 + view.x} ${50 + view.y}) scale(${view.k}) translate(-50 -50)`}
        >
          {STARS.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="#f7f1e3"
              opacity={s.o}
              filter={s.r > 0.28 ? "url(#nh-star-glow)" : undefined}
            />
          ))}

          {layers.horizon ? (
            <>
              <circle
                cx={CX}
                cy={CY}
                r={RH}
                className="stroke-gold/55 fill-[#0b1220]/55"
                strokeWidth="0.55"
              />
              <circle cx={CX} cy={CY} r={RH} fill="url(#nh-glow-core)" opacity="0.55" />
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
                    onMouseEnter={() =>
                      beginInspect({ kind: "nakshatra", id: name, x: pt.x, y: pt.y })
                    }
                    onMouseLeave={() => endInspect()}
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
                    {focusNakshatra === name ? (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="3.4"
                        className="stroke-gold fill-gold/10"
                        strokeWidth="0.28"
                      />
                    ) : null}
                    <SkyHaloText
                      x={pt.x}
                      y={pt.y}
                      inset={2.15}
                      size="sm"
                      emphasize={isLagna || isMoon || focusNakshatra === name}
                      className={
                        isLagna || isMoon || focusNakshatra === name
                          ? undefined
                          : "fill-foreground/70 dark:fill-ivory/75"
                      }
                    >
                      {name.replace("Purva ", "P.").replace("Uttara ", "U.")}
                    </SkyHaloText>
                  </g>
                );
              })
            : null}

          {focusedNak ? (
            <g className="pointer-events-none">
              <circle
                cx={focusedNak.cx}
                cy={focusedNak.cy}
                r="13.5"
                fill="#d4af37"
                opacity="0.08"
              />
              <NakshatraGlyph
                name={focusedNak.name}
                x={focusedNak.cx - 4.8}
                y={focusedNak.cy - 4.8}
                width={9.6}
                height={9.6}
                className="text-gold/35"
              />
              <path
                d={focusedNak.d}
                className="stroke-gold/35 fill-none"
                strokeWidth="0.4"
                strokeLinecap="round"
                strokeDasharray="0.8 0.7"
              />
              {focusedNak.halo.map((star, idx) => (
                <circle
                  key={`halo-${idx}`}
                  cx={star.x}
                  cy={star.y}
                  r={star.r}
                  fill="#fff6d4"
                  opacity={star.o}
                />
              ))}
              {focusedNak.placed.lines.map(([a, b], idx) => {
                const from = focusedNak.placed.stars[a];
                const to = focusedNak.placed.stars[b];
                if (!from || !to) return null;
                return (
                  <line
                    key={`link-${idx}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#e8c547"
                    strokeWidth="0.38"
                    opacity="0.95"
                  />
                );
              })}
              {focusedNak.placed.stars.map((star, idx) => (
                <g key={`star-${idx}`}>
                  <circle cx={star.x} cy={star.y} r={star.r + 0.85} fill="#d4af37" opacity="0.32" />
                  <circle cx={star.x} cy={star.y} r={Math.max(0.38, star.r)} fill="#fff6d4" />
                </g>
              ))}
              <SkyHaloText
                x={focusedNak.cx}
                y={focusedNak.cy}
                inset={0}
                size="lg"
                emphasize
                dy={-8.4}
              >
                {focusedNak.name}
              </SkyHaloText>
              {focusedNak.symbol ? (
                <SkyHaloText
                  x={focusedNak.cx}
                  y={focusedNak.cy}
                  inset={0}
                  size="sm"
                  emphasize
                  dy={-6.1}
                >
                  {focusedNak.symbol}
                </SkyHaloText>
              ) : null}
              {hover?.kind === "nakshatra" && focusedNak.detail?.deity ? (
                <SkyHaloText x={focusedNak.cx} y={focusedNak.cy} inset={0} size="sm" dy={-4.2}>
                  {focusedNak.detail.deity}
                </SkyHaloText>
              ) : null}
            </g>
          ) : null}

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
            onMouseEnter={() => beginInspect({ kind: "lagna", x: lagnaPt.x, y: lagnaPt.y })}
            onMouseLeave={() => endInspect()}
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
              onMouseEnter={() => beginInspect({ kind: "mc", x: mcPt.x, y: mcPt.y })}
              onMouseLeave={() => endInspect()}
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
                  inspect={hover?.kind === "planet" && hover.id === p.planet}
                  onSelect={onSelect}
                  onHover={(next) => (next ? beginInspect(next) : endInspect())}
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
          ref={cardRef}
          className="border-gold/30 pointer-events-none absolute z-30 w-[min(16.5rem,calc(100%-1rem))] rounded-xl border bg-black/88 px-3 py-2.5 text-left shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
          style={{ left: hoverBox.left, top: hoverBox.top }}
        >
          <p className="text-ivory text-[12px] font-semibold tracking-wide">{hoverCard.title}</p>
          {hoverCard.lines.map((line) => (
            <p key={line} className="text-ivory/75 mt-0.5 text-[11px] leading-snug">
              {line}
            </p>
          ))}
          <p className="text-gold/80 mt-1.5 text-[10px] tracking-[0.14em] uppercase">
            Click to select · pinch or +/− to zoom
          </p>
        </div>
      ) : null}
      <div className="absolute right-2 bottom-2 z-10 flex flex-col items-end gap-1">
        <div className="border-ivory/15 flex overflow-hidden rounded-lg border bg-black/45 backdrop-blur-md">
          <button
            type="button"
            className="text-ivory/80 hover:bg-ivory/10 px-2 py-1 text-sm"
            aria-label="Zoom out"
            onClick={() => setZoom(view.k * 0.88)}
          >
            −
          </button>
          <span className="text-ivory/70 min-w-[2.6rem] self-center text-center text-[10px] tabular-nums">
            {Math.round(view.k * 100)}%
          </span>
          <button
            type="button"
            className="text-ivory/80 hover:bg-ivory/10 px-2 py-1 text-sm"
            aria-label="Zoom in"
            onClick={() => setZoom(view.k * 1.14)}
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="border-ivory/15 text-ivory/75 hover:text-ivory rounded-md border bg-black/45 px-2 py-1 text-[10px] tracking-wide uppercase backdrop-blur-md"
          onClick={() => {
            if (panRaf.current) window.cancelAnimationFrame(panRaf.current);
            commitView({ x: 0, y: 0, k: 1 });
            setHover(null);
          }}
        >
          Reset view
        </button>
      </div>
    </div>
  );
}

function PlanetMark({
  body,
  selected,
  inspect,
  onSelect,
  onHover,
}: {
  body: CelestialBody;
  selected: boolean;
  inspect?: boolean;
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
      <circle cx={pt.x} cy={pt.y} r={r + (inspect ? 3.4 : 2.15)} className="fill-transparent" />
      {inspect ? (
        <circle
          cx={pt.x}
          cy={pt.y}
          r={r + 2.15}
          fill="none"
          stroke="#e8c547"
          strokeWidth="0.18"
          opacity="0.85"
        />
      ) : null}
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
      <PlanetOrb planet={body.planet} cx={pt.x} cy={pt.y} selected={selected || inspect} />
      <SkyHaloText
        x={pt.x}
        y={pt.y}
        inset={r + 2.85}
        size={inspect || selected ? "md" : "sm"}
        emphasize={inspect || selected}
      >
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
