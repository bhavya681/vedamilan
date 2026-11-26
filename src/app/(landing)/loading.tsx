import {
  PageHeaderSkeleton,
  MatchGridSkeleton,
  SkeletonScope,
} from "@/components/ui/page-skeletons";

export default function Loading() {
  return (
    <SkeletonScope label="Loading" className="landing-container space-y-8 pt-24 pb-16 sm:pt-28">
      <PageHeaderSkeleton withActions={false} />
      <MatchGridSkeleton count={3} />
    </SkeletonScope>
  );
}
