/**
 * Extra realistic Wikimedia gallery shots keyed by demo member id.
 * Primary `photo` stays the main portrait; these append to the profile gallery.
 */
export const DEMO_EXTRA_PHOTOS: Record<string, string[]> = {
  i_mcgregor: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Conor_McGregor_2015.jpg/960px-Conor_McGregor_2015.jpg",
  ],
  i_therock: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Dwayne_Johnson_2014_%28cropped%29.jpg/960px-Dwayne_Johnson_2014_%28cropped%29.jpg",
  ],
  i_zendaya: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Zendaya_-_2019_by_Glenn_Francis.jpg/960px-Zendaya_-_2019_by_Glenn_Francis.jpg",
  ],
  i_taylorswift: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.png/960px-191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.png",
  ],
  i_galgadot: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Gal_Gadot_at_the_2018_Comic-Con_International_9.jpg/960px-Gal_Gadot_at_the_2018_Comic-Con_International_9.jpg",
  ],
};

function fileKey(url: string): string {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    const thumbIdx = parts.indexOf("thumb");
    if (thumbIdx >= 0 && parts[thumbIdx + 3]) return decodeURIComponent(parts[thumbIdx + 3]!);
    return decodeURIComponent(parts[parts.length - 1] || url);
  } catch {
    return url;
  }
}

export function allDemoPhotoUrls(member: {
  id: string;
  photo: string;
  extraPhotos?: string[];
}): string[] {
  const extras = [...(member.extraPhotos ?? []), ...(DEMO_EXTRA_PHOTOS[member.id] ?? [])];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of [member.photo, ...extras]) {
    if (!url) continue;
    const key = fileKey(url);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(url);
  }
  return out;
}
