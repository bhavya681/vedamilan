import "dotenv/config";

import { connectMongo, disconnectMongo, getMongoDb } from "@/infrastructure/database/mongodb";
import { Profile, PartnerPreferences } from "@/infrastructure/database/models";
import { ensureSeedFaqs, ensureSeedPlans } from "@/repositories";
import { getAuth } from "@/lib/auth";
import { logger } from "@/lib/utils/logger";

function photo(url: string, primary = true) {
  return {
    cloudinaryPublicId: `demo/${url.split("/").pop()?.split("?")[0] || "photo"}`,
    url,
    secureUrl: url,
    width: 800,
    height: 800,
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

type SeedProfile = {
  email: string;
  password: string;
  name: string;
  role?: "user" | "admin";
  profile?: {
    headline: string;
    about: string;
    gender: "MALE" | "FEMALE";
    dateOfBirth: string;
    heightCm: number;
    religion: string;
    community: string;
    motherTongue: string;
    languages: string[];
    education: string;
    profession: string;
    company?: string;
    city: string;
    state: string;
    coordinates: [number, number];
    lifestyle: { diet: string; smoking: string; drinking: string };
    photoUrl: string;
  };
};

/** Realistic imaginary members for UI / matchmaking demos */
const DEMO_PROFILES: SeedProfile[] = [
  {
    email: "admin@vedamilan.ai",
    password: "VedaMilanAdmin!23",
    name: "VedaMilan Admin",
    role: "admin",
  },
  {
    email: "aditi.sharma@email.com",
    password: "AditiDemo!23",
    name: "Aditi Sharma",
    profile: {
      headline: "Engineer seeking intentional partnership",
      about:
        "Bengaluru software engineer who values family dinners, Sunday temple visits, and calm conversations. Looking for someone kind, grounded, and curious about Vedic philosophy.",
      gender: "FEMALE",
      dateOfBirth: "1997-08-14",
      heightCm: 165,
      religion: "Hindu",
      community: "Brahmin",
      motherTongue: "Hindi",
      languages: ["Hindi", "English", "Kannada"],
      education: "B.E. Computer Science, BITS Pilani",
      profession: "Software Engineer",
      company: "Flipkart",
      city: "Bengaluru",
      state: "Karnataka",
      coordinates: [77.5946, 12.9716],
      lifestyle: { diet: "Vegetarian", smoking: "No", drinking: "Occasionally" },
      photoUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    email: "rohan.mehta@email.com",
    password: "RohanDemo!23",
    name: "Rohan Mehta",
    profile: {
      headline: "Engineer building calm systems",
      about:
        "Staff engineer who enjoys classical music, evening walks in Cubbon Park, and cooking Gujarati thalis for friends.",
      gender: "MALE",
      dateOfBirth: "1994-07-21",
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
      coordinates: [77.5946, 12.9716],
      lifestyle: { diet: "Vegetarian", smoking: "No", drinking: "No" },
      photoUrl:
        "https://images.unsplash.com/photo-1615109398623-028698b9e5e1?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    email: "kabir.iyer@email.com",
    password: "KabirDemo!23",
    name: "Kabir Iyer",
    profile: {
      headline: "Product lead with South Indian roots",
      about:
        "Hyderabad PM who visits family in Chennai every other month. Prefers intentional dating over endless swiping.",
      gender: "MALE",
      dateOfBirth: "1993-11-02",
      heightCm: 175,
      religion: "Hindu",
      community: "Iyer",
      motherTongue: "Tamil",
      languages: ["Tamil", "English", "Hindi"],
      education: "MBA, ISB",
      profession: "Product Manager",
      company: "Microsoft",
      city: "Hyderabad",
      state: "Telangana",
      coordinates: [78.4867, 17.385],
      lifestyle: { diet: "Vegetarian", smoking: "No", drinking: "Occasionally" },
      photoUrl:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    email: "meera.joshi@email.com",
    password: "MeeraDemo!23",
    name: "Meera Joshi",
    profile: {
      headline: "Numbers person, warm homebody",
      about:
        "CA who loves Lonavala treks, Marathi theatre, and quiet dinners with close friends. Family-oriented and practical.",
      gender: "FEMALE",
      dateOfBirth: "1997-05-18",
      heightCm: 162,
      religion: "Hindu",
      community: "Marathi",
      motherTongue: "Marathi",
      languages: ["Marathi", "Hindi", "English"],
      education: "CA, ICAI",
      profession: "Chartered Accountant",
      company: "Deloitte",
      city: "Pune",
      state: "Maharashtra",
      coordinates: [73.8567, 18.5204],
      lifestyle: { diet: "Vegetarian", smoking: "No", drinking: "No" },
      photoUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    email: "aditi.banerjee@email.com",
    password: "AditiDemo!23",
    name: "Aditi Banerjee",
    profile: {
      headline: "Advocate for clarity and kindness",
      about:
        "Civil lawyer who reads Bengali poetry, hosts Friday adda evenings, and believes kundli should guide—not dictate—choices.",
      gender: "FEMALE",
      dateOfBirth: "1995-09-09",
      heightCm: 168,
      religion: "Hindu",
      community: "Bengali",
      motherTongue: "Bengali",
      languages: ["Bengali", "English", "Hindi"],
      education: "LL.B, NUJS",
      profession: "Civil Lawyer",
      city: "Kolkata",
      state: "West Bengal",
      coordinates: [88.3639, 22.5726],
      lifestyle: { diet: "Non-vegetarian", smoking: "No", drinking: "Occasionally" },
      photoUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    email: "nikhil.sharma@email.com",
    password: "NikhilDemo!23",
    name: "Nikhil Sharma",
    profile: {
      headline: "Architect designing lived-in spaces",
      about:
        "Runs a boutique studio in Jaipur. Values craftsmanship, family rituals, slow travel, and honest conversations.",
      gender: "MALE",
      dateOfBirth: "1991-01-28",
      heightCm: 180,
      religion: "Hindu",
      community: "Rajput",
      motherTongue: "Hindi",
      languages: ["Hindi", "English"],
      education: "B.Arch, SPA Delhi",
      profession: "Architect",
      company: "Studio Nila",
      city: "Jaipur",
      state: "Rajasthan",
      coordinates: [75.7873, 26.9124],
      lifestyle: { diet: "Vegetarian", smoking: "No", drinking: "Occasionally" },
      photoUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    email: "priya.menon@email.com",
    password: "PriyaDemo!23",
    name: "Priya Menon",
    profile: {
      headline: "Data scientist with coastal roots",
      about:
        "Works remotely from Kochi. Loves backwater mornings, Carnatic concerts, and partners who respect independence and family.",
      gender: "FEMALE",
      dateOfBirth: "1994-12-03",
      heightCm: 164,
      religion: "Hindu",
      community: "Nair",
      motherTongue: "Malayalam",
      languages: ["Malayalam", "English", "Hindi"],
      education: "M.Tech, NIT Calicut",
      profession: "Data Scientist",
      company: "Amazon",
      city: "Kochi",
      state: "Kerala",
      coordinates: [76.2673, 9.9312],
      lifestyle: { diet: "Vegetarian", smoking: "No", drinking: "No" },
      photoUrl:
        "https://images.unsplash.com/photo-1594744803329-e58b43116268?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    email: "arjun.desai@email.com",
    password: "ArjunDemo!23",
    name: "Arjun Desai",
    profile: {
      headline: "Founder building healthcare access",
      about:
        "Mumbai founder who still goes home for Navratri. Looking for a partner who balances ambition with empathy.",
      gender: "MALE",
      dateOfBirth: "1992-04-15",
      heightCm: 176,
      religion: "Hindu",
      community: "Gujarati",
      motherTongue: "Gujarati",
      languages: ["Gujarati", "Hindi", "English"],
      education: "B.Com, SRCC",
      profession: "Founder",
      company: "Lumen Health",
      city: "Mumbai",
      state: "Maharashtra",
      coordinates: [72.8777, 19.076],
      lifestyle: { diet: "Vegetarian", smoking: "No", drinking: "Occasionally" },
      photoUrl:
        "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    email: "isha.nair@email.com",
    password: "IshaDemo!23",
    name: "Isha Nair",
    profile: {
      headline: "Scientist who still believes in rituals",
      about:
        "IISc researcher in Chennai. Enjoys filter coffee debates, beach walks, and partners who value curiosity.",
      gender: "FEMALE",
      dateOfBirth: "1998-02-22",
      heightCm: 160,
      religion: "Hindu",
      community: "Nair",
      motherTongue: "Malayalam",
      languages: ["Malayalam", "Tamil", "English"],
      education: "PhD, IISc",
      profession: "Research Scientist",
      company: "Biocon",
      city: "Chennai",
      state: "Tamil Nadu",
      coordinates: [80.2707, 13.0827],
      lifestyle: { diet: "Vegetarian", smoking: "No", drinking: "No" },
      photoUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    email: "vihaan.reddy@email.com",
    password: "VihaanDemo!23",
    name: "Vihaan Reddy",
    profile: {
      headline: "Doctor with a calm bedside manner",
      about:
        "Cardiologist who protects Sundays for family. Prefers sincere introductions over rushed timelines.",
      gender: "MALE",
      dateOfBirth: "1990-08-08",
      heightCm: 182,
      religion: "Hindu",
      community: "Reddy",
      motherTongue: "Telugu",
      languages: ["Telugu", "English", "Hindi"],
      education: "MD, AIIMS",
      profession: "Cardiologist",
      company: "Apollo Hospitals",
      city: "Bengaluru",
      state: "Karnataka",
      coordinates: [77.5946, 12.9716],
      lifestyle: { diet: "Eggetarian", smoking: "No", drinking: "Occasionally" },
      photoUrl:
        "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    email: "dev.kapoor@email.com",
    password: "DevDemo!23",
    name: "Dev Kapoor",
    profile: {
      headline: "UX lead who designs for empathy",
      about:
        "Delhi-based designer who sketches in Lodhi Garden. Wants a partner who laughs easily and takes family seriously.",
      gender: "MALE",
      dateOfBirth: "1995-06-30",
      heightCm: 174,
      religion: "Hindu",
      community: "Punjabi",
      motherTongue: "Hindi",
      languages: ["Hindi", "English", "Punjabi"],
      education: "M.Des, IDC IIT Bombay",
      profession: "UX Lead",
      company: "Swiggy",
      city: "Delhi NCR",
      state: "Delhi",
      coordinates: [77.209, 28.6139],
      lifestyle: { diet: "Non-vegetarian", smoking: "No", drinking: "Occasionally" },
      photoUrl:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    },
  },
];

async function upsertProfile(userId: string, p: NonNullable<SeedProfile["profile"]>) {
  const existing = await Profile.findOne({ userId });
  const payload = {
    userId,
    headline: p.headline,
    about: p.about,
    gender: p.gender,
    dateOfBirth: new Date(p.dateOfBirth),
    heightCm: p.heightCm,
    religion: p.religion,
    community: p.community,
    motherTongue: p.motherTongue,
    languages: p.languages,
    education: p.education,
    profession: p.profession,
    company: p.company,
    city: p.city,
    state: p.state,
    country: "India",
    location: { type: "Point" as const, coordinates: p.coordinates },
    lifestyle: p.lifestyle,
    photos: [photo(p.photoUrl)],
    isProfileComplete: true,
    visibility: "MEMBERS" as const,
    status: "ACTIVE" as const,
    deletedAt: null,
  };

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

  const ids: Record<string, string> = {};

  for (const demo of DEMO_PROFILES) {
    const userId = await ensureAuthUser({
      email: demo.email,
      password: demo.password,
      name: demo.name,
      role: demo.role,
    });
    ids[demo.email] = userId;
    if (demo.profile) {
      await upsertProfile(userId, demo.profile);
    }
  }

  const memberId = ids["ananya.sharma@email.com"];
  if (memberId && !(await PartnerPreferences.findOne({ userId: memberId }))) {
    await PartnerPreferences.create({
      userId: memberId,
      ageMin: 28,
      ageMax: 36,
      religions: ["Hindu"],
      cities: ["Bengaluru", "Mumbai", "Delhi", "Pune", "Hyderabad"],
      minCompatibilityScore: 18,
    });
  }

  logger.info({ count: Object.keys(ids).length, ids }, "Demo users seeded");
  await disconnectMongo();
}

seed().catch(async (error) => {
  console.error(error);
  await disconnectMongo().catch(() => undefined);
  process.exit(1);
});
