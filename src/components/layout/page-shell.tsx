"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-secondary text-[11px] font-semibold tracking-[0.22em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display mt-2 text-3xl tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          {actions}
        </div>
      ) : null}
    </motion.div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="glass-panel flex flex-col items-center rounded-[2rem] px-6 py-20 text-center">
      <div className="lotus-divider mb-6 w-full max-w-[120px]" />
      {icon ? <div className="text-primary mb-4">{icon}</div> : null}
      <h2 className="font-display text-2xl sm:text-3xl">{title}</h2>
      <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">{description}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again in a moment.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-destructive/25 bg-destructive/5 rounded-[2rem] border px-6 py-14 text-center">
      <h2 className="font-display text-destructive text-2xl">{title}</h2>
      <p className="text-muted-foreground mt-3 text-sm">{description}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}

export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div className="bg-aurora absolute -top-24 -left-24 h-80 w-80 animate-[aurora-shift_14s_ease-in-out_infinite] rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-20 h-72 w-72 animate-[aurora-shift_18s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(200,162,74,0.22),transparent_70%)] blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 animate-[aurora-shift_16s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.18),transparent_70%)] blur-3xl" />
    </div>
  );
}

export function SectionShell({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24", className)}
    >
      {children}
    </section>
  );
}
