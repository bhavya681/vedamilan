import { redirect } from "next/navigation";

import { panchangaHref } from "@/lib/constants/routes";

/** /dashboard/astrology/muhurta → unified Panchanga & Muhurta studio */
export default function AstrologyMuhurtaRedirectPage() {
  redirect(panchangaHref({ tab: "muhurta" }));
}
