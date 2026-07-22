import "dotenv/config";

import { ObjectId } from "mongodb";

import { Profile } from "@/infrastructure/database/models";
import { connectMongo, disconnectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
import { logger } from "@/lib/utils/logger";

function nameFromPlaceholderHeadline(headline?: string | null): string | null {
  const value = String(headline || "").trim();
  if (!value) return null;
  const match = value.match(/^(.+?)['’]s profile$/i);
  return match?.[1]?.trim() || null;
}

function userLookupFilter(userId: string) {
  const ors: object[] = [{ id: userId }, { _id: userId as never }];
  if (ObjectId.isValid(userId) && String(new ObjectId(userId)) === userId) {
    ors.push({ _id: new ObjectId(userId) });
  }
  return { $or: ors };
}

/**
 * Backfill Profile.name from User.name (or legacy "${name}'s profile" headlines),
 * and fill empty User.name from Profile.name when needed.
 */
async function backfillProfileNames() {
  await connectMongo();
  const db = getMongoDb();

  const profiles = await Profile.find({}).select("userId name headline").lean();

  let updatedProfiles = 0;
  let updatedUsers = 0;
  let unresolved = 0;

  for (const profile of profiles) {
    const userId = String(profile.userId);
    const existingProfileName = String(profile.name || "").trim();

    const user = await db.collection("user").findOne(userLookupFilter(userId), {
      projection: { id: 1, name: 1, email: 1, _id: 1 },
    });

    const userName = String((user as { name?: string } | null)?.name || "").trim();
    const fromHeadline = nameFromPlaceholderHeadline(profile.headline);

    let nextProfileName = existingProfileName || userName || fromHeadline || "";

    const userEmail = (user as { email?: string } | null)?.email;
    if (!nextProfileName && user && typeof userEmail === "string") {
      const local = String(userEmail)
        .split("@")[0]
        ?.replace(/[._-]+/g, " ")
        .trim();
      if (local && local.length >= 2) {
        nextProfileName = local
          .split(" ")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");
      }
    }

    if (!nextProfileName) {
      unresolved += 1;
      continue;
    }

    if (nextProfileName !== existingProfileName) {
      await Profile.updateOne({ userId }, { $set: { name: nextProfileName } });
      updatedProfiles += 1;
    }

    if (user && !userName) {
      await db
        .collection("user")
        .updateOne(userLookupFilter(userId), { $set: { name: nextProfileName } });
      updatedUsers += 1;
    }
  }

  logger.info(
    { profiles: profiles.length, updatedProfiles, updatedUsers, unresolved },
    "Profile name backfill complete",
  );

  await disconnectMongo();
}

backfillProfileNames().catch(async (error) => {
  console.error(error);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
