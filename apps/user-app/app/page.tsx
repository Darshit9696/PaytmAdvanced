"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Wallet,
  CreditCard,
  TrendingUp,
  Building2,
  User,
  CheckCircle2,
  Lock,
  Smartphone,
  Globe,
  Menu,
  X,
  ChevronRight,
  BarChart3,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Check
} from "lucide-react";

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-blue-600 selection:text-white font-sans relative">
      
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              PayPulse
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Products
            </a>
            <a href="#business" className="hover:text-white transition-colors">
              Business
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Security
            </a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="http://localhost:3000/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </a>
            <a
              href="#account-choice"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-600/20 transition-all"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0c1220] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg"
            >
              Products
            </a>
            <a
              href="#business"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg"
            >
              Business
            </a>
            <a
              href="#security"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg"
            >
              Security
            </a>

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <a
                href="http://localhost:3000/login"
                className="w-full text-center px-4 py-2.5 text-sm font-medium text-slate-200 bg-slate-800/80 rounded-xl"
              >
                Sign In
              </a>
              <a
                href="#account-choice"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Modern Payment Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Payments made simple.
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Send money, manage your wallet, and accept payments — all in one secure platform.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#account-choice"
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="http://localhost:3000/login"
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center"
              >
                Sign In
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant Transfers
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Protected Wallet
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Business Checkout
              </span>
            </div>
          </div>

          {/* Right Product Graphic Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
              
              {/* Wallet Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">PayPulse Wallet</h3>
                    <p className="text-xs text-slate-400">Digital Balance</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Verified
                </span>
              </div>

              {/* Balance Amount */}
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Balance</p>
                <div className="text-3xl font-extrabold text-white mt-1">
                  ₹24,500.00
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs text-slate-200">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Received</p>
                    <p className="text-[10px] text-slate-400">+₹1,200.00</p>
                  </div>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs text-slate-200">
                  <ArrowDownLeft className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Transfer</p>
                    <p className="text-[10px] text-slate-400">-₹450.00</p>
                  </div>
                </div>
              </div>

              {/* Merchant Sale Preview */}
              <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5 text-slate-200">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Store Payment Collected
                  </span>
                  <span className="text-emerald-400 font-bold">+₹3,490.00</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. ACCOUNT CHOICE SECTION */}
      <section id="account-choice" className="py-20 bg-[#0b101c] border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              How will you use PayPulse?
            </h2>
            <p className="text-slate-400 text-base">
              Choose the account type that fits your financial needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* PERSONAL CARD */}
            <div className="bg-[#0f172a] border border-slate-800 hover:border-blue-500/40 rounded-3xl p-8 transition-all flex flex-col justify-between">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">
                    PERSONAL
                  </h3>
                  <p className="text-slate-400 text-sm font-semibold">
                    "Your everyday digital wallet"
                  </p>
                </div>

                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Send money instantly</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Add and manage funds</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Track your spending</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8 grid sm:grid-cols-2 gap-3 mt-6 border-t border-slate-800">
                <a
                  href="http://localhost:3000/login"
                  className="px-5 py-3 text-center text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
                >
                  Sign In
                </a>
                <a
                  href="http://localhost:3000/signup"
                  className="px-5 py-3 text-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-all"
                >
                  Create Personal Account
                </a>
              </div>
            </div>

            {/* BUSINESS CARD */}
            <div className="bg-[#0f172a] border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-8 transition-all flex flex-col justify-between">
              <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">
                    BUSINESS
                  </h3>
                  <p className="text-slate-400 text-sm font-semibold">
                    "Power your business with payments"
                  </p>
                </div>

                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Accept customer payments</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Track transactions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Manage your business</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8 grid sm:grid-cols-2 gap-3 mt-6 border-t border-slate-800">
                <a
                  href="http://localhost:3002/login"
                  className="px-5 py-3 text-center text-sm font-semibold text-indigo-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
                >
                  Sign In
                </a>
                <a
                  href="http://localhost:3002/signup"
                  className="px-5 py-3 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all"
                >
                  Create Business Account
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Everything you need to move money
          </h2>
          <p className="text-slate-400 text-base">
            Simple, powerful tools designed for everyday payments and business growth.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Transfers</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Send and receive funds in seconds with instant ledger verification.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Secure Wallet</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Keep your digital balance safe and accessible whenever you need it.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Easy Money Management</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Add funds effortlessly from your bank account anytime with complete control.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Transaction History</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Clear, detailed records of all your deposits, transfers, and payments.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Spending Insights</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Simple visual summaries to help you monitor and manage cash flow.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Business Payments</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Collect customer checkout payments online with seamless merchant tools.
            </p>
          </div>

        </div>
      </section>

      {/* 5. TRUST / SECURITY SECTION */}
      <section id="security" className="py-20 bg-[#0b101c] border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Your money. Your data. Protected.
            </h2>
            <p className="text-slate-400 text-base">
              We prioritize security at every layer so you can transact with total confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Secure Authentication</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Protected login credentials and account access controls keep your profile secure.
              </p>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Protected Transactions</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                End-to-end verification safeguards every wallet deposit and payment transfer.
              </p>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Private Account Information</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your personal and financial records remain private, protected, and confidential.
              </p>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Transaction Monitoring</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Active system safeguards continuously track account activity to prevent unauthorized access.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. BUSINESS SECTION */}
      <section id="business" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              For Enterprises & Merchants
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built for businesses that want to move faster.
            </h2>

            <p className="text-slate-300 text-base leading-relaxed">
              Accept digital payments, streamline sales, and manage payouts from one intuitive dashboard.
            </p>

            <ul className="grid sm:grid-cols-2 gap-3 text-sm text-slate-300 pt-2">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Accept digital payments</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Track sales & metrics</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Monitor real-time activity</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Manage bank payouts</span>
              </li>
            </ul>

            <div className="pt-4">
              <a
                href="http://localhost:3002/signup"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg transition-all"
              >
                <span>Start Selling</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-20 bg-[#0b101c] border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Join thousands of individuals and businesses managing payments with PayPulse.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="http://localhost:3000/signup"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              <span>Open Personal Account</span>
            </a>

            <a
              href="http://localhost:3002/signup"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-indigo-200 bg-slate-900 border border-indigo-500/30 hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-5 h-5 text-indigo-400" />
              <span>Create Business Account</span>
            </a>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-[#060910] border-t border-slate-800 py-12 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="text-lg font-bold text-white">PayPulse</span>
            </div>

            <div className="flex flex-wrap gap-6 text-xs font-semibold text-slate-300">
              <a href="#features" className="hover:text-white transition-colors">Products</a>
              <a href="#business" className="hover:text-white transition-colors">Business</a>
              <a href="#security" className="hover:text-white transition-colors">Security</a>
              <a href="#security" className="hover:text-white transition-colors">Contact</a>
              <a href="#security" className="hover:text-white transition-colors">Privacy</a>
              <a href="#security" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} PayPulse Platform Inc. All rights reserved.</p>
            <div className="flex items-center gap-4 text-slate-400 font-medium">
              <a href="http://localhost:3000/login" className="hover:text-white">Personal Sign In</a>
              <span>•</span>
              <a href="http://localhost:3002/login" className="hover:text-white">Business Sign In</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}