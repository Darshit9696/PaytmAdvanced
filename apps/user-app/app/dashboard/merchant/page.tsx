"use client";

import { Store, Building2, ArrowRight, ShieldCheck } from "lucide-react";

export default function UserAppMerchantGatewayPage() {
  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 font-sans space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 text-white shadow-lg space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full font-semibold border border-indigo-500/20">
          <ShieldCheck className="w-4 h-4 text-indigo-400" /> Merchant Portal Gateway
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">PayPulse Merchant Platform</h1>
        <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
          You are currently in your Personal User Account. Commercial merchant management, revenue analytics, and payment settlements run on the dedicated Merchant Application.
        </p>
      </div>

      {/* Gateway Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Option 1: Login to Existing Merchant Account */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">Merchant Login</h2>
              <p className="text-xs text-slate-400 mt-1">
                Access your standalone merchant console to view transactions and revenue metrics.
              </p>
            </div>
          </div>
          <a
            href="http://localhost:3002/login"
            className="inline-flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-sm"
          >
            <span>Open Merchant Sign In</span>
            <ArrowRight className="w-4 h-4 text-indigo-400" />
          </a>
        </div>

        {/* Option 2: Register New Merchant Account */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">Register Business</h2>
              <p className="text-xs text-slate-400 mt-1">
                Create a dedicated business merchant account to accept customer checkout payments.
              </p>
            </div>
          </div>
          <a
            href="http://localhost:3002/signup"
            className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-sm"
          >
            <span>Register Merchant Account</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
