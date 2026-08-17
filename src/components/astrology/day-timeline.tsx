import { cn } from "@/lib/utils/cn";

export type TimelineBand = {
  id: string;
  label: string;
  start: string;
  end: string;
  startTs: number;
  endTs: number;
  tone: "good" | "warn" | "bad" | "neutral";
};

const TONE: Record<TimelineBand["tone"], string> = {
  good: "bg-emerald-500/80",
  warn: "bg-amber-500/80",
  bad: "bg-rose-500/80",
  neutral: "bg-sky-500/70",
};

const LEGEND: Record<TimelineBand["tone"], string> = {
  good: "bg-emerald-500",
  warn: "bg-amber-500",
  bad: "bg-rose-500",
  neutral: "bg-sky-500",
};

export function formatDayLength(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const min = minutes % 60;
  return `${h}h ${String(min).padStart(2, "0")}m`;
}

export function DayTimeline({
  sunriseTs,
  sunsetTs,
  sunriseLabel,
  sunsetLabel,
  bands,
}: {
  sunriseTs: number;
  sunsetTs: number;
  sunriseLabel: string;
  sunsetLabel: string;
  bands: TimelineBand[];
}) {
  const span = Math.max(1, sunsetTs - sunriseTs);

  return (
    <div className="space-y-3">
      <div className="bg-muted relative h-11 w-full overflow-hidden rounded-full">
        {bands.map((band) => {
          const left = ((band.startTs - sunriseTs) / span) * 100;
          const width = ((band.endTs - band.startTs) / span) * 100;
          return (
            <div
              key={band.id}
              title={`${band.label}: ${band.start} – ${band.end}`}
              className={cn("absolute top-1 bottom-1 rounded-full", TONE[band.tone])}
              style={{
                left: `${Math.max(0, Math.min(100, left))}%`,
                width: `${Math.max(1.2, Math.min(100, width))}%`,
              }}
            />
          );
        })}
      </div>
      <div className="text-muted-foreground flex justify-between text-[11px]">
        <span>Sunrise {sunriseLabel}</span>
        <span>Sunset {sunsetLabel}</span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {bands.map((band) => (
          <div key={`${band.id}-legend`} className="flex items-center gap-1.5 text-[11px]">
            <span className={cn("h-2 w-2 rounded-full", LEGEND[band.tone])} />
            <span className="text-muted-foreground">
              {band.label} · {band.start}–{band.end}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
