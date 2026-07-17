import { cn } from "@/lib/utils/cn";

const SIGN_NAMES = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

const SIGN_ABBR = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"] as const;

const PLANET_ABBR: Record<string, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
  Ascendant: "Asc",
  Lagna: "Asc",
};

const CLASSICAL = new Set([
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
]);

export type NorthChartData = {
  style?: string;
  lagnaSignId: number;
  houses: Record<string, string[]>;
};

export type SouthChartData = {
  style?: string;
  lagnaSignId: number;
  signs: Array<{ sign: string; signId: number; planets: string[] }>;
};

function abbr(name: string) {
  return PLANET_ABBR[name] ?? name.slice(0, 2);
}

function classicalOnly(names: string[]) {
  return names.filter((n) => CLASSICAL.has(n));
}

function signForHouse(lagnaSignId: number, house: number) {
  return (lagnaSignId + house - 1) % 12;
}

/** North Indian diamond — house 1 (lagna) always at top. */
const NORTH_POS: Record<number, { x: number; y: number }> = {
  1: { x: 50, y: 18 },
  2: { x: 78, y: 22 },
  3: { x: 82, y: 50 },
  4: { x: 78, y: 78 },
  5: { x: 50, y: 82 },
  6: { x: 22, y: 78 },
  7: { x: 18, y: 50 },
  8: { x: 22, y: 22 },
  9: { x: 35, y: 50 },
  10: { x: 50, y: 42 },
  11: { x: 65, y: 50 },
  12: { x: 50, y: 58 },
};

/** South Indian fixed-sign grid (signId or null for empty center). */
const SOUTH_GRID: Array<number | null> = [
  11,
  0,
  1,
  2, // Pisces Aries Taurus Gemini
  10,
  null,
  null,
  3, // Aquarius — — Cancer
  9,
  null,
  null,
  4, // Capricorn — — Leo
  8,
  7,
  6,
  5, // Sagittarius Scorpio Libra Virgo
];

/** East Indian diamond — fixed signs, lagna highlighted. */
const EAST_SIGN_POS: Record<number, { x: number; y: number }> = {
  0: { x: 50, y: 18 }, // Aries top
  1: { x: 78, y: 22 }, // Taurus
  2: { x: 82, y: 50 }, // Gemini
  3: { x: 78, y: 78 }, // Cancer
  4: { x: 50, y: 82 }, // Leo
  5: { x: 22, y: 78 }, // Virgo
  6: { x: 18, y: 50 }, // Libra
  7: { x: 22, y: 22 }, // Scorpio
  8: { x: 35, y: 50 }, // Sagittarius
  9: { x: 50, y: 42 }, // Capricorn
  10: { x: 65, y: 50 }, // Aquarius
  11: { x: 50, y: 58 }, // Pisces
};

function DiamondFrame({ className }: { className?: string }) {
  return (
    <g className={className}>
      <rect
        x="5"
        y="5"
        width="90"
        height="90"
        fill="var(--background)"
        stroke="currentColor"
        strokeWidth="1.4"
        className="text-gold"
      />
      <line
        x1="5"
        y1="5"
        x2="95"
        y2="95"
        stroke="currentColor"
        strokeWidth="0.9"
        className="text-gold/80"
      />
      <line
        x1="95"
        y1="5"
        x2="5"
        y2="95"
        stroke="currentColor"
        strokeWidth="0.9"
        className="text-gold/80"
      />
      <line
        x1="50"
        y1="5"
        x2="5"
        y2="50"
        stroke="currentColor"
        strokeWidth="0.9"
        className="text-gold/70"
      />
      <line
        x1="50"
        y1="5"
        x2="95"
        y2="50"
        stroke="currentColor"
        strokeWidth="0.9"
        className="text-gold/70"
      />
      <line
        x1="5"
        y1="50"
        x2="50"
        y2="95"
        stroke="currentColor"
        strokeWidth="0.9"
        className="text-gold/70"
      />
      <line
        x1="95"
        y1="50"
        x2="50"
        y2="95"
        stroke="currentColor"
        strokeWidth="0.9"
        className="text-gold/70"
      />
    </g>
  );
}

