"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Wallet,
  CreditCard,
  TrendingUp,
  Building2,
  User,
  CheckCircle2,
  Lock,
  Menu,
  X,
  BarChart3,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  Scale,
  Sparkles,
} from "lucide-react";
import { Amount, Avatar, Button } from "@repo/ui";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary selection:text-white font-sans relative">
      {/* --------------------------------------------------------------------- */}
      {/* 1. NAVBAR                                                             */}
      {/* --------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[8px] bg-primary flex items-center justify-center text-white shadow-xs">
              <Scale className="w-4 h-4 text-accent" />
            </div>
            <span className="text-base font-semibold tracking-tight text-text">
              PayPulse
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-text-muted">
            <a href="#features" className="hover:text-text transition-colors">
              Platform Features
            </a>
            <a href="#account-choice" className="hover:text-text transition-colors">
              Account Types
            </a>
            <a href="#security" className="hover:text-text transition-colors">
              Ledger Security
            </a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors"
            >
              Sign In
            </Link>
            <a
              href="#account-choice"
              className="px-4 py-2 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-[6px] shadow-xs transition-all"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-muted hover:text-text rounded-[6px] border border-border"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-surface border-b border-border px-4 pt-3 pb-6 space-y-3">
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-text hover:bg-surface-subtle rounded-[6px]"
            >
              Platform Features
            </a>
            <a
              href="#account-choice"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-text hover:bg-surface-subtle rounded-[6px]"
            >
              Account Types
            </a>
            <a
              href="#security"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-text hover:bg-surface-subtle rounded-[6px]"
            >
              Ledger Security
            </a>

            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center px-4 py-2 text-xs font-medium text-text bg-surface-subtle border border-border rounded-[6px]"
              >
                Sign In
              </Link>
              <a
                href="#account-choice"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-xs font-medium text-white bg-primary rounded-[6px]"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </header>

      {/* --------------------------------------------------------------------- */}
      {/* 2. HERO SECTION                                                       */}
      {/* --------------------------------------------------------------------- */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-medium text-amber-700 dark:text-amber-300 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Payments Simulator • Virtual Ledger (No Real Money)</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-text leading-[1.12]">
              Payments made simple.
              <br />
              <span className="text-primary font-normal">Every rupee accounted for.</span>
            </h1>

            <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Send money peer-to-peer, manage your protected wallet balance, and collect customer checkout payments with an immutable, balanced ledger.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <a
                href="#account-choice"
                className="w-full sm:w-auto px-6 py-3 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-[6px] shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Open An Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-3 text-xs font-medium text-text bg-surface border border-border hover:bg-surface-subtle rounded-[6px] shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Instant Demo Login</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded font-mono">No Signup</span>
              </Link>
            </div>

            {/* Invariant Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-text-muted font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Atomic Transfers
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Strict NetBanking On-Ramp
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Real-Time Double-Entry
              </span>
            </div>
          </div>

          {/* Right Product Preview Card (Built with REAL components) */}
          <div className="lg:col-span-5 relative">
            <div className="bg-surface border border-border rounded-[10px] p-6 shadow-xs space-y-5">
              {/* Product Card Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[6px] bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text">Consumer ledger</h3>
                    <p className="text-[11px] text-text-muted font-mono">Personal wallet #1042</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium bg-accent/20 text-primary border border-accent/40">
                  Balanced
                </span>
              </div>

              {/* Balance Amount Display */}
              <div className="space-y-1">
                <p className="text-xs text-text-muted font-medium">
                  Ledger balance
                </p>
                <div>
                  <Amount value={124500.0} size="3xl" weight="semibold" />
                </div>
              </div>

              {/* Real Component Activity Preview (Flat dividers) */}
              <div className="space-y-2 pt-1 border-t border-border">
                <span className="text-xs font-medium text-text-muted block">
                  Recent activity
                </span>

                <div className="divide-y divide-border border-t border-b border-border">
                  <div className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-success-subtle/50 text-success flex items-center justify-center border border-success/30">
                        <ArrowDownLeft className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-medium text-text">Aarav Sharma</p>
                        <p className="text-[10px] text-text-muted font-mono">P2P Credit • 10:42 AM</p>
                      </div>
                    </div>
                    <Amount value={4500.0} sign="positive" variant="success" size="xs" weight="semibold" />
                  </div>

                  <div className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-danger-subtle/50 text-danger flex items-center justify-center border border-danger/30">
                        <ArrowUpRight className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-medium text-text">Blue Tokai Coffee</p>
                        <p className="text-[10px] text-text-muted font-mono">Merchant Checkout • 09:15 AM</p>
                      </div>
                    </div>
                    <Amount value={340.0} sign="negative" variant="danger" size="xs" weight="semibold" />
                  </div>
                </div>
              </div>

              {/* Footnote */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-text-muted">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Verified
                </span>
                <span className="font-mono text-text">Debits == Credits</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 3. THREE FEATURE BLOCKS                                               */}
      {/* --------------------------------------------------------------------- */}
      <section id="features" className="py-20 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-medium text-primary">
              Financial infrastructure
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text tracking-tight">
              Quietly premium, mathematically sound.
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Built on double-entry accounting principles where every transaction is matched and verified.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Block 1: Instant Transfers */}
            <div className="bg-surface-subtle border border-border rounded-[10px] p-6 space-y-3.5 shadow-xs">
              <div className="w-9 h-9 rounded-[6px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-text">Instant Peer Transfers</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Send funds to any registered mobile number or contact with zero latency. Every transfer records paired atomic debit and credit ledger rows.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-mono text-primary font-medium">Idempotency-guaranteed</span>
              </div>
            </div>

            {/* Block 2: Protected Wallet */}
            <div className="bg-surface-subtle border border-border rounded-[10px] p-6 space-y-3.5 shadow-xs">
              <div className="w-9 h-9 rounded-[6px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-text">Protected Ledger Wallet</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Your wallet balance is an exact, computable sum of historic ledger entries. Run live audit jobs anytime to verify that zero drift exists.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-mono text-primary font-medium">Continuous audit engine</span>
              </div>
            </div>

            {/* Block 3: Store Checkout */}
            <div className="bg-surface-subtle border border-border rounded-[10px] p-6 space-y-3.5 shadow-xs">
              <div className="w-9 h-9 rounded-[6px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-text">Commercial Point-of-Sale</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Merchants generate on-demand dynamic payment QRs or countertop standees. Customers scan to authorize instant wallet settlements.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-mono text-primary font-medium">Real-time settlement</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 4. ACCOUNT CHOICE SECTION (Personal vs Business)                      */}
      {/* --------------------------------------------------------------------- */}
      <section id="account-choice" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-medium text-primary">
            Account options
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-text tracking-tight">
            Designed for consumers and merchants
          </h2>
          <p className="text-xs sm:text-sm text-text-muted">
            Select the dedicated environment tailored to your transactions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* PERSONAL CARD */}
          <div className="bg-surface border border-border hover:border-border-strong rounded-[10px] p-6 sm:p-8 transition-all flex flex-col justify-between shadow-xs">
            <div className="space-y-5">
              <div className="w-10 h-10 rounded-[8px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-text">Personal Account</h3>
                  <span className="text-[10px] font-mono bg-surface-subtle text-text-muted px-2 py-0.5 rounded border border-border">
                    Consumer
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  Peer-to-peer transfers, deposits, withdrawals, and spending analytics.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-text-muted pt-2 border-t border-border">
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Instant peer-to-peer wallet transfers</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>On-ramp NetBanking deposit simulation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Scan merchant QRs to pay checkout orders</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Ledger reconciliation audit tool</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 grid sm:grid-cols-2 gap-2.5 mt-4 border-t border-border">
              <Link
                href="/login"
                className="px-4 py-2 text-center text-xs font-medium text-text bg-surface-subtle hover:bg-surface border border-border rounded-[6px] transition-all shadow-xs"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-center text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-[6px] shadow-xs transition-all"
              >
                Open Personal Account
              </Link>
            </div>
          </div>

          {/* BUSINESS / MERCHANT CARD */}
          <div className="bg-surface border border-border hover:border-border-strong rounded-[10px] p-6 sm:p-8 transition-all flex flex-col justify-between shadow-xs">
            <div className="space-y-5">
              <div className="w-10 h-10 rounded-[8px] bg-accent/20 text-primary border border-accent/40 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-text">Merchant Console</h3>
                  <span className="text-[10px] font-mono bg-accent/20 text-primary px-2 py-0.5 rounded border border-accent/40">
                    Commercial
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  Point-of-sale dynamic charges, countertop standee QRs, and daily velocity.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-text-muted pt-2 border-t border-border">
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Generate on-demand charge requests</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Download printable store countertop standee QR</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>7-day sales and order volume velocity charts</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Real-time customer payment settlement log</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 grid sm:grid-cols-2 gap-2.5 mt-4 border-t border-border">
              <a
                href="http://localhost:3002/login"
                className="px-4 py-2 text-center text-xs font-medium text-text bg-surface-subtle hover:bg-surface border border-border rounded-[6px] transition-all shadow-xs"
              >
                Merchant Sign In
              </a>
              <a
                href="http://localhost:3002/signup"
                className="px-4 py-2 text-center text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-[6px] shadow-xs transition-all"
              >
                Register Store Account
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 5. TRUST & SECURITY SECTION                                           */}
      {/* --------------------------------------------------------------------- */}
      <section id="security" className="py-20 bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Verification Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text tracking-tight">
              Integrity guaranteed by design
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Three strict database invariants enforce ledger correctness around the clock.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-surface-subtle border border-border rounded-[10px] p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-text">Zero Unpaired Legs</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Money cannot be created or destroyed. Every transaction commits matched debit and credit records atomically.
              </p>
            </div>

            <div className="bg-surface-subtle border border-border rounded-[10px] p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-text">Idempotent Delivery</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Client-generated UUID idempotency keys guarantee network retries never debit or credit a wallet twice.
              </p>
            </div>

            <div className="bg-surface-subtle border border-border rounded-[10px] p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-text">Audit Trail Proof</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Immutable, append-only logs in postgres maintain an unalterable financial record for every participant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 6. CLEAN FOOTER                                                       */}
      {/* --------------------------------------------------------------------- */}
      <footer className="bg-surface-subtle border-t border-border py-12 text-text-muted text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[6px] bg-primary flex items-center justify-center text-accent">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-text">PayPulse</span>
              <span className="text-[11px] text-text-muted">Calm Ledger Architecture</span>
            </div>

            <div className="flex flex-wrap gap-5 text-xs text-text-muted">
              <a href="#features" className="hover:text-text transition-colors">Features</a>
              <a href="#account-choice" className="hover:text-text transition-colors">Accounts</a>
              <a href="#security" className="hover:text-text transition-colors">Security</a>
              <Link href="/login" className="hover:text-text transition-colors">Personal Portal</Link>
              <a href="http://localhost:3002/login" className="hover:text-text transition-colors">Merchant Console</a>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-faint">
            <p>© {new Date().getFullYear()} PayPulse Financial Platform. All rights reserved.</p>
            <div className="flex items-center gap-4 text-text-muted">
              <Link href="/login" className="hover:text-text">Personal Sign In</Link>
              <span>•</span>
              <a href="http://localhost:3002/login" className="hover:text-text">Merchant Sign In</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
