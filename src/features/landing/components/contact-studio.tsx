"use client";

import Link from "next/link";
import { FormEvent, useState, type ReactNode } from "react";
import { Loader2, Mail } from "lucide-react";

import WorldMap from "@/components/ui/world-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { brand } from "@/lib/constants/brand";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const INDIA = { lat: 21.15, lng: 79.09 };

const fieldClass =
  "border-border/50 bg-muted/70 h-12 rounded-xl shadow-none dark:border-transparent dark:bg-[#0c0a08]";

type FormState = {
  name: string;
  email: string;
  company: string;
  message: string;
  website: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  company: "",
  message: "",
  website: "",
};

export function ContactStudio() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await res.json()) as {
        success?: boolean;
        error?: { message?: string };
      };
      if (!json.success) {
        setError(json.error?.message || "Unable to send your message. Please try again.");
        return;
      }
      setDone(true);
      setForm(emptyForm);
    } catch {
      setError("Network error. Please try again, or email us directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] xl:gap-16">
      <div className="flex min-w-0 flex-col lg:min-h-[34rem]">
        <div className="relative mb-7 inline-flex w-fit">
          <span className="bg-gold/45 absolute inset-x-1 -bottom-1 h-3 rounded-full blur-md" />
          <span className="border-border bg-card shadow-soft relative flex h-11 w-11 items-center justify-center rounded-xl border">
            <Mail className="text-gold h-5 w-5" aria-hidden />
          </span>
        </div>

        <h1 className="font-display text-foreground text-[2.15rem] tracking-tight text-balance sm:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
          Contact us
        </h1>
        <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed sm:text-base">
          We are always looking for ways to improve our products and services. Contact us and let us
          know how we can help you.
        </p>

        <div className="mt-8 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-0">
          <a
            className="text-foreground/80 hover:text-foreground transition-colors"
            href={`mailto:${brand.supportEmail}`}
          >
            {brand.supportEmail}
          </a>
          <Dot />
          <Link
            className="text-foreground/80 hover:text-foreground transition-colors"
            href={routes.help}
          >
            Help center
          </Link>
          <Dot />
          <span className="text-muted-foreground">Usually one business day</span>
        </div>

        <div className="mt-10 w-full min-w-0 lg:mt-auto">
          <WorldMap
            className="max-w-xl lg:max-w-none"
            pin={{ ...INDIA, label: "We are here" }}
            lineColor="#D4AF37"
          />
        </div>
      </div>

      <div className="border-border/60 bg-card shadow-elevated relative min-w-0 overflow-hidden rounded-2xl border p-5 sm:p-7 dark:border-white/8 dark:bg-[#16120e]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_62%)] opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in srgb, var(--foreground) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 8%, transparent) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {done ? (
          <div className="relative space-y-4 py-8">
            <p className="font-display text-2xl">Thank you</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We received your message and will reply within one business day. For a faster note,
              write to{" "}
              <a
                className="text-foreground underline-offset-4 hover:underline"
                href={`mailto:${brand.supportEmail}`}
              >
                {brand.supportEmail}
              </a>
              .
            </p>
            <Button type="button" variant="outline" onClick={() => setDone(false)}>
              Send another
            </Button>
          </div>
        ) : (
          <form className="relative space-y-5" onSubmit={onSubmit} noValidate>
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(event) => update("website", event.target.value)}
              />
            </div>

            <Field label="Full name" htmlFor="contact-name">
              <Input
                id="contact-name"
                name="name"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                placeholder="Aditya Sharma"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                className={fieldClass}
              />
            </Field>

            <Field label="Email Address" htmlFor="contact-email">
              <Input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="aditya.sharma@email.com"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                className={fieldClass}
              />
            </Field>

            <Field label="Company" htmlFor="contact-company">
              <Input
                id="contact-company"
                name="company"
                autoComplete="organization"
                placeholder="Optional"
                value={form.company}
                onChange={(event) => update("company", event.target.value)}
                className={fieldClass}
              />
            </Field>

            <Field label="Message" htmlFor="contact-message">
              <Textarea
                id="contact-message"
                name="message"
                required
                minLength={10}
                maxLength={4000}
                placeholder="Type your message here"
                value={form.message}
                onChange={(event) => update("message", event.target.value)}
                className={cn(fieldClass, "min-h-[8.5rem] py-3")}
              />
            </Field>

            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="border-border/70 bg-muted text-foreground hover:bg-muted/80 dark:text-ivory min-w-[7.5rem] dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/12"
              variant="outline"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {loading ? "Sending" : "Submit"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-foreground/90 text-[13px] font-medium">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Dot() {
  return (
    <span
      className="bg-foreground/30 mx-3 hidden h-1 w-1 shrink-0 rounded-full sm:inline-block"
      aria-hidden
    />
  );
}
