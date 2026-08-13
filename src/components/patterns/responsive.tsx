import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type ResponsiveSectionProps = {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "main" | "aside";
};

export function ResponsiveSection({ children, className, as = "section" }: ResponsiveSectionProps) {
  const Comp = as;
  return (
    <Comp className={cn("min-w-0 space-y-5 sm:space-y-6 lg:space-y-8", className)}>{children}</Comp>
  );
}

type ResponsiveGridProps = {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: "sm" | "md" | "lg";
};

const GRID_CLASSES: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-6",
};

const GAP_CLASSES: Record<string, string> = {
  sm: "gap-3 sm:gap-4",
  md: "gap-4 sm:gap-5 lg:gap-6",
  lg: "gap-5 sm:gap-6 lg:gap-8",
};

export function ResponsiveGrid({ children, className, cols = 3, gap = "md" }: ResponsiveGridProps) {
  const gridClasses = GRID_CLASSES[cols] || GRID_CLASSES[3];
  const gapClasses = GAP_CLASSES[gap] || GAP_CLASSES["md"];
  return <div className={cn("grid min-w-0", gridClasses, gapClasses, className)}>{children}</div>;
}

type ResponsiveActionsProps = {
  children: ReactNode;
  className?: string;
  align?: "start" | "end" | "center" | "between";
};

const ALIGN_CLASSES: Record<string, string> = {
  start: "justify-start",
  end: "justify-end",
  center: "justify-center",
  between: "justify-between",
};

export function ResponsiveActions({ children, className, align = "end" }: ResponsiveActionsProps) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap",
        ALIGN_CLASSES[align],
        className,
      )}
    >
      {children}
    </div>
  );
}

type ResponsiveCardProps = {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
};

const PADDING_CLASSES: Record<string, string> = {
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5 lg:p-6",
  lg: "p-5 sm:p-6 lg:p-8",
};

export function ResponsiveCard({ children, className, padding = "md" }: ResponsiveCardProps) {
  return (
    <div
      className={cn("bg-card/40 min-w-0 rounded-2xl border", PADDING_CLASSES[padding], className)}
    >
      {children}
    </div>
  );
}
