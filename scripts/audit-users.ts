import "dotenv/config";

import { connectMongo, disconnectMongo, getMongoDb } from "@/infrastructure/database/mongodb";

async function main() {
  await connectMongo();

  try {
    const db = getMongoDb();

    console.log("Database:", db.databaseName);

    const users = await db
      .collection("user")
      .find({})
      .project({ _id: 1, id: 1, email: 1, name: 1, role: 1 })
      .toArray();

    console.log("\nAuthentication users:");
    console.table(
      users.map((u) => ({
        id: String(u.id || u._id),
        email: u.email || "(no email)",
        name: u.name || "(no name)",
        role: u.role || "user",
      })),
    );

    console.log("\nCollection counts:");
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();

      console.log(`${collection.name}: ${count}`);
    }
  } finally {
    await disconnectMongo();
  }
}

main().catch((error) => {
  console.error("Audit failed:", error.message);
  process.exitCode = 1;
});
