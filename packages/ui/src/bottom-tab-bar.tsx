"use client";

import React from "react";
import Link from "next/link";

export interface TabBarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

export interface BottomTabBarProps {
  items: TabBarItem[];
  className?: string;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  items,
  className = "",
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-2 py-1.5 flex items-center justify-around shadow-lg ${className}`}
    >
      {items.map((item) => {
        const isActive = !!item.active;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-sm transition-colors text-[10px] font-medium ${
              isActive
                ? "text-primary font-bold"
                : "text-text-muted hover:text-text"
            }`}
          >
            <span className={`shrink-0 ${isActive ? "text-primary" : "text-text-faint"}`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
