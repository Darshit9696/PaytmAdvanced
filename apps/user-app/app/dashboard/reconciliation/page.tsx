"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Scale,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Wrench,
  Check
} from "lucide-react";

interface ReconciliationReport {
  timestamp: string;
  status: "BALANCED" | "DISCREPANCY_DETECTED";
  globalCheck: {
    totalDebits: number;
    totalCredits: number;
    difference: number;
    isBalanced: boolean;
  };
  transactionCheck: {
    totalTransactionsChecked: number;
    unbalancedCount: number;
    unbalancedTransactions: Array<{
      transactionId: number;
      debits: number;
      credits: number;
      expectedAmount: number;
    }>;
  };
  walletCheck: {
    totalWalletsChecked: number;
    matchedWalletsCount: number;
    discrepancyCount: number;
    discrepancies: Array<{
      walletId: number;
      userId: number;
      userName: string;
      balance: number;
      ledgerSum: number;
      difference: number;
      fixed?: boolean;
    }>;
  };
}

interface LedgerEntryItem {
  id: string;
  transactionId: number | null;
  walletId: number;
  direction: "DEBIT" | "CREDIT";
  amount: number;
  createdAt: string;
  wallet?: {
    id: number;
    userId: number;
    user?: {
      id: number;
      name: string;
      number: string;
    };
  };
  transaction?: {
    id: number;
    amount: number;
    note: string | null;
    category: string | null;
    createdAt: string;
    sender?: { name: string; number: string };
    receiver?: { name: string; number: string };
  };
}

