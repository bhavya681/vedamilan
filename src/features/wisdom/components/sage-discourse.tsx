"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { GuruMarkdown } from "@/features/ai/components/guru-markdown";
import { WisdomPortrait } from "@/features/wisdom/components/wisdom-portrait";
import type { WisdomGuide } from "@/domain/wisdom/guides";
import { cn } from "@/lib/utils/cn";

/** Soft geometric yantra — decorative only, not a ritual diagram. */
export function SageYantraMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("text-gold/25 pointer-events-none", className)}
      aria-hidden
    >
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx="60" cy="60" r="22" fill="none" stroke="currentColor" strokeWidth="0.5" />
      <path
        d="M60 18 L94 78 H26 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.55"
        strokeLinejoin="round"
      />
      <path
        d="M60 102 L26 42 H94 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.55"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="60" r="3.5" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

export function SageOrnamentLine({ className }: { className?: string }) {
  return (
    <div className={cn("text-gold/50 flex items-center gap-3", className)} aria-hidden>
      <span className="via-gold/35 h-px flex-1 bg-gradient-to-r from-transparent to-transparent" />
      <span className="font-display text-[11px] tracking-[0.35em]">॥</span>
      <span className="via-gold/35 h-px flex-1 bg-gradient-to-r from-transparent to-transparent" />
    </div>
  );
}

export function SageDiscourseShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("sage-discourse relative overflow-hidden", className)}>
      <div className="sage-discourse-wash pointer-events-none absolute inset-0" aria-hidden />
      <SageYantraMark className="absolute -top-6 -right-8 h-44 w-44 opacity-40 sm:h-56 sm:w-56" />
      <SageYantraMark className="absolute -bottom-10 -left-12 h-40 w-40 opacity-25" />
      <div className="relative z-10 flex h-full min-h-0 flex-col">{children}</div>
    </div>
  );
}

export function SageEmptyInvite({
  guide,
  prompts,
  onPrompt,
}: {
  guide: Pick<WisdomGuide, "id" | "displayName" | "monogram" | "accent" | "shortPhilosophy">;
  prompts: string[];
  onPrompt: (q: string) => void;
}) {
  return (
    <div className="flex flex-col items-center px-1 py-8 text-center sm:px-2 sm:py-14">
      <div className="relative mb-5 sm:mb-6">
        <div className="from-gold/20 absolute -inset-3 rounded-full bg-gradient-to-b to-transparent blur-md" />
        <WisdomPortrait
          guide={guide}
          size="xl"
          className="ring-gold/30 shadow-gold relative !h-20 !w-20 ring-2 sm:!h-28 sm:!w-28"
        />
      </div>
      <p className="text-gold/80 font-display text-[10px] tracking-[0.28em] uppercase sm:text-xs">
        Satsang · Quiet counsel
      </p>
      <h2 className="font-display text-foreground mt-3 max-w-md text-xl leading-snug sm:text-3xl">
        Namaste. Sit with {guide.displayName}.
      </h2>
      <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
        Ask with sincerity. Reflections are AI interpretations inspired by Vedic teaching — not
        prophecy or quotation.
      </p>
      <SageOrnamentLine className="mx-auto mt-5 w-full max-w-xs sm:mt-6" />
      <p className="text-foreground/70 font-display mt-4 max-w-md text-sm leading-relaxed italic sm:mt-5">
        “{guide.shortPhilosophy}”
      </p>
      <div className="mt-6 flex w-full max-w-lg flex-col gap-2 sm:mt-8 sm:gap-2.5">
        {prompts.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPrompt(q)}
            className={cn(
              "border-border/55 bg-card/55 hover:border-gold/40 hover:bg-gold/8",
              "rounded-2xl border px-4 py-3 text-left text-sm leading-snug transition-colors",
              "shadow-soft",
            )}
          >
            <span className="text-gold/70 font-display mr-2 text-xs">॥</span>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SageMessageTurn({
  role,
  guide,
  content,
  pending,
  failed,
  footer,
}: {
  role: "user" | "assistant";
  guide: Pick<WisdomGuide, "id" | "displayName" | "monogram" | "accent">;
  content: string;
  pending?: boolean;
  failed?: boolean;
  footer?: ReactNode;
}) {
  if (pending) {
    return (
      <div className="flex items-start gap-3 py-2">
        <WisdomPortrait guide={guide} size="sm" className="mt-0.5 !h-9 !w-9 shrink-0 opacity-80" />
        <div className="border-gold/20 from-card/80 to-muted/40 flex items-center gap-2.5 rounded-2xl border bg-gradient-to-br px-4 py-3 text-sm">
          <Loader2 className="text-gold h-4 w-4 animate-spin" />
          <span className="text-muted-foreground font-display italic">
            Listening… gathering a calm reflection
          </span>
        </div>
      </div>
    );
  }

  if (role === "user") {
    return (
      <div className="flex justify-end py-2">
        <div className="max-w-[min(100%,28rem)]">
          <p className="text-muted-foreground mb-1.5 text-right text-[10px] font-medium tracking-[0.16em] uppercase">
            Seeker
          </p>
          <div
            className={cn(
              "rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed",
              "bg-secondary text-secondary-foreground shadow-soft",
            )}
          >
            <GuruMarkdown content={content} tone="user" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-2">
      <WisdomPortrait
        guide={guide}
        size="sm"
        className="ring-gold/25 mt-1 !h-10 !w-10 shrink-0 ring-1"
      />
      <div className="max-w-[min(100%,38rem)] min-w-0 flex-1">
        <div className="mb-1.5 flex items-baseline gap-2">
          <p className="font-display text-foreground text-sm font-semibold tracking-tight">
            {guide.displayName}
          </p>
          <p className="text-muted-foreground text-[10px] tracking-[0.14em] uppercase">
            Wisdom · AI
          </p>
        </div>
        <div
          className={cn(
            "sage-manuscript relative overflow-hidden rounded-2xl rounded-tl-md border px-4 py-3.5 sm:px-5 sm:py-4",
            "border-gold/20 from-card/95 via-card/80 to-muted/35 shadow-soft bg-gradient-to-br",
            failed && "border-destructive/30",
          )}
        >
          <span
            className="from-gold via-gold/70 to-gold/20 absolute top-3 bottom-3 left-0 w-0.5 rounded-full bg-gradient-to-b"
            aria-hidden
          />
          <div className="pl-2.5 sm:pl-3">
            <GuruMarkdown content={content} tone="assistant" className="sage-md" />
            {footer ? <div className="mt-3.5 flex flex-wrap gap-2">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
