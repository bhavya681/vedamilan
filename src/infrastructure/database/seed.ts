import "dotenv/config";

import { connectMongo, disconnectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
import { Profile, PartnerPreferences } from "@/infrastructure/database/models";
import { ensureSeedFaqs, ensureSeedPlans } from "@/repositories";
import { getAuth } from "@/lib/auth";
import { logger } from "@/lib/utils/logger";

async function ensureAuthUser(input: {
  email: string;
  password: string;
  name: string;
  role?: "user" | "admin";
}) {
  const auth = await getAuth();
  const db = getMongoDb();
  const existing = await db.collection("user").findOne({ email: input.email.toLowerCase() });
  if (existing) {
    if (input.role && existing.role !== input.role) {
      await db.collection("user").updateOne({ _id: existing._id }, { $set: { role: input.role } });
    }
    return String(existing._id);
  }

  const result = await auth.api.signUpEmail({
    body: {
      email: input.email,
      password: input.password,
      name: input.name,
    },
  });

  const userId = result.user.id;
  if (input.role) {
    await db.collection("user").updateOne({ id: userId }, { $set: { role: input.role } });
    // Better Auth may store _id as ObjectId with separate id field depending on version
    await db
      .collection("user")
      .updateOne({ _id: result.user.id as never }, { $set: { role: input.role } });
  }
  return userId;
}

async function seed() {
  await connectMongo();
  await ensureSeedPlans();
  await ensureSeedFaqs();

  const adminId = await ensureAuthUser({
    email: "admin@vedamilan.ai",
    password: "VedaMilanAdmin!23",
    name: "VedaMilan Admin",
    role: "admin",
  });

  const memberId = await ensureAuthUser({
    email: "ananya.sharma@email.com",
    password: "AnanyaDemo!23",
    name: "Ananya Sharma",
  });

  const existingProfile = await Profile.findOne({ userId: memberId });
  if (!existingProfile) {
    await Profile.create({
      userId: memberId,
      headline: "Designer seeking intentional partnership",
      about: "Bengaluru-based product designer who values family, clarity, and calm conversations.",
      gender: "FEMALE",
      dateOfBirth: new Date("1996-03-12"),
      heightCm: 165,
      religion: "Hindu",
      community: "Brahmin",
      motherTongue: "Hindi",
      languages: ["Hindi", "English", "Kannada"],
      education: "NID",
      profession: "Product Designer",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      location: { type: "Point", coordinates: [77.5946, 12.9716] },
      lifestyle: { diet: "Vegetarian", smoking: "No", drinking: "Occasionally" },
      isProfileComplete: false,
      visibility: "MEMBERS",
    });
  }

  const prefs = await PartnerPreferences.findOne({ userId: memberId });
  if (!prefs) {
    await PartnerPreferences.create({
      userId: memberId,
      ageMin: 28,
      ageMax: 36,
      religions: ["Hindu"],
      cities: ["Bengaluru", "Mumbai", "Delhi"],
      minCompatibilityScore: 24,
    });
  }

  logger.info(
    { adminId, memberId },
    "MongoDB + Better Auth seed completed (admin@vedamilan.ai / ananya.sharma@email.com)",
  );
  await disconnectMongo();
}

seed().catch(async (error) => {
  console.error(error);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
