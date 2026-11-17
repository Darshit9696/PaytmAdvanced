"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Amount } from "@repo/ui";

interface DayData {
  day: string;
  amount: number;
  transactions: number;
}

const DEFAULT_DAYS: DayData[] = [
  { day: "Mon", amount: 0, transactions: 0 },
  { day: "Tue", amount: 0, transactions: 0 },
  { day: "Wed", amount: 0, transactions: 0 },
  { day: "Thu", amount: 0, transactions: 0 },
  { day: "Fri", amount: 0, transactions: 0 },
  { day: "Sat", amount: 0, transactions: 0 },
  { day: "Sun", amount: 0, transactions: 0 },
];

export function RevenueChart() {
  const [data, setData] = useState<DayData[]>(DEFAULT_DAYS);
  const [totalWeekly, setTotalWeekly] = useState<number>(0);
  const [changePercentage, setChangePercentage] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBar, setActiveBar] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/merchant/dashboard");
        if (!res.ok) {
          throw new Error(`Failed to fetch revenue data (${res.status})`);
        }
        const json = await res.json();
        if (isMounted) {
          if (Array.isArray(json.data) && json.data.length > 0) {
            setData(json.data);
          }
          if (typeof json.totalWeekly === "number") {
            setTotalWeekly(json.totalWeekly);
          } else if (Array.isArray(json.data)) {
            setTotalWeekly(
              json.data.reduce((sum: number, d: DayData) => sum + (d.amount || 0), 0)
            );
          }
          setChangePercentage(json.changePercentage ?? null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to load revenue data:", err);
          setError(err.message || "Failed to load revenue data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRevenueData();

    return () => {
      isMounted = false;
    };
  }, []);

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="bg-surface border border-border rounded-[10px] p-6 shadow-xs space-y-5 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[6px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">Settlement & Sales Velocity</h3>
            <p className="text-xs text-text-muted">7-day gross customer transaction volume</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-text-muted">
            <Calendar className="w-3.5 h-3.5 text-text-faint" />
            <span>7-Day Volume:</span>
            <Amount value={totalWeekly} size="sm" weight="semibold" />
          </div>
          {changePercentage !== null && (
            <span
              className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium border flex items-center gap-1 ${
                changePercentage >= 0
                  ? "bg-success-subtle/50 text-success border-success/30"
                  : "bg-danger-subtle/50 text-danger border-danger/30"
              }`}
            >
              {changePercentage >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {changePercentage > 0 ? "+" : ""}
              {changePercentage}%
            </span>
          )}
        </div>
      </div>

      {/* Active Bar Inspector Banner */}
      <div className="h-8 bg-surface-subtle border border-border rounded-[6px] px-3 flex items-center justify-between text-xs">
        {activeBar !== null && data[activeBar] ? (
          <>
            <span className="text-text-muted">
              <strong className="text-text">{data[activeBar].day}</strong> Activity:
            </span>
            <div className="flex items-center gap-3 font-mono font-medium">
              <span className="text-primary">
                Volume: <Amount value={data[activeBar].amount} size="xs" weight="semibold" />
              </span>
              <span className="text-text-muted text-[11px]">
                ({data[activeBar].transactions} orders)
              </span>
            </div>
          </>
        ) : (
          <span className="text-text-faint text-[11px]">
            Hover over any day column to inspect gross volume and order counts.
          </span>
        )}
      </div>

      {/* Bar Chart Container */}
      <div className="pt-2">
        <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-border pb-2">
          {data.map((item, idx) => {
            const heightPct = Math.round(((item.amount || 0) / maxAmount) * 100);
            const isHovered = activeBar === idx;

            return (
              <div
                key={item.day}
                onMouseEnter={() => setActiveBar(idx)}
                onMouseLeave={() => setActiveBar(null)}
                className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-full max-w-[42px] bg-surface-subtle rounded-t-[4px] overflow-hidden h-32 flex items-end justify-center p-1 border-x border-t border-border">
                  <div
                    style={{ height: `${Math.max(heightPct, 6)}%` }}
                    className={`w-full rounded-t-[3px] transition-all duration-200 ${
                      item.amount > 0
                        ? isHovered
                          ? "bg-primary"
                          : "bg-primary/80 group-hover:bg-primary"
                        : "bg-border"
                    }`}
                  />
                </div>

                <span
                  className={`text-[11px] font-mono transition-colors ${
                    isHovered ? "text-primary font-semibold" : "text-text-muted"
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
