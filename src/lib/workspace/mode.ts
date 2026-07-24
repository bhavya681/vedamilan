export type WorkspaceMode = "astrology" | "matrimony";

export const WORKSPACE_MODE_STORAGE_KEY = "vedamilan.workspace-mode.v1";

export const WORKSPACE_MODE_META: Record<
  WorkspaceMode,
  { label: string; subtitle: string; homePath: string }
> = {
  astrology: {
    label: "Astrology",
    subtitle: "Explore your life through Vedic astrology",
    homePath: "/dashboard/astrology",
  },
  matrimony: {
    label: "Matrimony",
    subtitle: "Discover meaningful compatibility",
    homePath: "/dashboard/matrimony",
  },
};

export function isWorkspaceMode(value: unknown): value is WorkspaceMode {
  return value === "astrology" || value === "matrimony";
}

export function readLocalWorkspaceMode(): WorkspaceMode {
  if (typeof window === "undefined") return "matrimony";
  try {
    const raw = window.localStorage.getItem(WORKSPACE_MODE_STORAGE_KEY);
    if (isWorkspaceMode(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "matrimony";
}

export function writeLocalWorkspaceMode(mode: WorkspaceMode) {
  try {
    window.localStorage.setItem(WORKSPACE_MODE_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

/** Infer preferred mode from the current path when no explicit preference applies. */
export function inferModeFromPath(pathname: string): WorkspaceMode | null {
  if (!pathname.startsWith("/dashboard")) return null;
  if (pathname.startsWith("/dashboard/astrology")) return "astrology";
  if (pathname.startsWith("/dashboard/matrimony")) return "matrimony";

  const astrologyPrefixes = [
    "/dashboard/kundli",
    "/dashboard/horoscope",
    "/dashboard/calendar",
    "/dashboard/birth-details",
    "/dashboard/ai-insights",
    "/dashboard/predictions",
    "/dashboard/remedies",
  ];
  if (astrologyPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return "astrology";
  }

  const matrimonyPrefixes = [
    "/dashboard/matches",
    "/dashboard/connections",
    "/dashboard/chat",
    "/dashboard/messages",
    "/dashboard/search",
    "/dashboard/shortlisted",
    "/dashboard/likes",
    "/dashboard/visitors",
    "/dashboard/recommendations",
    "/dashboard/compatibility",
  ];
  if (matrimonyPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return "matrimony";
  }

  return null;
}