export function NorthIndianKundli({
  chart,
  className,
}: {
  chart: NorthChartData;
  className?: string;
}) {
  const lagna = ((chart.lagnaSignId % 12) + 12) % 12;

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-72 w-72 sm:h-[22rem] sm:w-[22rem]", className)}
      role="img"
      aria-label="North Indian kundli chart"
    >
      <DiamondFrame />
      {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
        const pos = NORTH_POS[house]!;
        const planets = classicalOnly(chart.houses[String(house)] ?? []);
        const signId = signForHouse(lagna, house);
        const lines =
          house === 1
            ? ["Asc", ...planets.map(abbr)]
            : planets.length
              ? planets.map(abbr)
              : [String(house)];

        return (
          <g key={house}>
            <text
              x={pos.x}
              y={pos.y - (lines.length > 1 ? 3.5 : 0)}
              textAnchor="middle"
              className="fill-muted-foreground text-[2.4px]"
            >
              {SIGN_ABBR[signId]}
            </text>
            {lines.map((line, index) => (
              <text
                key={`${house}-${line}-${index}`}
                x={pos.x}
                y={pos.y + index * 4}
                textAnchor="middle"
                className={cn(
                  "text-[3.2px] font-semibold",
                  house === 1 || line === "Asc" ? "fill-primary" : "fill-foreground",
                )}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function SouthIndianKundli({
  chart,
  className,
}: {
  chart: SouthChartData;
  className?: string;
}) {
  const lagna = ((chart.lagnaSignId % 12) + 12) % 12;
  const bySign = new Map(chart.signs.map((s) => [s.signId, s]));

  return (
    <div
      className={cn(
        "border-gold bg-gold/25 grid h-72 w-72 grid-cols-4 grid-rows-4 gap-px overflow-hidden rounded-xl border-2 sm:h-[22rem] sm:w-[22rem]",
        className,
      )}
      role="img"
      aria-label="South Indian kundli chart"
    >
      {SOUTH_GRID.map((signId, index) => {
        if (signId === null) {
          return <div key={index} className="bg-muted/40" />;
        }
        const cell = bySign.get(signId);
        const planets = classicalOnly(cell?.planets ?? []);
        const isLagna = signId === lagna;
        return (
          <div
            key={index}
            className={cn(
              "bg-background flex flex-col items-center justify-center gap-0.5 p-1 text-center",
              isLagna && "bg-primary/10 ring-primary/40 ring-1 ring-inset",
            )}
          >
            <span className="text-muted-foreground text-[9px] font-medium tracking-wide uppercase sm:text-[10px]">
              {SIGN_ABBR[signId]}
              {isLagna ? " · Asc" : ""}
            </span>
            <span className="text-foreground text-[10px] leading-tight font-semibold sm:text-xs">
              {planets.map(abbr).join(" ") || "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function EastIndianKundli({
  chart,
  className,
}: {
  chart: SouthChartData;
  className?: string;
}) {
  const lagna = ((chart.lagnaSignId % 12) + 12) % 12;
  const bySign = new Map(chart.signs.map((s) => [s.signId, s]));

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-72 w-72 sm:h-[22rem] sm:w-[22rem]", className)}
      role="img"
      aria-label="East Indian kundli chart"
    >
      <DiamondFrame />
      {SIGN_NAMES.map((_, signId) => {
        const pos = EAST_SIGN_POS[signId]!;
        const planets = classicalOnly(bySign.get(signId)?.planets ?? []);
        const isLagna = signId === lagna;
        const lines = isLagna ? ["Asc", ...planets.map(abbr)] : planets.map(abbr);

        return (
          <g key={signId}>
            <text
              x={pos.x}
              y={pos.y - (lines.length ? 3.5 : 0)}
              textAnchor="middle"
              className={cn("text-[2.4px]", isLagna ? "fill-primary" : "fill-muted-foreground")}
            >
              {SIGN_ABBR[signId]}
            </text>
            {(lines.length ? lines : ["·"]).map((line, index) => (
              <text
                key={`${signId}-${line}-${index}`}
                x={pos.x}
                y={pos.y + index * 4}
                textAnchor="middle"
                className={cn(
                  "text-[3.2px] font-semibold",
                  isLagna || line === "Asc" ? "fill-primary" : "fill-foreground",
                )}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function isNorthChart(value: unknown): value is NorthChartData {
  return Boolean(
    value &&
    typeof value === "object" &&
    "houses" in value &&
    typeof (value as NorthChartData).lagnaSignId === "number",
  );
}

export function isSouthChart(value: unknown): value is SouthChartData {
  return Boolean(
    value &&
    typeof value === "object" &&
    Array.isArray((value as SouthChartData).signs) &&
    typeof (value as SouthChartData).lagnaSignId === "number",
  );
}
