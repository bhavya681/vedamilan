import { cn } from "@/lib/utils/cn";
import { Skeleton } from "@/components/ui/skeleton";

/** Accessible wrapper for any page-level loading UI */
export function SkeletonScope({
  label = "Loading",
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
      className={cn("space-y-6", className)}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function PageHeaderSkeleton({
  withActions = true,
  className,
}: {
  withActions?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="w-full max-w-2xl space-y-3">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-10 w-56 max-w-full rounded-2xl sm:h-11 sm:w-72" />
        <Skeleton className="h-4 w-full max-w-md rounded-full" />
      </div>
      {withActions ? (
        <div className="flex w-full gap-2 sm:w-auto">
          <Skeleton className="h-10 w-full rounded-xl sm:w-32" />
          <Skeleton className="hidden h-10 w-32 rounded-xl sm:block" />
        </div>
      ) : null}
    </div>
  );
}

export function StatStripSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-border/60 bg-card space-y-3 rounded-2xl border p-5">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-3 w-28 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function MatchCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("border-border/40 bg-card overflow-hidden rounded-2xl border", className)}>
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
    </div>
  );
}

export function MatchGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <MatchCardSkeleton key={i} className={i >= 2 ? "max-sm:hidden" : undefined} />
      ))}
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="border-border/60 bg-card flex items-center gap-3 rounded-2xl border p-4">
      <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-40 max-w-full rounded-full" />
        <Skeleton className="h-3 w-56 max-w-full rounded-full" />
      </div>
      <Skeleton className="hidden h-9 w-24 rounded-xl sm:block" />
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="border-border/60 bg-card space-y-5 rounded-2xl border p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-36 rounded-xl" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="border-border/60 bg-card space-y-4 rounded-2xl border p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-40 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
      <Skeleton className="mx-auto aspect-square w-full max-w-md rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    </div>
  );
}

export function PanelSkeleton({ lines = 4, className }: { lines?: number; className?: string }) {
  return (
    <div
      className={cn("border-border/60 bg-card space-y-3 rounded-2xl border p-5 sm:p-6", className)}
    >
      <Skeleton className="h-5 w-48 max-w-full rounded-full" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3 rounded-full", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="border-border/60 grid min-h-[60vh] overflow-hidden rounded-2xl border lg:grid-cols-[280px_1fr]">
      <div className="border-border/60 space-y-3 border-b p-4 lg:border-r lg:border-b-0">
        <Skeleton className="h-9 w-full rounded-xl" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-28 rounded-full" />
              <Skeleton className="h-3 w-40 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3 border-b pb-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-36 rounded-full" />
        </div>
        <div className="flex flex-1 flex-col justify-end gap-3">
          <Skeleton className="ml-auto h-12 w-[70%] rounded-2xl" />
          <Skeleton className="h-12 w-[55%] rounded-2xl" />
          <Skeleton className="ml-auto h-10 w-[40%] rounded-2xl" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function DashboardHomeSkeleton() {
  return (
    <SkeletonScope label="Preparing your home">
      <PageHeaderSkeleton />
      <StatStripSkeleton />
      <div className="space-y-4">
        <Skeleton className="h-6 w-48 rounded-full" />
        <MatchGridSkeleton count={3} />
      </div>
      <PanelSkeleton lines={3} />
    </SkeletonScope>
  );
}

export function ConnectionsSkeleton() {
  return (
    <SkeletonScope label="Loading connections">
      <PageHeaderSkeleton />
      <Skeleton className="h-11 w-full rounded-xl" />
      <ListSkeleton rows={4} />
    </SkeletonScope>
  );
}

export function MatchesPageSkeleton() {
  return (
    <SkeletonScope label="Finding meaningful connections">
      <PageHeaderSkeleton />
      <MatchGridSkeleton count={6} />
    </SkeletonScope>
  );
}

export function ProfileDetailSkeleton() {
  return (
    <SkeletonScope label="Loading profile">
      <PageHeaderSkeleton />
      <div className="border-border/60 overflow-hidden rounded-2xl border">
        <Skeleton className="aspect-[16/10] w-full rounded-none sm:aspect-[21/9]" />
        <div className="space-y-4 p-5 sm:p-8">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-3 w-5/6 rounded-full" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
      </div>
    </SkeletonScope>
  );
}

export function CompatibilitySkeleton() {
  return (
    <SkeletonScope label="Preparing compatibility">
      <PageHeaderSkeleton />
      <div className="grid gap-4 lg:grid-cols-2">
        <PanelSkeleton lines={5} />
        <PanelSkeleton lines={5} />
      </div>
      <StatStripSkeleton count={4} />
      <PanelSkeleton lines={6} />
    </SkeletonScope>
  );
}

/** Soft reveal when content replaces a skeleton — keeps transitions calm */
export function ContentReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("content-reveal", className)}>{children}</div>;
}
