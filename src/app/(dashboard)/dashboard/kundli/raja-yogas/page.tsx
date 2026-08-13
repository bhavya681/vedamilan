import { redirect } from "next/navigation";

import { routes } from "@/lib/constants/routes";

/** /dashboard/kundli/raja-yogas → unified yogas view */
export default function RajaYogasRedirectPage() {
  redirect(routes.astrologyYogas);
}
