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
  Zap,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: session } = useSession();

  const userName = session?.user?.name || "User";

  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 font-sans overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#0b101d] border-r border-slate-800/80 flex flex-col p-6 hidden md:flex shrink-0">
        
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 mb-8 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#090d16] rounded-[9px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-white">
              PayPulse
            </span>
            <span className="text-[10px] font-semibold text-cyan-400 tracking-wider uppercase -mt-1">
              Personal App
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5">
          <SidebarItem
            href="/dashboard"
            icon={<LayoutDashboard className="w-5 h-5" />}
            label="Dashboard"
            active={pathname === "/dashboard"}
          />
          <SidebarItem
            href="/dashboard/scan"
            icon={<QrCode className="w-5 h-5" />}
            label="Scan & Pay"
            active={pathname === "/dashboard/scan"}
          />
          <SidebarItem
            href="/dashboard/transfer"
            icon={<Send className="w-5 h-5" />}
            label="Send Money"
            active={pathname === "/dashboard/transfer"}
          />
          <SidebarItem
            href="/dashboard/transactions"
            icon={<History className="w-5 h-5" />}
            label="Transactions"
            active={pathname === "/dashboard/transactions"}
          />
          <SidebarItem
            href="/dashboard/merchant"
            icon={<Store className="w-5 h-5" />}
            label="Merchant"
            active={pathname === "/dashboard/merchant"}
          />
          <SidebarItem
            href="/dashboard/profile"
            icon={<User className="w-5 h-5" />}
            label="Profile"
            active={pathname === "/dashboard/profile"}
          />
        </nav>

        {/* Bottom User Card / Logout */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0">
              {userName[0]}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] text-slate-400">Personal</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Container Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header Bar */}
        <header className="md:hidden bg-[#0b101d] border-b border-slate-800/80 px-4 py-3.5 flex items-center justify-between z-40">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5">
              <div className="w-full h-full bg-[#090d16] rounded-[6px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <span className="text-base font-extrabold text-white">PayPulse</span>
          </Link>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer Overlay */}
        {isMobileOpen && (
          <div className="md:hidden bg-[#0c1220] border-b border-slate-800 px-4 py-4 space-y-2 z-40">
            <SidebarItem
              href="/dashboard"
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Dashboard"
              active={pathname === "/dashboard"}
              onClick={() => setIsMobileOpen(false)}
            />
            <SidebarItem
              href="/dashboard/scan"
              icon={<QrCode className="w-5 h-5" />}
              label="Scan & Pay"
              active={pathname === "/dashboard/scan"}
              onClick={() => setIsMobileOpen(false)}
            />
            <SidebarItem
              href="/dashboard/transfer"
              icon={<Send className="w-5 h-5" />}
              label="Send Money"
              active={pathname === "/dashboard/transfer"}
              onClick={() => setIsMobileOpen(false)}
            />
            <SidebarItem
              href="/dashboard/transactions"
              icon={<History className="w-5 h-5" />}
              label="Transactions"
              active={pathname === "/dashboard/transactions"}
              onClick={() => setIsMobileOpen(false)}
            />
            <SidebarItem
              href="/dashboard/merchant"
              icon={<Store className="w-5 h-5" />}
              label="Merchant"
              active={pathname === "/dashboard/merchant"}
              onClick={() => setIsMobileOpen(false)}
            />
            <SidebarItem
              href="/dashboard/profile"
              icon={<User className="w-5 h-5" />}
              label="Profile"
              active={pathname === "/dashboard/profile"}
              onClick={() => setIsMobileOpen(false)}
            />

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Logged in as {userName}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-xs font-semibold text-rose-400 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarItem({
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
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
        active
          ? "bg-blue-600/15 text-cyan-400 font-bold border-l-4 border-cyan-400 rounded-l-none"
          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
      }`}
    >
      <span className={`transition-colors ${active ? "text-cyan-400" : "text-slate-400"}`}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
    </Link>
  );
}