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

  const rohanId = await ensureAuthUser({
    email: "rohan.mehta@email.com",
    password: "RohanDemo!23",
    name: "Rohan Mehta",
  });

  const kabirId = await ensureAuthUser({
    email: "kabir.iyer@email.com",
    password: "KabirDemo!23",
    name: "Kabir Iyer",
  });

  if (!(await Profile.findOne({ userId: memberId }))) {
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

  if (!(await Profile.findOne({ userId: rohanId }))) {
    await Profile.create({
      userId: rohanId,
      headline: "Engineer building calm systems",
      about: "Staff engineer who enjoys classical music, temple visits, and long walks.",
      gender: "MALE",
      dateOfBirth: new Date("1994-07-21"),
      heightCm: 178,
      religion: "Hindu",
      community: "Gujarati",
      motherTongue: "Gujarati",
      languages: ["Gujarati", "Hindi", "English"],
      education: "B.Tech, IIT Bombay",
      profession: "Staff Engineer",
      company: "Google",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      location: { type: "Point", coordinates: [77.5946, 12.9716] },
      lifestyle: { diet: "Vegetarian", smoking: "No", drinking: "No" },
      visibility: "MEMBERS",
    });
  }

  if (!(await Profile.findOne({ userId: kabirId }))) {
    await Profile.create({
      userId: kabirId,
      headline: "Product lead with South Indian roots",
      about: "Hyderabad-based PM focused on family values and intentional dating.",
      gender: "MALE",
      dateOfBirth: new Date("1993-11-02"),
      heightCm: 175,
      religion: "Hindu",
      community: "Iyer",
      motherTongue: "Tamil",
      languages: ["Tamil", "English", "Hindi"],
      education: "MBA, IIM",
      profession: "Product Manager",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      location: { type: "Point", coordinates: [78.4867, 17.385] },
      lifestyle: { diet: "Vegetarian", smoking: "No", drinking: "Occasionally" },
      visibility: "MEMBERS",
    });
  }

  if (!(await PartnerPreferences.findOne({ userId: memberId }))) {
    await PartnerPreferences.create({
      userId: memberId,
      ageMin: 28,
      ageMax: 36,
      religions: ["Hindu"],
      cities: ["Bengaluru", "Mumbai", "Delhi"],
      minCompatibilityScore: 18,
    });
  }

  logger.info({ adminId, memberId, rohanId, kabirId }, "MongoDB + Better Auth seed completed");
  await disconnectMongo();
}

seed().catch(async (error) => {
  console.error(error);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
