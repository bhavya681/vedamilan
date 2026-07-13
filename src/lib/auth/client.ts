import { createAuthClient } from "better-auth/react";
import { adminClient, emailOTPClient, phoneNumberClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [adminClient(), emailOTPClient(), phoneNumberClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
