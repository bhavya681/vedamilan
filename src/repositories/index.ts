import { Profile, Plan, Faq, type ProfileDocument } from "@/infrastructure/database/models";
import { BaseRepository } from "./base.repository";

export class ProfileRepository extends BaseRepository<ProfileDocument> {
  constructor() {
    super(Profile as never);
  }

  async findByUserId(userId: string) {
    return this.findOne({ userId } as never);
  }

  async searchCandidates(
    filters: {
      city?: string;
      religion?: string;
      gender?: string;
      excludeUserId?: string;
    },
    pagination = {},
  ) {
    const query: Record<string, unknown> = {
      status: "ACTIVE",
      visibility: { $ne: "HIDDEN" },
      isProfileComplete: true,
    };
    if (filters.city) query.city = filters.city;
    if (filters.religion) query.religion = filters.religion;
    if (filters.gender) query.gender = filters.gender;
    if (filters.excludeUserId) query.userId = { $ne: filters.excludeUserId };
    return this.findMany(query as never, pagination);
  }
}

export const profileRepository = new ProfileRepository();

export async function ensureSeedPlans() {
  const count = await Plan.countDocuments();
  if (count > 0) return;
  await Plan.insertMany([
    {
      code: "FREE",
      name: "Free",
      description: "Begin your journey with core intelligence.",
      priceInr: 0,
      interval: "MONTHLY",
      features: ["Basic profile", "Limited matches", "Sample kundli"],
      isHighlighted: false,
    },
    {
      code: "PREMIUM",
      name: "Premium",
      description: "Full matchmaking and compatibility workspace.",
      priceInr: 1999,
      interval: "MONTHLY",
      features: ["Unlimited matches", "Compatibility reports", "Marriage timing"],
      isHighlighted: true,
    },
    {
      code: "ELITE",
      name: "Elite",
      description: "Priority consults and family sharing.",
      priceInr: 4999,
      interval: "QUARTERLY",
      features: ["Everything in Premium", "Priority consults", "PDF dossiers"],
      isHighlighted: false,
    },
  ]);
}

export async function ensureSeedFaqs() {
  const count = await Faq.countDocuments();
  if (count > 0) return;
  await Faq.insertMany([
    {
      question: "Does AI calculate my kundli?",
      answer:
        "No. Swiss Ephemeris and deterministic rule engines calculate charts and scores. AI only explains results.",
      category: "ai",
      sortOrder: 1,
    },
    {
      question: "Is my birth data private?",
      answer:
        "Birth details are encrypted in transit and access-controlled. You control profile visibility.",
      category: "privacy",
      sortOrder: 2,
    },
  ]);
}
