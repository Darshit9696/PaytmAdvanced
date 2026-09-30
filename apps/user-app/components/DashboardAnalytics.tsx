"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  BarChart3,
  Users,
  Send,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
  Utensils,
  ShoppingBag,
  Navigation,
  Film,
  PieChart,
} from "lucide-react";

interface MonthlyStats {
  amount: number;
  transactionCount: number;
}

interface CategoryItem {
  category: "Food" | "Shopping" | "Travel" | "Entertainment" | string;
  amount: number;
  transactionCount: number;
}

interface DailyChartItem {
  date: string;
  label: string;
  spending: number;
  income: number;
}

interface WeeklyChartItem {
  weekStart: string;
  label: string;
  spending: number;
  income: number;
}

interface TopFriend {
  id: number | string;
  name: string;
  avatarUrl?: string | null;
  totalAmount: number;
  transactionCount: number;
}

interface AnalyticsData {
  balance: number;
  monthly: {
    spending: MonthlyStats;
    income: MonthlyStats;
  };
  categories: CategoryItem[];
  charts: {
    daily: DailyChartItem[];
    weekly: WeeklyChartItem[];
  };
  topFriends: {
    mostPaid: TopFriend | null;
    mostReceived: TopFriend | null;
  };
}

const CATEGORY_CONFIG: Record<
  string,
  {
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
    barColor: string;
  }
> = {
  Food: {
    icon: <Utensils className="w-4 h-4 text-amber-400" />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    barColor: "bg-amber-500",
  },
  Shopping: {
    icon: <ShoppingBag className="w-4 h-4 text-purple-400" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    barColor: "bg-purple-500",
  },
  Travel: {
    icon: <Navigation className="w-4 h-4 text-cyan-400" />,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    barColor: "bg-cyan-500",
  },
  Entertainment: {
    icon: <Film className="w-4 h-4 text-pink-400" />,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    barColor: "bg-pink-500",
  },
};

