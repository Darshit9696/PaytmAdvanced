"use client";

import { Store, Building2, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@repo/ui";

export default function UserAppMerchantGatewayPage() {
  return (
    <div className="max-w-[1100px] w-full space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-surface border border-border rounded-[10px] p-6 sm:p-8 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium border border-primary/20">
          <ShieldCheck className="w-3.5 h-3.5" /> Merchant Business Console
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text">
          Merchant Settlement & Point of Sale
        </h1>
        <p className="text-xs sm:text-sm text-text-muted max-w-xl leading-relaxed">
          You are currently in your Personal Wallet account. Commercial merchant management, revenue analytics, dynamic QR generation, and payout settlements are operated in the dedicated Merchant Console.
        </p>
      </div>

      {/* Gateway Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Option 1: Login to Existing Merchant Account */}
        <div className="bg-surface border border-border rounded-[10px] p-6 shadow-xs space-y-4 flex flex-col justify-between group">
          <div className="space-y-3.5">
            <div className="w-11 h-11 rounded-[8px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text group-hover:text-primary transition-colors">
                Merchant Sign In
              </h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Access your standalone merchant console to inspect payment requests, revenue velocity, and real-time settlements.
              </p>
            </div>
          </div>
          <a
            href="http://localhost:3002/login"
            className="inline-flex items-center justify-center gap-2 w-full bg-surface-subtle hover:bg-surface text-text border border-border hover:border-border-strong font-medium py-2.5 px-4 rounded-[6px] text-xs transition-all shadow-xs"
          >
            <span>Open Merchant Sign In</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
          </a>
        </div>

        {/* Option 2: Register New Merchant Account */}
        <div className="bg-surface border border-border rounded-[10px] p-6 shadow-xs space-y-4 flex flex-col justify-between group">
          <div className="space-y-3.5">
            <div className="w-11 h-11 rounded-[8px] bg-accent/20 text-primary border border-accent/40 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text group-hover:text-primary transition-colors">
                Register Store Account
              </h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Create a dedicated commercial merchant profile to generate on-demand payment request QRs and receive customer checkouts.
              </p>
            </div>
          </div>
          <a
            href="http://localhost:3002/signup"
            className="inline-flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-primary-fg font-medium py-2.5 px-4 rounded-[6px] text-xs transition-all shadow-xs"
          >
            <span>Register Merchant Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
