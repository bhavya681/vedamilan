/**
 * One-shot cleanup:
 * - Deduplicate auth users by email (keep newest verified / most complete)
 * - Deduplicate profiles by userId
 * - Remove orphan profile graphs with no user
 * - Backfill Profile.gender from demo roster + force Bhavya accounts to MALE
 */
import "dotenv/config";

import { ObjectId } from "mongodb";

import {
  BirthDetails,
  Chat,
  CompatibilityReport,
  Dasha,
  Horoscope,
  Like,
  Match,
  Message,
  Notification,
  PartnerPreferences,
  Profile,
  Shortlist,
  Visitor,
} from "@/infrastructure/database/models";
import { connectMongo, disconnectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
import { DEMO_MEMBERS, PRESERVE_USER_EMAILS } from "@/lib/mock/demo-profiles";
import { logger } from "@/lib/utils/logger";

const BHAVYA_MALE_EMAILS = new Set(
  ["bhavyawade2@gmail.com", "bhavya@vedamilan.ai", "bhavya.wade@gmail.com"].map((e) =>
    e.toLowerCase(),
  ),
);

/** Known preserved / real accounts with explicit gender overrides */
const GENDER_OVERRIDES = new Map<string, "MALE" | "FEMALE">([
  ["bhavyawade2@gmail.com", "MALE"],
  ["bhavya@vedamilan.ai", "MALE"],
  ["bhavya.wade@gmail.com", "MALE"],
  ["matiya@gmail.com", "FEMALE"],
  ["mariya@gmail.com", "FEMALE"],
]);

const FORCE_MALE_NAME_HINTS = [/bhavya/i, /\bwade\b/i];

function userLookupFilter(userId: string) {
  const ors: object[] = [{ id: userId }, { _id: userId as never }];
  if (ObjectId.isValid(userId) && String(new ObjectId(userId)) === userId) {
    ors.push({ _id: new ObjectId(userId) });
  }
  return { $or: ors };
}

async function purgeUserData(userId: string) {
  const db = getMongoDb();
  await Promise.all([
    Profile.deleteMany({ userId }),
    PartnerPreferences.deleteMany({ userId }),
    BirthDetails.deleteMany({ userId }),
    Horoscope.deleteMany({ userId }),
    Dasha.deleteMany({ userId }),
    Match.deleteMany({ $or: [{ userId }, { candidateUserId: userId }] } as never),
    Like.deleteMany({ $or: [{ fromUserId: userId }, { toUserId: userId }] } as never),
    Visitor.deleteMany({
      $or: [{ visitorUserId: userId }, { profileUserId: userId }],
    } as never),
    Shortlist.deleteMany({ $or: [{ userId }, { targetUserId: userId }] } as never),
    CompatibilityReport.deleteMany({
      $or: [{ userAId: userId }, { userBId: userId }],
    } as never),
    Chat.deleteMany({ participantIds: userId } as never),
    Message.deleteMany({ senderId: userId } as never),
    Notification.deleteMany({ userId }),
    db.collection("session").deleteMany({ userId }),
    db.collection("account").deleteMany({ userId }),
  ]);
}

function demoGenderByEmail(): Map<string, "MALE" | "FEMALE"> {
  const map = new Map<string, "MALE" | "FEMALE">();
  for (const m of DEMO_MEMBERS) {
    map.set(m.email.toLowerCase(), m.gender);
  }
  return map;
}

function scoreUser(user: Record<string, unknown>): number {
  let score = 0;
  if (user.emailVerified) score += 100;
  if (user.name && String(user.name).trim()) score += 10;
  const ts = new Date(
    (user.updatedAt as string | Date | undefined) ||
      (user.createdAt as string | Date | undefined) ||
      0,
  ).getTime();
  score += Math.min(50, Math.floor(ts / 1e11));
  return score;
}

async function dedupeUsersByEmail() {
  const db = getMongoDb();
  const users = await db.collection("user").find({}).toArray();
  const byEmail = new Map<string, typeof users>();

  for (const user of users) {
    const email = String(user.email || "")
      .trim()
      .toLowerCase();
    if (!email) continue;
    const list = byEmail.get(email) || [];
    list.push(user);
    byEmail.set(email, list);
  }

  let removed = 0;
  for (const [email, list] of byEmail) {
    if (list.length < 2) continue;
    const ranked = [...list].sort(
      (a, b) => scoreUser(b as Record<string, unknown>) - scoreUser(a as Record<string, unknown>),
    );
    const keep = ranked[0]!;
    const keepId = String(keep.id || keep._id);
    for (const dup of ranked.slice(1)) {
      const dupId = String(dup.id || dup._id);
      if (dupId === keepId) continue;
      await purgeUserData(dupId);
      await db.collection("user").deleteOne({ _id: dup._id });
      removed += 1;
      logger.info({ email, removedUserId: dupId, keptUserId: keepId }, "Removed duplicate user");
    }
  }
  return removed;
}

async function dedupeProfilesByUserId() {
  const profiles = await Profile.find({})
    .select("_id userId updatedAt createdAt gender name")
    .lean();
  const byUser = new Map<string, typeof profiles>();
  for (const p of profiles) {
    const uid = String(p.userId);
    const list = byUser.get(uid) || [];
    list.push(p);
    byUser.set(uid, list);
  }

  let removed = 0;
  for (const [, list] of byUser) {
    if (list.length < 2) continue;
    const ranked = [...list].sort((a, b) => {
      const aHas = a.gender === "MALE" || a.gender === "FEMALE" ? 1 : 0;
      const bHas = b.gender === "MALE" || b.gender === "FEMALE" ? 1 : 0;
      if (bHas !== aHas) return bHas - aHas;
      return (
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime()
      );
    });
    for (const dup of ranked.slice(1)) {
      await Profile.deleteOne({ _id: dup._id });
      removed += 1;
    }
  }
  return removed;
}

async function removeOrphanProfiles() {
  const db = getMongoDb();
  const profiles = await Profile.find({}).select("userId").lean();
  let removed = 0;
  for (const profile of profiles) {
    const userId = String(profile.userId);
    const user = await db.collection("user").findOne(userLookupFilter(userId), {
      projection: { _id: 1, id: 1 },
    });
    if (!user) {
      await purgeUserData(userId);
      removed += 1;
      logger.info({ userId }, "Removed orphan profile graph");
    }
  }
  return removed;
}

async function backfillGenders() {
  const db = getMongoDb();
  const demoMap = demoGenderByEmail();
  const profiles = await Profile.find({}).lean();

  let updated = 0;
  let bhavyaFixed = 0;
  let fromDemo = 0;
  let alreadyOk = 0;
  let unresolved = 0;

  for (const profile of profiles) {
    const userId = String(profile.userId);
    const user = await db.collection("user").findOne(userLookupFilter(userId), {
      projection: { email: 1, name: 1, id: 1, _id: 1 },
    });
    const email = String((user as { email?: string } | null)?.email || "")
      .trim()
      .toLowerCase();
    const userName = String((user as { name?: string } | null)?.name || profile.name || "");

    let nextGender: "MALE" | "FEMALE" | "OTHER" | "UNDISCLOSED" | null = null;

    if (
      GENDER_OVERRIDES.has(email) ||
      BHAVYA_MALE_EMAILS.has(email) ||
      FORCE_MALE_NAME_HINTS.some((re) => re.test(userName))
    ) {
      nextGender =
        GENDER_OVERRIDES.get(email) ||
        (BHAVYA_MALE_EMAILS.has(email) || FORCE_MALE_NAME_HINTS.some((re) => re.test(userName))
          ? "MALE"
          : null);
      if (BHAVYA_MALE_EMAILS.has(email)) {
        bhavyaFixed += 1;
      }
    } else if (demoMap.has(email)) {
      nextGender = demoMap.get(email)!;
      fromDemo += 1;
    } else if (profile.gender === "MALE" || profile.gender === "FEMALE") {
      alreadyOk += 1;
      continue;
    } else if (PRESERVE_USER_EMAILS.map((e) => e.toLowerCase()).includes(email)) {
      // Non-Bhavya preserved accounts: leave OTHER/UNDISCLOSED only if unknown — default MALE for matiya if unclear?
      // Safer: if matiya unknown leave UNDISCLOSED but log
      nextGender = null;
    }

    if (!nextGender) {
      // Last resort: keep existing if valid binary; else mark UNDISCLOSED (won't appear in matches)
      if (profile.gender === "MALE" || profile.gender === "FEMALE") {
        alreadyOk += 1;
        continue;
      }
      unresolved += 1;
      if (profile.gender !== "UNDISCLOSED") {
        await Profile.updateOne({ userId }, { $set: { gender: "UNDISCLOSED" } });
        updated += 1;
      }
      continue;
    }

    if (profile.gender !== nextGender) {
      await Profile.updateOne({ userId }, { $set: { gender: nextGender } });
      updated += 1;
      logger.info(
        { email: email || userId, from: profile.gender, to: nextGender, name: userName },
        "Set profile gender",
      );
    } else {
      alreadyOk += 1;
    }
  }

  return { updated, bhavyaFixed, fromDemo, alreadyOk, unresolved, total: profiles.length };
}

async function ensureBhavyaMaleProfiles() {
  const db = getMongoDb();
  let ensured = 0;

  for (const email of BHAVYA_MALE_EMAILS) {
    const user = await db.collection("user").findOne({ email });
    if (!user) continue;
    const userId = String(user.id || user._id);
    const name = String(user.name || "Bhavya").trim() || "Bhavya";

    await Profile.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          name,
          gender: "MALE",
          status: "ACTIVE",
          deletedAt: null,
          visibility: "MEMBERS",
        },
        $setOnInsert: {
          headline: "",
          about: "",
          photos: [],
          isProfileComplete: false,
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
    ensured += 1;
    logger.info({ email, userId }, "Ensured Bhavya profile is MALE");
  }

  // Also catch preserved emails containing "bhavya"
  for (const email of PRESERVE_USER_EMAILS) {
    const lower = email.toLowerCase();
    if (!lower.includes("bhavya") && !BHAVYA_MALE_EMAILS.has(lower)) continue;
    const user = await db.collection("user").findOne({ email: lower });
    if (!user) continue;
    const userId = String(user.id || user._id);
    await Profile.updateOne(
      { userId },
      { $set: { gender: "MALE", status: "ACTIVE", deletedAt: null } },
      { upsert: false },
    );
  }

  return ensured;
}

async function summarize() {
  const db = getMongoDb();
  const genderCounts = await Profile.aggregate<{ _id: string; n: number }>([
    { $group: { _id: "$gender", n: { $sum: 1 } } },
  ]);
  const userCount = await db.collection("user").countDocuments();
  const profileCount = await Profile.countDocuments();
  const emailDupes = await db
    .collection("user")
    .aggregate<{ _id: string; n: number }>([
      {
        $group: {
          _id: { $toLower: "$email" },
          n: { $sum: 1 },
        },
      },
      { $match: { n: { $gt: 1 } } },
    ])
    .toArray();

  return {
    users: userCount,
    profiles: profileCount,
    genders: Object.fromEntries(genderCounts.map((g) => [g._id || "null", g.n])),
    duplicateEmailsLeft: emailDupes.length,
  };
}

async function main() {
  await connectMongo();

  const removedDupUsers = await dedupeUsersByEmail();
  const removedDupProfiles = await dedupeProfilesByUserId();
  const removedOrphans = await removeOrphanProfiles();
  const bhavyaEnsured = await ensureBhavyaMaleProfiles();
  const genderResult = await backfillGenders();
  const summary = await summarize();

  logger.info(
    {
      removedDupUsers,
      removedDupProfiles,
      removedOrphans,
      bhavyaEnsured,
      genderResult,
      summary,
      preserved: PRESERVE_USER_EMAILS,
      bhavyaEmailsForcedMale: [...BHAVYA_MALE_EMAILS],
    },
    "Gender + duplicate cleanup complete",
  );

  await disconnectMongo();
}

main().catch(async (error) => {
  console.error(error);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
