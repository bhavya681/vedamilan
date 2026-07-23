import {
  MatchGridSkeleton,
  PageHeaderSkeleton,
  SkeletonScope,
  StatStripSkeleton,
} from "@/components/ui/page-skeletons";

export default function DashboardLoading() {
  return (
    <SkeletonScope label="Loading workspace" className="space-y-6">
      <PageHeaderSkeleton />
      <StatStripSkeleton count={4} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <MatchGridSkeleton count={2} />
        </div>
        <div className="border-border/60 bg-card space-y-3 rounded-2xl border p-5">
          <div className="skeleton-shimmer h-5 w-40 rounded-full" />
          <div className="skeleton-shimmer h-3 w-full rounded-full" />
          <div className="skeleton-shimmer h-3 w-5/6 rounded-full" />
          <div className="skeleton-shimmer h-3 w-2/3 rounded-full" />
        </div>
      </div>
    </SkeletonScope>
  );
}
