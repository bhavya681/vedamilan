import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  ProfessionalProfileHero,
  ProfileFactGrid,
  ProfileLayout,
  ProfilePageFrame,
  ProfilePhotoGallery,
  ProfileSection,
  ProfileStatStrip,
  SoftPill,
} from "@/features/profile/components/professional-profile";
import { primaryPhotoUrl } from "@/features/profile/profile-photo";
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

  const lifestyle = profile.lifestyle as
    { diet?: string | null; smoking?: string | null; drinking?: string | null } | undefined;

  return (
    <ProfilePageFrame>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
            Your presence
          </p>
          <h1 className="font-display mt-1 text-2xl tracking-tight sm:text-3xl">My profile</h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">
            This is how matches see you — keep it polished and current.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={routes.editProfile}>Edit profile</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={routes.matches}>See matches</Link>
          </Button>
        </div>
      </div>

      <ProfessionalProfileHero
        name={displayName}
        headline={headline}
        location={location || null}
        profession={profile.profession}
        education={profile.education}
        verified={Boolean(profile.isVerified)}
        photo={photo}
        eyebrow="Member profile"
        badges={
          <>
            {profile.completion.isComplete ? (
              <SoftPill tone="success">Profile complete</SoftPill>
            ) : (
              <SoftPill tone="gold">In progress · {profile.completion.score}%</SoftPill>
            )}
            {profile.visibility ? <SoftPill>{profile.visibility}</SoftPill> : null}
            {profile.motherTongue ? <SoftPill>{profile.motherTongue}</SoftPill> : null}
          </>
        }
        actions={
          <>
            <Button asChild className="w-full">
              <Link href={routes.editProfile}>Edit details</Link>
            </Button>
            {!photos.length ? (
              <Button asChild variant="secondary" className="w-full">
                <Link href={routes.editProfile}>Add photo</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link href={routes.kundli}>My kundli</Link>
              </Button>
            )}
          </>
        }
      />

      <ProfileStatStrip
        items={[
          {
            label: "Strength",
            value: `${profile.completion.score}%`,
            hint: profile.completion.missing.length
              ? `Missing: ${profile.completion.missing.slice(0, 2).join(", ")}`
              : "Ready for discovery",
          },
          {
            label: "Photos",
            value: String(photos.length),
            hint: photos.length ? "Portrait on file" : "Add a clear photo",
          },
          {
            label: "Visibility",
            value: String(profile.visibility || "—"),
            hint: profile.isVerified ? "Verified member" : "Complete profile to verify",
          },
        ]}
      />

      <ProfileLayout
        main={
          <>
            <ProfileSection
              title="About"
              description="Your introduction to potential matches."
              action={
                <Button asChild variant="ghost" size="sm">
                  <Link href={routes.editProfile}>Edit</Link>
                </Button>
              }
            >
              <p className="text-[15px] leading-relaxed sm:text-base">
                {profile.about ||
                  "Share a short introduction so matches understand your values and intent."}
              </p>
            </ProfileSection>

            <ProfileSection title="Personal details" description="Core facts from your profile.">
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

            <ProfilePhotoGallery photos={photos} name={displayName} />

            <ProfileSection
              title="Birth & kundli"
              description="Used for chart generation and match ranking."
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
          </>
        }
        aside={
          <>
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
                <p className="text-muted-foreground mt-3 text-sm">
                  Set preferences to refine your match feed.
                </p>
              ) : null}
            </ProfileSection>

            <ProfileSection title="Shortcuts">
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="justify-start">
                  <Link href={routes.editProfile}>Edit profile & photos</Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href={routes.preferences}>Partner preferences</Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href={routes.birthDetails}>Birth details</Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href={routes.settings}>Account settings</Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href={routes.premium}>Premium</Link>
                </Button>
              </div>
            </ProfileSection>
          </>
        }
      />
    </ProfilePageFrame>
  );
}
