"use client";

import Link from "next/link";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  QrCode,
  Send,
  History,
  Store,
  User,
  LogOut,
  Scale,
  Menu,
  X,
  CreditCard,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { NotificationBell } from "@/components/NotificationBell";
import { BottomTabBar, TabBarItem } from "@repo/ui/bottom-tab-bar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const { data: session } = useSession();

  const userName = session?.user?.name || "User";

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/dashboard/scan":
        return "Scan & Pay";
      case "/dashboard/transfer":
        return "Send Money";
      case "/dashboard/transactions":
        return "Transactions";
      case "/dashboard/reconciliation":
        return "Ledger & Audit";
      case "/dashboard/merchant":
        return "Merchant Portal";
      case "/dashboard/profile":
        return "Account";
      case "/dashboard/on-ramp":
        return "Add Money";
      case "/dashboard/withdraw":
        return "Withdraw";
      default:
        return "Dashboard";
    }
  };

  const pageTitle = getPageTitle(pathname);

  // Mobile Bottom Tab Bar items
  const mobileTabItems: TabBarItem[] = [
    {
      href: "/dashboard",
      label: "Home",
      icon: <LayoutDashboard className="w-4 h-4" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/transfer",
      label: "Send",
      icon: <Send className="w-4 h-4" />,
      active: pathname === "/dashboard/transfer",
    },
    {
      href: "/dashboard/scan",
      label: "Scan",
      icon: <QrCode className="w-4 h-4" />,
      active: pathname === "/dashboard/scan",
    },
    {
      href: "/dashboard/transactions",
      label: "Activity",
      icon: <History className="w-4 h-4" />,
      active: pathname === "/dashboard/transactions",
    },
    {
      href: "/dashboard/profile",
      label: "Account",
      icon: <User className="w-4 h-4" />,
      active: pathname === "/dashboard/profile",
    },
  ];

  return (
    <div className="flex h-screen bg-bg text-text font-sans overflow-hidden">
      
      {/* 1. DESKTOP SLIM LEFT RAIL */}
      <aside className="w-60 bg-surface border-r border-border flex flex-col p-4 hidden md:flex shrink-0">
        
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2 mb-6 group rounded-sm">
          <div className="w-8 h-8 rounded-sm bg-primary text-primary-fg flex items-center justify-center font-bold text-sm tracking-tight shadow-xs select-none">
            P
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-text">PayPulse</span>
            <span className="text-[10px] tracking-wider uppercase font-medium text-text-muted -mt-0.5">
              Personal Ledger
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          <RailItem
            href="/dashboard"
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Dashboard"
            active={pathname === "/dashboard"}
          />
          <RailItem
            href="/dashboard/transfer"
            icon={<Send className="w-4 h-4" />}
            label="Send Money"
            active={pathname === "/dashboard/transfer"}
          />
          <RailItem
            href="/dashboard/scan"
            icon={<QrCode className="w-4 h-4" />}
            label="Scan & Pay"
            active={pathname === "/dashboard/scan"}
          />
          <RailItem
            href="/dashboard/transactions"
            icon={<History className="w-4 h-4" />}
            label="Transactions"
            active={pathname === "/dashboard/transactions"}
          />
          <RailItem
            href="/dashboard/reconciliation"
            icon={<Scale className="w-4 h-4" />}
            label="Ledger Audit"
            active={pathname === "/dashboard/reconciliation"}
          />
          <RailItem
            href="/dashboard/merchant"
            icon={<Store className="w-4 h-4" />}
            label="Merchant Gateway"
            active={pathname === "/dashboard/merchant"}
          />
          <RailItem
            href="/dashboard/profile"
            icon={<User className="w-4 h-4" />}
            label="Profile"
            active={pathname === "/dashboard/profile"}
          />
        </nav>

        {/* Bottom User Profile Card & Logout */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-primary-tint text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-text truncate">{userName}</p>
              <p className="text-[10px] text-text-faint font-mono">Personal</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 text-text-faint hover:text-danger hover:bg-danger-tint rounded-sm transition-colors cursor-pointer"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="bg-surface/90 backdrop-blur-xs border-b border-border px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between z-30 shrink-0">
          
          {/* Mobile Brand Link */}
          <Link href="/" className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-sm bg-primary text-primary-fg flex items-center justify-center font-bold text-xs select-none">
              P
            </div>
            <span className="text-sm font-bold text-text">PayPulse</span>
          </Link>

          {/* Desktop Breadcrumb Navigation */}
          <div className="hidden md:flex items-center gap-1.5 text-xs">
            <span className="text-text-muted font-medium">PayPulse</span>
            <span className="text-text-faint">/</span>
            <span className="text-text font-semibold">{pageTitle}</span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            <NotificationBell />

            {/* Mobile Drawer Menu Toggle */}
            <button
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className="md:hidden p-2 text-text-muted hover:text-text rounded-sm border border-border bg-surface cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Mobile Full Menu Drawer */}
        {isMobileDrawerOpen && (
          <div className="md:hidden bg-surface border-b border-border px-4 py-3 space-y-1 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
            <RailItem
              href="/dashboard"
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Dashboard"
              active={pathname === "/dashboard"}
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            <RailItem
              href="/dashboard/transfer"
              icon={<Send className="w-4 h-4" />}
              label="Send Money"
              active={pathname === "/dashboard/transfer"}
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            <RailItem
              href="/dashboard/scan"
              icon={<QrCode className="w-4 h-4" />}
              label="Scan & Pay"
              active={pathname === "/dashboard/scan"}
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            <RailItem
              href="/dashboard/transactions"
              icon={<History className="w-4 h-4" />}
              label="Transactions"
              active={pathname === "/dashboard/transactions"}
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            <RailItem
              href="/dashboard/reconciliation"
              icon={<Scale className="w-4 h-4" />}
              label="Ledger Audit"
              active={pathname === "/dashboard/reconciliation"}
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            <RailItem
              href="/dashboard/merchant"
              icon={<Store className="w-4 h-4" />}
              label="Merchant Gateway"
              active={pathname === "/dashboard/merchant"}
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            <RailItem
              href="/dashboard/profile"
              icon={<User className="w-4 h-4" />}
              label="Account Profile"
              active={pathname === "/dashboard/profile"}
              onClick={() => setIsMobileDrawerOpen(false)}
            />

            <div className="pt-2 mt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted truncate">Signed in as {userName}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="font-medium text-danger hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>

        {/* 3. MOBILE BOTTOM TAB BAR */}
        <BottomTabBar items={mobileTabItems} />

      </div>
    </div>
  );
}

function RailItem({
  href,
  icon,
  label,
  active = false,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium transition-all duration-150 cursor-pointer ${
        active
          ? "bg-primary-tint text-primary font-semibold border-l-2 border-primary"
          : "text-text-muted hover:text-text hover:bg-surface-subtle"
      }`}
    >
      <span className={`shrink-0 transition-colors ${active ? "text-primary" : "text-text-faint"}`}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
