"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, useSession } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";

export default function VerifyEmailPage() {
  const { data } = useSession();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const targetEmail = data?.user?.email || email;

  async function resend() {
    setError(null);
    setMessage(null);
    if (!targetEmail) {
      setError("Enter your email to resend verification.");
      return;
    }
    setLoading(true);
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email: targetEmail,
      type: "email-verification",
    });
    setLoading(false);
    if (sendError) {
      setError(sendError.message || "Unable to resend");
      return;
    }
    setMessage("Verification code sent. In development, check the server console.");
  }

  async function verify() {
    setError(null);
    setMessage(null);
    if (!targetEmail || !otp) {
      setError("Email and code are required.");
      return;
    }
    setLoading(true);
    const { error: verifyError } = await authClient.emailOtp.verifyEmail({
      email: targetEmail,
      otp,
    });
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message || "Invalid code");
      return;
    }
    setMessage("Email verified. You can continue to your dashboard.");
  }

  return (
    <div className="text-center">
      <div className="bg-primary/15 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-full">
        <MailCheck className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="font-display mt-4 text-2xl">Verify your email</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Enter the 6-digit code we sent, or open the verification link from your inbox.
      </p>
      <div className="mt-6 space-y-3 text-left">
        {!data?.user?.email ? (
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="otp">Verification code</Label>
          <Input
            id="otp"
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />
        </div>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {message ? <p className="text-emerald text-sm">{message}</p> : null}
        <Button type="button" className="w-full" onClick={verify} disabled={loading}>
          Verify email
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={resend}
          disabled={loading}
        >
          Resend code
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link href={routes.dashboard}>Continue to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
