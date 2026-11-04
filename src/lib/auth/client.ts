import { createAuthClient } from "better-auth/react";
import { adminClient, emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || undefined,
  plugins: [adminClient(), emailOTPClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
