"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Building2, ArrowRight, ShieldCheck, QrCode, BarChart3, Wallet } from "lucide-react";
import { Button } from "@repo/ui";

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
      <div className="flex h-screen w-full items-center justify-center bg-bg font-sans">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text font-sans">
      {/* Top Navbar */}
      <header className="bg-surface border-b border-border py-4 px-6 md:px-12 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[6px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight text-text">PayPulse</span>
            <span className="text-[10px] font-mono font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-[4px] border border-primary/20">
              MERCHANT
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="text-xs font-medium text-text-muted hover:text-text px-3 py-1.5 rounded-[6px] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-xs font-medium bg-primary hover:bg-primary-hover text-white px-3.5 py-1.5 rounded-[6px] transition-all shadow-xs"
          >
            Register Store
          </Link>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-lg w-full bg-surface rounded-[10px] p-6 sm:p-8 shadow-xs border border-border text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

          <div className="w-12 h-12 rounded-[8px] bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-semibold text-text tracking-tight">
              PayPulse Merchant Console
            </h1>
            <p className="text-xs sm:text-sm text-text-muted max-w-sm mx-auto leading-relaxed">
              Accept consumer checkout payments, generate dynamic charge QRs, and reconcile revenue settlements in real time.
            </p>
          </div>

          {/* Quick Value Props */}
          <div className="grid grid-cols-3 gap-2 py-1 text-left">
            <div className="p-2.5 bg-surface-subtle border border-border rounded-[6px] space-y-1">
              <QrCode className="w-4 h-4 text-primary" />
              <p className="text-[11px] font-medium text-text">Countertop QR</p>
              <p className="text-[10px] text-text-muted">Instant customer scan</p>
            </div>
            <div className="p-2.5 bg-surface-subtle border border-border rounded-[6px] space-y-1">
              <BarChart3 className="w-4 h-4 text-primary" />
              <p className="text-[11px] font-medium text-text">Sales Velocity</p>
              <p className="text-[10px] text-text-muted">7-day breakdown</p>
            </div>
            <div className="p-2.5 bg-surface-subtle border border-border rounded-[6px] space-y-1">
              <Wallet className="w-4 h-4 text-primary" />
              <p className="text-[11px] font-medium text-text">Instant Payout</p>
              <p className="text-[10px] text-text-muted">Direct bank settlement</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <Link
              href="/login"
              className="flex-1 bg-surface-subtle hover:bg-surface text-text border border-border hover:border-border-strong font-medium py-2.5 px-4 rounded-[6px] transition-all flex items-center justify-center gap-1.5 text-xs shadow-xs"
            >
              <span>Merchant Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </Link>
            <Link
              href="/signup"
              className="flex-1 bg-primary hover:bg-primary-hover text-white font-medium py-2.5 px-4 rounded-[6px] transition-all flex items-center justify-center gap-1.5 text-xs shadow-xs"
            >
              <span>Register Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-center gap-2 text-[11px] text-text-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            <span>Encrypted Double-Entry Merchant Protocol</span>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface border-t border-border py-3 px-6 text-center text-xs text-text-faint">
        <p>© PayPulse Merchant Console 2026. Enterprise Ledger System.</p>
      </footer>
    </div>
  );
}
