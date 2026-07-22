/**
 * Completes preserved Bhavya accounts: gender MALE, profile basics, birth, kundli, onboarding flag.
 */
import "dotenv/config";

import { ObjectId } from "mongodb";

import { BirthDetails, Dasha, Horoscope, Profile } from "@/infrastructure/database/models";
import { connectMongo, disconnectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
import { horoscopeService } from "@/application/horoscope/horoscope.service";
import { calculateProfileCompletion } from "@/application/profile/profile.service";
import { logger } from "@/lib/utils/logger";

const BHAVYA_EMAILS = ["bbw3238@gmail.com", "bhavyawade2@gmail.com"];

const PHOTO = "/avatars/bhavya.png";

function userLookup(userId: string) {
  const ors: object[] = [{ id: userId }, { _id: userId as never }];
  if (ObjectId.isValid(userId) && String(new ObjectId(userId)) === userId) {
    ors.push({ _id: new ObjectId(userId) });
  }
  return { $or: ors };
}

async function completeForEmail(email: string) {
  const db = getMongoDb();
  const user = await db.collection("user").findOne({ email: email.toLowerCase() });
  if (!user) {
    logger.warn({ email }, "User not found — skip");
    return;
  }
  const userId = String(user.id || user._id);
  const name = String(user.name || "Bhavya Wade").trim() || "Bhavya Wade";

  const photo = {
    cloudinaryPublicId: `local/bhavya/${userId}`,
    url: PHOTO,
    secureUrl: PHOTO,
    width: 800,
    height: 1000,
    isPrimary: true,
    sortOrder: 0,
    visibility: "MEMBERS" as const,
  };

  const profilePayload = {
    userId,
    name,
    gender: "MALE" as const,
    dateOfBirth: new Date("1998-06-15"),
    heightCm: 178,
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    profession: "Software Engineer",
    education: "B.Tech Computer Science",
    religion: "Hindu",
    community: "Indian",
    motherTongue: "Marathi",
    languages: ["English", "Hindi", "Marathi"],
    about:
      "Building thoughtful products and looking for a meaningful partnership rooted in values, humour, and shared growth. Interested in Vedic compatibility as a guide — not a verdict.",
    headline: "Engineer with a calm mind and curious heart",
    maritalStatus: "NEVER_MARRIED" as const,
    photos: [photo],
    isVerified: true,
    verificationStatus: "VERIFIED" as const,
    isProfileComplete: true,
    onboardingCompletedAt: new Date(),
    visibility: "MEMBERS" as const,
    status: "ACTIVE" as const,
    deletedAt: null,
    location: { type: "Point" as const, coordinates: [72.8777, 19.076] },
  };

  await Profile.findOneAndUpdate(
    { userId },
    { $set: profilePayload as never },
    { upsert: true, setDefaultsOnInsert: true },
  );

  const completion = calculateProfileCompletion(
    profilePayload as unknown as Record<string, unknown>,
  );
  await Profile.updateOne({ userId }, { $set: { isProfileComplete: completion.isComplete } });

  await BirthDetails.findOneAndUpdate(
    { userId },
    {
      $set: {
        userId,
        birthDate: new Date("1998-06-15"),
        birthTime: "10:30:00",
        birthTimeUnknown: false,
        placeName: "Mumbai, Maharashtra, India",
        latitude: 19.076,
        longitude: 72.8777,
        timezone: "Asia/Kolkata",
        ayanamsha: "LAHIRI",
        chartStylePreference: "NORTH",
        status: "ACTIVE",
        deletedAt: null,
      },
    },
    { upsert: true, setDefaultsOnInsert: true },
  );

  await Horoscope.deleteMany({ userId });
  await Dasha.deleteMany({ userId });
  await horoscopeService.generateForUser(userId);

  await db.collection("user").updateOne(userLookup(userId), {
    $set: { name, emailVerified: true },
  });

  logger.info(
    { email, userId, completion: completion.score, isComplete: completion.isComplete },
    "Bhavya profile completed",
  );
}

async function main() {
  await connectMongo();
  for (const email of BHAVYA_EMAILS) {
    await completeForEmail(email);
  }
  await disconnectMongo();
}

main().catch(async (error) => {
  console.error(error);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
