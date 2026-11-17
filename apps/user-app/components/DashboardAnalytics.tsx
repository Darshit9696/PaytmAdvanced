"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  BarChart3,
  Users,
  Send,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Utensils,
  ShoppingBag,
  Navigation,
  Film,
  PieChart,
} from "lucide-react";
import { Amount, Avatar, StatCard } from "@repo/ui";

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

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Food: <Utensils className="w-4 h-4 text-warning" />,
  Shopping: <ShoppingBag className="w-4 h-4 text-primary" />,
  Travel: <Navigation className="w-4 h-4 text-info" />,
  Entertainment: <Film className="w-4 h-4 text-danger" />,
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
      <div className="space-y-6 font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-[10px] p-5 h-28 animate-pulse" />
          <div className="bg-surface border border-border rounded-[10px] p-5 h-28 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surface border border-border rounded-[10px] p-4 h-24 animate-pulse" />
          <div className="bg-surface border border-border rounded-[10px] p-4 h-24 animate-pulse" />
          <div className="bg-surface border border-border rounded-[10px] p-4 h-24 animate-pulse" />
          <div className="bg-surface border border-border rounded-[10px] p-4 h-24 animate-pulse" />
        </div>
        <div className="bg-surface border border-border rounded-[10px] p-6 h-72 animate-pulse" />
      </div>
    );
  }

  // Error State with Retry Button
  if (error && !data) {
    return (
      <div className="bg-danger-subtle/30 border border-danger/20 rounded-[10px] p-6 text-center space-y-3 font-sans">
        <AlertCircle className="w-7 h-7 text-danger mx-auto" />
        <h3 className="text-sm font-semibold text-text">Unable to load dashboard analytics</h3>
        <p className="text-xs text-text-muted">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 text-xs font-medium bg-surface border border-border hover:bg-surface-subtle text-text px-4 py-2 rounded-[6px] transition-colors cursor-pointer"
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
        <div className="bg-surface border border-border rounded-[10px] p-5 flex flex-col justify-between space-y-2">
          <span className="text-xs font-medium text-text-muted">Monthly spending</span>
          <div>
            <Amount value={monthlySpending.amount} size="2xl" weight="medium" />
            <p className="text-xs text-text-faint mt-1">
              Current calendar month outgoings
            </p>
          </div>
        </div>

        {/* Monthly Income Card */}
        <div className="bg-surface border border-border rounded-[10px] p-5 flex flex-col justify-between space-y-2">
          <span className="text-xs font-medium text-text-muted">Monthly income</span>
          <div>
            <Amount value={monthlyIncome.amount} size="2xl" weight="medium" />
            <p className="text-xs text-text-faint mt-1">
              Transfers received this month
            </p>
          </div>
        </div>
      </div>

      {/* 2. Spending Categories Breakdown (No nested cards) */}
      <div className="bg-surface border border-border rounded-[10px] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-text">Expense categories</h3>
            <p className="text-xs text-text-muted">Monthly spending breakdown by tag</p>
          </div>

          {totalCategorizedAmount > 0 && (
            <div className="text-xs text-text-muted self-start sm:self-auto flex items-center gap-1.5">
              <span>Total categorized:</span>
              <Amount value={totalCategorizedAmount} size="sm" weight="medium" />
            </div>
          )}
        </div>

        {totalCategorizedAmount === 0 ? (
          <p className="text-xs text-text-muted py-2">
            No categorized spending this month yet
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            {categories.map((item) => {
              const icon = CATEGORY_ICONS[item.category] || (
                <ShoppingBag className="w-4 h-4 text-primary" />
              );
              const percentage = Math.round((item.amount / totalCategorizedAmount) * 100);

              return (
                <div
                  key={item.category}
                  className="flex flex-col justify-between space-y-2 py-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">{icon}</span>
                      <span className="text-xs font-medium text-text">{item.category}</span>
                    </div>
                    <span className="text-xs text-text-muted font-mono">
                      {percentage}%
                    </span>
                  </div>

                  <div>
                    <Amount value={item.amount} size="md" weight="medium" />
                    <p className="text-xs text-text-faint font-mono mt-0.5">
                      {item.transactionCount}{" "}
                      {item.transactionCount === 1 ? "payment" : "payments"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Cash Flow Dual Bar Chart */}
      <div className="bg-surface border border-border rounded-[10px] p-5 sm:p-6 space-y-4">
        {/* Chart Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-text">Cash flow velocity</h3>
            <p className="text-xs text-text-muted">Outgoings vs incoming volume</p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-text-muted font-medium mr-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-danger" /> Spending
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-success" /> Income
              </span>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-surface-subtle p-0.5 rounded-[8px] border border-border">
              <button
                onClick={() => {
                  setChartMode("daily");
                  setHoveredIdx(null);
                }}
                className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-colors cursor-pointer ${
                  chartMode === "daily"
                    ? "bg-surface text-text border border-border font-semibold"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => {
                  setChartMode("weekly");
                  setHoveredIdx(null);
                }}
                className={`px-3 py-1 rounded-[6px] text-xs font-medium transition-colors cursor-pointer ${
                  chartMode === "weekly"
                    ? "bg-surface text-text border border-border font-semibold"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Weekly
              </button>
            </div>
          </div>
        </div>

        {/* Hover Detail Banner */}
        <div className="h-9 bg-surface-subtle border border-border rounded-[8px] px-3.5 flex items-center justify-between text-xs">
          {hoveredItem ? (
            <>
              <span className="text-text-muted">
                <strong className="text-text font-semibold">{hoveredItem.label}</strong> Summary:
              </span>
              <div className="flex items-center gap-4 font-mono font-medium">
                <span className="text-danger flex items-center gap-1">
                  Spending: <Amount value={hoveredItem.spending} size="xs" weight="medium" />
                </span>
                <span className="text-success flex items-center gap-1">
                  Income: <Amount value={hoveredItem.income} size="xs" weight="medium" />
                </span>
              </div>
            </>
          ) : (
            <span className="text-text-faint text-xs">
              Hover over any column to inspect spending and income breakdown.
            </span>
          )}
        </div>

        {/* Visual Dual Bars Container */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="min-w-[500px] h-44 flex items-end justify-between gap-2 sm:gap-3 pt-6 px-2 border-b border-border">
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
                  <div className="w-full max-w-[36px] bg-surface-subtle rounded-t-[6px] overflow-hidden h-32 flex items-end justify-center gap-1 p-1 border-x border-t border-border">
                    {/* Spending Bar */}
                    <div
                      style={{ height: `${Math.max(spendingHeight, 4)}%` }}
                      className={`w-1/2 rounded-t-[3px] transition-all duration-200 ${
                        item.spending > 0
                          ? isHovered
                            ? "bg-danger"
                            : "bg-danger/70 group-hover:bg-danger"
                          : "bg-border/60"
                      }`}
                      title={`Spending: ₹${item.spending}`}
                    />

                    {/* Income Bar */}
                    <div
                      style={{ height: `${Math.max(incomeHeight, 4)}%` }}
                      className={`w-1/2 rounded-t-[3px] transition-all duration-200 ${
                        item.income > 0
                          ? isHovered
                            ? "bg-success"
                            : "bg-success/70 group-hover:bg-success"
                          : "bg-border/60"
                      }`}
                      title={`Income: ₹${item.income}`}
                    />
                  </div>

                  <span
                    className={`text-[10px] font-mono transition-colors truncate max-w-[48px] text-center ${
                      isHovered ? "text-primary font-semibold" : "text-text-muted"
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

      {/* 4. Top Contacts Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Paid Contact */}
        <div className="bg-surface border border-border rounded-[10px] p-5 space-y-4 flex flex-col justify-between">
          <div className="pb-3 border-b border-border">
            <span className="text-xs font-medium text-text-muted">Most paid contact</span>
          </div>

          {data?.topFriends.mostPaid ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <Avatar name={data.topFriends.mostPaid.name} size="lg" />
                <div>
                  <h4 className="text-sm font-semibold text-text">
                    {data.topFriends.mostPaid.name}
                  </h4>
                  <p className="text-xs text-text-muted font-mono mt-0.5">
                    {data.topFriends.mostPaid.transactionCount}{" "}
                    {data.topFriends.mostPaid.transactionCount === 1 ? "transfer" : "transfers"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <Amount value={data.topFriends.mostPaid.totalAmount} size="md" weight="medium" />
                <Link
                  href={`/dashboard/transfer?id=${data.topFriends.mostPaid.id}&name=${encodeURIComponent(
                    data.topFriends.mostPaid.name
                  )}`}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium mt-1"
                >
                  <span>Send again</span>
                  <Send className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-text-muted space-y-1">
              <p className="font-medium text-text">No outgoing payments yet</p>
              <p>Contacts you pay will appear here with analytics.</p>
            </div>
          )}
        </div>

        {/* Top Income Source */}
        <div className="bg-surface border border-border rounded-[10px] p-5 space-y-4 flex flex-col justify-between">
          <div className="pb-3 border-b border-border">
            <span className="text-xs font-medium text-text-muted">Top income source</span>
          </div>

          {data?.topFriends.mostReceived ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <Avatar name={data.topFriends.mostReceived.name} size="lg" />
                <div>
                  <h4 className="text-sm font-semibold text-text">
                    {data.topFriends.mostReceived.name}
                  </h4>
                  <p className="text-xs text-text-muted font-mono mt-0.5">
                    {data.topFriends.mostReceived.transactionCount}{" "}
                    {data.topFriends.mostReceived.transactionCount === 1
                      ? "transfer"
                      : "transfers"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <Amount value={data.topFriends.mostReceived.totalAmount} size="md" weight="medium" />
                <span className="inline-block text-xs text-success font-medium mt-1">
                  Received in wallet
                </span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-text-muted space-y-1">
              <p className="font-medium text-text">No incoming transfers yet</p>
              <p>Contacts who send you money will appear here with analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
