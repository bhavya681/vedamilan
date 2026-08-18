"use client";

import { cn } from "@/lib/utils/cn";

/** Small gold line-glyphs for nakshatra symbols. Decorative — not a star catalog. */
export function NakshatraGlyph({
  name,
  className,
  width,
  height,
  x,
  y,
}: {
  name: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  x?: number | string;
  y?: number | string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={width}
      height={height}
      x={x}
      y={y}
      className={cn(!(width || height) && "h-7 w-7 shrink-0", className)}
      aria-hidden
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {glyphFor(name)}
      </g>
    </svg>
  );
}

function glyphFor(name: string) {
  switch (name) {
    case "Ashwini":
      return <path d="M6 22c4-9 8-14 14-16 2 4 3 9 1 14-4 2-9 3-15 2Z M18 8l5-3" />;
    case "Bharani":
      return <ellipse cx="16" cy="16" rx="8" ry="10" />;
    case "Krittika":
      return <path d="M16 5v22M10 12l6-7 6 7M12 27h8" />;
    case "Rohini":
      return <path d="M7 22V12l9-6 9 6v10H7Z M16 12v10" />;
    case "Mrigashira":
      return <path d="M10 24c2-8 12-8 14 0M10 14l-3-6M22 14l3-6M13 12h6" />;
    case "Ardra":
      return <path d="M16 6c5 6 8 10 8 15a8 8 0 1 1-16 0c0-5 3-9 8-15Z" />;
    case "Punarvasu":
      return <path d="M8 24l8-18 4 10 4-6v14" />;
    case "Pushya":
      return (
        <>
          <circle cx="16" cy="16" r="6" />
          <path d="M16 6v4M16 22v4M6 16h4M22 16h4" />
        </>
      );
    case "Ashlesha":
      return <path d="M8 22c3-8 6-4 8-10 2 6 5 2 8 10" />;
    case "Magha":
      return <path d="M8 24h16v-4l-3-3V10l-5-4-5 4v7l-3 3v4Z" />;
    case "Purva Phalguni":
      return <path d="M6 20c6-2 14-2 20 0M8 16c5-8 11-8 16 0" />;
    case "Uttara Phalguni":
      return <path d="M7 22h18v-6H7v6Z M10 16V10h12v6" />;
    case "Hasta":
      return <path d="M10 24v-9h2v-4h3v4h2v-6h3v11" />;
    case "Chitra":
      return (
        <>
          <circle cx="16" cy="16" r="5" />
          <path d="M16 6v3M16 23v3M6 16h3M23 16h3M9 9l2 2M21 21l2 2M9 23l2-2M21 11l2-2" />
        </>
      );
    case "Swati":
      return <path d="M8 16h16M16 8c5 3 7 6 8 8-1 2-3 5-8 8-5-3-7-6-8-8 1-2 3-5 8-8Z" />;
    case "Vishakha":
      return <path d="M6 24V10h6v14M20 24V10h6v14M12 12h8" />;
    case "Anuradha":
      return <path d="M8 20c4-10 12-10 16 0M16 8v6" />;
    case "Jyeshtha":
      return <path d="M10 8h12l-2 8H12L10 8Z M16 16v8M12 24h8" />;
    case "Mula":
      return <path d="M16 6v8M10 26c2-8 4-8 6-12 2 4 4 4 6 12M8 26h16" />;
    case "Purva Ashadha":
      return <path d="M8 22h16v-5l-8-9-8 9v5Z" />;
    case "Uttara Ashadha":
      return <path d="M6 20h20M8 16h16M10 12h12M16 8v16" />;
    case "Shravana":
      return <path d="M8 12c4 8 12 8 16 0M8 16c4 6 12 6 16 0" />;
    case "Dhanishta":
      return (
        <>
          <ellipse cx="16" cy="16" rx="7" ry="9" />
          <path d="M16 8v16" />
        </>
      );
    case "Shatabhisha":
      return (
        <>
          <circle cx="16" cy="16" r="8" />
          <circle cx="16" cy="16" r="3" />
        </>
      );
    case "Purva Bhadrapada":
      return <path d="M10 6v20M10 6h10l-4 8h8l-12 12" />;
    case "Uttara Bhadrapada":
      return <path d="M8 22c4-12 12-12 16 0M8 22h16M16 6v8" />;
    case "Revati":
      return <path d="M8 16c3-6 6-6 8 0 2-6 5-6 8 0-3 6-6 6-8 0-2 6-5 6-8 0Z" />;
    default:
      return <circle cx="16" cy="16" r="7" />;
  }
}
