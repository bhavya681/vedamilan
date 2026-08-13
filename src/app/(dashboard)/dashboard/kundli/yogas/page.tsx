import { redirect } from "next/navigation";

import { routes } from "@/lib/constants/routes";

/** /dashboard/kundli/yogas → unified yogas view */
export default function YogasIndexRedirectPage() {
  redirect(routes.astrologyYogas);
}
