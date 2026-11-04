import { cn } from "@/lib/utils/cn";

import { planetSymbol } from "./planet-symbols";

export function DashaPeriodBadges({
  maha,
  antar,
  className,
}: {
  maha?: string | null;
  antar?: string | null;
  className?: string;
}) {
  if (!maha && !antar) return null;

  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-1.5", className)}>
      {maha ? (
        <span className="border-gold/30 bg-gold/8 inline-flex min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]">
          <span className="text-gold text-sm leading-none" aria-hidden>
            {planetSymbol(maha)}
          </span>
          <span className="text-muted-foreground">Mahadasha</span>
          <span className="text-foreground truncate font-semibold">{maha}</span>
        </span>
      ) : null}
      {antar ? (
        <span className="border-primary/30 bg-primary/8 inline-flex min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]">
          <span className="text-primary text-sm leading-none" aria-hidden>
            {planetSymbol(antar)}
          </span>
          <span className="text-muted-foreground">Antardasha</span>
          <span className="text-foreground truncate font-semibold">{antar}</span>
        </span>
      ) : null}
    </div>
  );
}
