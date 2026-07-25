import Link from "next/link";

import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const DEFAULT_LINKS = [
  {
    href: `${routes.vedicWisdom}/vidura/chat?topic=${encodeURIComponent("Communication")}`,
    label: "Ask Vidura about communication",
  },
  {
    href: `${routes.vedicWisdom}/krishna/chat?topic=${encodeURIComponent("Duty")}`,
    label: "Ask Krishna about dharma",
  },
  {
    href: `${routes.vedicWisdom}/chanakya/voice`,
    label: "Start voice with Chanakya",
  },
] as const;

/** Bridge from compatibility → reflective wisdom conversations */
export function WisdomCompatibilityBridge({
  className,
  title = "Reflect with Vedic Wisdom",
  description = "Your compatibility insight can become a calmer conversation. Explore principles — not predictions.",
}: {
  className?: string;
  title?: string;
  description?: string;
}) {
  return (
    <section className={cn("border-border/60 space-y-3 border-t pt-8", className)}>
      <h2 className="font-display text-xl">{title}</h2>
      <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">{description}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {DEFAULT_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="border-border/60 hover:border-foreground/25 inline-flex items-center rounded-xl border px-4 py-2 text-sm transition-colors"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href={routes.askTheSages}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
        >
          Ask the Sages
        </Link>
      </div>
    </section>
  );
}
