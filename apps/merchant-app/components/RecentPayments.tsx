"use client";

import React, { useState, useEffect } from "react";
import { History, CheckCircle2, Clock, XCircle, ExternalLink, RefreshCw } from "lucide-react";

interface DbPayment {
  transactionId: string;
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  createdAt: string;
  customer?: {
    name: string | null;
  } | null;
}

export function RecentPayments() {
  const [payments, setPayments] = useState<DbPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "Success" | "Pending">("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payments");
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error("Failed to fetch merchant payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatPaymentDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      const timeStr = date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      if (isToday) {
        return `Today, ${timeStr}`;
      }

      const isYesterday =
        new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
      if (isYesterday) {
        return `Yesterday, ${timeStr}`;
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (filter === "All") return true;
    if (filter === "Success") return p.status === "SUCCESS";
    if (filter === "Pending") return p.status === "PENDING";
    return true;
  });

  const handleViewAll = () => {
    setToastMessage(`Total store customer transactions recorded: ${payments.length}`);
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

        {/* Tab Filters & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
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

          <button
            onClick={fetchPayments}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh payment logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          </button>
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
              <th className="pb-3 px-2">Date &amp; Time</th>
              <th className="pb-3 px-2 text-right">Amount</th>
              <th className="pb-3 px-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading customer transactions...</span>
                  </div>
                </td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No {filter !== "All" ? filter.toLowerCase() : ""} transactions found.
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => {
                const customerName = payment.customer?.name || "Store Customer";
                return (
                  <tr key={payment.transactionId} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-2 font-bold text-slate-100 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-xs uppercase">
                        {customerName[0] || "C"}
                      </div>
                      <span>{customerName}</span>
                    </td>
                    <td className="py-3.5 px-2 text-slate-400 font-mono">
                      {payment.transactionId.slice(0, 16)}...
                    </td>
                    <td className="py-3.5 px-2 text-slate-400">
                      {formatPaymentDate(payment.createdAt)}
                    </td>
                    <td className="py-3.5 px-2 text-right font-extrabold text-white font-mono">
                      ₹{payment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-2 text-center">
                      {payment.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Success
                        </span>
                      ) : payment.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Action */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={handleViewAll}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-2.5 px-6 rounded-xl border border-slate-800 transition-all text-xs flex items-center gap-2 cursor-pointer"
        >
          <span>View All Payments ({payments.length})</span>
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
        </button>
      </div>
    </div>
  );
}
