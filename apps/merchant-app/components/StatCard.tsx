"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtitle,
}: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-[10px] p-5 shadow-xs hover:border-border-strong transition-all flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {title}
        </span>
        <div className="w-8 h-8 rounded-[6px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-semibold text-text font-mono tracking-tight tabular-nums">
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
          <p className="text-[11px] text-text-faint font-medium font-sans">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
