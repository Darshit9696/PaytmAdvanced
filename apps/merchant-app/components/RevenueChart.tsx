"use client";

import React, { useState } from "react";
import { BarChart3, TrendingUp, Calendar } from "lucide-react";

interface DayData {
  day: string;
  amount: number;
  transactions: number;
}

export function RevenueChart() {
  const [activeBar, setActiveBar] = useState<number | null>(5); // Default active to Saturday

  const data: DayData[] = [
    { day: "Mon", amount: 500, transactions: 4 },
    { day: "Tue", amount: 1200, transactions: 8 },
    { day: "Wed", amount: 800, transactions: 6 },
    { day: "Thu", amount: 1500, transactions: 11 },
    { day: "Fri", amount: 900, transactions: 7 },
    { day: "Sat", amount: 2000, transactions: 15 },
    { day: "Sun", amount: 1250, transactions: 9 },
  ];

  const maxAmount = Math.max(...data.map((d) => d.amount));
  const totalWeekly = data.reduce((sum, d) => sum + d.amount, 0);

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
            <span className="text-white font-bold font-mono">₹{totalWeekly.toLocaleString("en-IN")}</span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4%
          </span>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="pt-4 space-y-6">
        
        {/* Active Hover Detail Banner */}
        <div className="h-10 bg-slate-900 border border-slate-800 rounded-xl px-4 flex items-center justify-between text-xs">
          {activeBar !== null ? (
            <>
              <span className="text-slate-400">
                <strong className="text-white">{data[activeBar].day}</strong> Sales Volume:
              </span>
              <span className="font-bold text-indigo-400 font-mono">
                ₹{data[activeBar].amount.toLocaleString("en-IN")} ({data[activeBar].transactions} payments)
              </span>
            </>
          ) : (
            <span className="text-slate-400">Hover over any bar to inspect daily sales detail</span>
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
