/**
 * Upsert international demo celebs without wiping existing users.
 * Safe for local testing — preserves real accounts and prior demo chats.
 */
import "dotenv/config";

import { connectMongo, disconnectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
import {
  BirthDetails,
  Dasha,
  Horoscope,
  PartnerPreferences,
  Profile,
} from "@/infrastructure/database/models";
import { INTERNATIONAL_DEMO_MEMBERS } from "@/lib/mock/international-demo-profiles";
import { allDemoPhotoUrls } from "@/lib/mock/demo-extra-photos";
import type { DemoMember } from "@/lib/mock/demo-profiles";
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
}

async function main() {
  if (!process.env.BETTER_AUTH_SECRET) {
    process.env.BETTER_AUTH_SECRET = "vedamilan-local-dev-secret-key-32chars";
  }

  const onlyNew = process.argv.includes("--only-new");
  await connectMongo();
  const db = getMongoDb();

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
