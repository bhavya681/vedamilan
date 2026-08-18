"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Compass, Orbit, Sparkles, Sunrise } from "lucide-react";

import { NAKSHATRAS, SIGNS } from "@/application/horoscope/vedic-constants";
import { NAKSHATRA_DETAILS } from "@/application/horoscope/nakshatra-catalog";
import { PLANET_GLYPH } from "@/features/horoscope/components/planet-symbols";
import {
  conjunctionAlignments,
  horizonRole,
  horizonRoleLabel,
  lagnaLongitudeFromChart,
  nakshatraAt,
  northHorizonPoint,
  planetLongitudeFallback,
  ringSectorPath,
  type SkyPlanet,
} from "@/features/horoscope/lib/north-horizon";
import { GlassCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const CX = 400;
const CY = 400;
const R_NAK = 368;
const R_RASHI = 312;
const R_PLANET = 248;

const PLANET_COLOR: Record<string, string> = {
  Sun: "#e8c547",
  Moon: "#f3efe4",
  Mars: "#e07050",
  Mercury: "#7dce82",
  Jupiter: "#f0c36a",
  Venus: "#f2b6c6",
  Saturn: "#7aa2d4",
  Rahu: "#c4b4e0",
  Ketu: "#c4b8a0",
};

const CLASSICAL = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
] as const;

function polar(lon: number, lagnaLon: number, r: number) {
  return northHorizonPoint(lon, lagnaLon, CX, CY, r);
}

function seededStars(count: number) {
  const stars: Array<{ x: number; y: number; r: number; o: number }> = [];
  let s = 0x9e3779b9;
  for (let i = 0; i < count; i += 1) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const x = (s % 8000) / 10;
    const y = ((s / 8000) % 8000) / 10;
    const dx = x - CX;
    const dy = y - CY;
    if (dx * dx + dy * dy < 90 * 90) continue;
    stars.push({
      x,
      y,
      r: (s % 8) / 10 + 0.25,
      o: ((s >> 8) % 45) / 100 + 0.18,
    });
  }
  return stars;
}

function nakShort(name: string) {
  return name.replace("Purva ", "P.").replace("Uttara ", "U.").slice(0, 8);
}

type IncomingPlanet = {
  planet: string;
  sign: string;
  house: number;
  nakshatra: string;
  nakshatraPada?: number;
  longitude?: number;
  dignity?: string | null;
  isRetrograde?: boolean;
};

