"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutDashboard, MessageCircle, Sparkles, Stars } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";

const items = [
  { href: routes.dashboard, label: "Home", icon: LayoutDashboard },
  { href: routes.matches, label: "Matches", icon: Heart },
  { href: routes.horoscope, label: "Kundli", icon: Stars },
  { href: routes.chat, label: "Chat", icon: MessageCircle },
  { href: routes.aiInsights, label: "AI", icon: Sparkles },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-border/50 bg-background/90 fixed inset-x-0 bottom-0 z-40 border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
      aria-label="Primary workspace"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== routes.dashboard && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium transition-colors",
                  active ? "bg-primary/15 text-foreground" : "text-muted-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
