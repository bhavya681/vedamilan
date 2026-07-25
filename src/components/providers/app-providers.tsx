"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppearanceProvider } from "@/components/providers/appearance-provider";
import { WorkspaceModeProvider } from "@/components/providers/workspace-mode-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { Toaster } from "@/components/ui/sonner";
import type { MessageTree } from "@/lib/i18n/translate";
import type { AppLocale, MessageNamespace } from "@/lib/i18n/locales";

export function AppProviders({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: AppLocale;
  messages: Record<MessageNamespace, MessageTree>;
}) {
  return (
    <I18nProvider locale={locale} messages={messages}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AppearanceProvider>
          <WorkspaceModeProvider>
            <QueryProvider>
              {children}
              <Toaster richColors closeButton position="top-right" />
            </QueryProvider>
          </WorkspaceModeProvider>
        </AppearanceProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
