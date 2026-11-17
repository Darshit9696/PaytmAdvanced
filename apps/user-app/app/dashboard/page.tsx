import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db/client";
import { SearchUsers } from "@/components/SearchUsers";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Wallet,
  History,
  Send,
  QrCode,
  Scale,
  Sparkles,
} from "lucide-react";
import { Amount, Avatar, Card, CardHeader, CardTitle, CardContent } from "@repo/ui";

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

  // Query to get distinct people interacted with for "Quick Send"
  const recentInteractions = await prisma.transaction.findMany({
    where: { senderId: userId },
    take: 6,
    orderBy: { createdAt: "desc" },
    distinct: ["receiverId"],
    include: { receiver: true },
  });

  const walletBalance = user?.wallet?.balance ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* 1. Header Greeting & Session Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text">
            Welcome back, {user.name}
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            Your personal wallet ledger, activity, and cash flow overview.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-text-muted self-start sm:self-auto shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Active Session</span>
        </div>
      </div>

      {/* 2. Calm Ledger Balance Hero Card */}
      <div className="bg-surface border border-border rounded-[10px] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle accent highlight bar on top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted uppercase tracking-wider">
              <Wallet className="w-3.5 h-3.5 text-primary" />
              <span>Available Wallet Balance</span>
            </div>
            <div className="flex items-baseline gap-3">
              <Amount value={walletBalance} size="4xl" weight="semibold" />
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-accent/20 text-primary px-2.5 py-0.5 rounded-md border border-accent/40">
                <Sparkles className="w-3 h-3" /> Ledger Verified
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
            {/* Scan & Pay */}
            <Link
              href="/dashboard/scan"
              className="h-10 bg-accent text-primary hover:bg-accent-hover px-4 rounded-[10px] text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer border border-accent/60"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan & Pay</span>
            </Link>

            {/* Send Money */}
            <Link
              href="/dashboard/transfer"
              className="h-10 bg-primary hover:bg-primary-hover text-white px-4 rounded-[10px] text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Money</span>
            </Link>

            {/* Add Money */}
            <Link
              href="/dashboard/on-ramp"
              className="h-10 bg-surface-subtle hover:bg-surface text-text border border-border hover:border-border-strong px-4 rounded-[10px] text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-primary" />
              <span>Add Money</span>
            </Link>

            {/* Withdraw */}
            <Link
              href="/dashboard/withdraw"
              className="h-10 bg-surface-subtle hover:bg-surface text-text border border-border hover:border-border-strong px-4 rounded-[10px] text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <ArrowDownLeft className="w-4 h-4 text-text-muted" />
              <span>Withdraw</span>
            </Link>

            {/* Ledger Audit */}
            <Link
              href="/dashboard/reconciliation"
              className="h-10 bg-surface-subtle hover:bg-surface text-primary border border-border hover:border-primary/40 px-3.5 rounded-[10px] text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              title="Continuous double-entry ledger audit"
            >
              <Scale className="w-4 h-4" />
              <span>Audit Ledger</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Search Users */}
      <SearchUsers />

      {/* 4. Analytics, Chart & Breakdown */}
      <DashboardAnalytics />

      {/* 5. Bottom Section: Recent Activity & Quick Transfers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Transactions Card */}
        <div className="bg-surface border border-border rounded-[10px] p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-text-muted flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-primary" />
              <span>Recent Activity</span>
            </h3>
            <Link
              href="/dashboard/transactions"
              className="text-xs text-primary font-medium hover:underline"
            >
              View statement →
            </Link>
          </div>

          <div className="space-y-1 divide-y divide-border">
            {dbTransactions.length === 0 ? (
              <p className="text-xs text-text-muted py-8 text-center">
                No recent wallet transactions found.
              </p>
            ) : (
              dbTransactions.map((tx) => {
                const isSent = tx.senderId === userId;
                const displayUser = isSent ? tx.receiver : tx.sender;
                return (
                  <TransactionItem
                    key={tx.id}
                    name={displayUser.name || "PayPulse User"}
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
        <div className="bg-surface border border-border rounded-[10px] p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-text-muted">
              Quick Transfers
            </h3>
            <span className="text-[11px] text-text-faint">Frequent contacts</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {recentInteractions.length === 0 ? (
              <p className="text-xs text-text-muted py-8 w-full text-center">
                People you pay will appear here.
              </p>
            ) : (
              recentInteractions.map((interaction) => (
                <QuickUser
                  key={interaction.id}
                  name={interaction.receiver.name || "Contact"}
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
    <div className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs ${
            isSent
              ? "bg-danger-subtle/40 border-danger/20 text-danger"
              : "bg-success-subtle/40 border-success/20 text-success"
          }`}
        >
          {isSent ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
        </div>
        <div>
          <p className="text-sm font-medium text-text">{name}</p>
          <p className="text-[11px] text-text-muted font-mono">{date}</p>
        </div>
      </div>
      <Amount
        value={amount}
        sign={isSent ? "negative" : "positive"}
        variant={isSent ? "danger" : "success"}
        size="sm"
        weight="semibold"
      />
    </div>
  );
}

{/* Helper Component: Quick Send Action Avatar */}
function QuickUser({ name, phone }: { name: string; phone: string }) {
  return (
    <Link
      href={`/dashboard/transfer?name=${encodeURIComponent(name)}&phone=${phone}`}
      className="flex flex-col items-center gap-2 p-3 rounded-[10px] border border-border bg-surface-subtle hover:bg-surface hover:border-border-strong transition-all min-w-[88px] text-center group shadow-xs"
    >
      <Avatar name={name} size="md" />
      <span className="text-[11px] font-medium text-text truncate max-w-[72px]">
        {name.split(" ")[0]}
      </span>
    </Link>
  );
}
