import { redirect } from "next/navigation";

import { routes } from "@/lib/constants/routes";

/** /dashboard/kundli/yogas → full yogas & doshas view */
export default function YogasIndexRedirectPage() {
  redirect(routes.yogas);
}
