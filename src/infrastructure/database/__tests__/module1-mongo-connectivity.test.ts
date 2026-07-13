import { afterAll, describe, expect, it } from "vitest";

import { connectMongo, disconnectMongo, mongoose } from "@/infrastructure/database/mongodb";
import { Profile } from "@/infrastructure/database/models";

const mongoUri = process.env.MONGODB_URI || "";

describe("Module 1 — MongoDB connectivity", () => {
  it("connects and can insert/read when MONGODB_URI is set", async () => {
    if (!mongoUri) {
      console.warn("Skipping live Mongo test — MONGODB_URI not set");
      return;
    }

    process.env.MONGODB_URI = mongoUri;
    await connectMongo();
    expect(mongoose.connection.readyState).toBe(1);

    const userId = `module1-test-${Date.now()}`;
    const created = await Profile.create({
      userId,
      headline: "Module1 Test",
      city: "Bengaluru",
      country: "India",
    });
    const found = await Profile.findOne({ userId });
    expect(found?.userId).toBe(userId);

    await Profile.deleteOne({ _id: created._id });
  }, 30_000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await disconnectMongo();
    }
  });
});
