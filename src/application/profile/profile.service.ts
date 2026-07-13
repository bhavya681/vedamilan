import { BirthDetails, PartnerPreferences, Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { cloudinaryService } from "@/lib/services/cloudinary";
import type {
  BirthDetailsInput,
  PartnerPreferencesInput,
  ProfileUpdateInput,
} from "@/lib/validators/profile";
import { NotFoundError } from "@/lib/utils/error-handler";

const COMPLETION_WEIGHTS: Array<{
  key: string;
  weight: number;
  check: (p: Record<string, unknown>) => boolean;
}> = [
  { key: "about", weight: 15, check: (p) => Boolean(p.about && String(p.about).length > 40) },
  { key: "photos", weight: 20, check: (p) => Array.isArray(p.photos) && p.photos.length > 0 },
  { key: "city", weight: 10, check: (p) => Boolean(p.city) },
  { key: "profession", weight: 10, check: (p) => Boolean(p.profession) },
  { key: "education", weight: 10, check: (p) => Boolean(p.education) },
  { key: "religion", weight: 10, check: (p) => Boolean(p.religion) },
  { key: "dateOfBirth", weight: 10, check: (p) => Boolean(p.dateOfBirth) },
  { key: "heightCm", weight: 5, check: (p) => Boolean(p.heightCm) },
  {
    key: "languages",
    weight: 5,
    check: (p) => Array.isArray(p.languages) && p.languages.length > 0,
  },
  {
    key: "lifestyle",
    weight: 5,
    check: (p) => Boolean((p.lifestyle as { diet?: string } | undefined)?.diet),
  },
];

export function calculateProfileCompletion(profile: Record<string, unknown>): {
  score: number;
  isComplete: boolean;
  missing: string[];
} {
  let score = 0;
  const missing: string[] = [];
  for (const item of COMPLETION_WEIGHTS) {
    if (item.check(profile)) score += item.weight;
    else missing.push(item.key);
  }
  return { score, isComplete: score >= 80, missing };
}

function ageFromDob(dob?: Date | string | null): number | null {
  if (!dob) return null;
  const d = typeof dob === "string" ? new Date(dob) : dob;
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

export class ProfileService {
  async ensureConnected() {
    await connectMongo();
  }

  async getOrCreateProfile(userId: string, seed?: { name?: string }) {
    await this.ensureConnected();
    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = await Profile.create({
        userId,
        headline: seed?.name ? `${seed.name}'s profile` : "",
        about: "",
        visibility: "MEMBERS",
      });
    }
    return profile.toObject();
  }

  async getProfileBundle(userId: string, seed?: { name?: string; email?: string }) {
    await this.ensureConnected();
    const profile = await this.getOrCreateProfile(userId, seed);
    const [preferences, birthDetails] = await Promise.all([
      PartnerPreferences.findOne({ userId }).lean(),
      BirthDetails.findOne({ userId }).lean(),
    ]);
    const completion = calculateProfileCompletion(profile as Record<string, unknown>);
    if (
      profile.isProfileComplete !== completion.isComplete ||
      (profile as { profileCompletion?: number }).profileCompletion !== completion.score
    ) {
      await Profile.updateOne(
        { userId },
        {
          isProfileComplete: completion.isComplete,
        },
      );
    }

    return {
      profile: {
        ...profile,
        age: ageFromDob(profile.dateOfBirth as Date | null),
        completion,
      },
      preferences: preferences ?? null,
      birthDetails: birthDetails ?? null,
      user: { id: userId, name: seed?.name, email: seed?.email },
    };
  }

  async updateProfile(userId: string, input: ProfileUpdateInput) {
    await this.ensureConnected();
    await this.getOrCreateProfile(userId);

    const payload: Record<string, unknown> = { ...input };
    if (input.dateOfBirth) {
      payload.dateOfBirth = new Date(input.dateOfBirth);
    }

    const updated = await Profile.findOneAndUpdate(
      { userId },
      { $set: payload },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) throw new NotFoundError("Profile not found");

    const completion = calculateProfileCompletion(updated as Record<string, unknown>);
    await Profile.updateOne({ userId }, { isProfileComplete: completion.isComplete });

    return { ...updated, completion, age: ageFromDob(updated.dateOfBirth as Date | null) };
  }

  async uploadPhoto(userId: string, dataUrl: string, makePrimary = false) {
    await this.ensureConnected();
    await this.getOrCreateProfile(userId);

    const uploaded = await cloudinaryService.uploadImage({
      data: dataUrl,
      folder: `vedamilan/profiles/${userId}`,
    });

    const photo = {
      cloudinaryPublicId: uploaded.public_id,
      url: uploaded.url,
      secureUrl: uploaded.secure_url,
      width: uploaded.width,
      height: uploaded.height,
      isPrimary: makePrimary,
      sortOrder: 0,
      visibility: "MEMBERS" as const,
    };

    const profile = await Profile.findOne({ userId });
    if (!profile) throw new NotFoundError("Profile not found");

    if (makePrimary || profile.photos.length === 0) {
      profile.photos.forEach((p) => {
        p.isPrimary = false;
      });
      photo.isPrimary = true;
    }

    profile.photos.unshift(photo as never);
    const completion = calculateProfileCompletion(profile.toObject() as Record<string, unknown>);
    profile.isProfileComplete = completion.isComplete;
    await profile.save();

    return { photo, completion, photos: profile.photos };
  }

  async deletePhoto(userId: string, publicId: string) {
    await this.ensureConnected();
    const profile = await Profile.findOne({ userId });
    if (!profile) throw new NotFoundError("Profile not found");

    const before = profile.photos.length;
    profile.photos = profile.photos.filter((p) => p.cloudinaryPublicId !== publicId) as never;
    if (profile.photos.length === before) throw new NotFoundError("Photo not found");

    try {
      await cloudinaryService.deleteAsset(publicId);
    } catch {
      // Continue DB cleanup even if Cloudinary delete fails
    }

    if (profile.photos.length > 0 && !profile.photos.some((p) => p.isPrimary)) {
      profile.photos[0].isPrimary = true;
    }

    const completion = calculateProfileCompletion(profile.toObject() as Record<string, unknown>);
    profile.isProfileComplete = completion.isComplete;
    await profile.save();
    return { photos: profile.photos, completion };
  }

  async upsertPreferences(userId: string, input: PartnerPreferencesInput) {
    await this.ensureConnected();
    if (input.ageMin !== undefined && input.ageMax !== undefined && input.ageMin > input.ageMax) {
      throw new Error("ageMin cannot exceed ageMax");
    }
    const doc = await PartnerPreferences.findOneAndUpdate(
      { userId },
      { $set: { userId, ...input } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();
    return doc;
  }

  async getPreferences(userId: string) {
    await this.ensureConnected();
    return PartnerPreferences.findOne({ userId }).lean();
  }

  async upsertBirthDetails(userId: string, input: BirthDetailsInput) {
    await this.ensureConnected();
    const doc = await BirthDetails.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          birthDate: new Date(input.birthDate),
          birthTime: input.birthTime.length === 5 ? `${input.birthTime}:00` : input.birthTime,
          birthTimeUnknown: input.birthTimeUnknown ?? false,
          placeName: input.placeName,
          latitude: input.latitude,
          longitude: input.longitude,
          timezone: input.timezone ?? "Asia/Kolkata",
          ayanamsha: input.ayanamsha ?? "LAHIRI",
          chartStylePreference: input.chartStylePreference ?? "NORTH",
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();
    return doc;
  }

  async getBirthDetails(userId: string) {
    await this.ensureConnected();
    return BirthDetails.findOne({ userId }).lean();
  }
}

export const profileService = new ProfileService();
