import React from "react";
import Link from "next/link";
import { Building2, ShieldCheck, Lock, ArrowRight } from "lucide-react";

export default function BankAppHome() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="w-full bg-[#0b101d] border-b border-slate-800/80 py-4 px-6 md:px-12 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center font-black tracking-tighter text-xl">
            <span className="text-[#004C8F]">HDFC</span>
            <span className="text-[#ED1C24] ml-0.5">BANK</span>
          </div>
          <div className="h-5 w-px bg-slate-800" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Bank Simulation Gateway
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-bit SSL Secured</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-lg bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden text-center p-8 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              PayPulse Bank Simulation Gateway
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              This application operates as the mock banking backend for processing wallet on-ramp deposits and off-ramp withdrawals.
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">On-Ramp Deposit Gateway</span>
              <span className="text-cyan-400 font-medium">Bank Pay Handler</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Off-Ramp Payout Gateway</span>
              <span className="text-cyan-400 font-medium">Bank Payout Handler</span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="http://localhost:3000/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all text-sm"
            >
              <span>Return to User Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>HDFC Bank Simulated Webhook Infrastructure</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#060910] border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <p>© Dummy HDFC Bank 2026. Bank Gateway Simulation.</p>
      </footer>
    </div>
  );
}
