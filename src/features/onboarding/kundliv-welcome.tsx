"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Heart, Stars, type LucideIcon } from "lucide-react";

import { LocaleLink, useAppPathname } from "@/components/i18n/locale-navigation";
import { useWorkspaceMode } from "@/components/providers/workspace-mode-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  hasSeenKundlivWelcome,
  markKundlivWelcomeSeen,
  shouldShowKundlivWelcome,
} from "@/features/onboarding/welcome-state";
import { useSession } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";
import { fetchJsonWhenAuthed, isAbortError } from "@/lib/http/session-fetch";
import { cn } from "@/lib/utils/cn";
import { WORKSPACE_MODE_META, type WorkspaceMode } from "@/lib/workspace/mode";

const MODES: WorkspaceMode[] = ["astrology", "matrimony", "wisdom"];

const MODE_ICON: Record<WorkspaceMode, LucideIcon> = {
  astrology: Stars,
  matrimony: Heart,
  wisdom: BookOpen,
};

const MODE_DESCRIPTION: Record<WorkspaceMode, string> = {
  astrology: "Kundli, dashas, and AI Guru guidance",
  matrimony: "Matches, compatibility, and conscious discovery",
  wisdom: "Ask the Sages and Wisdom Journal",
};

type ProfileResponse = {
  success?: boolean;
  data?: {
    profile?: { onboardingCompletedAt?: Date | string | null };
    birthDetails?: { birthDate?: Date | string | null } | null;
  };
};

export function KundlivWelcome() {
  const pathname = useAppPathname();
  const { data: session, isPending } = useSession();
  const { mode: workspaceMode, setMode } = useWorkspaceMode();
  const user = session?.user as unknown as
    | { id?: string; createdAt?: Date | string | null }
    | undefined;
  const userId = user?.id;
  const createdAt = user?.createdAt;
  const [open, setOpen] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [hasBirthDetails, setHasBirthDetails] = useState(false);
  const openedFor = useRef<string | null>(null);

  useEffect(() => {
    if (isPending || pathname === routes.onboarding || !userId || !createdAt) {
      setOpen(false);
      return;
    }
    if (
      !shouldShowKundlivWelcome({ id: userId, createdAt }) ||
      hasSeenKundlivWelcome(userId)
    ) {
      setOpen(false);
      return;
    }
    if (openedFor.current === userId) return;
    openedFor.current = userId;
    setProfileReady(false);
    setHasBirthDetails(false);
    setOpen(true);
  }, [isPending, pathname, userId, createdAt]);

  useEffect(() => {
    if (!open || !userId) return;
    const ac = new AbortController();
    let cancelled = false;

    void (async () => {
      try {
        const res = (await fetchJsonWhenAuthed("/api/profile", ac.signal)) as ProfileResponse;
        if (cancelled) return;
        if (res.success && res.data?.profile?.onboardingCompletedAt) {
          markKundlivWelcomeSeen(userId);
          setOpen(false);
          return;
        }
        setHasBirthDetails(Boolean(res.success && res.data?.birthDetails?.birthDate));
        setProfileReady(true);
      } catch (error) {
        if (cancelled || isAbortError(error)) return;
        setHasBirthDetails(false);
        setProfileReady(true);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [open, userId]);

  function handleOpenChange(next: boolean) {
    if (!next && userId) markKundlivWelcomeSeen(userId);
    setOpen(next);
  }

  function chooseMode(mode: WorkspaceMode) {
    if (!userId) return;
    markKundlivWelcomeSeen(userId);
    setOpen(false);
    setMode(mode, { navigate: true });
  }

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-gold text-[11px] font-semibold tracking-[0.22em] uppercase">
            Welcome to KUNDLIV
          </DialogTitle>
          <DialogDescription className="font-display text-foreground text-xl leading-snug tracking-tight sm:text-2xl">
            Your Vedic Universe. One Intelligent Experience.
          </DialogDescription>
        </DialogHeader>

        {profileReady ? (
          <>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Three spaces, one connected journey. Pick where to begin — you can move between them
              anytime.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {MODES.map((mode) => {
                const active = mode === workspaceMode;
                const Icon = MODE_ICON[mode];
                return (
                  <button
                    key={mode}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => chooseMode(mode)}
                    className={cn(
                      "border-border/60 from-card/90 to-muted/35 flex min-h-[7.5rem] flex-col items-start gap-2 rounded-2xl border bg-gradient-to-br p-3 text-left transition-colors",
                      active
                        ? "border-gold/45 bg-gold/5 ring-gold/45 ring-2"
                        : "hover:border-gold/35 hover:bg-muted/45",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-xl border",
                        active
                          ? "border-gold/35 bg-gold/15 text-gold"
                          : "border-border/50 text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="font-display text-sm font-semibold">
                      {WORKSPACE_MODE_META[mode].label}
                    </span>
                    <span className="text-muted-foreground text-[11px] leading-snug">
                      {MODE_DESCRIPTION[mode]}
                    </span>
                    <span
                      className={cn(
                        "mt-auto text-[10px] font-semibold tracking-[0.12em] uppercase",
                        active ? "text-gold" : "text-muted-foreground/70",
                      )}
                    >
                      {active ? "Current mode" : "Open mode"}
                    </span>
                  </button>
                );
              })}
            </div>

            {hasBirthDetails ? (
              <div className="border-border/60 bg-muted/35 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                <CheckCircle2 className="text-gold h-4 w-4 shrink-0" aria-hidden />
                <span>Birth details ready — no need to add them again.</span>
              </div>
            ) : (
              <div className="border-border/60 bg-muted/35 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Birth details are not saved yet. You can browse every mode and ask AI guidance
                  now; add them when you want a personal Kundli.
                </p>
                <Button asChild size="sm" variant="outline" className="w-full shrink-0 sm:w-auto">
                  <LocaleLink href={routes.birthDetails}>
                    Add birth details
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </LocaleLink>
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Checking your setup…</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
