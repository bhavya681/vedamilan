import {
  PageHeaderSkeleton,
  MatchGridSkeleton,
  SkeletonScope,
} from "@/components/ui/page-skeletons";

export default function Loading() {
  return (
    <SkeletonScope
      label="Loading"
      className="mx-auto max-w-7xl space-y-8 px-4 pt-24 pb-16 sm:px-6 sm:pt-28 lg:px-8"
    >
      <PageHeaderSkeleton withActions={false} />
      <MatchGridSkeleton count={3} />
    </SkeletonScope>
  );
}
