"use client";

import { Languages } from "lucide-react";

import { switchLocale } from "@/components/i18n/locale-navigation";
import { useLocale, useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_LOCALES, LOCALE_META, type AppLocale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
  variant?: "default" | "ghost" | "outline" | "secondary";
  align?: "start" | "center" | "end";
  /** Compact control for navbars */
  compact?: boolean;
  onChanged?: (locale: AppLocale) => void;
};

export function LanguageSelector({
  className,
  variant = "outline",
  align = "end",
  compact,
  onChanged,
}: Props) {
  const locale = useLocale();
  const t = useT();
  const current = LOCALE_META[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={compact ? "sm" : "default"}
          className={cn("gap-2", className)}
          aria-label={`Language: ${current.nativeName}`}
        >
          <Languages className="h-4 w-4 shrink-0" aria-hidden />
          <span className={cn(compact && "max-w-[7.5rem] truncate")}>{current.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="max-h-80 w-56 overflow-y-auto">
        <DropdownMenuLabel>{t("common.language")}</DropdownMenuLabel>
        {APP_LOCALES.map((code) => {
          const meta = LOCALE_META[code];
          const active = code === locale;
          return (
            <DropdownMenuItem
              key={code}
              className={cn("flex flex-col items-start gap-0.5", active && "bg-primary/10")}
              onSelect={() => {
                onChanged?.(code);
                if (code !== locale) switchLocale(code);
              }}
              aria-current={active ? "true" : undefined}
            >
              <span className="font-medium">{meta.nativeName}</span>
              <span className="text-muted-foreground text-xs">{meta.englishName}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
