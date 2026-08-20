"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Store, ArrowRight, ShieldCheck, Building2 } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#090d16] font-sans">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-[#0b101d] border-b border-slate-800/80 text-white py-4 px-6 md:px-12 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 p-0.5 shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            PayPulse <span className="text-indigo-400 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">Merchant</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-colors"
          >
            Merchant Sign In
          </Link>
          <Link
            href="/signup"
            className="text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl shadow-md transition-all"
          >
            Register Merchant
          </Link>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-xl w-full bg-[#0f172a] rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-800 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              PayPulse Merchant Portal
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Commercial business interface for accepting digital payments, monitoring transaction settlements, and managing merchant balances in real time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/login"
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <span>Merchant Sign In</span>
              <ArrowRight className="w-4 h-4 text-indigo-400" />
            </Link>
            <Link
              href="/signup"
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <span>Register Business Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Independent Merchant Security Gateway</span>
          </div>
        </div>
      </main>
    </div>
  );
}
