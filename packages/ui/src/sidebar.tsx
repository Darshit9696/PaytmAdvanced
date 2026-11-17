"use client";

import React from "react";
import Link from "next/link";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: number | string;
}

export interface SidebarProps {
  brand: {
    name: string;
    subname?: string;
    logo?: React.ReactNode;
    href?: string;
  };
  items: NavItem[];
  footer?: React.ReactNode;
  className?: string;
  theme?: "light" | "dark"; // dark for merchant-app ink-green sidebar
}

export const Sidebar: React.FC<SidebarProps> = ({
  brand,
  items,
  footer,
  className = "",
  theme = "light",
}) => {
  const isDark = theme === "dark";

  return (
    <aside
      className={`w-60 flex flex-col p-4 border-r shrink-0 transition-colors ${
        isDark
          ? "bg-[#0F3D33] text-white border-[#174B3F]"
          : "bg-surface text-text border-border"
      } ${className}`}
    >
      {/* Brand Header */}
      <Link
        href={brand.href || "/"}
        className="flex items-center gap-2.5 px-3 py-2 mb-6 group rounded-sm"
      >
        {brand.logo ? (
          brand.logo
        ) : (
          <div
            className={`w-8 h-8 rounded-sm flex items-center justify-center font-bold text-sm ${
              isDark
                ? "bg-accent text-accent-fg"
                : "bg-primary text-primary-fg"
            }`}
          >
            {brand.name.charAt(0)}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight">{brand.name}</span>
          {brand.subname && (
            <span
              className={`text-[10px] tracking-wide uppercase font-medium -mt-0.5 ${
                isDark ? "text-accent/90" : "text-text-muted"
              }`}
            >
              {brand.subname}
            </span>
          )}
        </div>
      </Link>

      {/* Nav List */}
      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const isActive = !!item.active;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-sm text-xs font-medium transition-all duration-150 ${
                isActive
                  ? isDark
                    ? "bg-[#174B3F] text-white font-semibold shadow-xs"
                    : "bg-primary-tint text-primary font-semibold shadow-xs"
                  : isDark
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-text-muted hover:text-text hover:bg-surface-subtle"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? isDark
                        ? "bg-accent text-accent-fg font-bold"
                        : "bg-primary text-primary-fg font-bold"
                      : isDark
                        ? "bg-white/20 text-white"
                        : "bg-surface-subtle text-text-faint"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {footer && (
        <div
          className={`pt-4 border-t mt-4 ${
            isDark ? "border-[#174B3F]" : "border-border"
          }`}
        >
          {footer}
        </div>
      )}
    </aside>
  );
};
