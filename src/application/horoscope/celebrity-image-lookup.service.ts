const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";
const USER_AGENT = "VedamilanAstrologyAtlas/1.0 (educational chart study)";

const TITLE_ALIASES: Record<string, string> = {
  "a q r's david kabiller": "David Kabiller",
  "john c. bogle": "John Bogle",
  "bhagwan shree rajneesh": "Osho (Bhagwan Shree Rajneesh)",
  "jeffrey esteem": "",
  "bruce lee?": "",
};

const cache = new Map<string, string | null>();
const inFlight = new Map<string, Promise<string | null>>();

type WikipediaPage = {
  missing?: boolean;
  thumbnail?: { source?: string };
  original?: { source?: string };
};

type WikipediaImageResponse = {
  query?: { pages?: WikipediaPage[] };
};

function wikiUrl(params: Record<string, string>) {
  const url = new URL(WIKIPEDIA_API);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function requestPages(params: Record<string, string>): Promise<WikipediaPage[]> {
  const response = await fetch(wikiUrl(params), {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) return [];
  const payload = (await response.json()) as WikipediaImageResponse;
  return payload.query?.pages ?? [];
}

function cleanSource(source: string | undefined) {
  if (!source) return null;
  return source.split("?")[0] ?? null;
}

async function lookup(name: string): Promise<string | null> {
  const title = TITLE_ALIASES[name.toLowerCase()] ?? name;
  if (!title) return null;

  const baseParams = {
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "pageimages",
    pithumbsize: "330",
    redirects: "1",
  };

  try {
    const exact = await requestPages({ ...baseParams, titles: title });
    const exactSource =
      cleanSource(exact[0]?.thumbnail?.source) ?? cleanSource(exact[0]?.original?.source);
    if (exactSource) return exactSource;

    const search = await requestPages({
      ...baseParams,
      generator: "search",
      gsrsearch: title,
      gsrlimit: "1",
    });
    return (
      cleanSource(search[0]?.thumbnail?.source) ?? cleanSource(search[0]?.original?.source) ?? null
    );
  } catch {
    return null;
  }
}

export function resolveCelebrityImageUrl(name: string): Promise<string | null> {
  const key = name.trim();
  if (!key) return Promise.resolve(null);
  const cacheKey = key.toLowerCase();
  if (cache.has(cacheKey)) return Promise.resolve(cache.get(cacheKey) ?? null);

  const pending = inFlight.get(cacheKey);
  if (pending) return pending;

  const task = lookup(key)
    .then((imageUrl) => {
      cache.set(cacheKey, imageUrl);
      return imageUrl;
    })
    .finally(() => {
      inFlight.delete(cacheKey);
    });
  inFlight.set(cacheKey, task);
  return task;
}
