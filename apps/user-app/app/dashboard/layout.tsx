"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Send, History, Store, User } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Tracks current URL path automatically

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 hidden md:flex">
        <div className="text-2xl font-black text-[#002e6e] mb-8 tracking-tight">
          Paytm 
        </div>

        <nav className="flex-1 space-y-1.5">
          <SidebarItem 
            href="/dashboard" 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            active={pathname === "/dashboard"} 
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
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}

function SidebarItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
        active
          ? "bg-[#00baf2]/10 text-[#002e6e] font-bold shadow-sm border-l-4 border-[#00baf2] rounded-l-none"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span className={`transition-colors ${active ? "text-[#00baf2]" : "text-slate-400"}`}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
    </Link>
  );
}