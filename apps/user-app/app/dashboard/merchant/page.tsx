"use client";

import { Store, Building2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button, PageHeader } from "@repo/ui";

export default function UserAppMerchantGatewayPage() {
  const merchantAppUrl =
    process.env.NEXT_PUBLIC_MERCHANT_APP_URL ||
    (process.env.NODE_ENV !== "production" ? "http://localhost:3002" : "");
  const merchantLoginUrl = merchantAppUrl
    ? `${merchantAppUrl.replace(/\/+$/, "")}/login`
    : "#";
  const merchantSignupUrl = merchantAppUrl
    ? `${merchantAppUrl.replace(/\/+$/, "")}/signup`
    : "#";

  return (
    <div className="max-w-[1100px] w-full space-y-6 font-sans">
      <PageHeader
        title="Merchant Settlement & Point of Sale"
        subtitle="Commercial merchant management, dynamic QR generation, and store settlements"
      />

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
            href={merchantLoginUrl}
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
            href={merchantSignupUrl}
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
