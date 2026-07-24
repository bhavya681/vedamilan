"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  inferModeFromPath,
  readLocalWorkspaceMode,
  writeLocalWorkspaceMode,
  type WorkspaceMode,
  WORKSPACE_MODE_META,
} from "@/lib/workspace/mode";

type WorkspaceModeContextValue = {
  mode: WorkspaceMode;
  hydrated: boolean;
  setMode: (mode: WorkspaceMode, options?: { navigate?: boolean }) => void;
  homeHref: string;
};

const WorkspaceModeContext = createContext<WorkspaceModeContextValue | null>(null);

export function WorkspaceModeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setModeState] = useState<WorkspaceMode>("matrimony");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readLocalWorkspaceMode();
    const inferred = inferModeFromPath(pathname);
    setModeState(inferred || stored);
    setHydrated(true);
    // Only on mount — path-driven soft sync below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const inferred = inferModeFromPath(pathname);
    if (inferred && inferred !== mode) {
      setModeState(inferred);
      writeLocalWorkspaceMode(inferred);
    }
  }, [pathname, hydrated, mode]);

  const setMode = useCallback(
    (next: WorkspaceMode, options?: { navigate?: boolean }) => {
      setModeState(next);
      writeLocalWorkspaceMode(next);
      if (options?.navigate !== false) {
        router.push(WORKSPACE_MODE_META[next].homePath);
      }
    },
    [router],
  );

  const value = useMemo<WorkspaceModeContextValue>(
    () => ({
      mode,
      hydrated,
      setMode,
      homeHref: WORKSPACE_MODE_META[mode].homePath,
    }),
    [mode, hydrated, setMode],
  );

  return <WorkspaceModeContext.Provider value={value}>{children}</WorkspaceModeContext.Provider>;
}

export function useWorkspaceMode() {
  const ctx = useContext(WorkspaceModeContext);
  if (!ctx) {
    throw new Error("useWorkspaceMode must be used within WorkspaceModeProvider");
  }
  return ctx;
}

/** Safe for shared chrome that may render outside provider (landing). */
export function useWorkspaceModeOptional() {
  return useContext(WorkspaceModeContext);
}
