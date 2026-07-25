import { routes } from "@/lib/constants/routes";

/**
 * Prevent open redirects. Only same-origin relative paths are allowed.
 * Rejects protocol-relative (`//evil.com`), backslash tricks, and encoded variants.
 */
export function sanitizeInternalPath(
  raw: string | null | undefined,
  fallback: string = routes.dashboard,
): string {
  if (!raw || typeof raw !== "string") return fallback;
  let path = raw.trim();
  try {
    path = decodeURIComponent(path);
  } catch {
    return fallback;
  }
  path = path.trim();

  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//")) return fallback;
  if (path.includes("://")) return fallback;
  if (path.includes("\\")) return fallback;
  if (/[\0\r\n]/.test(path)) return fallback;
  // Block `@` host tricks like `/\\@evil` after decode
  if (path.startsWith("/@") || path.startsWith("/\\")) return fallback;

  return path;
}
