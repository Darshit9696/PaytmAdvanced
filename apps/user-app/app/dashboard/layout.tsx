import Link from "next/link";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 hidden md:flex">
        <div className="text-2xl font-bold text-blue-900 mb-8 flex items-center gap-2">
           Paytm 
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem href="/dashboard" icon="🏠" label="Dashboard" active />
          <SidebarItem href="/dashboard/transfer" icon="💸" label="Send Money" />
          <SidebarItem href="/dashboard/transactions" icon="📜" label="Transactions" />
          <SidebarItem href="/dashboard/merchant" icon="🏪" label="Merchant" />
          <SidebarItem href="/dashboard/profile" icon="👤" label="Profile" />
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
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
        active
          ? "bg-blue-50 text-blue-600 font-semibold"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );
}