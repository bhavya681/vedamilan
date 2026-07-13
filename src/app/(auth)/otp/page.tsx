"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { routes } from "@/lib/constants/routes";

export default function OtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const code = useMemo(() => otp.join(""), [otp]);

  async function sendCode(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    if (mode === "email") {
      const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
        email: destination,
        type: "sign-in",
      });
      setLoading(false);
      if (sendError) {
        setError(sendError.message || "Unable to send OTP");
        return;
      }
    } else {
      const { error: sendError } = await authClient.phoneNumber.sendOtp({
        phoneNumber: destination,
      });
      setLoading(false);
      if (sendError) {
        setError(sendError.message || "Unable to send OTP");
        return;
      }
    }
    setSent(true);
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    if (mode === "email") {
      const { error: verifyError } = await authClient.signIn.emailOtp({
        email: destination,
        otp: code,
      });
      setLoading(false);
      if (verifyError) {
        setError(verifyError.message || "Invalid OTP");
        return;
      }
    } else {
      const { error: verifyError } = await authClient.phoneNumber.verify({
        phoneNumber: destination,
        code,
      });
      setLoading(false);
      if (verifyError) {
        setError(verifyError.message || "Invalid OTP");
        return;
      }
    }
    router.push(routes.dashboard);
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display text-2xl">Enter OTP</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        We will send a 6-digit code to your {mode === "email" ? "email" : "phone"}. In development,
        the code is printed in the server console.
      </p>
      <div className="mt-4 flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "email" ? "default" : "outline"}
          onClick={() => setMode("email")}
        >
          Email
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "phone" ? "default" : "outline"}
          onClick={() => setMode("phone")}
        >
          Phone
        </Button>
      </div>

      {!sent ? (
        <form className="mt-6 space-y-4" onSubmit={sendCode}>
          <div className="space-y-2">
            <Label htmlFor="destination">{mode === "email" ? "Email" : "Phone"}</Label>
            <Input
              id="destination"
              name="destination"
              placeholder={mode === "email" ? "you@email.com" : "+91 98XXX XXXXX"}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send OTP"}
          </Button>
        </form>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={verifyCode}>
          <div className="flex justify-between gap-2" role="group" aria-label="One-time password">
            {otp.map((digit, index) => (
              <Input
                key={index}
                inputMode="numeric"
                maxLength={1}
                className="h-12 w-11 text-center text-lg"
                value={digit}
                aria-label={`Digit ${index + 1}`}
                onChange={(event) => {
                  const next = [...otp];
                  next[index] = event.target.value.slice(-1);
                  setOtp(next);
                }}
              />
            ))}
          </div>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading || code.length < 6}>
            {loading ? "Verifying…" : "Verify OTP"}
          </Button>
        </form>
      )}

      <p className="text-muted-foreground mt-4 text-center text-sm">
        <Link href={routes.login} className="text-primary hover:underline">
          Back to password sign in
        </Link>
      </p>
    </div>
  );
}
