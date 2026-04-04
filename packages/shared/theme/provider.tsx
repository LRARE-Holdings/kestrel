"use client";

import { ThemeProvider as BaseThemeProvider } from "@wrksz/themes/next";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <BaseThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="kestrel-theme"
    >
      {children}
    </BaseThemeProvider>
  );
}
