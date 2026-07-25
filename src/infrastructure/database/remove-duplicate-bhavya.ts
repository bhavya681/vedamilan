/**
 * Remove duplicate Bhavya Wade account.
 * Keep: bhavyawade2@gmail.com (more activity)
 * Remove: bbw3238@gmail.com
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
import { logger } from "@/lib/utils/logger";

const KEEP_EMAIL = "bhavyawade2@gmail.com";
const REMOVE_EMAIL = "bbw3238@gmail.com";

function userLookupFilter(userId: string) {
  const ors: object[] = [{ id: userId }, { _id: userId as never }];
  if (ObjectId.isValid(userId) && String(new ObjectId(userId)) === userId) {
    ors.push({ _id: new ObjectId(userId) });
  }
  return { $or: ors };
}

async function purgeUserData(userId: string) {
  const db = getMongoDb();
  const results = await Promise.all([
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
    db.collection("connection_requests").deleteMany({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    }),
    db.collection("connections").deleteMany({
      $or: [{ userAId: userId }, { userBId: userId }, { userIds: userId }],
    }),
    db.collection("blocks").deleteMany({
      $or: [{ blockerUserId: userId }, { blockedUserId: userId }],
    }),
    db.collection("session").deleteMany({ userId }),
    db.collection("account").deleteMany({ userId }),
    db.collection("reports").deleteMany({
      $or: [{ reporterUserId: userId }, { reportedUserId: userId }],
    }),
  ]);

  return results.map((r) => ("deletedCount" in r ? r.deletedCount : 0));
}

async function main() {
  await connectMongo();
  const db = getMongoDb();

  const keep = await db.collection("user").findOne({ email: KEEP_EMAIL.toLowerCase() });
  const remove = await db.collection("user").findOne({ email: REMOVE_EMAIL.toLowerCase() });

  if (!keep) {
    throw new Error(`Keep account not found: ${KEEP_EMAIL}`);
  }
  if (!remove) {
    logger.info({ email: REMOVE_EMAIL }, "Duplicate already absent — nothing to remove");
    await disconnectMongo();
    return;
  }

  const removeUserId = String(remove.id || remove._id);
  const keepUserId = String(keep.id || keep._id);

  if (removeUserId === keepUserId) {
    throw new Error("Keep and remove resolve to the same userId — aborting");
  }

  logger.info(
    {
      keep: { email: KEEP_EMAIL, userId: keepUserId, name: keep.name },
      remove: { email: REMOVE_EMAIL, userId: removeUserId, name: remove.name },
    },
    "Removing duplicate Bhavya account",
  );

  const deletedCounts = await purgeUserData(removeUserId);
  const userDelete = await db.collection("user").deleteMany(userLookupFilter(removeUserId));

  // Safety: ensure keep still exists
  const keepStill = await db.collection("user").findOne({ email: KEEP_EMAIL.toLowerCase() });
  const keepProfile = await Profile.findOne({ userId: keepUserId }).lean();

  logger.info(
    {
      purgedCollections: deletedCounts.reduce((a, b) => a + (b || 0), 0),
      userDocsRemoved: userDelete.deletedCount,
      keepStillPresent: Boolean(keepStill),
      keepProfilePresent: Boolean(keepProfile),
      keepEmail: KEEP_EMAIL,
    },
    "Duplicate Bhavya removed",
  );

  await disconnectMongo();
}

main().catch(async (e) => {
  console.error(e);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
