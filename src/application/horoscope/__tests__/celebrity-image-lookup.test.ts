import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveCelebrityImageUrl } from "../celebrity-image-lookup.service";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("celebrity image lookup", () => {
  it("returns a real Wikipedia thumbnail URL and caches the result", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          query: {
            pages: [
              {
                thumbnail: {
                  source: "https://thumb.wikimedia.org/example.jpg?utm_source=en.wikipedia.org",
                },
              },
            ],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const first = await resolveCelebrityImageUrl("Atlas Test Person");
    const second = await resolveCelebrityImageUrl("atlas test person");

    expect(first).toBe("https://thumb.wikimedia.org/example.jpg");
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns null for a name with no usable Wikipedia image", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ query: { pages: [{ missing: true }] } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(resolveCelebrityImageUrl("Atlas Missing Person")).resolves.toBeNull();
  });
});
