import { cn } from "@/lib/utils/cn";

/** Classical astronomical glyphs for chart “Symbols” view */
export const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mars: "♂",
  Mercury: "☿",
  Jupiter: "♃",
  Venus: "♀",
  Saturn: "♄",
  Rahu: "☊",
  Ketu: "☋",
};

export type ChartPlanetView = "labels" | "symbols";

export function planetSymbol(planet: string) {
  return PLANET_GLYPH[planet] || planet.slice(0, 1);
}

/** Compact SVG mark centered at (cx, cy) — scales cleanly inside kundli viewBox */
export function PlanetSymbolSvg({
  planet,
  cx,
  cy,
  size = 2.35,
  className,
}: {
  planet: string;
  cx: number;
  cy: number;
  size?: number;
  className?: string;
}) {
  const s = size;
  const stroke = "currentColor";
  const common = {
    fill: "none" as const,
    stroke,
    strokeWidth: s * 0.18,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (planet) {
    case "Sun":
      return (
        <g className={className} transform={`translate(${cx} ${cy})`} aria-hidden>
          <circle r={s * 0.42} fill="currentColor" stroke="none" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = Math.cos(rad) * s * 0.58;
            const y1 = Math.sin(rad) * s * 0.58;
            const x2 = Math.cos(rad) * s * 0.95;
            const y2 = Math.sin(rad) * s * 0.95;
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} {...common} />;
          })}
        </g>
      );
    case "Moon":
      return (
        <g className={className} transform={`translate(${cx} ${cy})`} aria-hidden>
          <path
            d={`M ${s * 0.15} ${-s * 0.85}
               A ${s * 0.9} ${s * 0.9} 0 1 0 ${s * 0.15} ${s * 0.85}
               A ${s * 0.62} ${s * 0.62} 0 1 1 ${s * 0.15} ${-s * 0.85}
               Z`}
            fill="currentColor"
            stroke="none"
          />
        </g>
      );
    case "Mars":
      return (
        <g className={className} transform={`translate(${cx} ${cy})`} aria-hidden>
          <circle r={s * 0.55} {...common} />
          <line x1={s * 0.35} y1={-s * 0.35} x2={s * 0.95} y2={-s * 0.95} {...common} />
          <polyline
            points={`${s * 0.45},${-s * 0.95} ${s * 0.95},${-s * 0.95} ${s * 0.95},${-s * 0.45}`}
            {...common}
            fill="none"
          />
        </g>
      );
    case "Mercury":
      return (
        <g className={className} transform={`translate(${cx} ${cy})`} aria-hidden>
          <circle cy={-s * 0.15} r={s * 0.42} {...common} />
          <line x1={0} y1={s * 0.28} x2={0} y2={s * 0.95} {...common} />
          <line x1={-s * 0.35} y1={s * 0.62} x2={s * 0.35} y2={s * 0.62} {...common} />
          <path
            d={`M ${-s * 0.42} ${-s * 0.55} Q 0 ${-s * 1.05} ${s * 0.42} ${-s * 0.55}`}
            {...common}
          />
        </g>
      );
    case "Jupiter":
      return (
        <g className={className} transform={`translate(${cx} ${cy})`} aria-hidden>
          <path
            d={`M ${-s * 0.55} ${-s * 0.35}
               Q ${-s * 0.55} ${-s * 0.95} 0 ${-s * 0.95}
               Q ${s * 0.55} ${-s * 0.95} ${s * 0.55} ${-s * 0.25}`}
            {...common}
          />
          <line x1={-s * 0.75} y1={0} x2={s * 0.35} y2={0} {...common} />
          <line x1={0} y1={-s * 0.15} x2={0} y2={s * 0.95} {...common} />
        </g>
      );
    case "Venus":
      return (
        <g className={className} transform={`translate(${cx} ${cy})`} aria-hidden>
          <circle cy={-s * 0.25} r={s * 0.5} {...common} />
          <line x1={0} y1={s * 0.28} x2={0} y2={s * 0.95} {...common} />
          <line x1={-s * 0.38} y1={s * 0.58} x2={s * 0.38} y2={s * 0.58} {...common} />
        </g>
      );
    case "Saturn":
      return (
        <g className={className} transform={`translate(${cx} ${cy})`} aria-hidden>
          <line x1={0} y1={-s * 0.95} x2={0} y2={s * 0.35} {...common} />
          <line x1={-s * 0.4} y1={-s * 0.45} x2={s * 0.4} y2={-s * 0.45} {...common} />
          <circle cy={s * 0.62} r={s * 0.38} {...common} />
        </g>
      );
    case "Rahu":
      return (
        <g className={className} transform={`translate(${cx} ${cy})`} aria-hidden>
          <path
            d={`M ${-s * 0.85} ${s * 0.35}
               A ${s * 0.85} ${s * 0.85} 0 0 1 ${s * 0.85} ${s * 0.35}`}
            {...common}
          />
          <circle cx={-s * 0.85} cy={s * 0.35} r={s * 0.22} fill="currentColor" stroke="none" />
          <circle cx={s * 0.85} cy={s * 0.35} r={s * 0.22} fill="currentColor" stroke="none" />
        </g>
      );
    case "Ketu":
      return (
        <g className={className} transform={`translate(${cx} ${cy})`} aria-hidden>
          <path
            d={`M ${-s * 0.85} ${-s * 0.35}
               A ${s * 0.85} ${s * 0.85} 0 0 0 ${s * 0.85} ${-s * 0.35}`}
            {...common}
          />
          <circle cx={-s * 0.85} cy={-s * 0.35} r={s * 0.22} fill="currentColor" stroke="none" />
          <circle cx={s * 0.85} cy={-s * 0.35} r={s * 0.22} fill="currentColor" stroke="none" />
          <line x1={0} y1={-s * 0.1} x2={0} y2={s * 0.85} {...common} />
        </g>
      );
    default:
      return (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          className={cn("text-[3.2px] font-bold", className)}
        >
          {planetSymbol(planet)}
        </text>
      );
  }
}

export function ChartViewToggle({
  value,
  onChange,
}: {
  value: ChartPlanetView;
  onChange: (v: ChartPlanetView) => void;
}) {
  return (
    <div
      className="border-border/70 bg-muted/30 mb-2 inline-flex rounded-lg border p-0.5"
      role="group"
      aria-label="Chart planet view"
    >
      {(
        [
          ["labels", "Labels"],
          ["symbols", "Symbols"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors sm:text-xs",
            value === id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function SymbolsKey({ className }: { className?: string }) {
  const items = Object.entries(PLANET_GLYPH);
  return (
    <div
      className={cn(
        "text-muted-foreground mt-2 flex max-w-md flex-wrap justify-center gap-x-2.5 gap-y-1 text-[10px] sm:text-[11px]",
        className,
      )}
    >
      {items.map(([name, glyph]) => (
        <span key={name} className="inline-flex items-center gap-1">
          <span className="text-foreground text-sm leading-none">{glyph}</span>
          <span>{name}</span>
        </span>
      ))}
    </div>
  );
}
