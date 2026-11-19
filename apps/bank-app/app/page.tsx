import React from "react";
import Link from "next/link";
import { Building2, ShieldCheck, Lock, ArrowRight } from "lucide-react";
import { Button, ThemeToggle } from "@repo/ui";

export default function BankAppHome() {
  const userAppUrl =
    process.env.NEXT_PUBLIC_USER_APP_URL ||
    (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "");
  const returnDashboardUrl = userAppUrl
    ? `${userAppUrl.replace(/\/+$/, "")}/dashboard`
    : "#";
  return (
    <div className="min-h-screen bg-bg text-text font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="w-full bg-surface border-b border-border py-4 px-6 md:px-12 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center font-bold tracking-tight text-base text-text">
            <span>HDFC Bank</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
            Simulated Core Banking
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="icon" />
          <div className="flex items-center gap-1.5 text-xs text-text-muted bg-surface-subtle border border-border px-3 py-1 rounded-full">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>256-bit Encrypted Session</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md bg-surface rounded-[10px] shadow-xs border border-border text-center p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

          <div className="w-12 h-12 rounded-[8px] bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold text-text tracking-tight">
              Bank Gateway Simulation
            </h1>
            <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
              Provides the simulated core banking layer for processing on-ramp wallet deposits and off-ramp bank withdrawals.
            </p>
          </div>

          <div className="bg-surface-subtle rounded-[8px] p-4 border border-border text-xs text-text-muted space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-text-muted font-medium">Deposit Simulation:</span>
              <span className="font-mono text-primary">/pay?token=...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted font-medium">Payout Simulation:</span>
              <span className="font-mono text-primary">/payout?token=...</span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={returnDashboardUrl}
              className="inline-flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-hover text-primary-fg font-medium py-2.5 px-4 rounded-[6px] shadow-xs transition-all text-xs"
            >
              <span>Return to Consumer Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            <span>Simulated Webhook Infrastructure</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface border-t border-border py-3 px-6 text-center text-xs text-text-faint">
        <p>© Simulated Core Banking Gateway 2026. Internal Test Network.</p>
      </footer>
    </div>
  );
}
