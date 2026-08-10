"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Store, User, Mail, Wallet, LogOut, ShieldCheck, RefreshCw, Building2 } from "lucide-react";

interface MerchantData {
  id: number;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  balance: number;
  createdAt: string;
}

export default function MerchantDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/merchant/login");
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

  useEffect(() => {
    if (status === "authenticated") {
      fetchMerchantProfile();
    }
  }, [status]);

  if (status === "loading" || (loading && !merchant)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-10 h-10 border-4 border-[#00baf2] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold">Loading Merchant Portal...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // Fallback to session data if profile fetch hasn't finished yet
  const displayBusinessName = merchant?.businessName || session.user.businessName || "Merchant Business";
  const displayOwnerName = merchant?.ownerName || session.user.ownerName || session.user.name || "Owner";
  const displayEmail = merchant?.email || session.user.email || "email@business.com";
  const displayBalance = merchant?.balance ?? 0;

  return (
    <div className="min-h-screen bg-[#f4f7fa] font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#002e6e] text-white py-4 px-6 md:px-12 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#00baf2]">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              Paytm <span className="text-[#00baf2] text-sm font-bold">Business Portal</span>
            </h1>
            <p className="text-xs text-cyan-200">Merchant Control Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={fetchMerchantProfile}
            disabled={refreshing}
            className="hidden sm:flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-cyan-100 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            title="Refresh balance"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/merchant/login" })}
            className="flex items-center gap-2 text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-3.5 py-2 rounded-xl border border-rose-400/30 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-10 space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#002e6e] to-[#004b9c] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs bg-white/10 text-cyan-200 px-3 py-1 rounded-full font-medium backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-[#00baf2]" /> Verified Merchant Account
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{displayBusinessName}</h2>
            <p className="text-sm text-gray-200 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-300" /> Owner: <span className="font-semibold text-white">{displayOwnerName}</span>
            </p>
          </div>

          {/* Balance Card Highlight */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 min-w-[240px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-cyan-200 mb-2">
              <span className="font-bold uppercase tracking-wider">Merchant Balance</span>
              <Wallet className="w-4 h-4 text-[#00baf2]" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">
              ₹{displayBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-cyan-200/80 mt-1">Available for payout & settlements</p>
          </div>
        </div>

        {/* Info Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Business Info Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#002e6e] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Name</p>
              <p className="text-base font-bold text-slate-800 mt-1">{displayBusinessName}</p>
            </div>
          </div>

          {/* Owner Info Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-[#00baf2] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Owner Name</p>
              <p className="text-base font-bold text-slate-800 mt-1">{displayOwnerName}</p>
            </div>
          </div>

          {/* Contact Email Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#002e6e]/10 text-[#002e6e] flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Merchant Email</p>
              <p className="text-base font-bold text-slate-800 mt-1 truncate">{displayEmail}</p>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400 mt-auto">
        <p>© Paytm Business Portal 2026. Secure PCI-DSS Compliant Infrastructure.</p>
      </footer>
    </div>
  );
}
