import { redirect } from "next/navigation";

import { routes } from "@/lib/constants/routes";

/** Legacy path — Raja Yogas lives at /dashboard/kundli/raja-yogas */
export default function RajaYogasLegacyRedirectPage() {
  redirect(routes.rajaYogas);
}
