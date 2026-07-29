import { redirect } from "next/navigation";

import { routes } from "@/lib/constants/routes";

/** Legacy human-expert placeholder — send members to the virtual roster. */
export default function AstrologerPage() {
  redirect(routes.consultation);
}