export function NorthHorizonGalaxy({
  lagnaSign,
  lagnaDegree,
  lagnaSignId,
  lagnaNakshatra,
  lagnaNakshatraPada,
  planets,
}: {
  lagnaSign?: string | null;
  lagnaDegree?: number | null;
  lagnaSignId?: number | null;
  lagnaNakshatra?: string | null;
  lagnaNakshatraPada?: number | null;
  planets?: IncomingPlanet[] | null;
}) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<string | null>(null);

  const lagnaLon = useMemo(
    () => lagnaLongitudeFromChart({ lagnaSign, lagnaDegree, lagnaSignId }),
    [lagnaSign, lagnaDegree, lagnaSignId],
  );

  const skyPlanets = useMemo<SkyPlanet[]>(() => {
    return (planets || [])
      .filter((p) => CLASSICAL.includes(p.planet as (typeof CLASSICAL)[number]))
      .map((p) => ({
        planet: p.planet,
        sign: p.sign,
        house: p.house,
        nakshatra: p.nakshatra,
        nakshatraPada: p.nakshatraPada,
        longitude: typeof p.longitude === "number" ? p.longitude : planetLongitudeFallback(p.sign),
        dignity: p.dignity,
        isRetrograde: p.isRetrograde,
      }));
  }, [planets]);

  const alignments = useMemo(() => conjunctionAlignments(skyPlanets, 8), [skyPlanets]);
  const stars = useMemo(() => seededStars(140), []);
  const lagnaNak = lagnaNakshatra || nakshatraAt(lagnaLon).nakshatra;
  const lagnaPada = lagnaNakshatraPada || nakshatraAt(lagnaLon).nakshatraPada;
  const lagnaDetail = NAKSHATRA_DETAILS[lagnaNak];

  const rising = skyPlanets.filter((p) => horizonRole(p.house) === "rising");
  const aboutToRise = skyPlanets.filter((p) => horizonRole(p.house) === "about-to-rise");
  const culminating = skyPlanets.filter((p) => horizonRole(p.house) === "culminating");
  const setting = skyPlanets.filter((p) => horizonRole(p.house) === "setting");

  const selectedPlanet = skyPlanets.find((p) => p.planet === selected) || null;
  const selectedRole = selectedPlanet ? horizonRole(selectedPlanet.house) : null;

  const rahu = skyPlanets.find((p) => p.planet === "Rahu");
  const ketu = skyPlanets.find((p) => p.planet === "Ketu");

  if (!lagnaSign && !skyPlanets.length) return null;

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="from-navy via-navy relative bg-gradient-to-b to-[#070b16]">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 18%, rgba(212,175,55,0.16), transparent 55%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(90,70,180,0.18), transparent 60%), radial-gradient(ellipse 40% 30% at 18% 80%, rgba(40,90,160,0.16), transparent 55%)",
          }}
        />

        <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-gold/80 flex items-center gap-1.5 text-xs tracking-[0.18em] uppercase">
                  <Orbit className="h-3.5 w-3.5" />
                  North horizon · galaxy overview
                </p>
                <h2 className="font-display text-ivory mt-1 text-2xl sm:text-3xl">
                  What is rising
                </h2>
                <p className="text-ivory/70 mt-1 max-w-xl text-sm leading-relaxed">
                  East / Lagna sits at the top, like the North Indian diamond. Planets travel
                  anti-clockwise through 27 nakshatras. Gold glow marks the rising window.
                </p>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[40rem]">
              <svg
                viewBox="0 0 800 800"
                className="h-auto w-full"
                role="img"
                aria-label={`North Indian sky. Rising lagna ${lagnaSign || "unknown"} in ${lagnaNak}.`}
              >
                <defs>
                  <radialGradient id="nh-core" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1a2744" />
                    <stop offset="55%" stopColor="#0c1222" />
                    <stop offset="100%" stopColor="#070b16" />
                  </radialGradient>
                  <linearGradient id="nh-rise" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                  </linearGradient>
                  <filter id="nh-glow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="3.5" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <circle cx={CX} cy={CY} r="392" fill="url(#nh-core)" />

                {stars.map((st, i) => (
                  <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#f7f1e3" opacity={st.o} />
                ))}

                {/* Rising window (East, top) */}
                <ellipse cx={CX} cy={CY - 210} rx="92" ry="70" fill="url(#nh-rise)" opacity="0.9" />

                {/* Nakshatra ring */}
                {NAKSHATRAS.map((name, i) => {
                  const start = i * (360 / 27);
                  const mid = start + 360 / 54;
                  const label = polar(mid, lagnaLon, R_NAK - 22);
                  const isLagnaNak = name === lagnaNak;
                  return (
                    <g key={name}>
                      <path
                        d={ringSectorPath(start, 360 / 27, lagnaLon, R_RASHI + 8, R_NAK, CX, CY)}
                        fill={
                          isLagnaNak
                            ? "rgba(212,175,55,0.18)"
                            : i % 2 === 0
                              ? "rgba(247,241,227,0.045)"
                              : "rgba(247,241,227,0.02)"
                        }
                        stroke="rgba(212,175,55,0.22)"
                        strokeWidth="0.6"
                      />
                      <text
                        x={label.x}
                        y={label.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={isLagnaNak ? "#e8c547" : "rgba(247,241,227,0.55)"}
                        fontSize="8.5"
                        fontFamily="ui-sans-serif, system-ui"
                      >
                        {nakShort(name)}
                      </text>
                    </g>
                  );
                })}

                {/* Rashi ring */}
                {SIGNS.map((sign, i) => {
                  const start = i * 30;
                  const mid = start + 15;
                  const a = polar(start, lagnaLon, R_RASHI);
                  const b = polar(start + 30, lagnaLon, R_RASHI);
                  const label = polar(mid, lagnaLon, R_RASHI - 22);
                  const isLagna = sign === lagnaSign;
                  return (
                    <g key={sign}>
                      <path
                        d={`M ${a.x} ${a.y} A ${R_RASHI} ${R_RASHI} 0 0 0 ${b.x} ${b.y}`}
                        fill="none"
                        stroke={isLagna ? "#d4af37" : "rgba(247,241,227,0.18)"}
                        strokeWidth={isLagna ? 2.4 : 1}
                      />
                      <text
                        x={label.x}
                        y={label.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={isLagna ? "#e8c547" : "rgba(247,241,227,0.72)"}
                        fontSize="13"
                        fontWeight={isLagna ? 700 : 500}
                        fontFamily="ui-sans-serif, system-ui"
                      >
                        {sign.slice(0, 3)}
                      </text>
                    </g>
                  );
                })}

                <circle
                  cx={CX}
                  cy={CY}
                  r={R_PLANET}
                  fill="none"
                  stroke="rgba(212,175,55,0.28)"
                  strokeWidth="1.2"
                  strokeDasharray="3 7"
                />

                {/* Rahu–Ketu axis */}
                {rahu && ketu ? (
                  <line
                    x1={polar(rahu.longitude, lagnaLon, R_PLANET).x}
                    y1={polar(rahu.longitude, lagnaLon, R_PLANET).y}
                    x2={polar(ketu.longitude, lagnaLon, R_PLANET).x}
                    y2={polar(ketu.longitude, lagnaLon, R_PLANET).y}
                    stroke="rgba(196,180,224,0.45)"
                    strokeWidth="1.4"
                    strokeDasharray="6 6"
                  />
                ) : null}

                {alignments.map((pair) => {
                  const a = skyPlanets.find((p) => p.planet === pair.a);
                  const b = skyPlanets.find((p) => p.planet === pair.b);
                  if (!a || !b) return null;
                  const pa = polar(a.longitude, lagnaLon, R_PLANET);
                  const pb = polar(b.longitude, lagnaLon, R_PLANET);
                  return (
                    <line
                      key={`${pair.a}-${pair.b}`}
                      x1={pa.x}
                      y1={pa.y}
                      x2={pb.x}
                      y2={pb.y}
                      stroke="rgba(232,197,71,0.55)"
                      strokeWidth="1.6"
                    />
                  );
                })}

                {/* Cardinals */}
                {(
                  [
                    { label: "EAST · RISING", lon: 0, r: 86 },
                    { label: "NORTH", lon: 90, r: 86 },
                    { label: "WEST · SETTING", lon: 180, r: 86 },
                    { label: "SOUTH · MC", lon: 270, r: 86 },
                  ] as const
                ).map((c) => {
                  const p = polar(c.lon, 0, R_NAK + 18);
                  return (
                    <text
                      key={c.label}
                      x={p.x}
                      y={p.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={c.lon === 0 ? "#e8c547" : "rgba(247,241,227,0.55)"}
                      fontSize="11"
                      fontWeight={c.lon === 0 ? 700 : 500}
                      letterSpacing="1.2"
                    >
                      {c.label}
                    </text>
                  );
                })}

                {skyPlanets.map((p, idx) => {
                  const jitter = ((idx % 5) - 2) * 7;
                  const pt = polar(p.longitude, lagnaLon, R_PLANET + jitter);
                  const color = PLANET_COLOR[p.planet] || "#f7f1e3";
                  const role = horizonRole(p.house);
                  const active = selected === p.planet;
                  const risingNow = role === "rising";
                  return (
                    <g
                      key={p.planet}
                      role="button"
                      tabIndex={0}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelected(p.planet === selected ? null : p.planet)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelected(p.planet === selected ? null : p.planet);
                        }
                      }}
                    >
                      <title>{`${p.planet} in ${p.sign}, ${p.nakshatra}, house ${p.house}. ${horizonRoleLabel(role)}.`}</title>
                      {risingNow ? (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="16"
                          fill="none"
                          stroke="#d4af37"
                          strokeWidth="1.2"
                          opacity="0.7"
                        />
                      ) : null}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={active ? 11 : 8.5}
                        fill={color}
                        filter="url(#nh-glow)"
                        opacity={role === "below" ? 0.55 : 1}
                        stroke={active ? "#fff6d4" : "rgba(7,11,22,0.7)"}
                        strokeWidth={active ? 2 : 1}
                      />
                      <text
                        x={pt.x}
                        y={pt.y + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#070b16"
                        fontSize="9"
                        fontWeight={700}
                      >
                        {PLANET_GLYPH[p.planet] || p.planet.slice(0, 1)}
                      </text>
                      <text
                        x={pt.x}
                        y={pt.y + 20}
                        textAnchor="middle"
                        fill={color}
                        fontSize="11"
                        fontWeight={600}
                      >
                        {p.planet}
                        {p.isRetrograde ? " Rx" : ""}
                      </text>
                    </g>
                  );
                })}

                {/* Lagna core */}
                <circle
                  cx={CX}
                  cy={CY}
                  r="58"
                  fill="rgba(12,18,34,0.92)"
                  stroke="#d4af37"
                  strokeWidth="1.6"
                />
                <text
                  x={CX}
                  y={CY - 10}
                  textAnchor="middle"
                  fill="#e8c547"
                  fontSize="11"
                  letterSpacing="1.6"
                >
                  LAGNA
                </text>
                <text
                  x={CX}
                  y={CY + 10}
                  textAnchor="middle"
                  fill="#f7f1e3"
                  fontSize="18"
                  fontWeight={700}
                >
                  {lagnaSign || "—"}
                </text>
                <text
                  x={CX}
                  y={CY + 28}
                  textAnchor="middle"
                  fill="rgba(247,241,227,0.7)"
                  fontSize="10"
                >
                  {typeof lagnaDegree === "number" ? `${lagnaDegree.toFixed(1)}°` : ""}
                </text>
              </svg>
            </div>
          </div>

          <aside className="border-gold/15 bg-navy/40 space-y-4 border-t p-4 sm:p-6 lg:border-t-0 lg:border-l">
            <div className="space-y-2">
              <p className="text-gold/80 flex items-center gap-1.5 text-xs tracking-[0.16em] uppercase">
                <Sunrise className="h-3.5 w-3.5" />
                Rising now
              </p>
              <p className="font-display text-ivory text-2xl">{lagnaSign || "—"}</p>
              <p className="text-ivory/75 text-sm leading-relaxed">
                {lagnaNak}
                {lagnaPada ? ` · pada ${lagnaPada}` : ""}
                {lagnaDetail ? ` · ${lagnaDetail.symbol}` : ""}
              </p>
              {lagnaDetail ? (
                <p className="text-ivory/60 text-xs leading-relaxed">{lagnaDetail.effect}</p>
              ) : null}
            </div>

            <HorizonList
              icon={<Sparkles className="h-3.5 w-3.5" />}
              title="In the rising house"
              items={rising}
              empty="No graha sitting exactly in house 1."
              onPick={setSelected}
              selected={selected}
            />
            <HorizonList
              title="About to rise"
              items={aboutToRise}
              empty="Twelfth house is empty."
              onPick={setSelected}
              selected={selected}
            />
            <HorizonList
              title="Culminating"
              items={culminating}
              empty="Nothing at the midheaven now."
              onPick={setSelected}
              selected={selected}
            />
            <HorizonList
              title="Setting in the west"
              items={setting}
              empty="Seventh house is empty."
              onPick={setSelected}
              selected={selected}
            />

            {alignments.length ? (
              <div>
                <p className="text-ivory/80 mb-2 text-xs tracking-[0.14em] uppercase">
                  Close alignments
                </p>
                <ul className="space-y-1.5 text-sm">
                  {alignments.slice(0, 6).map((a) => (
                    <li key={`${a.a}-${a.b}`} className="text-ivory/75">
                      {a.a} · {a.b}
                      <span className="text-ivory/45"> · {a.orb}°</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-ivory/50 text-xs">No grahas within an 8° conjunction orb.</p>
            )}

            {selectedPlanet ? (
              <div className="border-gold/25 rounded-xl border bg-black/20 p-3">
                <p className="text-ivory font-medium">{selectedPlanet.planet}</p>
                <p className="text-ivory/70 mt-1 text-sm leading-relaxed">
                  {selectedPlanet.sign} · house {selectedPlanet.house} · {selectedPlanet.nakshatra}
                  {selectedPlanet.nakshatraPada ? ` pada ${selectedPlanet.nakshatraPada}` : ""}
                </p>
                <p className="text-gold/80 mt-2 text-xs">
                  {selectedRole ? horizonRoleLabel(selectedRole) : ""}
                </p>
              </div>
            ) : (
              <p className="text-ivory/45 text-xs">Tap a graha on the wheel for its sky note.</p>
            )}

            <div className="flex flex-wrap gap-2">
              {skyPlanets.map((p) => (
                <button
                  key={p.planet}
                  type="button"
                  onClick={() => setSelected(p.planet === selected ? null : p.planet)}
                  className={cn(
                    "min-h-11 rounded-full border px-3 text-xs font-medium",
                    selected === p.planet
                      ? "border-gold bg-gold/20 text-ivory"
                      : "border-ivory/20 text-ivory/80 hover:border-gold/50",
                  )}
                >
                  {p.planet}
                </button>
              ))}
            </div>

            <p className="text-ivory/40 flex items-start gap-1.5 text-[11px] leading-relaxed">
              <Compass className="mt-0.5 h-3 w-3 shrink-0" />
              Sidereal natal sky from your kundli — not a live telescope feed. House 1 is the
              eastern horizon; 10 is south / midheaven; 7 is west.
            </p>
            <Button asChild size="sm" variant="outline" className="border-ivory/20 text-ivory">
              <Link href={routes.astrologyNorthHorizon}>Open live celestial sky</Link>
            </Button>
          </aside>
        </div>
      </div>
      {!reduceMotion ? (
        <motion.div
          aria-hidden
          className="from-gold/0 via-gold/25 to-gold/0 h-px bg-gradient-to-r"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.25, 0.7, 0.25] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
    </GlassCard>
  );
}

function HorizonList({
  title,
  items,
  empty,
  onPick,
  selected,
  icon,
}: {
  title: string;
  items: SkyPlanet[];
  empty: string;
  onPick: (name: string) => void;
  selected: string | null;
  icon?: ReactNode;
}) {
  return (
    <div>
      <p className="text-ivory/80 mb-1.5 flex items-center gap-1.5 text-xs tracking-[0.14em] uppercase">
        {icon}
        {title}
      </p>
      {items.length ? (
        <ul className="flex flex-wrap gap-1.5">
          {items.map((p) => (
            <li key={p.planet}>
              <button
                type="button"
                onClick={() => onPick(p.planet)}
                className={cn(
                  "min-h-9 rounded-lg border px-2.5 text-xs",
                  selected === p.planet ? "border-gold text-gold" : "border-ivory/15 text-ivory/80",
                )}
              >
                {p.planet}
                <span className="text-ivory/45"> · {p.nakshatra}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ivory/45 text-xs">{empty}</p>
      )}
    </div>
  );
}
