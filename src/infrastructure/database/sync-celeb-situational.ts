/**
 * Upsert situational-alignment answers for popular celeb demos (no wipe).
 * Usage: npm run db:sync-celeb-situational
 */
import "dotenv/config";

import { connectMongo, disconnectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
import { SituationalProfile } from "@/infrastructure/database/models";
import { DEMO_MEMBERS } from "@/lib/mock/demo-profiles";
import {
  CELEB_SITUATIONAL_ANSWERS,
  getDemoSituationalAnswers,
} from "@/lib/mock/celeb-situational-answers";
import { logger } from "@/lib/utils/logger";

async function main() {
  await connectMongo();
  const db = getMongoDb();

  let ok = 0;
  let missing = 0;
  let skipped = 0;

  for (const member of DEMO_MEMBERS) {
    const answers = getDemoSituationalAnswers(member.id);
    if (!answers) {
      skipped += 1;
      continue;
    }

    const user = await db.collection("user").findOne({ email: member.email.toLowerCase() });
    if (!user) {
      missing += 1;
      logger.warn({ email: member.email, name: member.name }, "Celeb user not found — seed first");
      continue;
    }

    const userId = String((user as { id?: string }).id || user._id);
    await SituationalProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          answers,
          completedAt: new Date(),
          deletedAt: null,
          status: "ACTIVE",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    ok += 1;
    logger.info({ name: member.name }, "Situational answers synced");
  }

  logger.info(
    {
      catalogued: Object.keys(CELEB_SITUATIONAL_ANSWERS).length,
      synced: ok,
      missingUsers: missing,
      withoutAnswers: skipped,
    },
    "Celeb situational sync complete",
  );

  await disconnectMongo();
}

main().catch(async (error) => {
  console.error(error);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
