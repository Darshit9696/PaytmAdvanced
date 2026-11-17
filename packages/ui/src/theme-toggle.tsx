"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sun, Moon, Monitor, ChevronDown, Check } from "lucide-react";
import { useTheme, Theme } from "./theme-provider";

export interface ThemeToggleProps {
  variant?: "icon" | "dropdown" | "segmented";
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  variant = "icon",
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!mounted) {
    // Render placeholder with same dimensions to avoid layout shift
    return (
      <div
        className={`w-8 h-8 rounded-md bg-surface-subtle border border-border opacity-60 ${className}`}
        aria-hidden="true"
      />
    );
  }

  // 1. Segmented Control Variant (Ideal for Profile/Settings pages)
  if (variant === "segmented") {
    const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
      { value: "light", label: "Light", icon: <Sun className="w-3.5 h-3.5" /> },
      { value: "system", label: "System", icon: <Monitor className="w-3.5 h-3.5" /> },
      { value: "dark", label: "Dark", icon: <Moon className="w-3.5 h-3.5" /> },
    ];

    return (
      <div
        className={`inline-flex items-center p-1 bg-surface-subtle border border-border rounded-md text-xs font-medium ${className}`}
        role="radiogroup"
        aria-label="Color theme"
      >
        {options.map((opt) => {
          const isSelected = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] transition-all cursor-pointer ${
                isSelected
                  ? "bg-surface text-text font-semibold shadow-xs border border-border"
                  : "text-text-muted hover:text-text hover:bg-surface/50 border border-transparent"
              }`}
            >
              <span className={isSelected ? "text-primary" : "text-text-faint"}>
                {opt.icon}
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 2. Dropdown Menu Variant
  if (variant === "dropdown") {
    const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
      { value: "light", label: "Light Mode", icon: <Sun className="w-4 h-4 text-amber-500" /> },
      { value: "dark", label: "Dark Mode", icon: <Moon className="w-4 h-4 text-cyan-400" /> },
      { value: "system", label: "System Default", icon: <Monitor className="w-4 h-4 text-text-muted" /> },
    ];

    return (
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-surface hover:bg-surface-subtle border border-border text-xs text-text transition-colors cursor-pointer"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label="Select theme"
        >
          {resolvedTheme === "dark" ? (
            <Moon className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          )}
          {showLabel && (
            <span className="capitalize text-text font-medium">{theme}</span>
          )}
          <ChevronDown className="w-3 h-3 text-text-muted" />
        </button>

        {isOpen && (
          <div
            className="absolute right-0 mt-1.5 w-40 bg-surface border border-border rounded-md shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
            role="listbox"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                  theme === opt.value
                    ? "bg-primary-tint text-primary font-medium"
                    : "text-text hover:bg-surface-subtle"
                }`}
                role="option"
                aria-selected={theme === opt.value}
              >
                <div className="flex items-center gap-2">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                {theme === opt.value && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 3. Compact Icon Toggle Button (Default)
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-8 h-8 rounded-md bg-surface hover:bg-surface-subtle border border-border text-text transition-colors cursor-pointer group ${className}`}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="sr-only">Toggle theme</span>
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
      )}
    </button>
  );
}
