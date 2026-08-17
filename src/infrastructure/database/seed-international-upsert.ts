/**
 * Upsert international demo celebs without wiping existing users.
 * Safe for local testing — preserves real accounts and prior demo chats.
 */
import "dotenv/config";

import { connectMongo, disconnectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
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
  SituationalProfile,
  Visitor,
} from "@/infrastructure/database/models";
import { INTERNATIONAL_DEMO_MEMBERS } from "@/lib/mock/international-demo-profiles";
import { allDemoPhotoUrls } from "@/lib/mock/demo-extra-photos";
import type { DemoMember } from "@/lib/mock/demo-profiles";
import { getDemoSituationalAnswers } from "@/lib/mock/celeb-situational-answers";
import { getAuth } from "@/lib/auth";
import { horoscopeService } from "@/application/horoscope/horoscope.service";
import { logger } from "@/lib/utils/logger";

function photosFromUrls(urls: string[]) {
  return urls.map((url, sortOrder) => {
    const slug = url.split("/").pop()?.split("?")[0] || `photo-${sortOrder}`;
    return {
      cloudinaryPublicId: `demo/${slug}`.slice(0, 180),
      url,
      secureUrl: url,
      width: 800,
      height: 1000,
      isPrimary: sortOrder === 0,
      sortOrder,
      visibility: "MEMBERS" as const,
    };
  });
}

