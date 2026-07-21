import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-shell";
import { GlassCard, StatCard } from "@/components/ui/premium-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { profileService } from "@/application/profile/profile.service";
import { routes } from "@/lib/constants/routes";

export const metadata = { title: "Profile" };

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
    isPrimary?: boolean;
  }>;
  const primaryPhoto = photos.find((p) => p.isPrimary)?.secureUrl || photos[0]?.secureUrl || null;

  return (
    <div className="relative space-y-8">
      <PageHeader
        eyebrow="Identity"
        title="Your profile"
        description="A calm portrait of who you are—values, planets, and relationship intent."
        actions={
          <Button asChild>
            <Link href={routes.editProfile}>Edit profile</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="overflow-hidden p-0">
          <div className="bg-navy relative aspect-[16/10] w-full">
            {primaryPhoto ? (
              <Image
                src={primaryPhoto}
                alt=""
                fill
                unoptimized={
                  primaryPhoto.startsWith("data:") ||
                  (!primaryPhoto.includes("res.cloudinary.com") &&
                    !primaryPhoto.includes("images.unsplash.com") &&
                    !primaryPhoto.includes("upload.wikimedia.org"))
                }
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover opacity-90"
              />
            ) : (
              <div className="from-navy absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br to-[#1a3a6b] p-6 text-center">
                <p className="text-ivory/90 text-sm font-medium">Profile picture required</p>
                <p className="text-ivory/65 max-w-sm text-xs">
                  Add a clear photo to complete your profile and appear in matches.
                </p>
                <Button asChild size="sm" variant="secondary">
                  <Link href={routes.editProfile}>Upload photo</Link>
                </Button>
              </div>
            )}
            <div className="from-navy via-navy/20 absolute inset-0 bg-gradient-to-t to-transparent" />
            <div className="text-ivory absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl sm:text-4xl">
                    {session.user.name || "Member"}
                  </h2>
                  <p className="text-ivory/75 mt-2 text-sm">
                    {[profile.age, profile.city, profile.profession].filter(Boolean).join(" · ") ||
                      "Complete your profile to appear in discovery"}
                  </p>
                </div>
                <div className="border-gold/40 bg-navy/50 flex h-16 w-16 items-center justify-center rounded-full border backdrop-blur-md">
                  <span className="font-display text-gold text-xl">{profile.completion.score}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <Badge>{profile.visibility}</Badge>
              {profile.isVerified ? <Badge variant="secondary">Verified</Badge> : null}
              {profile.education ? <Badge variant="outline">{profile.education}</Badge> : null}
              {profile.completion.isComplete ? (
                <Badge variant="secondary">Profile complete</Badge>
              ) : (
                <Badge variant="outline">In progress</Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
              {profile.about || "Share a short introduction so matches understand your intent."}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-[11px] tracking-[0.16em] uppercase">
                  Birth
                </p>
                <p className="mt-1 text-sm">
                  {birthDetails
                    ? `${new Date(birthDetails.birthDate).toLocaleDateString("en-IN")} · ${birthDetails.birthTime}`
                    : "Not set"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {birthDetails?.placeName || "Add birth place for kundli"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px] tracking-[0.16em] uppercase">
                  Preferences
                </p>
                <p className="mt-1 text-sm">
                  {preferences ? `Age ${preferences.ageMin}–${preferences.ageMax}` : "Not set"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {preferences?.cities?.length
                    ? preferences.cities.join(" · ")
                    : "Add partner cities"}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
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
            value={String(profile.photos?.length ?? 0)}
            hint={
              profile.photos?.length ? "Primary portrait set" : "Required — add a photo to go live"
            }
            tone={profile.photos?.length ? "ai" : "rose"}
          />
          <GlassCard>
            <p className="text-sm font-medium">Next steps</p>
            <div className="mt-4 flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link href={routes.editProfile}>Edit details & photos</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={routes.preferences}>Partner preferences</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={routes.birthDetails}>Birth details</Link>
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
