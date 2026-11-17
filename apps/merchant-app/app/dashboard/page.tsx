"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  User,
  Mail,
  Wallet,
  LogOut,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  CreditCard,
  LayoutDashboard,
  QrCode,
  BarChart3,
  History,
  Menu,
  X,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Amount } from "@repo/ui";

// Reusable Components
import { StatCard } from "@/components/StatCard";
import { ReceivePaymentCard } from "@/components/ReceivePaymentCard";
import { MerchantQRCard } from "@/components/MerchantQRCard";
import { RevenueChart } from "@/components/RevenueChart";
import { RecentPayments } from "@/components/RecentPayments";

interface MerchantData {
  id: number;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  balance: number;
  createdAt: string;
}

interface DashboardStats {
  todayRevenue: {
    amount: number;
    changePercentage: number | null;
  };
  thisMonth: {
    amount: number;
    changePercentage: number | null;
  };
  successfulPayments: {
    count: number;
    successRate: number;
  };
  pendingPayments: {
    count: number;
  };
}

export default function MerchantDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchMerchantProfile = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/merchant/me");
      if (res.ok) {
        const data = await res.json();
        setMerchant(data.merchant);
      }
    } catch (err) {
      console.error("Failed to fetch merchant profile", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("/api/merchant/dashboard");
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchMerchantProfile(), fetchDashboardStats()]);
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchMerchantProfile();
      fetchDashboardStats();
    }
  }, [status]);

  if (status === "loading" || (loading && !merchant)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg font-sans">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">Loading Merchant Console...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const displayBusinessName = merchant?.businessName || session.user.businessName || "Acme Retail Store";
  const displayOwnerName = merchant?.ownerName || session.user.ownerName || session.user.name || "Owner";
  const displayEmail = merchant?.email || session.user.email || "merchant@business.com";
  const displayBalance = merchant?.balance ?? 0;

  return (
    <div className="min-h-screen bg-bg text-text font-sans flex flex-col md:flex-row">
      {/* --------------------------------------------------------------------- */}
      {/* 1. Dark Ink-Green Sidebar (#0F3D33) for Desktop                       */}
      {/* --------------------------------------------------------------------- */}
      <aside className="hidden md:flex flex-col w-64 bg-primary text-white shrink-0 sticky top-0 h-screen border-r border-[#1F4D43] select-none justify-between p-5">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-9 h-9 rounded-[8px] bg-white/10 border border-white/15 flex items-center justify-center text-accent">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-white">PayPulse</span>
                <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.2 rounded border border-accent/40 font-mono">
                  BIZ
                </span>
              </div>
              <p className="text-[11px] text-white/60">Merchant Console</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="text-[11px] font-medium text-white/50 block px-2 mb-2">
              Management
            </span>
            <a
              href="#overview"
              className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium bg-white/15 text-white shadow-xs"
            >
              <LayoutDashboard className="w-4 h-4 text-accent" />
              <span>Overview</span>
            </a>
            <a
              href="#charge"
              className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <QrCode className="w-4 h-4 text-white/70" />
              <span>Charge Terminal</span>
            </a>
            <a
              href="#analytics"
              className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-white/70" />
              <span>Sales Velocity</span>
            </a>
            <a
              href="#transactions"
              className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <History className="w-4 h-4 text-white/70" />
              <span>Customer Log</span>
            </a>
          </nav>

          {/* Switch to Personal App Link */}
          <div className="pt-4 border-t border-white/10">
            <span className="text-[11px] font-medium text-white/50 block px-2 mb-2">
              Cross-app
            </span>
            <a
              href="http://localhost:3000/dashboard"
              className="flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
            >
              <span>Personal Wallet</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-accent" />
            </a>
          </div>
        </div>

        {/* Bottom Profile Pill */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent font-semibold text-xs uppercase">
              {displayBusinessName[0]}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-medium text-white truncate">{displayBusinessName}</p>
              <p className="text-[10px] text-white/60 truncate">{displayOwnerName}</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-danger" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --------------------------------------------------------------------- */}
      {/* 2. Mobile Top Bar with Collapsible Drawer                            */}
      {/* --------------------------------------------------------------------- */}
      <header className="md:hidden bg-primary text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-xs border-b border-[#1F4D43]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[6px] bg-white/10 flex items-center justify-center text-accent">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight">PayPulse Business</span>
            <span className="text-[10px] text-white/60 block -mt-0.5">{displayBusinessName}</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-[6px] bg-white/10 text-white cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary text-white p-4 space-y-3 border-b border-[#1F4D43] animate-in fade-in duration-150">
          <nav className="space-y-1">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium bg-white/15 text-white"
            >
              <LayoutDashboard className="w-4 h-4 text-accent" />
              <span>Overview</span>
            </a>
            <a
              href="#charge"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium text-white/70"
            >
              <QrCode className="w-4 h-4" />
              <span>Charge Terminal</span>
            </a>
            <a
              href="http://localhost:3000/dashboard"
              className="flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-medium text-accent"
            >
              <span>Personal Wallet</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </nav>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[6px] text-xs font-medium bg-white/10 text-white"
          >
            <LogOut className="w-3.5 h-3.5 text-danger" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 3. Main Light Content Area                                           */}
      {/* --------------------------------------------------------------------- */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] w-full">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-text">
              Store Settlement Console
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Live incoming customer transactions, dynamic terminal charges, and balance settlements.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs bg-surface hover:bg-surface-subtle text-text px-3 py-1.5 rounded-[6px] border border-border transition-colors cursor-pointer shadow-xs"
              title="Refresh merchant balance"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-primary ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 1. Merchant Balance Hero Card (Flat, no card-in-card) */}
        <div id="overview" className="bg-surface border border-border rounded-[10px] p-6 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-medium text-text-muted block">
                Merchant account
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-text">
                {displayBusinessName}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-text-faint" /> Owner: <strong className="text-text font-medium">{displayOwnerName}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-text-faint" /> Email: <strong className="text-text font-medium">{displayEmail}</strong>
                </span>
              </div>
            </div>

            {/* Balance Column (Flat border-l, no nested box) */}
            <div className="flex flex-col justify-between md:border-l md:border-border md:pl-6 min-w-[240px]">
              <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
                <span className="font-medium text-xs">Settled balance</span>
                <Wallet className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <Amount value={displayBalance} size="3xl" weight="semibold" />
              </div>
              <p className="text-[11px] text-success mt-1 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Available for automatic payout
              </p>
            </div>
          </div>
        </div>

        {/* 2. Overview / KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard
            title="Today's Volume"
            value={stats ? `₹${stats.todayRevenue.amount.toLocaleString("en-IN")}` : "₹0"}
            change={
              stats?.todayRevenue.changePercentage !== null && stats?.todayRevenue.changePercentage !== undefined
                ? `${stats.todayRevenue.changePercentage > 0 ? "+" : ""}${stats.todayRevenue.changePercentage}% vs yesterday`
                : "— vs yesterday"
            }
            isPositive={(stats?.todayRevenue.changePercentage ?? 0) >= 0}
            icon={<DollarSign className="w-4 h-4 text-primary" />}
          />
          <StatCard
            title="This Month"
            value={stats ? `₹${stats.thisMonth.amount.toLocaleString("en-IN")}` : "₹0"}
            change={
              stats?.thisMonth.changePercentage !== null && stats?.thisMonth.changePercentage !== undefined
                ? `${stats.thisMonth.changePercentage > 0 ? "+" : ""}${stats.thisMonth.changePercentage}% vs last month`
                : "— vs last month"
            }
            isPositive={(stats?.thisMonth.changePercentage ?? 0) >= 0}
            icon={<TrendingUp className="w-4 h-4 text-success" />}
          />
          <StatCard
            title="Settled Orders"
            value={stats ? stats.successfulPayments.count.toLocaleString() : "0"}
            subtitle={`${stats?.successfulPayments.successRate ?? 100}% processed successfully`}
            icon={<CheckCircle2 className="w-4 h-4 text-success" />}
          />
          <StatCard
            title="Pending Checkouts"
            value={stats ? stats.pendingPayments.count.toLocaleString() : "0"}
            subtitle="Awaiting customer scan"
            isPositive={false}
            icon={<Clock className="w-4 h-4 text-warning" />}
          />
        </div>

        {/* 3. Middle Grid: Charge Terminal + Countertop QR Card */}
        <div id="charge" className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReceivePaymentCard businessName={displayBusinessName} />
          </div>
          <div>
            <MerchantQRCard businessName={displayBusinessName} merchantId="MRC_1234" />
          </div>
        </div>

        {/* 4. Sales Velocity Chart */}
        <div id="analytics">
          <RevenueChart />
        </div>

        {/* 5. Recent Payments Table */}
        <div id="transactions">
          <RecentPayments />
        </div>
      </main>
    </div>
  );
}
