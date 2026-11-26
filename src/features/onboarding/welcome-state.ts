export const KUNDLIV_WELCOME_KEY = "kundliv.welcome.v1";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function readSeenMap(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KUNDLIV_WELCOME_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const seen: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value === true) seen[key] = true;
    }
    return seen;
  } catch {
    return {};
  }
}

export function hasSeenKundlivWelcome(userId?: string): boolean {
  if (!userId) return false;
  return readSeenMap()[userId] === true;
}

export function markKundlivWelcomeSeen(userId?: string): void {
  if (!userId || typeof window === "undefined") return;
  const seen = readSeenMap();
  seen[userId] = true;
  try {
    window.localStorage.setItem(KUNDLIV_WELCOME_KEY, JSON.stringify(seen));
  } catch {
    return;
  }
}

export function shouldShowKundlivWelcome(user: {
  id: string;
  createdAt?: Date | string | null;
}): boolean {
  if (!user?.id || !user.createdAt) return false;
  const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
  const time = createdAt.getTime();
  if (!Number.isFinite(time)) return false;
  const age = Date.now() - time;
  return age >= 0 && age <= THIRTY_DAYS_MS;
}
