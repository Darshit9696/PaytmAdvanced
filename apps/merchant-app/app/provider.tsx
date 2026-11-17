"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@repo/ui";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="system">
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
};
