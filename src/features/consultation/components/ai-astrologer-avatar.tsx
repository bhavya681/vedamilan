"use client";

import { cn } from "@/lib/utils/cn";
import {
  astrologerAvatarTheme,
  type AstrologerAvatarTheme,
} from "@/domain/consultation/astrologer-portraits";
import type { VirtualAstrologer } from "@/domain/consultation/virtual-astrologers";

function hsl(h: number, s: number, l: number, a = 1) {
  return `hsla(${h % 360}, ${s}%, ${l}%, ${a})`;
}

/**
 * Modern stylized AI-astrologer portrait — abstract, cosmic, non-photorealistic.
 * Not a real person; generated illustration from persona theme.
 */
export function AiAstrologerAvatar({
  astrologer,
  className,
}: {
  astrologer: Pick<VirtualAstrologer, "id" | "displayName" | "monogram" | "accent" | "gender">;
  className?: string;
}) {
  const theme: AstrologerAvatarTheme = astrologerAvatarTheme(astrologer.id) || {
    hue: 40,
    hue2: 220,
    rings: 2,
    glyph: "✦",
  };
  const { hue, hue2, rings, glyph } = theme;
  const female = astrologer.gender === "female";
  const uid = astrologer.id.replace(/[^a-z0-9-]/gi, "");

  return (
    <div
      className={cn("relative overflow-hidden rounded-full", className)}
      role="img"
      aria-label={`Stylized AI astrologer avatar for ${astrologer.displayName}`}
    >
      <svg viewBox="0 0 160 160" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`bg-${uid}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={hsl(hue, 55, 28)} />
            <stop offset="55%" stopColor={hsl(hue2, 45, 14)} />
            <stop offset="100%" stopColor={hsl(hue, 40, 6)} />
          </radialGradient>
          <linearGradient id={`face-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={hsl(hue, 35, 72)} />
            <stop offset="100%" stopColor={hsl(hue2, 40, 48)} />
          </linearGradient>
          <linearGradient id={`glow-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={hsl(hue, 80, 70, 0.55)} />
            <stop offset="100%" stopColor={hsl(hue2, 70, 40, 0)} />
          </linearGradient>
          <filter id={`soft-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        {/* Cosmic disc */}
        <circle cx="80" cy="80" r="80" fill={`url(#bg-${uid})`} />

        {/* Soft constellation dots */}
        {[
          [28, 36],
          [122, 42],
          [40, 118],
          [130, 110],
          [70, 24],
          [100, 130],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 2 === 0 ? 1.4 : 1}
            fill={hsl(hue, 70, 78, 0.55 + (i % 3) * 0.1)}
          />
        ))}

        {/* Orbit rings */}
        {Array.from({ length: rings }).map((_, i) => (
          <ellipse
            key={i}
            cx="80"
            cy="78"
            rx={52 + i * 8}
            ry={20 + i * 3}
            fill="none"
            stroke={hsl(hue2, 60, 65, 0.22 - i * 0.04)}
            strokeWidth="1"
            transform={`rotate(${-18 + i * 12} 80 78)`}
          />
        ))}

        {/* Upper glow */}
        <ellipse cx="80" cy="48" rx="46" ry="28" fill={`url(#glow-${uid})`} />

        {/* Abstract head silhouette */}
        <ellipse
          cx="80"
          cy={female ? 72 : 74}
          rx={female ? 28 : 30}
          ry={female ? 34 : 36}
          fill={`url(#face-${uid})`}
          opacity="0.92"
        />

        {/* Stylized hair / hood crown — abstract AI look */}
        {female ? (
          <>
            <path
              d="M48 78 C46 48 60 38 80 36 C100 38 114 48 112 78 C108 62 96 54 80 54 C64 54 52 62 48 78 Z"
              fill={hsl(hue2, 50, 22, 0.85)}
            />
            <path
              d="M50 90 C48 110 58 128 80 130 C102 128 112 110 110 90"
              fill="none"
              stroke={hsl(hue, 60, 60, 0.35)}
              strokeWidth="3"
            />
          </>
        ) : (
          <path
            d="M50 70 C48 42 62 34 80 32 C98 34 112 42 110 70 C104 52 94 46 80 46 C66 46 56 52 50 70 Z"
            fill={hsl(hue2, 45, 18, 0.9)}
          />
        )}

        {/* Minimal face marks — geometric, not photographic */}
        <circle cx="68" cy="76" r="2.2" fill={hsl(hue2, 20, 18, 0.75)} />
        <circle cx="92" cy="76" r="2.2" fill={hsl(hue2, 20, 18, 0.75)} />
        <path
          d="M70 92 Q80 98 90 92"
          fill="none"
          stroke={hsl(hue2, 25, 22, 0.55)}
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Tech / yantra forehead mark */}
        <circle
          cx="80"
          cy="62"
          r="3.5"
          fill={hsl(hue, 80, 62, 0.85)}
          filter={`url(#soft-${uid})`}
        />
        <circle cx="80" cy="62" r="1.4" fill={hsl(hue, 90, 88)} />

        {/* Bottom vignette + monogram plate */}
        <ellipse cx="80" cy="148" rx="70" ry="28" fill={hsl(hue, 40, 4, 0.55)} />
        <text
          x="80"
          y="142"
          textAnchor="middle"
          fill={hsl(hue, 70, 78, 0.9)}
          fontSize="11"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight="600"
          letterSpacing="1.5"
        >
          {astrologer.monogram}
        </text>

        {/* Floating glyph */}
        <text
          x="118"
          y="48"
          textAnchor="middle"
          fill={hsl(hue, 70, 75, 0.55)}
          fontSize={glyph.length > 1 ? "9" : "14"}
          fontFamily="serif"
        >
          {glyph}
        </text>

        {/* Rim */}
        <circle
          cx="80"
          cy="80"
          r="78"
          fill="none"
          stroke={hsl(hue, 55, 60, 0.35)}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
