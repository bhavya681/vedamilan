import { SkeletonCard } from "@/components/ui/premium-cards";

export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading workspace">
      <div className="space-y-3">
        <div className="skeleton-shimmer h-3 w-24 rounded-full" />
        <div className="skeleton-shimmer h-10 w-64 max-w-full rounded-2xl" />
        <div className="skeleton-shimmer h-4 w-96 max-w-full rounded-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SkeletonCard className="h-64 lg:col-span-2" />
        <SkeletonCard className="h-64" />
      </div>
    </div>
  );
}
