"use client";

import React, { useState, useEffect } from "react";
import { History, CheckCircle2, Clock, XCircle, RefreshCw, FileText } from "lucide-react";
import { Amount } from "@repo/ui";

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
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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

  return (
    <div className="bg-surface border border-border rounded-[10px] p-6 space-y-5 font-sans">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-text">Customer payment log</h3>
          <p className="text-xs text-text-muted">Live incoming customer checkout activity</p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-surface-subtle p-0.5 rounded-[6px] border border-border text-xs">
            {(["All", "Success", "Pending"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                  filter === tab
                    ? "bg-surface text-text border border-border font-semibold"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {tab === "All" ? "All Orders" : tab}
              </button>
            ))}
          </div>

          <button
            onClick={fetchPayments}
            className="p-1.5 rounded-[6px] bg-surface-subtle hover:bg-surface text-text-muted hover:text-text border border-border transition-colors cursor-pointer"
            title="Refresh payments"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-border rounded-[8px]">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-subtle text-text-muted text-xs font-medium border-b border-border">
            <tr>
              <th className="py-2.5 px-3.5">Transaction ID</th>
              <th className="py-2.5 px-3.5">Customer / payee</th>
              <th className="py-2.5 px-3.5">Date and time</th>
              <th className="py-2.5 px-3.5">Amount</th>
              <th className="py-2.5 px-3.5">Settlement status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-muted">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1.5 text-primary" />
                  Loading payment activity...
                </td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-muted">
                  No transactions recorded matching this filter.
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => {
                const isSuccess = p.status === "SUCCESS";
                const isPending = p.status === "PENDING";

                return (
                  <tr key={p.transactionId} className="hover:bg-surface-subtle transition-colors">
                    <td className="py-3 px-3.5 font-mono text-[11px] text-text-muted">
                      {p.transactionId.length > 18
                        ? `${p.transactionId.slice(0, 16)}...`
                        : p.transactionId}
                    </td>

                    <td className="py-3 px-3.5 font-medium text-text">
                      {p.customer?.name || "Direct Checkout User"}
                    </td>

                    <td className="py-3 px-3.5 font-mono text-text-muted text-[11px]">
                      {formatPaymentDate(p.createdAt)}
                    </td>

                    <td className="py-3 px-3.5">
                      <Amount value={p.amount} size="sm" weight="semibold" />
                    </td>

                    <td className="py-3 px-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-xs font-medium font-mono border ${
                          isSuccess
                            ? "bg-success-subtle/50 text-success border-success/30"
                            : isPending
                            ? "bg-warning-subtle/50 text-warning border-warning/30"
                            : "bg-danger-subtle/50 text-danger border-danger/30"
                        }`}
                      >
                        {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                        {isPending && <Clock className="w-3 h-3" />}
                        {!isSuccess && !isPending && <XCircle className="w-3 h-3" />}
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-text-faint pt-1">
        <span>Showing {filteredPayments.length} transactions</span>
        <span>Automatic real-time settlement</span>
      </div>
    </div>
  );
}
