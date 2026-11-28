type ImagePayload = { data?: { imageUrl?: string | null } };

const cache = new Map<string, string | null>();
const pending = new Map<string, Promise<string | null>>();
const queue: Array<() => void> = [];
const MAX_CONCURRENT = 3;

let active = 0;

function schedule<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      active += 1;
      task()
        .then(resolve, reject)
        .finally(() => {
          active -= 1;
          const next = queue.shift();
          if (next) next();
        });
    };

    if (active < MAX_CONCURRENT) run();
    else queue.push(run);
  });
}

export function getCelebrityImageUrl(name: string): Promise<string | null> {
  const key = name.trim().toLowerCase();
  if (!key) return Promise.resolve(null);
  if (cache.has(key)) return Promise.resolve(cache.get(key) ?? null);

  const existing = pending.get(key);
  if (existing) return existing;

  const task = schedule(async () => {
    try {
      const response = await fetch(
        `/api/astrology/celebrities/image?name=${encodeURIComponent(name.trim())}`,
      );
      if (!response.ok) {
        cache.set(key, null);
        return null;
      }
      const payload = (await response.json()) as ImagePayload;
      const imageUrl = typeof payload.data?.imageUrl === "string" ? payload.data.imageUrl : null;
      cache.set(key, imageUrl);
      return imageUrl;
    } catch {
      cache.set(key, null);
      return null;
    } finally {
      pending.delete(key);
    }
  });

  pending.set(key, task);
  return task;
}
