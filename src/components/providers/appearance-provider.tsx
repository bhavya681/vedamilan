"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";

import {
  applyAppearanceDom,
  normalizeAppearance,
  readLocalAppearance,
  writeLocalAppearance,
} from "@/lib/appearance/dom";
import { DEFAULT_APPEARANCE, type AppearancePreferences } from "@/lib/appearance/types";
import { useSession } from "@/lib/auth/client";

type AppearanceContextValue = {
  preferences: AppearancePreferences;
  hydrated: boolean;
  setPreferences: (patch: Partial<AppearancePreferences>) => void;
  resetAppearance: () => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const { setTheme } = useTheme();
  const { data: session, isPending } = useSession();
  const [preferences, setPrefsState] = useState<AppearancePreferences>(DEFAULT_APPEARANCE);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncedUser = useRef<string | null>(null);

  useEffect(() => {
    const local = readLocalAppearance();
    setPrefsState(local);
    applyAppearanceDom(local);
    setTheme(local.mode);
    setHydrated(true);
  }, [setTheme]);

  useEffect(() => {
    if (!hydrated || isPending) return;
    const userId = session?.user?.id;
    if (!userId) {
      syncedUser.current = null;
      return;
    }
    if (syncedUser.current === userId) return;
    syncedUser.current = userId;

    void fetch("/api/appearance")
      .then((r) => r.json())
      .then((json) => {
        if (!json.success || !json.data) return;
        const next = normalizeAppearance(json.data as Partial<AppearancePreferences>);
        setPrefsState(next);
        writeLocalAppearance(next);
        applyAppearanceDom(next);
        setTheme(next.mode);
      })
      .catch(() => undefined);
  }, [hydrated, isPending, session?.user?.id, setTheme]);

  const persistRemote = useCallback(
    (next: AppearancePreferences) => {
      if (!session?.user?.id) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void fetch("/api/appearance", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        }).catch(() => undefined);
      }, 400);
    },
    [session?.user?.id],
  );

  const setPreferences = useCallback(
    (patch: Partial<AppearancePreferences>) => {
      setPrefsState((prev) => {
        const next = normalizeAppearance({ ...prev, ...patch });
        writeLocalAppearance(next);
        applyAppearanceDom(next);
        if (patch.mode !== undefined) setTheme(next.mode);
        persistRemote(next);
        return next;
      });
    },
    [persistRemote, setTheme],
  );

  const resetAppearance = useCallback(() => {
    setPreferences(DEFAULT_APPEARANCE);
  }, [setPreferences]);

  const value = useMemo(
    () => ({ preferences, hydrated, setPreferences, resetAppearance }),
    [preferences, hydrated, setPreferences, resetAppearance],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    throw new Error("useAppearance must be used within AppearanceProvider");
  }
  return ctx;
}
