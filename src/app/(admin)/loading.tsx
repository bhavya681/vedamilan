import {
  ListSkeleton,
  PageHeaderSkeleton,
  PanelSkeleton,
  SkeletonScope,
} from "@/components/ui/page-skeletons";

export default function AdminLoading() {
  return (
    <SkeletonScope label="Loading admin" className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-4 lg:grid-cols-2">
        <PanelSkeleton lines={6} />
        <PanelSkeleton lines={6} />
      </div>
      <ListSkeleton rows={5} />
    </SkeletonScope>
  );
}