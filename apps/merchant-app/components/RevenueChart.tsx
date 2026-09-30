"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Calendar } from "lucide-react";

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
    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-cyan-400 border border-blue-500/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Revenue Overview</h3>
            <p className="text-xs text-slate-400">7-Day Transaction & Sales Velocity</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>This Week Total:</span>
            <span className="text-white font-bold font-mono">
              {loading ? "..." : `₹${totalWeekly.toLocaleString("en-IN")}`}
            </span>
          </div>
          {loading ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 animate-pulse">
              <TrendingUp className="w-3 h-3" /> ...
            </span>
          ) : changePercentage === null ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
              —
            </span>
          ) : changePercentage > 0 ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +{changePercentage}%
            </span>
          ) : changePercentage < 0 ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> {changePercentage}%
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center gap-1">
              0.0%
            </span>
          )}
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="pt-4 space-y-6">
        
        {/* Active Hover Detail Banner */}
        <div className="h-10 bg-slate-900 border border-slate-800 rounded-xl px-4 flex items-center justify-between text-xs">
          {activeBar !== null && data[activeBar] ? (
            <>
              <span className="text-slate-400">
                <strong className="text-white">{data[activeBar].day}</strong> Sales Volume:
              </span>
              <span className="font-bold text-indigo-400 font-mono">
                ₹{data[activeBar].amount.toLocaleString("en-IN")} ({data[activeBar].transactions}{" "}
                {data[activeBar].transactions === 1 ? "payment" : "payments"})
              </span>
            </>
          ) : (
            <span className="text-slate-400">
              {loading
                ? "Loading sales data..."
                : error
                ? "Failed to load revenue data"
                : totalWeekly === 0
                ? "No sales recorded this week. Hover over any bar to inspect daily sales detail"
                : "Hover over any bar to inspect daily sales detail"}
            </span>
          )}
        </div>

        {/* Bars Container */}
        <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 pt-6 px-2 border-b border-slate-800">
          {data.map((item, idx) => {
            const heightPercent = Math.round((item.amount / maxAmount) * 100);
            const isHovered = activeBar === idx;

            return (
              <div
                key={item.day}
                onMouseEnter={() => setActiveBar(idx)}
                className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
              >
                {/* Bar Element */}
                <div className="w-full max-w-[40px] bg-slate-900 rounded-t-xl overflow-hidden h-36 flex items-end p-1">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isHovered
                        ? "bg-gradient-to-t from-indigo-600 to-purple-500 shadow-lg shadow-indigo-500/30"
                        : "bg-indigo-600/40 hover:bg-indigo-600/70"
                    }`}
                  />
                </div>

                {/* Day Label */}
                <span
                  className={`text-xs font-semibold transition-colors ${
                    isHovered ? "text-indigo-400 font-bold" : "text-slate-400"
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
