"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  change,
  isPositive = true,
  subtitle,
}: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-[10px] p-5 flex flex-col justify-between space-y-2">
      <span className="text-xs font-medium text-text-muted">
        {title}
      </span>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-medium text-text font-mono tracking-tight tabular-nums">
          {value}
        </div>
        {change && (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            {isPositive ? (
              <span className="text-success flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> {change}
              </span>
            ) : (
              <span className="text-danger flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> {change}
              </span>
            )}
          </div>
        )}
        {subtitle && (
          <p className="text-xs text-text-faint font-normal">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
