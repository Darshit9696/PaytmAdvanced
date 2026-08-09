import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db/client";
import { SearchUsers } from "@/components/SearchUsers";
import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";
import { DynamicTimerBanner } from "@/components/DynamicTimerBanner";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = Number(session.user.id);

  // Fetch user profile + wallet balance + recent real DB transactions
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
    },
  });

  // Pull last 4 transactions involving this user from your databasen for the recent transactions card
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
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
          Hi, {user?.name || "User"} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Here is your financial summary</p>
      </div>

      {/* 1. Dynamic Balance Card */}
      <div className="bg-[#06244f] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-cyan-200/80 text-xs font-bold uppercase tracking-wider">Available Balance</p>
            <h2 className="text-4xl font-black mt-1.5 tracking-tight">
              ₹{(user?.wallet?.balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h2>
          </div>

          {/* On-Ramp and Off-Ramp Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Primary Action: Add Money */}
            <Link
              href="/dashboard/on-ramp"
              className="h-11 bg-[#00baf2] hover:bg-sky-500 text-white px-6 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] shadow-sm text-center flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Money
            </Link>

            {/* Secondary Action: Withdraw */}
            <Link
              href="/dashboard/withdraw"
              className="h-11 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-6 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] shadow-sm text-center flex items-center justify-center gap-2"
            >
              <ArrowDownLeft className="w-4 h-4 text-slate-600" />
              Withdraw
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search Area */}
      <SearchUsers />

      {/* 3. Bottom Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Real DB Recent Transactions Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400">Recent Transactions</h3>
            <Link href="/dashboard/transactions" className="text-xs text-[#00baf2] font-bold hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-1 divide-y divide-slate-100">
            {dbTransactions.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No recent wallet transactions found.</p>
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

        {/* Real Quick Send Favorites Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400">Quick Send</h3>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {recentInteractions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 w-full text-center">People you pay will appear here.</p>
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

{/* Helper Component: Transaction Row */ }
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
    <div className="flex justify-between items-center py-3 first:pt-0 last:pb-0 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center border ${isSent ? "bg-red-50 border-red-100 text-red-500" : "bg-emerald-50 border-emerald-100 text-emerald-600"
            }`}
        >
          {isSent ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{name}</p>
          <p className="text-[11px] text-slate-400 font-medium font-mono">{date}</p>
        </div>
      </div>
      {/* Updated: Changed text-base font-black tracking-tight to text-sm font-medium */}
      <span className={`text-sm font-medium ${isSent ? "text-red-600" : "text-emerald-600"}`}>
        {isSent ? `-${amount.toLocaleString("en-IN")}` : `+${amount.toLocaleString("en-IN")}`}
      </span>
    </div>
  );
}

{/* Helper Component: Quick Send Action Avatar Redirect Link */ }
function QuickUser({ name, phone }: { name: string; phone: string }) {
  return (
    <Link
      href={`/dashboard/transfer?name=${encodeURIComponent(name)}&phone=${phone}`}
      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-[#00baf2] hover:bg-cyan-50/30 transition-all min-w-[84px] text-center"
    >
      <div className="w-11 h-11 bg-cyan-50 border border-cyan-100 rounded-full flex items-center justify-center text-[#002e6e] font-black text-xs uppercase shadow-inner">
        {name[0]}
      </div>
      <span className="text-[11px] font-bold text-slate-700 truncate max-w-[72px]">{name.split(" ")[0]}</span>
    </Link>
  );
}