async function ensureAuthUser(input: { email: string; password: string; name: string }) {
  const auth = await getAuth();
  const db = getMongoDb();
  const existing = await db.collection("user").findOne({ email: input.email.toLowerCase() });
  if (existing) {
    await db
      .collection("user")
      .updateOne(
        { _id: existing._id },
        { $set: { name: input.name, email: input.email.toLowerCase(), emailVerified: true } },
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
  await db.collection("user").updateOne({ id: userId }, { $set: { emailVerified: true } });
  await db
    .collection("user")
    .updateOne({ _id: result.user.id as never }, { $set: { emailVerified: true } });
  return userId;
}

async function purgeDemoUser(userId: string) {
  const db = getMongoDb();
  await Promise.all([
    Profile.deleteMany({ userId }),
    PartnerPreferences.deleteMany({ userId }),
    BirthDetails.deleteMany({ userId }),
    Horoscope.deleteMany({ userId }),
    Dasha.deleteMany({ userId }),
    SituationalProfile.deleteMany({ userId }),
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

/** Drop extra demo accounts that share a celeb name (e.g. two Dua Lipa rows). */
async function retireDuplicateNamedDemos() {
  const db = getMongoDb();
  const keepEmails = new Set(INTERNATIONAL_DEMO_MEMBERS.map((m) => m.email.toLowerCase()));
  const leftoverEmails = ["dualipa@demo.vedamilan.ai"];

  let removed = 0;

  for (const email of leftoverEmails) {
    if (keepEmails.has(email)) continue;
    const user = await db.collection("user").findOne({ email });
    if (!user) continue;
    const userId = String(user.id || user._id);
    await purgeDemoUser(userId);
    await db.collection("user").deleteOne({ _id: user._id });
    if (user._id) {
      await db.collection("user").deleteOne({ id: userId });
    }
    removed += 1;
    logger.info({ email, userId }, "Retired leftover demo email");
  }

  const profiles = await Profile.find({
    name: { $regex: /^dua\s*lipa$/i },
  })
    .select("userId name")
    .lean();

  if (profiles.length < 2) return removed;

  const userIds = profiles.map((p) => p.userId);
  const users = await db
    .collection("user")
    .find({
      $or: [{ id: { $in: userIds } }, { _id: { $in: userIds as never[] } }],
    })
    .toArray();
  const emailByUserId = new Map<string, string>();
  for (const user of users) {
    const id = String(user.id || user._id);
    emailByUserId.set(id, String(user.email || "").toLowerCase());
    emailByUserId.set(String(user._id), String(user.email || "").toLowerCase());
  }

  const keepUserId =
    profiles.find((p) => keepEmails.has(emailByUserId.get(p.userId) || ""))?.userId ||
    profiles[0]!.userId;

  for (const profile of profiles) {
    if (profile.userId === keepUserId) continue;
    const email = emailByUserId.get(profile.userId) || "";
    if (keepEmails.has(email)) continue;
    await purgeDemoUser(profile.userId);
    await db.collection("user").deleteMany({
      $or: [{ id: profile.userId }, { _id: profile.userId as never }],
    });
    removed += 1;
    logger.info(
      { name: profile.name, email, userId: profile.userId },
      "Retired duplicate demo profile",
    );
  }

  return removed;
}

async function upsertOne(userId: string, member: DemoMember) {
  await Profile.findOneAndUpdate(
    { userId },
    {
      $set: {
        userId,
        name: member.name,
        headline: member.headline,
        about: member.about,
        gender: member.gender,
        dateOfBirth: new Date(member.dateOfBirth),
        heightCm: member.heightCm,
        maritalStatus: member.maritalStatus,
        religion: member.religion,
        community: member.community,
        motherTongue: member.motherTongue,
        languages: member.languages,
        education: member.education,
        profession: member.profession,
        company: member.company,
        incomeRange: member.incomeRange ?? null,
        city: member.city,
        state: member.state,
        country: member.country || "United States",
        location: { type: "Point" as const, coordinates: member.coordinates },
        lifestyle: member.lifestyle,
        photos: photosFromUrls(allDemoPhotoUrls(member)),
        isVerified: true,
        verificationStatus: "VERIFIED" as const,
        isProfileComplete: true,
        onboardingCompletedAt: new Date(),
        visibility: "MEMBERS" as const,
        status: "ACTIVE" as const,
        deletedAt: null,
      } as never,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await PartnerPreferences.findOneAndUpdate(
    { userId },
    {
      $set: {
        userId,
        ageMin: Math.max(21, member.age - 8),
        ageMax: member.age + 10,
        religions: [],
        cities: [],
        countries: [],
        minCompatibilityScore: 15,
        maritalStatuses: ["NEVER_MARRIED", "DIVORCED"],
      },
    },
    { upsert: true },
  );

  await BirthDetails.findOneAndUpdate(
    { userId },
    {
      $set: {
        userId,
        birthDate: new Date(member.birth.birthDate),
        birthTime: member.birth.birthTime,
        birthTimeUnknown: member.birth.birthTimeUnknown,
        placeName: member.birth.placeName,
        latitude: member.birth.latitude,
        longitude: member.birth.longitude,
        timezone: member.birth.timezone,
        ayanamsha: "LAHIRI",
        chartStylePreference: "NORTH",
        status: "ACTIVE",
        deletedAt: null,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await Horoscope.deleteMany({ userId });
  await Dasha.deleteMany({ userId });
  await horoscopeService.generateForUser(userId);

  const answers = getDemoSituationalAnswers(member.id);
  if (answers) {
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
  }
}

async function main() {
  if (!process.env.BETTER_AUTH_SECRET) {
    process.env.BETTER_AUTH_SECRET = "vedamilan-local-dev-secret-key-32chars";
  }

  const onlyNew = process.argv.includes("--only-new");
  const retireOnly = process.argv.includes("--retire-duplicates");
  await connectMongo();
  const db = getMongoDb();

  const retired = await retireDuplicateNamedDemos();
  logger.info({ retired }, "Duplicate demo names retired");
  if (retireOnly) {
    await disconnectMongo();
    return;
  }

  let ok = 0;
  let fail = 0;
  let skipped = 0;

  for (const member of INTERNATIONAL_DEMO_MEMBERS) {
    try {
      if (onlyNew) {
        const exists = await db.collection("user").findOne({ email: member.email.toLowerCase() });
        if (exists) {
          skipped += 1;
          continue;
        }
      }
      const userId = await ensureAuthUser({
        email: member.email,
        password: member.password,
        name: member.name,
      });
      await upsertOne(userId, member);
      ok += 1;
      logger.info(
        { name: member.name, gender: member.gender, country: member.country },
        "Upserted",
      );
    } catch (error) {
      fail += 1;
      logger.error({ err: error, name: member.name }, "Failed");
    }
  }

  logger.info(
    { total: INTERNATIONAL_DEMO_MEMBERS.length, ok, fail, skipped, onlyNew },
    "International celeb upsert complete",
  );
  await disconnectMongo();
}

main().catch(async (err) => {
  console.error(err);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
