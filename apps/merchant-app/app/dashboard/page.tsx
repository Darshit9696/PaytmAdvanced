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
  CreditCard
} from "lucide-react";
import Link from "next/link";

// Custom UI Components
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
      <div className="flex h-screen w-full items-center justify-center bg-[#090d16] font-sans">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold">Loading Merchant Portal...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const displayBusinessName = merchant?.businessName || session.user.businessName || "Jack and Johns Stores";
  const displayOwnerName = merchant?.ownerName || session.user.ownerName || session.user.name || "Owner";
  const displayEmail = merchant?.email || session.user.email || "merchant@business.com";
  const displayBalance = merchant?.balance ?? 0;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">

      {/* Top Navbar */}
      <header className="bg-[#0b101d] border-b border-slate-800/80 py-4 px-6 md:px-12 flex items-center justify-between shadow-lg sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="http://localhost:3000" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                PayPulse <span className="text-indigo-400 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">Merchant</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Merchant Business Console
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="hidden sm:flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Refresh merchant balance"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3.5 py-2 rounded-xl border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">

        {/* 1. Merchant Header & Balance Summary Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-semibold border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Merchant Account Verified
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full font-semibold border border-indigo-500/20">
                <CreditCard className="w-3.5 h-3.5" /> Payments Enabled
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-blue-500/10 text-cyan-300 px-3 py-1 rounded-full font-semibold border border-blue-500/20">
                Account Status: Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{displayBusinessName}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Owner: <strong className="text-slate-200">{displayOwnerName}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email: <strong className="text-slate-200">{displayEmail}</strong>
              </span>
            </div>
          </div>

          {/* Merchant Balance Metrics Box */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 min-w-[260px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold uppercase tracking-wider">Merchant Balance</span>
              <Wallet className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
              ₹{displayBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Available for instant bank payout
            </p>
          </div>
        </div>

        {/* 2. Overview / KPI Cards Grid (4 Compact Stat Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Revenue"
            value={stats ? `₹${stats.todayRevenue.amount.toLocaleString("en-IN")}` : "₹0"}
            change={
              stats?.todayRevenue.changePercentage !== null && stats?.todayRevenue.changePercentage !== undefined
                ? `${stats.todayRevenue.changePercentage > 0 ? "+" : ""}${stats.todayRevenue.changePercentage}% vs yesterday`
                : "— vs yesterday"
            }
            isPositive={(stats?.todayRevenue.changePercentage ?? 0) >= 0}
            icon={<DollarSign className="w-5 h-5 text-indigo-400" />}
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
            icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          />
          <StatCard
            title="Successful Payments"
            value={stats ? stats.successfulPayments.count.toLocaleString() : "0"}
            subtitle={`${stats?.successfulPayments.successRate ?? 100}% processed successfully`}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          />
          <StatCard
            title="Pending Payments"
            value={stats ? stats.pendingPayments.count.toLocaleString() : "0"}
            subtitle="Awaiting customer completion"
            isPositive={false}
            icon={<Clock className="w-5 h-5 text-amber-400" />}
          />
        </div>

        {/* 3. Middle Grid: Receive Payment UI + My Store QR Card */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReceivePaymentCard businessName={displayBusinessName} />
          </div>
          <div>
            <MerchantQRCard businessName={displayBusinessName} merchantId="MRC_1234" />
          </div>
        </div>

        {/* 4. Revenue Overview (Analytics Preview Chart) */}
        <RevenueChart />

        {/* 5. Recent Payments Table */}
        <RecentPayments />

      </main>

      {/* Footer */}
      <footer className="w-full bg-[#060910] border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 mt-auto">
        <p>© PayPulse Merchant Portal 2026. Business Merchant Platform.</p>
      </footer>
    </div>
  );
}
