"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "paypulse-theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeScript() {
  const scriptContent = `(function() {
    try {
      var stored = localStorage.getItem("${STORAGE_KEY}") || localStorage.getItem("theme");
      var mql = window.matchMedia("(prefers-color-scheme: dark)");
      var systemDark = mql.matches;
      var resolved = "light";
      if (stored === "dark") {
        resolved = "dark";
      } else if (stored === "light") {
        resolved = "light";
      } else if (stored === "system" || !stored) {
        resolved = systemDark ? "dark" : "light";
      }
      var root = document.documentElement;
      root.setAttribute("data-theme", resolved);
      if (resolved === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      root.style.colorScheme = resolved;
    } catch (e) {}
  })();`;

  return (
    <script
      id="paypulse-theme-script"
      dangerouslySetInnerHTML={{ __html: scriptContent }}
    />
  );
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = STORAGE_KEY,
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      const stored = (localStorage.getItem(storageKey) || localStorage.getItem("theme")) as Theme | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    } catch {
      // Ignore localStorage access errors
    }
    return defaultTheme;
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Listen to system preference changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    setSystemIsDark(mql.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (theme === "system") {
      return systemIsDark ? "dark" : "light";
    }
    return theme;
  }, [theme, systemIsDark]);

  // Apply attributes to <html>
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    root.setAttribute("data-theme", resolvedTheme);
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  // Listen to localStorage events from other tabs
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        const val = e.newValue as Theme;
        if (val === "light" || val === "dark" || val === "system") {
          setThemeState(val);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(storageKey, newTheme);
      // For backwards compatibility
      localStorage.setItem("theme", newTheme);
    } catch {
      // Ignore localStorage write errors
    }
  };

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback for components rendered outside ThemeProvider
    return {
      theme: "light",
      resolvedTheme: "light",
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
