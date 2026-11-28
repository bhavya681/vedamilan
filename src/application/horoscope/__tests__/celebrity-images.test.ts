import { describe, expect, it } from "vitest";

import { CELEBRITY_CATALOG } from "../celebrity-catalog";
import { CELEBRITY_IMAGES } from "../celebrity-images";

describe("celebrity images", () => {
  it("has an image for every catalog profile", () => {
    const missing = CELEBRITY_CATALOG.filter((profile) => !CELEBRITY_IMAGES[profile.id]);

    expect(missing.map((profile) => profile.name)).toEqual([]);
  });

  it("uses absolute local or remote image URLs", () => {
    const invalid = Object.entries(CELEBRITY_IMAGES).filter(
      ([, url]) => !url.startsWith("/") && !url.startsWith("https://"),
    );

    expect(invalid).toEqual([]);
  });
});
