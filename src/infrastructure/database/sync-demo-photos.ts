/**
 * Sync demo profile photos from mock definitions (no kundli regen).
 * Restores realistic Wikimedia celeb portraits + appends extra gallery shots.
 * Prefers locally mirrored files under /public/demo-portraits when present.
 */
import "dotenv/config";
import { existsSync } from "node:fs";
import path from "node:path";

import { Profile } from "@/infrastructure/database/models";
import { connectMongo, disconnectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
import { allDemoPhotoUrls } from "@/lib/mock/demo-extra-photos";
import { DEMO_MEMBERS } from "@/lib/mock/demo-profiles";
import { logger } from "@/lib/utils/logger";

const PUBLIC_DIR = path.join(process.cwd(), "public", "demo-portraits");

function extensionFromUrl(url: string): string {
  const clean = url.split("?")[0] || url;
  const base = clean.split("/").pop() || "photo.jpg";
  const match = base.match(/\.(jpe?g|png|webp|gif)$/i);
  return match ? `.${match[1]!.toLowerCase().replace("jpeg", "jpg")}` : ".jpg";
}

function photoDoc(url: string, sortOrder: number, isPrimary: boolean) {
  const slug = url.split("/").pop()?.split("?")[0] || `photo-${sortOrder}`;
  return {
    cloudinaryPublicId: `demo/${slug}`.slice(0, 180),
    url,
    secureUrl: url,
    width: 800,
    height: 1000,
    isPrimary,
    sortOrder,
    visibility: "MEMBERS" as const,
  };
}

function resolvePhotoUrl(memberId: string, remoteUrl: string, index: number): string {
  const ext = extensionFromUrl(remoteUrl);
  const localName = `${memberId}-${index}${ext}`;
  const localPath = path.join(PUBLIC_DIR, localName);
  if (existsSync(localPath)) return `/demo-portraits/${localName}`;
  return remoteUrl;
}

async function main() {
  await connectMongo();
  const db = getMongoDb();

  let updated = 0;
  let missing = 0;
  let photoCount = 0;

  for (const member of DEMO_MEMBERS) {
    const user = await db.collection("user").findOne({ email: member.email.toLowerCase() });
    if (!user) {
      missing += 1;
      continue;
    }
    const userId = String(user.id || user._id);
    const remotes = allDemoPhotoUrls(member);
    const photos = remotes.map((url, index) =>
      photoDoc(resolvePhotoUrl(member.id, url, index), index, index === 0),
    );
    photoCount += photos.length;
    const result = await Profile.updateOne({ userId }, { $set: { photos } });
    if (result.matchedCount > 0) updated += 1;
    else missing += 1;
  }

  logger.info(
    { updated, missing, photoCount, total: DEMO_MEMBERS.length },
    "Demo photo sync complete (Wikimedia restored + extras)",
  );
  await disconnectMongo();
}

main().catch(async (err) => {
  console.error(err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
