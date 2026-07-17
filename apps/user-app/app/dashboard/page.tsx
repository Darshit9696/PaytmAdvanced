import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // or your auth options path
import { redirect } from "next/navigation";
import { prisma } from "@repo/db/client";
import { SearchUsers } from "@/components/SearchUsers";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: Number(session.user.id),
    },
    include: {
      wallet: true,
    },
  });

  return (
    // max-w-5xl
    // Sets the maximum width of the container. basically makes the box not stretch too much on large screens.
    // mx means margin-left and margin-right.So the container becomes centered.
    // space-y-6 adds vertical spacing btw all direct child elements.
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Greeting */}
      <div>
        {/* md means medium screens and larger. mobile -> 2xl and medium and large screens pe 3xl */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Hi, {user?.name || "User"} 👋
        </h1>
        <p className="text-slate-500 text-sm">Here is your financial summary</p>
      </div>

      {/* 1. Balance Card */}
      {/* relative : "Children using absolute positioning should use this card as their reference." */}
      {/* justify-between : Pushes the two children to opposite ends. */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-sm font-medium">Available Balance</p>
            {/* mt : margin from top to be 1 */}
            <h2 className="text-4xl font-extrabold mt-1">{user?.wallet?.balance?.toFixed(2)?.toString() || "0.00"}</h2>
            <p className="text-emerald-400 text-sm mt-2 font-medium">
              ↑ +₹250 Today
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
            Updated 2 mins ago
          </span>
        </div>
      </div>

     <SearchUsers/>

      {/* 3. Bottom Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Transactions Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Transactions</h3>
            <button className="text-xs text-blue-600 font-semibold hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-3">
            <TransactionItem
              name="Aryan"
              type="sent"
              amount="₹500"
              date="Today, 2:15 PM"
            />
            <TransactionItem
              name="Rahul"
              type="received"
              amount="₹300"
              date="Yesterday"
            />
            <TransactionItem
              name="Neel"
              type="sent"
              amount="₹1,200"
              date="14 July"
            />
          </div>
        </div>

        {/* Quick Transfer / Favorites Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800">Quick Send</h3>
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <QuickUser name="Aryan" phone="9876543210" />
            <QuickUser name="Rahul" phone="9123456789" />
            <QuickUser name="Neel" phone="9988776655" />
            <QuickUser name="Dhruv" phone="9112233445" />
          </div>
        </div>
      </div>
    </div>
  );
}

{/* Helper Component: Transaction Row */ }
function TransactionItem({
  name,
  type,
  amount,
  date,
}: {
  name: string;
  type: "sent" | "received";
  amount: string;
  date: string;
}) {
  const isSent = type === "sent";
  return (
    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${isSent ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
            }`}
        >
          {isSent ? "↑" : "↓"}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{name}</p>
          <p className="text-xs text-slate-400">{date}</p>
        </div>
      </div>
      <span
        className={`text-sm font-bold ${isSent ? "text-slate-800" : "text-emerald-600"
          }`}
      >
        {isSent ? `-${amount}` : `+${amount}`}
      </span>
    </div>
  );
}

{/* Helper Component: Quick Send Avatar */ }
function QuickUser({ name, phone }: { name: string; phone: string }) {
  return (
    <button className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all min-w-[80px]">
      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 font-bold text-sm">
        {name[0]}
      </div>
      <span className="text-xs font-semibold text-slate-700">{name}</span>
    </button>
  );
}