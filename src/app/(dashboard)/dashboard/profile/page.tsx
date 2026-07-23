import Link from "next/link";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/premium-cards";
import {
  ProfessionalProfileHero,
  ProfileFactGrid,
  ProfilePhotoGallery,
  ProfileSection,
  SoftPill,
  primaryPhotoUrl,
} from "@/features/profile/components/professional-profile";
import { profileService } from "@/application/profile/profile.service";
import { getSession } from "@/lib/auth/session";
import { routes } from "@/lib/constants/routes";

export const metadata = { title: "My profile" };

function formatMarital(status?: string | null) {
  if (!status) return null;
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user) redirect(routes.login);

  const bundle = await profileService.getProfileBundle(session.user.id, {
    name: session.user.name,
    email: session.user.email,
  });
  const { profile, birthDetails, preferences } = bundle;
  const photos = (profile.photos || []) as Array<{
    secureUrl?: string;
    url?: string;
    isPrimary?: boolean;
  }>;
  const photo = primaryPhotoUrl(photos);
  const displayName = profile.name || session.user.name || "Member";
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(", ");
  const headline =
    profile.headline && !String(profile.headline).toLowerCase().endsWith("'s profile")
      ? profile.headline
      : null;
  const meta = [profile.age ? `${profile.age} yrs` : null, location || null, profile.profession]
    .filter(Boolean)
    .join(" · ");

  const lifestyle = profile.lifestyle as
    { diet?: string | null; smoking?: string | null; drinking?: string | null } | undefined;

  return (
    <div className="relative mx-auto max-w-3xl space-y-5 sm:space-y-6">
      <PageHeader
        eyebrow="Your presence"
        title="My profile"
        description="This is how you appear to matches — keep it clear and current."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={routes.editProfile}>Edit profile</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={routes.matches}>See matches</Link>
            </Button>
          </div>
        }
      />

      <ProfessionalProfileHero
        name={displayName}
        headline={headline}
        meta={meta || "Add location and profession so matches can place you."}
        photo={photo}
        badges={
          <>
            {profile.isVerified ? <SoftPill>Verified</SoftPill> : null}
            {profile.completion.isComplete ? (
              <SoftPill>Profile complete</SoftPill>
            ) : (
              <SoftPill>In progress · {profile.completion.score}%</SoftPill>
            )}
            {profile.visibility ? <SoftPill>{profile.visibility}</SoftPill> : null}
            {profile.education ? <SoftPill>{profile.education}</SoftPill> : null}
          </>
        }
        actions={
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href={routes.editProfile}>Edit details & photos</Link>
            </Button>
            {!photos.length ? (
              <Button asChild variant="secondary">
                <Link href={routes.editProfile}>Add profile photo</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Profile strength"
          value={`${profile.completion.score}%`}
          hint={
            profile.completion.missing.length
              ? `Missing: ${profile.completion.missing.slice(0, 3).join(", ")}`
              : "Ready for discovery"
          }
          tone="gold"
        />
        <StatCard
          label="Photos"
          value={String(photos.length)}
          hint={photos.length ? "Primary portrait set" : "Required — add a photo to go live"}
          tone={photos.length ? "ai" : "rose"}
        />
      </div>

      <ProfileSection
        title="About"
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.editProfile}>Edit</Link>
          </Button>
        }
      >
        <p className="text-sm leading-relaxed sm:text-[15px]">
          {profile.about || "Share a short introduction so matches understand your intent."}
        </p>
      </ProfileSection>

      <ProfileSection title="Basics">
        <ProfileFactGrid
          items={[
            { label: "Age", value: profile.age },
            { label: "Height", value: profile.heightCm ? `${profile.heightCm} cm` : null },
            { label: "Location", value: location || null },
            { label: "Profession", value: profile.profession },
            { label: "Works at", value: profile.company },
            { label: "Education", value: profile.education },
            { label: "Income", value: profile.incomeRange },
            { label: "Religion", value: profile.religion },
            { label: "Community", value: profile.community },
            { label: "Mother tongue", value: profile.motherTongue },
            {
              label: "Languages",
              value: profile.languages?.length ? profile.languages.join(", ") : null,
            },
            { label: "Marital status", value: formatMarital(profile.maritalStatus) },
            { label: "Diet", value: lifestyle?.diet },
            { label: "Smoking", value: lifestyle?.smoking },
            { label: "Drinking", value: lifestyle?.drinking },
          ]}
        />
      </ProfileSection>

      <ProfileSection
        title="Birth & kundli"
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.birthDetails}>Update</Link>
          </Button>
        }
      >
        <ProfileFactGrid
          items={[
            {
              label: "Birth date",
              value: birthDetails
                ? new Date(birthDetails.birthDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : null,
            },
            { label: "Birth time", value: birthDetails?.birthTime || null },
            { label: "Birth place", value: birthDetails?.placeName || null },
            { label: "Ayanamsha", value: birthDetails?.ayanamsha || null },
          ]}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={routes.kundli}>Open my kundli</Link>
          </Button>
          {!birthDetails ? (
            <Button asChild size="sm">
              <Link href={routes.birthDetails}>Add birth details</Link>
            </Button>
          ) : null}
        </div>
      </ProfileSection>

      <ProfileSection
        title="Partner preferences"
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.preferences}>Edit</Link>
          </Button>
        }
      >
        <ProfileFactGrid
          items={[
            {
              label: "Age range",
              value: preferences ? `${preferences.ageMin}–${preferences.ageMax}` : null,
            },
            {
              label: "Cities",
              value: preferences?.cities?.length ? preferences.cities.join(", ") : null,
            },
            {
              label: "Religions",
              value: preferences?.religions?.length ? preferences.religions.join(", ") : null,
            },
          ]}
        />
        {!preferences ? (
          <p className="text-muted-foreground mt-2 text-sm">
            Set preferences to refine who appears in your match feed.
          </p>
        ) : null}
      </ProfileSection>

      <ProfilePhotoGallery photos={photos} name={displayName} />

      <ProfileSection title="Account shortcuts">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button asChild variant="outline">
            <Link href={routes.editProfile}>Edit profile</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={routes.preferences}>Preferences</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={routes.settings}>Settings</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={routes.premium}>Premium</Link>
          </Button>
        </div>
      </ProfileSection>
    </div>
  );
}
