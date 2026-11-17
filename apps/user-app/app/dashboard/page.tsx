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
    <div className="max-w-[1100px] w-full space-y-6 font-sans">
      {/* 1. Header Greeting (Small, 16px, regular, muted) */}
      <div>
        <p className="text-base text-text-muted font-normal">
          Welcome back, {user.name}
        </p>
      </div>

      {/* 2. Calm Ledger Balance Hero Card */}
      <div className="bg-surface border border-border rounded-[10px] p-5 sm:px-6 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-text-muted block">
              Available balance
            </span>
            <div>
              <Amount value={walletBalance} size="display" weight="medium" />
            </div>
          </div>

          {/* Action Row - Only "Send money" (primary, filled) and "Add money" (secondary, outline) */}
          <div className="flex items-center gap-2.5">
            {/* Send Money - Primary filled button (no shadow, 1px border) */}
            <Link
              href="/dashboard/transfer"
              className="h-10 bg-primary hover:bg-primary-hover text-white px-4 rounded-[8px] text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-primary cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send money</span>
            </Link>

            {/* Add Money - Outline button (no shadow, 1px border) */}
            <Link
              href="/dashboard/on-ramp"
              className="h-10 bg-surface hover:bg-surface-subtle text-text border border-border hover:border-border-strong px-4 rounded-[8px] text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-text-muted" />
              <span>Add money</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Search Users (40px high, max-w-[480px], debounced, no search button) */}
      <SearchUsers />

      {/* 4. Analytics, Chart & Breakdown */}
      <DashboardAnalytics />

      {/* 5. Bottom Section: Recent Activity & Quick Transfers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Transactions Card */}
        <div className="bg-surface border border-border rounded-[10px] p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <h3 className="font-medium text-xs text-text-muted flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-primary" />
              <span>Recent activity</span>
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
        <div className="bg-surface border border-border rounded-[10px] p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <h3 className="font-medium text-xs text-text-muted">
              Quick transfers
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

{/* Helper Component: Quick Send Action Avatar (Flat, no card-in-card) */}
function QuickUser({ name, phone }: { name: string; phone: string }) {
  return (
    <Link
      href={`/dashboard/transfer?name=${encodeURIComponent(name)}&phone=${phone}`}
      className="flex flex-col items-center gap-1.5 p-2 rounded-[8px] hover:bg-surface-subtle transition-colors min-w-[76px] text-center group cursor-pointer"
    >
      <Avatar name={name} size="md" />
      <span className="text-[11px] font-medium text-text truncate max-w-[72px]">
        {name.split(" ")[0]}
      </span>
    </Link>
  );
}
