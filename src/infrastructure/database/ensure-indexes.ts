import "dotenv/config";

import { connectMongo, disconnectMongo } from "@/infrastructure/database/mongodb";
import * as models from "@/infrastructure/database/models";
import { logger } from "@/lib/utils/logger";

async function ensureIndexes() {
  await connectMongo();
  const entries = Object.entries(models).filter(
    ([, value]) => value && typeof value === "object" && "createIndexes" in value,
  );

  for (const [name, model] of entries) {
    await (model as { createIndexes: () => Promise<unknown> }).createIndexes();
    logger.info({ model: name }, "Indexes ensured");
  }

  await disconnectMongo();
  logger.info("All MongoDB indexes ensured");
}

ensureIndexes().catch(async (error) => {
  console.error(error);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
