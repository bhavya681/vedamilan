import { BirthDetails, PartnerPreferences, Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { cloudinaryService } from "@/lib/services/cloudinary";
import type {
  BirthDetailsInput,
  PartnerPreferencesInput,
  ProfileUpdateInput,
} from "@/lib/validators/profile";
import { NotFoundError, ValidationError } from "@/lib/utils/error-handler";

const COMPLETION_WEIGHTS: Array<{
  key: string;
  weight: number;
  check: (p: Record<string, unknown>) => boolean;
}> = [
  { key: "about", weight: 15, check: (p) => Boolean(p.about && String(p.about).length > 40) },
  { key: "photos", weight: 25, check: (p) => Array.isArray(p.photos) && p.photos.length > 0 },
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
];

function hasProfilePhoto(profile: Record<string, unknown>): boolean {
  return Array.isArray(profile.photos) && profile.photos.length > 0;
}

export function calculateProfileCompletion(profile: Record<string, unknown>): {
  score: number;
  isComplete: boolean;
  missing: string[];
  requiresPhoto: boolean;
} {
  let score = 0;
  const missing: string[] = [];
  for (const item of COMPLETION_WEIGHTS) {
    if (item.check(profile)) score += item.weight;
    else missing.push(item.key);
  }
  const requiresPhoto = !hasProfilePhoto(profile);
  // Profile picture is mandatory — never mark complete without at least one photo.
  const isComplete = score >= 80 && !requiresPhoto;
  return { score, isComplete, missing, requiresPhoto };
}

const MAX_PROFILE_PHOTOS = 6;

function assertHttpsImageUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    throw new ValidationError("Enter a valid image URL");
  }
  if (parsed.protocol !== "https:") {
    throw new ValidationError("Image links must use HTTPS");
  }
  return parsed;
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
    const seedName = String(seed?.name || "").trim();
    if (!profile) {
      profile = await Profile.create({
        userId,
        name: seedName,
        headline: "",
        about: "",
        visibility: "MEMBERS",
      });
    } else if (seedName && !String(profile.name || "").trim()) {
      profile.name = seedName;
      await profile.save();
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
        name: String(profile.name || seed?.name || "").trim(),
        age: ageFromDob(profile.dateOfBirth as Date | null),
        completion,
      },
      preferences: preferences ?? null,
      birthDetails: birthDetails ?? null,
      user: {
        id: userId,
        name: String(profile.name || seed?.name || "").trim() || seed?.name,
        email: seed?.email,
      },
    };
  }

  async updateProfile(userId: string, input: ProfileUpdateInput) {
    await this.ensureConnected();
    await this.getOrCreateProfile(userId);

    const { completeOnboarding, ...rest } = input;
    const payload: Record<string, unknown> = { ...rest };
    if (rest.dateOfBirth) {
      payload.dateOfBirth = new Date(rest.dateOfBirth);
    }
    if (typeof rest.name === "string") {
      payload.name = rest.name.trim();
    }
    if (completeOnboarding === true) {
      payload.onboardingCompletedAt = new Date();
    }

    const updated = await Profile.findOneAndUpdate(
      { userId },
      { $set: payload },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) throw new NotFoundError("Profile not found");

    if (typeof payload.name === "string" && payload.name) {
      const { getMongoDb } = await import("@/infrastructure/database/mongodb");
      const { ObjectId } = await import("mongodb");
      const userIdFilter: object[] = [{ id: userId }, { _id: userId as never }];
      if (ObjectId.isValid(userId) && String(new ObjectId(userId)) === userId) {
        userIdFilter.push({ _id: new ObjectId(userId) });
      }
      await getMongoDb()
        .collection("user")
        .updateOne({ $or: userIdFilter }, { $set: { name: payload.name } });
    }

    const completion = calculateProfileCompletion(updated as Record<string, unknown>);
    await Profile.updateOne({ userId }, { isProfileComplete: completion.isComplete });

    return { ...updated, completion, age: ageFromDob(updated.dateOfBirth as Date | null) };
  }

  private async attachPhoto(
    userId: string,
    photo: {
      cloudinaryPublicId: string;
      url: string;
      secureUrl: string;
      width?: number | null;
      height?: number | null;
    },
    makePrimary = false,
  ) {
    const profile = await Profile.findOne({ userId });
    if (!profile) throw new NotFoundError("Profile not found");

    if (profile.photos.length >= MAX_PROFILE_PHOTOS) {
      throw new ValidationError(`You can add up to ${MAX_PROFILE_PHOTOS} photos`);
    }

    const entry = {
      ...photo,
      isPrimary: makePrimary || profile.photos.length === 0,
      sortOrder: 0,
      visibility: "MEMBERS" as const,
    };

    if (entry.isPrimary) {
      profile.photos.forEach((p) => {
        p.isPrimary = false;
      });
    }

    profile.photos.unshift(entry as never);
    const completion = calculateProfileCompletion(profile.toObject() as Record<string, unknown>);
    profile.isProfileComplete = completion.isComplete;
    await profile.save();

    return { photo: entry, completion, photos: profile.photos };
  }

  async uploadPhoto(userId: string, dataUrl: string, makePrimary = false) {
    await this.ensureConnected();
    await this.getOrCreateProfile(userId);

    if (!dataUrl.startsWith("data:image/")) {
      throw new ValidationError("Expected a valid image file");
    }

    if (cloudinaryService.isConfigured()) {
      const uploaded = await cloudinaryService.uploadImage({
        data: dataUrl,
        folder: `vedamilan/profiles/${userId}`,
      });
      return this.attachPhoto(
        userId,
        {
          cloudinaryPublicId: uploaded.public_id,
          url: uploaded.url,
          secureUrl: uploaded.secure_url,
          width: uploaded.width,
          height: uploaded.height,
        },
        makePrimary,
      );
    }

    // Local / demo fallback when Cloudinary is not configured
    const stamp = Date.now();
    return this.attachPhoto(
      userId,
      {
        cloudinaryPublicId: `local/${userId}/${stamp}`,
        url: dataUrl,
        secureUrl: dataUrl,
        width: null,
        height: null,
      },
      makePrimary,
    );
  }

  async addPhotoFromUrl(userId: string, imageUrl: string, makePrimary = false) {
    await this.ensureConnected();
    await this.getOrCreateProfile(userId);

    const parsed = assertHttpsImageUrl(imageUrl);
    const href = parsed.toString();

    if (cloudinaryService.isConfigured()) {
      try {
        const uploaded = await cloudinaryService.uploadImage({
          data: href,
          folder: `vedamilan/profiles/${userId}`,
        });
        return this.attachPhoto(
          userId,
          {
            cloudinaryPublicId: uploaded.public_id,
            url: uploaded.url,
            secureUrl: uploaded.secure_url,
            width: uploaded.width,
            height: uploaded.height,
          },
          makePrimary,
        );
      } catch {
        // Fall through to direct URL storage if remote fetch fails
      }
    }

    return this.attachPhoto(
      userId,
      {
        cloudinaryPublicId: `remote/${userId}/${Buffer.from(href).toString("base64url").slice(0, 48)}`,
        url: href,
        secureUrl: href,
        width: null,
        height: null,
      },
      makePrimary,
    );
  }

  async deletePhoto(userId: string, publicId: string) {
    await this.ensureConnected();
    const profile = await Profile.findOne({ userId });
    if (!profile) throw new NotFoundError("Profile not found");

    if (profile.photos.length <= 1) {
      throw new ValidationError(
        "Profile picture is required. Add another photo before removing this one.",
      );
    }

    const before = profile.photos.length;
    const removing = profile.photos.find((p) => p.cloudinaryPublicId === publicId);
    profile.photos = profile.photos.filter((p) => p.cloudinaryPublicId !== publicId) as never;
    if (profile.photos.length === before) throw new NotFoundError("Photo not found");

    if (
      removing?.cloudinaryPublicId &&
      !removing.cloudinaryPublicId.startsWith("local/") &&
      !removing.cloudinaryPublicId.startsWith("remote/")
    ) {
      try {
        await cloudinaryService.deleteAsset(publicId);
      } catch {
        // Continue DB cleanup even if Cloudinary delete fails
      }
    }

    if (profile.photos.length > 0 && !profile.photos.some((p) => p.isPrimary)) {
      const first = profile.photos[0];
      if (first) first.isPrimary = true;
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
