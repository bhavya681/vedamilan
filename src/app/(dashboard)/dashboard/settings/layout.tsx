"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Palette, Shield, Settings2 } from "lucide-react";

import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";

const SETTINGS_NAV = [
  { href: routes.settings, label: "General", icon: Settings2, exact: true },
  { href: routes.appearance, label: "Appearance", icon: Palette },
  { href: routes.privacySettings, label: "Privacy", icon: Shield },
  { href: routes.security, label: "Security", icon: Lock },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[13.5rem_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-4 lg:self-start">
        <p className="text-muted-foreground mb-3 text-[10px] font-semibold tracking-[0.16em] uppercase">
          Settings
        </p>
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
          {SETTINGS_NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/12 text-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-4 w-4", active && "text-primary")} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