export function DashboardAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<"daily" | "weekly">("daily");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/dashboard/analytics");
      if (!res.ok) {
        throw new Error(`Failed to load analytics (${res.status})`);
      }
      const json: AnalyticsData = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Failed to fetch dashboard analytics:", err);
      setError(err?.message || "Failed to load dashboard analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Loading Skeleton State
  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse font-sans">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 h-28 flex flex-col justify-between" />
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 h-28 flex flex-col justify-between" />
        </div>

        {/* Categories Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 h-24" />
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 h-24" />
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 h-24" />
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 h-24" />
        </div>

        {/* Chart Skeleton */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 h-72" />

        {/* Top Friends Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 h-36" />
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 h-36" />
        </div>
      </div>
    );
  }

  // Error State with Retry Button
  if (error && !data) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center space-y-3 font-sans">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-sm font-bold text-rose-300">Unable to load dashboard analytics</h3>
        <p className="text-xs text-slate-400">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const monthlySpending = data?.monthly.spending || { amount: 0, transactionCount: 0 };
  const monthlyIncome = data?.monthly.income || { amount: 0, transactionCount: 0 };
  const categories = data?.categories || [
    { category: "Food", amount: 0, transactionCount: 0 },
    { category: "Shopping", amount: 0, transactionCount: 0 },
    { category: "Travel", amount: 0, transactionCount: 0 },
    { category: "Entertainment", amount: 0, transactionCount: 0 },
  ];

  const totalCategorizedAmount = categories.reduce((sum, c) => sum + c.amount, 0);

  const dailyItems = data?.charts.daily || [];
  const weeklyItems = data?.charts.weekly || [];
  const chartItems = chartMode === "daily" ? dailyItems : weeklyItems;

  const maxAmount = Math.max(
    ...chartItems.map((d) => Math.max(d.spending || 0, d.income || 0)),
    1
  );

  const hoveredItem = hoveredIdx !== null && chartItems[hoveredIdx] ? chartItems[hoveredIdx] : null;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Monthly Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Monthly Spending Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span>Monthly Spending</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
              {monthlySpending.transactionCount}{" "}
              {monthlySpending.transactionCount === 1 ? "payment" : "payments"}
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              ₹{monthlySpending.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-sans">
              <Calendar className="w-3 h-3 text-slate-400" /> Current calendar month outgoings
            </p>
          </div>
        </div>

        {/* Monthly Income Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <span>Monthly Income</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
              {monthlyIncome.transactionCount}{" "}
              {monthlyIncome.transactionCount === 1 ? "received" : "received"}
            </span>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              ₹{monthlyIncome.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-sans font-semibold">
              <TrendingUp className="w-3 h-3" /> P2P transfers received this month
            </p>
          </div>
        </div>
      </div>

      {/* 2. Spending Categories Breakdown */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-cyan-400 border border-blue-500/20 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Monthly Expense Categories</h3>
              <p className="text-[11px] text-slate-400">Spending breakdown by transaction category</p>
            </div>
          </div>

          <span className="text-xs text-slate-400 font-mono self-start sm:self-auto">
            Categorized:{" "}
            <strong className="text-slate-100">
              ₹{totalCategorizedAmount.toLocaleString("en-IN")}
            </strong>
          </span>
        </div>

        {/* 4-Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((item) => {
            const config = CATEGORY_CONFIG[item.category] || {
              icon: <ShoppingBag className="w-4 h-4 text-cyan-400" />,
              color: "text-cyan-400",
              bgColor: "bg-cyan-500/10",
              borderColor: "border-cyan-500/20",
              barColor: "bg-cyan-500",
            };

            const percentage =
              totalCategorizedAmount > 0
                ? Math.round((item.amount / totalCategorizedAmount) * 100)
                : 0;

            return (
              <div
                key={item.category}
                className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-lg ${config.bgColor} ${config.borderColor} border flex items-center justify-center`}
                  >
                    {config.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                    {percentage}%
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-300">{item.category}</p>
                  <p className="text-lg font-extrabold text-white font-mono mt-0.5">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {item.transactionCount}{" "}
                    {item.transactionCount === 1 ? "payment" : "payments"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {totalCategorizedAmount === 0 && (
          <p className="text-center text-xs text-slate-400 pt-1">
            No categorized expenses recorded this month yet. Tag your transfers with categories to track your spending.
          </p>
        )}
      </div>

      {/* 3. Interactive Spending & Income Bar Chart */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        {/* Chart Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cash Flow Analytics</h3>
              <p className="text-xs text-slate-400">Spending &amp; Income Velocity</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-semibold mr-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Spending
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Income
              </span>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  setChartMode("daily");
                  setHoveredIdx(null);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartMode === "daily"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Daily (This Month)
              </button>
              <button
                onClick={() => {
                  setChartMode("weekly");
                  setHoveredIdx(null);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartMode === "weekly"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Weekly (8 Weeks)
              </button>
            </div>
          </div>
        </div>

        {/* Hover Detail Banner */}
        <div className="h-10 bg-slate-900 border border-slate-800 rounded-xl px-4 flex items-center justify-between text-xs">
          {hoveredItem ? (
            <>
              <span className="text-slate-400">
                <strong className="text-white">{hoveredItem.label}</strong> Summary:
              </span>
              <div className="flex items-center gap-4 font-mono font-bold">
                <span className="text-rose-400">
                  Spending: ₹{hoveredItem.spending.toLocaleString("en-IN")}
                </span>
                <span className="text-emerald-400">
                  Income: ₹{hoveredItem.income.toLocaleString("en-IN")}
                </span>
              </div>
            </>
          ) : (
            <span className="text-slate-400">
              Hover over any day or week to inspect spending &amp; income detail
            </span>
          )}
        </div>

        {/* Visual Dual Bars Container */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="min-w-[500px] h-48 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2 border-b border-slate-800">
            {chartItems.map((item, idx) => {
              const spendingHeight = Math.round(((item.spending || 0) / maxAmount) * 100);
              const incomeHeight = Math.round(((item.income || 0) / maxAmount) * 100);
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={item.label + idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                >
                  {/* Pair of Bars */}
                  <div className="w-full max-w-[40px] bg-slate-900/90 rounded-t-xl overflow-hidden h-36 flex items-end justify-center gap-1 p-1">
                    {/* Spending Bar */}
                    <div
                      style={{ height: `${Math.max(spendingHeight, 3)}%` }}
                      className={`w-1/2 rounded-t-md transition-all duration-300 ${
                        item.spending > 0
                          ? isHovered
                            ? "bg-rose-500 shadow-lg shadow-rose-500/30"
                            : "bg-rose-500/60 group-hover:bg-rose-500/80"
                          : "bg-slate-800/40"
                      }`}
                      title={`Spending: ₹${item.spending}`}
                    />

                    {/* Income Bar */}
                    <div
                      style={{ height: `${Math.max(incomeHeight, 3)}%` }}
                      className={`w-1/2 rounded-t-md transition-all duration-300 ${
                        item.income > 0
                          ? isHovered
                            ? "bg-emerald-400 shadow-lg shadow-emerald-400/30"
                            : "bg-emerald-500/60 group-hover:bg-emerald-500/80"
                          : "bg-slate-800/40"
                      }`}
                      title={`Income: ₹${item.income}`}
                    />
                  </div>

                  {/* Date/Week Label */}
                  <span
                    className={`text-[10px] font-semibold transition-colors truncate max-w-[48px] text-center ${
                      isHovered ? "text-cyan-300 font-bold" : "text-slate-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Top Friends Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Paid Friend */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Users className="w-4 h-4 text-rose-400" />
              <span>Most Paid Contact</span>
            </div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              Top Outgoing
            </span>
          </div>

          {data?.topFriends.mostPaid ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-base font-bold uppercase">
                  {data.topFriends.mostPaid.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    {data.topFriends.mostPaid.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {data.topFriends.mostPaid.transactionCount}{" "}
                    {data.topFriends.mostPaid.transactionCount === 1 ? "transfer" : "transfers"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-base font-extrabold text-white font-mono">
                  ₹{data.topFriends.mostPaid.totalAmount.toLocaleString("en-IN")}
                </div>
                <Link
                  href={`/dashboard/transfer?id=${data.topFriends.mostPaid.id}&name=${encodeURIComponent(
                    data.topFriends.mostPaid.name
                  )}`}
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold mt-1"
                >
                  <span>Send again</span>
                  <Send className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">No outgoing payments yet</p>
              <p>Contacts you pay will appear here with analytics.</p>
            </div>
          )}
        </div>

        {/* Top Income Source */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Top Income Source</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Top Incoming
            </span>
          </div>

          {data?.topFriends.mostReceived ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-base font-bold uppercase">
                  {data.topFriends.mostReceived.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    {data.topFriends.mostReceived.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {data.topFriends.mostReceived.transactionCount}{" "}
                    {data.topFriends.mostReceived.transactionCount === 1
                      ? "transfer"
                      : "transfers"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-base font-extrabold text-white font-mono">
                  ₹{data.topFriends.mostReceived.totalAmount.toLocaleString("en-IN")}
                </div>
                <span className="inline-block text-[11px] text-emerald-400 font-semibold mt-1">
                  Received in wallet
                </span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">No incoming transfers yet</p>
              <p>Contacts who send you money will appear here with analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
