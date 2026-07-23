import { cn } from "@/lib/utils/cn";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("skeleton-shimmer rounded-xl", className)} aria-hidden="true" {...props} />
  );
}

export { Skeleton };
