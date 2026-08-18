"use client";

import { useId, useMemo } from "react";

import { asterismFor } from "@/features/horoscope/lib/nakshatra-asterisms";
import { galaxyStars, skyNebulae } from "@/features/horoscope/lib/sky-field";
import { cn } from "@/lib/utils/cn";

const VW = 160;
const VH = 90;

function seedFromName(name: string) {
  return [...name].reduce((s, ch) => s + ch.charCodeAt(0), 17);
}

function StarMark({
  x,
  y,
  r,
  spike = false,
}: {
  x: number;
  y: number;
  r: number;
  spike?: boolean;
}) {
  const arm = r * (spike ? 3.6 : 2.5);
  return (
    <g>
      <circle cx={x} cy={y} r={r * 2.6} fill="#d4af37" opacity="0.28" />
      {spike ? (
        <>
          <line
            x1={x - arm}
            y1={y}
            x2={x + arm}
            y2={y}
            stroke="#fff6d4"
            strokeWidth={Math.max(0.18, r * 0.26)}
            opacity="0.9"
          />
          <line
            x1={x}
            y1={y - arm}
            x2={x}
            y2={y + arm}
            stroke="#fff6d4"
            strokeWidth={Math.max(0.18, r * 0.26)}
            opacity="0.9"
          />
        </>
      ) : null}
      <circle cx={x} cy={y} r={r} fill="#fff8e8" />
    </g>
  );
}

/** Large classical nakshatra figure placed on a galaxy field. Decorative. */
export function NakshatraStarFigure({ name, className }: { name: string; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const field = useMemo(() => {
    const seed = seedFromName(name);
    return {
      stars: galaxyStars(140, seed),
      nebulae: skyNebulae(seed + 9),
    };
  }, [name]);
  const pattern = asterismFor(name);
  const figure = pattern.stars.map((star) => ({
    x: 42 + star.x * 76,
    y: 14 + star.y * 62,
    r: 1.7 + (star.r ?? 0.42) * 2.1,
  }));
  const brightest = figure.reduce(
    (best, star, i) => (star.r > (figure[best]?.r ?? 0) ? i : best),
    0,
  );

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={`${name} as a star group in a galaxy field`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={`${uid}-core`} cx="48%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#243868" />
          <stop offset="38%" stopColor="#121a33" />
          <stop offset="100%" stopColor="#05070e" />
        </radialGradient>
        <linearGradient id={`${uid}-milky`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b9c7ff" stopOpacity="0" />
          <stop offset="46%" stopColor="#e8dcc0" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#8b6ad4" stopOpacity="0" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="0.7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width={VW} height={VH} fill={`url(#${uid}-core)`} />
      <ellipse
        cx="80"
        cy="48"
        rx="58"
        ry="14"
        fill={`url(#${uid}-milky)`}
        transform="rotate(-26 80 48)"
      />
      {field.nebulae.map((n, i) => (
        <ellipse
          key={`neb-${i}`}
          cx={n.cx * 1.6}
          cy={n.cy * 0.9}
          rx={n.rx * 1.15}
          ry={n.ry}
          fill={n.fill}
          opacity={n.o + 0.06}
          transform={`rotate(${n.rot} ${n.cx * 1.6} ${n.cy * 0.9})`}
        />
      ))}
      {field.stars.map((s, i) => (
        <circle key={`g-${i}`} cx={s.x * 1.6} cy={s.y * 0.9} r={s.r} fill="#f7f1e3" opacity={s.o} />
      ))}
      {pattern.lines.map(([a, b], i) => {
        const from = figure[a];
        const to = figure[b];
        if (!from || !to) return null;
        return (
          <line
            key={`link-${i}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#e8c547"
            strokeWidth="0.62"
            opacity="0.78"
          />
        );
      })}
      <g filter={`url(#${uid}-glow)`}>
        {figure.map((star, i) => (
          <StarMark key={i} x={star.x} y={star.y} r={star.r} spike={i === brightest} />
        ))}
      </g>
    </svg>
  );
}
