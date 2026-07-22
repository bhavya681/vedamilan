import { cn } from "@/lib/utils/cn";

export function GlassPanel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-border/70 bg-card shadow-soft rounded-2xl border", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {eyebrow ? (
        <p className="text-saffron text-xs font-semibold tracking-[0.18em] uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-foreground text-2xl sm:text-3xl">{title}</h2>
      {description ? (
        <p className="text-muted-foreground max-w-2xl text-sm">{description}</p>
      ) : null}
    </div>
  );
}

export function Timeline({
  items,
}: {
  items: Array<{ title: string; subtitle?: string; meta?: string; active?: boolean }>;
}) {
  return (
    <ol className="border-border/70 relative space-y-4 border-l pl-5">
      {items.map((item) => (
        <li key={`${item.title}-${item.meta}`} className="relative">
          <span
            className={cn(
              "border-background absolute -left-[1.55rem] mt-1.5 h-3 w-3 rounded-full border-2",
              item.active ? "bg-primary shadow-gold" : "bg-muted-foreground/40",
            )}
            aria-hidden="true"
          />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium">{item.title}</p>
            {item.meta ? <p className="text-muted-foreground text-xs">{item.meta}</p> : null}
          </div>
          {item.subtitle ? (
            <p className="text-muted-foreground mt-1 text-sm">{item.subtitle}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function ProgressRing({
  value,
  label,
  size = 88,
}: {
  value: number;
  label?: string;
  size?: number;
}) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progress-gold)"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="progress-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C47A1A" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-semibold">{value}%</span>
        {label ? <span className="text-muted-foreground text-[10px]">{label}</span> : null}
      </div>
    </div>
  );
}
