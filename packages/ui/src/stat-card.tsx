"use client";

import React from "react";
import { Amount } from "./amount";
import { Badge } from "./badge";

export interface StatCardProps {
  title: string;
  value: number | string;
  isCurrency?: boolean;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  isCurrency = false,
  change,
  isPositive,
  subtitle,
  icon,
  className = "",
}) => {
  return (
    <div
      className={`bg-surface border border-border rounded-md p-5 shadow-xs flex flex-col justify-between space-y-3 transition-colors hover:border-border-strong ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted select-none">
          {title}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-sm bg-surface-subtle border border-border flex items-center justify-center text-text-muted shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl font-bold tracking-tight text-text">
          {isCurrency && typeof value === "number" ? (
            <Amount value={value} size="2xl" />
          ) : (
            <span className="font-mono tabular-nums">{value}</span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {change && (
            <Badge
              variant={isPositive ? "success" : isPositive === false ? "danger" : "neutral"}
              size="sm"
            >
              {change}
            </Badge>
          )}

          {subtitle && (
            <span className="text-[11px] text-text-faint">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
};
