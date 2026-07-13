import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 sm:pt-28 lg:px-8"
      role="status"
      aria-label="Loading"
    >
      <Skeleton className="h-10 w-40" />
      <Skeleton className="mt-4 h-12 w-full max-w-xl" />
      <Skeleton className="mt-3 h-16 w-full max-w-2xl" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-44 rounded-3xl" />
        <Skeleton className="h-44 rounded-3xl" />
        <Skeleton className="h-44 rounded-3xl" />
      </div>
    </div>
  );
}
