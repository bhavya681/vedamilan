"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppearanceProvider } from "@/components/providers/appearance-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AppearanceProvider>
        <QueryProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </QueryProvider>
      </AppearanceProvider>
    </ThemeProvider>
  );
}
