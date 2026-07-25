/**
 * Mirror demo Wikimedia portraits into public/demo-portraits for reliable local serving.
 * Uses Commons API thumbnails with retries + polite delays to reduce 429s.
 */
import "dotenv/config";
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

import { allDemoPhotoUrls } from "@/lib/mock/demo-extra-photos";
import { DEMO_MEMBERS } from "@/lib/mock/demo-profiles";
import { logger } from "@/lib/utils/logger";

const OUT_DIR = path.join(process.cwd(), "public", "demo-portraits");
const UA =
  "VedaMilanDemo/1.0 (local development portrait mirror; https://github.com/local/vedamilan)";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extensionFromUrl(url: string): string {
  const clean = url.split("?")[0] || url;
  const base = clean.split("/").pop() || "photo.jpg";
  const match = base.match(/\.(jpe?g|png|webp|gif)$/i);
  return match ? `.${match[1]!.toLowerCase().replace("jpeg", "jpg")}` : ".jpg";
}

function commonsFileTitle(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("wikimedia.org")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const thumbIdx = parts.indexOf("thumb");
    if (thumbIdx >= 0 && parts[thumbIdx + 3]) {
      return decodeURIComponent(parts[thumbIdx + 3]!);
    }
    return decodeURIComponent(parts[parts.length - 1] || "");
  } catch {
    return null;
  }
}

async function thumbUrlForFile(fileName: string, width = 800): Promise<string | null> {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.searchParams.set("action", "query");
  api.searchParams.set("format", "json");
  api.searchParams.set("origin", "*");
  api.searchParams.set("titles", `File:${fileName}`);
  api.searchParams.set("prop", "imageinfo");
  api.searchParams.set("iiprop", "url");
  api.searchParams.set("iiurlwidth", String(width));

  const res = await fetch(api, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    query?: { pages?: Record<string, { imageinfo?: Array<{ thumburl?: string; url?: string }> }> };
  };
  const page = Object.values(json.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];
  return info?.thumburl || info?.url || null;
}

async function downloadOnce(fetchUrl: string, dest: string): Promise<"ok" | "http" | "network"> {
  try {
    const res = await fetch(fetchUrl, { headers: { "User-Agent": UA } });
    if (res.status === 429) return "http";
    if (!res.ok) {
      logger.warn({ status: res.status, url: fetchUrl }, "Download failed");
      return "http";
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) {
      logger.warn({ url: fetchUrl, bytes: buf.length }, "Suspiciously small image");
      return "http";
    }
    await writeFile(dest, buf);
    return "ok";
  } catch (err) {
    logger.warn({ err, url: fetchUrl }, "Network error downloading");
    return "network";
  }
}

async function download(url: string, dest: string): Promise<boolean> {
  try {
    await access(dest);
    return true;
  } catch {
    // continue
  }

  const fileName = commonsFileTitle(url);
  let fetchUrl = url;
  if (fileName) {
    const thumb = await thumbUrlForFile(fileName);
    if (thumb) fetchUrl = thumb;
  }

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const result = await downloadOnce(fetchUrl, dest);
    if (result === "ok") return true;
    const wait = result === "http" ? 4000 * attempt : 2500 * attempt;
    await sleep(wait);
  }
  return false;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let ok = 0;
  let fail = 0;
  let skipped = 0;

  for (const member of DEMO_MEMBERS) {
    const urls = allDemoPhotoUrls(member);
    for (let i = 0; i < urls.length; i += 1) {
      const remote = urls[i]!;
      if (remote.includes("images.unsplash.com")) {
        skipped += 1;
        continue;
      }
      const dest = path.join(OUT_DIR, `${member.id}-${i}${extensionFromUrl(remote)}`);
      try {
        await access(dest);
        skipped += 1;
        continue;
      } catch {
        // download
      }
      const success = await download(remote, dest);
      if (success) {
        ok += 1;
        logger.info({ file: path.basename(dest), name: member.name }, "Mirrored");
      } else {
        fail += 1;
      }
      await sleep(2000);
    }
  }

  logger.info({ ok, fail, skipped }, "Demo portrait mirror complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
