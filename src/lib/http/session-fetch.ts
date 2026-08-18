/** True when an API JSON body means the session cookie is not ready yet. */
export function isUnauthorizedPayload(json: unknown): boolean {
  if (!json || typeof json !== "object") return false;
  const body = json as { authenticated?: unknown; success?: unknown; error?: { code?: unknown } };
  if (body.authenticated === false) return true;
  return body.success === false && body.error?.code === "UNAUTHORIZED";
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

export async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const res = await fetch(url, { credentials: "same-origin", signal });
  return res.json();
}

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

/**
 * After client sign-in, the first dashboard fetch can 401 before the session
 * cookie is visible. Retry a few times instead of treating that as empty data.
 */
export async function fetchJsonWhenAuthed(
  url: string,
  signal?: AbortSignal,
  attempts = 5,
): Promise<unknown> {
  let last: unknown = null;
  for (let i = 0; i < attempts; i += 1) {
    last = await fetchJson(url, signal);
    if (!isUnauthorizedPayload(last)) return last;
    if (i < attempts - 1) await wait(120 * (i + 1), signal);
  }
  return last;
}
