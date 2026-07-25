import "dotenv/config";

import { connectMongo, disconnectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
import {
  Profile,
  PartnerPreferences,
  BirthDetails,
  Horoscope,
  Dasha,
  Match,
  Like,
  Visitor,
  Shortlist,
  CompatibilityReport,
  Chat,
  Message,
  Notification,
} from "@/infrastructure/database/models";
import { DEMO_MEMBERS, PRESERVE_USER_EMAILS } from "@/lib/mock/demo-profiles";
import { ensureSeedFaqs, ensureSeedPlans } from "@/repositories";
import { getAuth } from "@/lib/auth";
import { horoscopeService } from "@/application/horoscope/horoscope.service";
import { logger } from "@/lib/utils/logger";

function photo(url: string, primary = true) {
  const slug = url.split("/").pop()?.split("?")[0] || "photo";
  return {
    cloudinaryPublicId: `demo/${slug}`.slice(0, 180),
    url,
    secureUrl: url,
    width: 800,
    height: 1000,
    isPrimary: primary,
    sortOrder: 0,
    visibility: "MEMBERS" as const,
  };
}

function inferCountry(member: (typeof DEMO_MEMBERS)[number]): string {
  if (member.country) return member.country;
  const place = member.birth.placeName.toLowerCase();
  if (place.includes("ireland")) return "Ireland";
  if (place.includes("nigeria")) return "Nigeria";
  if (place.includes("russia") || place.includes("dagestan")) return "Russia";
  if (place.includes("mexico")) return "Mexico";
  if (place.includes("china") || place.includes("hebei") || place.includes("harbin"))
    return "China";
  if (place.includes("usa") || place.includes("united states") || place.includes(", us")) {
    return "United States";
  }
  if (place.includes("australia") || place.includes("adelaide") || place.includes("melbourne")) {
    return "Australia";
  }
  if (place.includes("canada") || place.includes("vancouver")) return "Canada";
  if (
    place.includes("uk") ||
    place.includes("england") ||
    place.includes("london") ||
    place.includes("oxford")
  ) {
    return "United Kingdom";
  }
  if (place.includes("cuba") || place.includes("havana")) return "Cuba";
  if (place.includes("barbados") || place.includes("bridgetown") || place.includes("saint michael"))
    return "Barbados";
  if (place.includes("japan") || place.includes("osaka") || place.includes("tokyo")) return "Japan";
  if (place.includes("new zealand") || place.includes("auckland")) return "New Zealand";
  if (place.includes("hawaii") || place.includes("honolulu")) return "United States";
  if (
    place.includes("spain") ||
    place.includes("madrid") ||
    place.includes("barcelona") ||
    place.includes("sant cugat")
  )
    return "Spain";
  if (place.includes("chile") || place.includes("santiago")) return "Chile";
  if (place.includes("colombia") || place.includes("barranquilla")) return "Colombia";
  if (place.includes("kenya") || place.includes("nairobi")) return "Kenya";
  if (place.includes("israel") || place.includes("tel aviv") || place.includes("rosh"))
    return "Israel";
  if (place.includes("korea") || place.includes("seoul") || place.includes("busan"))
    return "South Korea";
  if (place.includes("jersey") || place.includes("saint helier")) return "United Kingdom";
  if (place.includes("puerto rico") || place.includes("vega baja") || place.includes("san juan")) {
    return "United States";
  }
  return "India";
}

function preserveEmailSet() {
  return new Set(["admin@vedamilan.ai", ...PRESERVE_USER_EMAILS.map((e) => e.toLowerCase())]);
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
    await db.collection("user").updateOne(
      { _id: existing._id },
      {
        $set: {
          name: input.name,
          email: input.email.toLowerCase(),
          emailVerified: true,
        },
      },
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
  if (input.role) {
    await db.collection("user").updateOne({ id: userId }, { $set: { role: input.role } });
    await db
      .collection("user")
      .updateOne({ _id: result.user.id as never }, { $set: { role: input.role } });
  }
  return userId;
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

/** Remove every auth user except preserved emails + wipe orphan profile graphs. */
async function wipeNonPreservedUsers() {
  const db = getMongoDb();
  const keep = preserveEmailSet();
  const users = await db.collection("user").find({}).toArray();
  const keepIds = new Set<string>();

  for (const user of users) {
    const email = String(user.email || "").toLowerCase();
    const userId = String(user.id || user._id);
    if (keep.has(email)) {
      keepIds.add(userId);
      continue;
    }
    await purgeUserData(userId);
    await db.collection("user").deleteOne({ _id: user._id });
    logger.info({ email }, "Removed user for reseeding");
  }

  // Orphan profiles / charts left from earlier seeds
  const orphanProfiles = await Profile.find({ userId: { $nin: [...keepIds] } }).lean();
  for (const profile of orphanProfiles) {
    await purgeUserData(String(profile.userId));
    logger.info({ userId: profile.userId }, "Removed orphan profile graph");
  }
}

async function upsertProfile(userId: string, member: (typeof DEMO_MEMBERS)[number]) {
  const payload = {
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
    country: inferCountry(member),
    location: { type: "Point" as const, coordinates: member.coordinates },
    lifestyle: member.lifestyle,
    photos: [photo(member.photo)],
    isVerified: member.isVerified ?? false,
    verificationStatus: member.isVerified ? ("VERIFIED" as const) : ("NONE" as const),
    isProfileComplete: true,
    visibility: "MEMBERS" as const,
    status: "ACTIVE" as const,
    deletedAt: null,
  };

  await Profile.findOneAndUpdate(
    { userId },
    { $set: payload as never },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

async function upsertBirthAndKundli(userId: string, member: (typeof DEMO_MEMBERS)[number]) {
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

async function seed() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DB_SEED !== "true") {
    throw new Error(
      "Refusing to seed in production. Set ALLOW_DB_SEED=true only for controlled staging resets.",
    );
  }

  if (!process.env.BETTER_AUTH_SECRET) {
    process.env.BETTER_AUTH_SECRET = "vedamilan-local-dev-secret-key-32chars";
    logger.warn("BETTER_AUTH_SECRET missing — using temporary local seed secret");
  }

  logger.warn(
    "Seeding demo users with known passwords — never point this at a production user database",
  );

  await connectMongo();
  await ensureSeedPlans();
  await ensureSeedFaqs();
  await wipeNonPreservedUsers();

  const ids: Record<string, string> = {};

  const adminId = await ensureAuthUser({
    email: "admin@vedamilan.ai",
    password: "VedaMilanAdmin!23",
    name: "VedaMilan Admin",
    role: "admin",
  });
  ids["admin@vedamilan.ai"] = adminId;

  let kundliOk = 0;
  let kundliFail = 0;

  for (const member of DEMO_MEMBERS) {
    const userId = await ensureAuthUser({
      email: member.email,
      password: member.password,
      name: member.name,
    });
    ids[member.email] = userId;
    await upsertProfile(userId, member);

    if (member.prefs) {
      await PartnerPreferences.findOneAndUpdate(
        { userId },
        {
          $set: {
            userId,
            ageMin: member.prefs.ageMin,
            ageMax: member.prefs.ageMax,
            religions: member.prefs.religions,
            cities: member.prefs.cities,
            minCompatibilityScore: member.prefs.minCompatibilityScore,
            maritalStatuses: ["NEVER_MARRIED"],
            countries: ["India"],
          },
        },
        { upsert: true },
      );
    } else {
      await PartnerPreferences.findOneAndUpdate(
        { userId },
        {
          $set: {
            userId,
            ageMin: Math.max(21, member.age - 8),
            ageMax: member.age + 8,
            religions: [member.religion],
            cities: [member.city, "Mumbai", "Bengaluru", "Delhi NCR", "Hyderabad"],
            minCompatibilityScore: 18,
            maritalStatuses: ["NEVER_MARRIED"],
            countries: ["India"],
          },
        },
        { upsert: true },
      );
    }

    try {
      await upsertBirthAndKundli(userId, member);
      kundliOk += 1;
      logger.info({ name: member.name }, "Kundli generated");
    } catch (error) {
      kundliFail += 1;
      logger.error({ err: error, name: member.name }, "Kundli generation failed");
    }
  }

  const preserved = await getMongoDb()
    .collection("user")
    .find({ email: { $in: [...PRESERVE_USER_EMAILS] } })
    .project({ email: 1, name: 1, id: 1 })
    .toArray();

  logger.info(
    {
      seeded: DEMO_MEMBERS.length,
      celebrities: DEMO_MEMBERS.filter((m) => m.isCelebrity).length,
      kundliOk,
      kundliFail,
      preserved: preserved.map((u) => u.email),
    },
    "Reseed complete — preserved your accounts untouched",
  );

  await disconnectMongo();
}

seed().catch(async (error) => {
  console.error(error);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
