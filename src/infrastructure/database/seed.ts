import "dotenv/config";

import { connectMongo, disconnectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
import { Profile, PartnerPreferences } from "@/infrastructure/database/models";
import { DEMO_MEMBERS } from "@/lib/mock/demo-profiles";
import { ensureSeedFaqs, ensureSeedPlans } from "@/repositories";
import { getAuth } from "@/lib/auth";
import { logger } from "@/lib/utils/logger";

function photo(url: string, primary = true) {
  return {
    cloudinaryPublicId: `demo/${url.split("/").pop()?.split("?")[0] || "photo"}`,
    url,
    secureUrl: url,
    width: 800,
    height: 1000,
    isPrimary: primary,
    sortOrder: 0,
    visibility: "MEMBERS" as const,
  };
}

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
    await db
      .collection("user")
      .updateOne(
        { _id: existing._id },
        { $set: { name: input.name, email: input.email.toLowerCase() } },
      );
    return String(existing.id || existing._id);
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
    await db
      .collection("user")
      .updateOne({ _id: result.user.id as never }, { $set: { role: input.role } });
  }
  return userId;
}

/** Remove previous fictional demo members so the roster stays clean. */
async function clearOldDemoUsers(keepEmails: Set<string>) {
  const db = getMongoDb();
  const demoUsers = await db
    .collection("user")
    .find({
      email: { $regex: /@email\.com$/i },
      role: { $ne: "admin" },
    })
    .toArray();

  for (const user of demoUsers) {
    const email = String(user.email || "").toLowerCase();
    if (keepEmails.has(email)) continue;
    const userId = String(user.id || user._id);
    await Profile.deleteMany({ userId });
    await PartnerPreferences.deleteMany({ userId });
    await db.collection("session").deleteMany({ userId });
    await db.collection("account").deleteMany({ userId });
    await db.collection("user").deleteOne({ _id: user._id });
    logger.info({ email }, "Removed stale demo user");
  }
}

async function upsertProfile(userId: string, member: (typeof DEMO_MEMBERS)[number]) {
  const payload = {
    userId,
    headline: member.headline,
    about: member.about,
    gender: member.gender,
    dateOfBirth: new Date(member.dateOfBirth),
    heightCm: member.heightCm,
    religion: member.religion,
    community: member.community,
    motherTongue: member.motherTongue,
    languages: member.languages,
    education: member.education,
    profession: member.profession,
    company: member.company,
    city: member.city,
    state: member.state,
    country: "India",
    location: { type: "Point" as const, coordinates: member.coordinates },
    lifestyle: member.lifestyle,
    photos: [photo(member.photo)],
    isProfileComplete: true,
    visibility: "MEMBERS" as const,
    status: "ACTIVE" as const,
    deletedAt: null,
  };

  const existing = await Profile.findOne({ userId });
  if (existing) {
    await Profile.updateOne({ userId }, { $set: payload as never });
    return;
  }
  await Profile.create(payload as never);
}

async function seed() {
  await connectMongo();
  await ensureSeedPlans();
  await ensureSeedFaqs();

  const keepEmails = new Set([
    "admin@vedamilan.ai",
    ...DEMO_MEMBERS.map((m) => m.email.toLowerCase()),
  ]);
  await clearOldDemoUsers(keepEmails);

  const ids: Record<string, string> = {};

  const adminId = await ensureAuthUser({
    email: "admin@vedamilan.ai",
    password: "VedaMilanAdmin!23",
    name: "VedaMilan Admin",
    role: "admin",
  });
  ids["admin@vedamilan.ai"] = adminId;

  for (const member of DEMO_MEMBERS) {
    const userId = await ensureAuthUser({
      email: member.email,
      password: member.password,
      name: member.name,
    });
    ids[member.email] = userId;
    await upsertProfile(userId, member);
  }

  const primaryId = ids["aditi.sharma@email.com"];
  if (primaryId) {
    await PartnerPreferences.findOneAndUpdate(
      { userId: primaryId },
      {
        $set: {
          userId: primaryId,
          ageMin: 27,
          ageMax: 36,
          religions: ["Hindu", "Muslim"],
          cities: ["Bengaluru", "Mumbai", "Delhi NCR", "Pune", "Hyderabad", "Chennai", "Kochi"],
          minCompatibilityScore: 18,
        },
      },
      { upsert: true },
    );
  }

  logger.info({ count: DEMO_MEMBERS.length, ids }, "Realistic demo users seeded");
  await disconnectMongo();
}

seed().catch(async (error) => {
  console.error(error);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
