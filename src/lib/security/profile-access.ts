import { Profile } from "@/infrastructure/database/models";
import { connectMongo } from "@/infrastructure/database/mongodb";
import { relationshipService } from "@/application/relationship/relationship.service";
import { ForbiddenError, NotFoundError } from "@/lib/utils/error-handler";

/**
 * Server-side gate for viewing / comparing another member's profile.
 * Enforces blocks and HIDDEN visibility (connections may still access).
 */
export async function assertCandidateAccessible(viewerUserId: string, candidateUserId: string) {
  if (!candidateUserId || viewerUserId === candidateUserId) {
    throw new ForbiddenError("This profile is not available");
  }

  await connectMongo();

  if (await relationshipService.isBlockedEitherWay(viewerUserId, candidateUserId)) {
    throw new ForbiddenError("This profile is not available");
  }

  const profile = await Profile.findOne({
    userId: candidateUserId,
    status: "ACTIVE",
  }).lean();

  if (!profile) {
    throw new NotFoundError("Profile not found");
  }

  if (profile.visibility === "HIDDEN") {
    const connected = await relationshipService.areConnected(viewerUserId, candidateUserId);
    if (!connected) {
      throw new ForbiddenError("This profile is not available");
    }
  }

  return profile;
}
