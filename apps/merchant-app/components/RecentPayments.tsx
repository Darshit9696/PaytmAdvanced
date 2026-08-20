"use client";

import React, { useState } from "react";
import { History, CheckCircle2, Clock, Search, ExternalLink } from "lucide-react";

interface PaymentItem {
  id: string;
  customerName: string;
  amount: number;
  date: string;
  status: "Success" | "Pending" | "Failed";
  refId: string;
}

export function RecentPayments() {
  const [filter, setFilter] = useState<"All" | "Success" | "Pending">("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mockPayments: PaymentItem[] = [
    {
      id: "1",
      customerName: "Rahul Sharma",
      amount: 500,
      date: "Today, 02:45 PM",
      status: "Success",
      refId: "TXN_98214",
    },
    {
      id: "2",
      customerName: "Amit Patel",
      amount: 750,
      date: "Today, 01:15 PM",
      status: "Success",
      refId: "TXN_98213",
    },
    {
      id: "3",
      customerName: "Priya Shah",
      amount: 250,
      date: "Today, 11:30 AM",
      status: "Success",
      refId: "TXN_98212",
    },
    {
      id: "4",
      customerName: "Rohan Mehta",
      amount: 1200,
      date: "Today, 10:05 AM",
      status: "Pending",
      refId: "TXN_98211",
    },
    {
      id: "5",
      customerName: "Ananya Roy",
      amount: 420,
      date: "Yesterday, 06:20 PM",
      status: "Success",
      refId: "TXN_98210",
    },
    {
      id: "6",
      customerName: "Vikram Malhotra",
      amount: 1850,
      date: "Yesterday, 03:10 PM",
      status: "Success",
      refId: "TXN_98209",
    },
  ];

  const filteredPayments = mockPayments.filter((p) => {
    if (filter === "All") return true;
    return p.status === filter;
  });

  const handleViewAll = () => {
    setToastMessage(`Showing all ${mockPayments.length} recent customer transactions`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Recent Payments</h3>
            <p className="text-xs text-slate-400">Live store customer transaction activity</p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(["All", "Success", "Pending"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === tab
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold p-3 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
          <span>ℹ️ {toastMessage}</span>
        </div>
      )}

      {/* Payment Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <th className="pb-3 px-2">Customer</th>
              <th className="pb-3 px-2">Transaction ID</th>
              <th className="pb-3 px-2">Date & Time</th>
              <th className="pb-3 px-2 text-right">Amount</th>
              <th className="pb-3 px-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-900/60 transition-colors">
                <td className="py-3.5 px-2 font-bold text-slate-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-xs">
                    {payment.customerName[0]}
                  </div>
                  <span>{payment.customerName}</span>
                </td>
                <td className="py-3.5 px-2 text-slate-400 font-mono">
                  {payment.refId}
                </td>
                <td className="py-3.5 px-2 text-slate-400">
                  {payment.date}
                </td>
                <td className="py-3.5 px-2 text-right font-extrabold text-white font-mono">
                  ₹{payment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-2 text-center">
                  {payment.status === "Success" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Action */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={handleViewAll}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-2.5 px-6 rounded-xl border border-slate-800 transition-all text-xs flex items-center gap-2 cursor-pointer"
        >
          <span>View All Payments</span>
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
        </button>
      </div>

    </div>
  );
}
