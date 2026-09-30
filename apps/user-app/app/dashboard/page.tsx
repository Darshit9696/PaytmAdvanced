import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db/client";
import { SearchUsers } from "@/components/SearchUsers";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, Plus, Wallet, History, Send, QrCode } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // If a Merchant account is logged in, redirect them to the Merchant Dashboard
  if (session.user.role === "merchant") {
    redirect("/dashboard/merchant");
  }

  const userId = Number(session.user.id);

  if (isNaN(userId) || userId <= 0) {
    redirect("/login");
  }

  // Fetch user profile + wallet balance + recent real DB transactions
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Pull last 4 transactions involving this user from database
  const dbTransactions = await prisma.transaction.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    take: 4,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      sender: true,
      receiver: true,
    },
  });

  // Simple query to get distinct people you've interacted with for "Quick Send"
  const recentInteractions = await prisma.transaction.findMany({
    where: { senderId: userId },
    take: 5,
    orderBy: { createdAt: "desc" },
    distinct: ["receiverId"],
    include: { receiver: true },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Overview of your personal wallet balance and recent activity.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-cyan-400 border border-blue-500/20 text-xs font-semibold self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Active Session</span>
        </div>
      </div>

      {/* 1. Wallet Balance & Action Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-cyan-400" />
              <span>Available Wallet Balance</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              ₹{(user?.wallet?.balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Scan & Pay */}
            <Link
              href="/dashboard/scan"
              className="h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 rounded-xl text-sm font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan & Pay</span>
            </Link>

            {/* Add Money */}
            <Link
              href="/dashboard/on-ramp"
              className="h-11 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Add Money</span>
            </Link>

            {/* Send Money */}
            <Link
              href="/dashboard/transfer"
              className="h-11 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Send Money</span>
            </Link>

            {/* Withdraw */}
            <Link
              href="/dashboard/withdraw"
              className="h-11 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <ArrowDownLeft className="w-4 h-4 text-slate-400" />
              <span>Withdraw</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search Component */}
      <SearchUsers />

      {/* 3. Real Backend-backed Analytics, Charts & Top Friends */}
      <DashboardAnalytics />

      {/* 4. Bottom Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Recent Transactions Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" /> Recent Activity
            </h3>
            <Link href="/dashboard/transactions" className="text-xs text-cyan-400 font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-1 divide-y divide-slate-800/80">
            {dbTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent wallet transactions found.</p>
            ) : (
              dbTransactions.map((tx) => {
                const isSent = tx.senderId === userId;
                const displayUser = isSent ? tx.receiver : tx.sender;
                return (
                  <TransactionItem
                    key={tx.id}
                    name={displayUser.name}
                    isSent={isSent}
                    amount={tx.amount}
                    date={new Date(tx.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Quick Send Favorites Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Quick Transfers</h3>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {recentInteractions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 w-full text-center">People you pay will appear here.</p>
            ) : (
              recentInteractions.map((interaction) => (
                <QuickUser
                  key={interaction.id}
                  name={interaction.receiver.name}
                  phone={interaction.receiver.number}
                />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

{/* Helper Component: Transaction Row */}
function TransactionItem({
  name,
  isSent,
  amount,
  date,
}: {
  name: string;
  isSent: boolean;
  amount: number;
  date: string;
}) {
  return (
    <div className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center border ${
            isSent 
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}
        >
          {isSent ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">{name}</p>
          <p className="text-[11px] text-slate-400 font-mono">{date}</p>
        </div>
      </div>
      <span className={`text-sm font-semibold ${isSent ? "text-rose-400" : "text-emerald-400"}`}>
        {isSent ? `-${amount.toLocaleString("en-IN")}` : `+${amount.toLocaleString("en-IN")}`}
      </span>
    </div>
  );
}

{/* Helper Component: Quick Send Action Avatar */}
function QuickUser({ name, phone }: { name: string; phone: string }) {
  return (
    <Link
      href={`/dashboard/transfer?name=${encodeURIComponent(name)}&phone=${phone}`}
      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-800/80 transition-all min-w-[88px] text-center group"
    >
      <div className="w-11 h-11 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center text-cyan-300 font-bold text-xs uppercase group-hover:scale-105 transition-transform">
        {name[0]}
      </div>
      <span className="text-[11px] font-semibold text-slate-300 truncate max-w-[72px]">{name.split(" ")[0]}</span>
    </Link>
  );
}