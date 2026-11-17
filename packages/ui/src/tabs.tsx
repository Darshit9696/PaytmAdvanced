"use client";

import React from "react";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  badge?: number | string;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
  size?: "sm" | "md";
}

export function Tabs<T extends string = string>({
  tabs,
  activeId,
  onChange,
  className = "",
  size = "md",
}: TabsProps<T>) {
  const sizeClasses = {
    sm: "p-0.5 text-xs",
    md: "p-1 text-xs",
  };

  const itemSizeClasses = {
    sm: "px-2.5 py-1",
    md: "px-3.5 py-1.5",
  };

  return (
    <div
      role="tablist"
      className={`inline-flex items-center bg-surface-subtle border border-border rounded-sm ${sizeClasses[size]} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 font-medium rounded-xs transition-all duration-150 cursor-pointer select-none ${
              itemSizeClasses[size]
            } ${
              isActive
                ? "bg-surface text-text font-semibold shadow-xs border border-border/80"
                : "text-text-muted hover:text-text"
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? "bg-primary-tint text-primary"
                    : "bg-surface text-text-faint"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
