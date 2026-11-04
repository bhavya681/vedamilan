import { FormSkeleton, PageHeaderSkeleton, SkeletonScope } from "@/components/ui/page-skeletons";

export default function AuthLoading() {
  return (
    <SkeletonScope label="Loading" className="mx-auto max-w-md space-y-6 px-4 py-16">
      <PageHeaderSkeleton withActions={false} />
      <FormSkeleton fields={4} />
    </SkeletonScope>
  );
}