export default function ReconciliationPage() {
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [runningAudit, setRunningAudit] = useState(false);
  const [runningFix, setRunningFix] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Ledger entries state
  const [entries, setEntries] = useState<LedgerEntryItem[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [directionFilter, setDirectionFilter] = useState<"ALL" | "DEBIT" | "CREDIT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const fetchReport = useCallback(async () => {
    try {
      setLoadingReport(true);
      const res = await fetch("/api/reconcile");
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
      } else if (data.globalCheck) {
        setReport(data);
      }
    } catch (err: any) {
      console.error("Failed to load audit report:", err);
      showToast("error", "Failed to fetch reconciliation status");
    } finally {
      setLoadingReport(false);
    }
  }, []);

  const fetchLedgerEntries = useCallback(async (p: number, dir: string, q: string) => {
    try {
      setLoadingEntries(true);
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", "15");
      if (dir !== "ALL") params.set("direction", dir);
      if (q.trim()) params.set("search", q.trim());

      const res = await fetch(`/api/ledger?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEntries(data.entries || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Failed to load ledger entries:", err);
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  useEffect(() => {
    fetchLedgerEntries(page, directionFilter, searchQuery);
  }, [page, directionFilter, searchQuery, fetchLedgerEntries]);

  const handleRunAudit = async () => {
    try {
      setRunningAudit(true);
      const res = await fetch("/api/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.reconciliation) {
        setReport(data.reconciliation);
        if (data.reconciliation.status === "BALANCED") {
          showToast("success", "Audit complete: Double-entry ledger is perfectly balanced!");
        } else {
          showToast("info", "Audit complete: Identified discrepancies in balances.");
        }
      }
      fetchLedgerEntries(page, directionFilter, searchQuery);
    } catch (err: any) {
      showToast("error", "Error executing audit job: " + err.message);
    } finally {
      setRunningAudit(false);
    }
  };

  const handleAutoFix = async () => {
    if (!confirm("This will synchronize wallet balances with their calculated ledger sums. Proceed?")) {
      return;
    }
    try {
      setRunningFix(true);
      const res = await fetch("/api/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoFix: true }),
      });
      const data = await res.json();
      if (data.reconciliation) {
        setReport(data.reconciliation);
        showToast("success", "Successfully synchronized wallet balances to ledger sums!");
      }
      fetchLedgerEntries(page, directionFilter, searchQuery);
    } catch (err: any) {
      showToast("error", "Auto-reconcile failed: " + err.message);
    } finally {
      setRunningFix(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return "₹" + Number(amount || 0).toLocaleString("en-IN");
  };

  const isBalanced = report?.status === "BALANCED";

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-16">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium border shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : toastMessage.type === "error"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-blue-500/10 border-blue-500/30 text-blue-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toastMessage.type === "error" && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            {toastMessage.type === "info" && <ShieldCheck className="w-5 h-5 text-blue-400" />}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs uppercase tracking-wider opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Scale className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Ledger Reconciliation & Audit
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Continuous double-entry verification engine enforcing debits equal credits.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAudit}
            disabled={runningAudit || loadingReport}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${runningAudit ? "animate-spin" : ""}`} />
            {runningAudit ? "Auditing Database..." : "Run Audit Job"}
          </button>

          {report && !isBalanced && (
            <button
              onClick={handleAutoFix}
              disabled={runningFix}
              className="px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Wrench className={`w-4 h-4 ${runningFix ? "animate-spin" : ""}`} />
              {runningFix ? "Aligning..." : "Auto-Align Wallets"}
            </button>
          )}
        </div>
      </div>

      {/* Main Status Overview Card */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isBalanced
            ? "bg-emerald-950/20 border-emerald-500/30 shadow-lg shadow-emerald-950/40"
            : "bg-slate-900/60 border-slate-800 shadow-lg"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isBalanced
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}
            >
              {isBalanced ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white">
                  {isBalanced ? "Ledger Perfectly Balanced" : "Audit Discrepancies Present"}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                    isBalanced
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {isBalanced ? "Verified Balanced" : "Action Required"}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                {isBalanced
                  ? "Every transfer has exact debits matching credits, and all wallet balances match their ledger sum."
                  : `Global double-entry rule: debits ${report?.globalCheck.isBalanced ? "match" : "do not match"} credits. ${report?.walletCheck.discrepancyCount || 0} wallet balance(s) deviate from their calculated ledger sums.`}
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            <span>Last Audit Run</span>
            <p className="text-slate-300 font-mono mt-0.5">
              {report?.timestamp ? new Date(report.timestamp).toLocaleString("en-IN") : "Pending..."}
            </p>
          </div>
        </div>

        {/* 4 KPI Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-[#0b101d] p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Total Debits</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-lg md:text-xl font-bold text-white font-mono">
              {formatCurrency(report?.globalCheck.totalDebits || 0)}
            </p>
            <span className="text-[10px] text-slate-500">All money out legs</span>
          </div>

          <div className="bg-[#0b101d] p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Total Credits</span>
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-lg md:text-xl font-bold text-white font-mono">
              {formatCurrency(report?.globalCheck.totalCredits || 0)}
            </p>
            <span className="text-[10px] text-slate-500">All money in legs</span>
          </div>

          <div className="bg-[#0b101d] p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Global Variance</span>
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p
              className={`text-lg md:text-xl font-bold font-mono ${
                report?.globalCheck.isBalanced ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatCurrency(report?.globalCheck.difference || 0)}
            </p>
            <span className="text-[10px] text-emerald-400/80">
              {report?.globalCheck.isBalanced ? "✓ Debits == Credits" : "Variance detected"}
            </span>
          </div>

          <div className="bg-[#0b101d] p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Transfers Verified</span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-lg md:text-xl font-bold text-white font-mono">
              {report?.transactionCheck.totalTransactionsChecked || 0}
            </p>
            <span className="text-[10px] text-slate-500">
              {report?.transactionCheck.unbalancedCount === 0
                ? "100% paired legs"
                : `${report?.transactionCheck.unbalancedCount} unbalanced`}
            </span>
          </div>
        </div>
      </div>

      {/* Discrepancy Breakdown Section (if any discrepancies exist) */}
      {report && report.walletCheck.discrepancies.length > 0 && (
        <div className="bg-[#0b101d] rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Wallet Balance Discrepancy Inspector ({report.walletCheck.discrepancies.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Variance = Stated Balance − Calculated Ledger Sum
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Wallets initialized with starting balances prior to double-entry ledger tracking exhibit drift. Auto-aligning reconciles balances directly to ledger records.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Wallet ID</th>
                  <th className="py-3 px-4">Stated Balance</th>
                  <th className="py-3 px-4">Ledger Sum (Credits − Debits)</th>
                  <th className="py-3 px-4">Drift Difference</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {report.walletCheck.discrepancies.slice(0, 10).map((d) => (
                  <tr key={d.walletId} className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-semibold text-white">
                      {d.userName} <span className="text-slate-500 font-normal">(User #{d.userId})</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">#{d.walletId}</td>
                    <td className="py-3 px-4 font-mono text-slate-200">{formatCurrency(d.balance)}</td>
                    <td className="py-3 px-4 font-mono text-cyan-300">{formatCurrency(d.ledgerSum)}</td>
                    <td className="py-3 px-4 font-mono text-amber-400">{formatCurrency(d.difference)}</td>
                    <td className="py-3 px-4">
                      {d.fixed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Fixed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Drift
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {report.walletCheck.discrepancies.length > 10 && (
              <p className="text-center text-xs text-slate-500 pt-3">
                Showing first 10 of {report.walletCheck.discrepancies.length} discrepancies.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Append-Only Ledger Entries Table */}
      <div className="bg-[#0b101d] rounded-2xl border border-slate-800 p-6 space-y-6">
        
        {/* Table Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Append-Only Ledger Entries (<code className="text-cyan-400 text-xs">ledger_entries</code>)
              </h3>
              <p className="text-xs text-slate-400">
                Immutable, append-only records written atomically with every money transfer.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user or note..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors w-48"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => {
                  setDirectionFilter("ALL");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  directionFilter === "ALL"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setDirectionFilter("CREDIT");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  directionFilter === "CREDIT"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Credits
              </button>
              <button
                onClick={() => {
                  setDirectionFilter("DEBIT");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  directionFilter === "DEBIT"
                    ? "bg-rose-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Debits
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Entry ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Wallet / Account Holder</th>
                <th className="py-3 px-4">Transfer Ref</th>
                <th className="py-3 px-4">Double-Entry Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loadingEntries ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                    Loading append-only ledger entries...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No ledger entries found matching criteria.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const isDebit = entry.direction === "DEBIT";
                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {entry.id.slice(0, 10)}...
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            isDebit
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {isDebit ? (
                            <>
                              <ArrowUpRight className="w-3 h-3" /> DEBIT
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="w-3 h-3" /> CREDIT
                            </>
                          )}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-4 font-mono font-bold text-xs ${
                          isDebit ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {isDebit ? "-" : "+"}
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">
                          {entry.wallet?.user?.name || `Wallet #${entry.walletId}`}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Wallet ID: {entry.walletId}
                          {entry.wallet?.user?.number ? ` • ${entry.wallet.user.number}` : ""}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {entry.transactionId ? (
                          <div>
                            <span className="font-mono text-slate-300">
                              Txn #{entry.transactionId}
                            </span>
                            {entry.transaction?.note && (
                              <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
                                {entry.transaction.note}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">System Funding</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                          <Check className="w-3 h-3" /> Paired Leg
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <span>
            Page <span className="font-semibold text-white">{page}</span> of{" "}
            <span className="font-semibold text-white">{totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loadingEntries}
              className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loadingEntries}
              className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Double-Entry Architecture Primer Card */}
      <div className="bg-[#0b101d] rounded-2xl border border-slate-800/80 p-6 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          PayPulse Double-Entry Financial Invariants
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
            <span className="font-semibold text-cyan-300">1. Global Conservation</span>
            <p className="text-slate-400">
              Every transfer generates matched debit and credit records. Across the entire database, total debits must always equal total credits.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
            <span className="font-semibold text-cyan-300">2. Transaction Atomicity</span>
            <p className="text-slate-400">
              For every individual transfer, exactly one DEBIT and one CREDIT are committed within a single database transaction.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
            <span className="font-semibold text-cyan-300">3. Wallet Determinism</span>
            <p className="text-slate-400">
              A wallet&apos;s current balance must match its historical net ledger entries (sum of all credits minus sum of all debits).
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
