import { redirect } from "next/navigation";

import { routes } from "@/lib/constants/routes";

/** OTP login temporarily disabled — use email/password. */
export default function OtpPage() {
  redirect(routes.login);
}
