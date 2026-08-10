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
      router.push("/merchant/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 font-sans">
        <div className="w-8 h-8 border-4 border-[#00baf2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f7fa] font-sans">
      {/* Top Navbar */}
      <header className="bg-[#002e6e] text-white py-4 px-6 md:px-12 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#00baf2]">
            <Store className="w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Paytm <span className="text-[#00baf2] text-sm font-bold">Business</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/merchant/login"
            className="text-xs font-bold text-cyan-200 hover:text-white px-4 py-2 rounded-xl transition-colors"
          >
            Login
          </Link>
          <Link
            href="/merchant/signup"
            className="text-xs font-bold bg-[#00baf2] hover:bg-[#00a3d9] text-white px-4 py-2 rounded-xl shadow-sm transition-all"
          >
            Register Merchant
          </Link>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#002e6e]/10 text-[#002e6e] flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Paytm Merchant Services
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Accept digital payments, monitor transaction settlements, and manage your merchant balance in real time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/merchant/login"
              className="flex-1 bg-[#002e6e] hover:bg-[#002252] text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>Merchant Login</span>
              <ArrowRight className="w-4 h-4 text-[#00baf2]" />
            </Link>
            <Link
              href="/merchant/signup"
              className="flex-1 bg-[#00baf2] hover:bg-[#00a3d9] text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>Create Business Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-bit Encrypted Banking Grade Security</span>
          </div>
        </div>
      </main>
    </div>
  );
}
