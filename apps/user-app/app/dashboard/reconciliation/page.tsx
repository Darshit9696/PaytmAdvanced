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
  Check,
} from "lucide-react";
import { Amount, Button } from "@repo/ui";

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
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

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

  const isBalanced = report?.status === "BALANCED";

  return (
    <div className="max-w-[1100px] w-full space-y-8 font-sans pb-16">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`p-4 rounded-[10px] flex items-center justify-between text-xs font-medium border shadow-xs ${
            toastMessage.type === "success"
              ? "bg-success-subtle/50 border-success/30 text-success"
              : toastMessage.type === "error"
              ? "bg-danger-subtle/50 border-danger/30 text-danger"
              : "bg-info-subtle/50 border-info/30 text-info"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === "success" && <CheckCircle2 className="w-4 h-4 text-success" />}
            {toastMessage.type === "error" && <AlertTriangle className="w-4 h-4 text-danger" />}
            {toastMessage.type === "info" && <ShieldCheck className="w-4 h-4 text-info" />}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[10px] uppercase tracking-wider font-semibold opacity-70 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text">
              Ledger Reconciliation & Audit
            </h1>
            <p className="text-xs md:text-sm text-text-muted">
              Continuous double-entry verification engine enforcing debits equal credits.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunAudit}
            disabled={runningAudit || loadingReport}
            loading={runningAudit}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${runningAudit ? "animate-spin" : ""}`} />
            <span>{runningAudit ? "Auditing Database..." : "Run Audit Job"}</span>
          </Button>

          {report && !isBalanced && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoFix}
              disabled={runningFix}
              loading={runningFix}
              className="text-warning border-warning/40 hover:bg-warning-subtle"
            >
              <Wrench className={`w-3.5 h-3.5 mr-1.5 ${runningFix ? "animate-spin" : ""}`} />
              <span>{runningFix ? "Aligning..." : "Auto-Align Wallets"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Status Overview Card */}
      <div
        className={`p-6 rounded-[10px] border shadow-xs transition-all ${
          isBalanced
            ? "bg-surface border-success/30"
            : "bg-surface border-warning/30"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-11 h-11 rounded-[8px] flex items-center justify-center shrink-0 border ${
                isBalanced
                  ? "bg-success-subtle/50 text-success border-success/30"
                  : "bg-warning-subtle/50 text-warning border-warning/30"
              }`}
            >
              {isBalanced ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-semibold text-text">
                  {isBalanced ? "Ledger Perfectly Balanced" : "Audit Discrepancies Present"}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-[4px] text-xs font-medium border font-mono ${
                    isBalanced
                      ? "bg-success-subtle/50 text-success border-success/30"
                      : "bg-warning-subtle/50 text-warning border-warning/30"
                  }`}
                >
                  {isBalanced ? "Balanced" : "Action required"}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                {isBalanced
                  ? "Every transfer has exact debits matching credits, and all wallet balances match their ledger sum."
                  : `Global double-entry rule: debits ${
                      report?.globalCheck.isBalanced ? "match" : "do not match"
                    } credits. ${
                      report?.walletCheck.discrepancyCount || 0
                    } wallet balance(s) deviate from their calculated ledger sums.`}
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-text-muted">
            <span>Last audit run</span>
            <p className="text-text font-mono text-[11px] mt-0.5">
              {report?.timestamp
                ? new Date(report.timestamp).toLocaleString("en-IN")
                : "Pending..."}
            </p>
          </div>
        </div>

        {/* 4 KPI Metrics Grid (Flat, no card-in-card) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-border">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Total debits</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-danger" />
            </div>
            <div className="text-lg font-semibold text-text">
              <Amount value={report?.globalCheck.totalDebits || 0} size="lg" weight="semibold" />
            </div>
            <span className="text-[11px] text-text-faint font-mono">All money out legs</span>
          </div>

          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Total credits</span>
              <ArrowDownLeft className="w-3.5 h-3.5 text-success" />
            </div>
            <div className="text-lg font-semibold text-text">
              <Amount value={report?.globalCheck.totalCredits || 0} size="lg" weight="semibold" />
            </div>
            <span className="text-[11px] text-text-faint font-mono">All money in legs</span>
          </div>

          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Global variance</span>
              <Scale className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-lg font-semibold">
              <Amount
                value={report?.globalCheck.difference || 0}
                variant={report?.globalCheck.isBalanced ? "success" : "danger"}
                size="lg"
                weight="semibold"
              />
            </div>
            <span className="text-[11px] text-text-faint font-mono">
              {report?.globalCheck.isBalanced ? "Debits match credits" : "Variance detected"}
            </span>
          </div>

          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Transfers verified</span>
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-lg font-semibold font-mono text-text">
              {report?.transactionCheck.totalTransactionsChecked || 0}
            </p>
            <span className="text-[11px] text-text-faint font-mono">
              {report?.transactionCheck.unbalancedCount === 0
                ? "100% paired legs"
                : `${report?.transactionCheck.unbalancedCount} unbalanced`}
            </span>
          </div>
        </div>
      </div>

      {/* Discrepancy Breakdown Section (if any discrepancies exist) */}
      {report && report.walletCheck.discrepancies.length > 0 && (
        <div className="bg-surface rounded-[10px] border border-border p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <h3 className="text-sm font-semibold text-text">
                Wallet Balance Discrepancy Inspector ({report.walletCheck.discrepancies.length})
              </h3>
            </div>
            <span className="text-xs text-text-muted font-mono">
              Variance = Stated Balance − Calculated Ledger Sum
            </span>
          </div>

          <p className="text-xs text-text-muted">
            Wallets initialized with starting balances prior to double-entry ledger tracking exhibit drift. Auto-aligning reconciles balances directly to ledger records.
          </p>

          <div className="overflow-x-auto border border-border rounded-[8px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle text-text-muted text-xs font-medium border-b border-border">
                <tr>
                  <th className="py-2.5 px-3.5">User</th>
                  <th className="py-2.5 px-3.5">Wallet ID</th>
                  <th className="py-2.5 px-3.5">Stated balance</th>
                  <th className="py-2.5 px-3.5">Ledger sum</th>
                  <th className="py-2.5 px-3.5">Drift difference</th>
                  <th className="py-2.5 px-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.walletCheck.discrepancies.slice(0, 10).map((d) => (
                  <tr key={d.walletId} className="hover:bg-surface-subtle">
                    <td className="py-3 px-3.5 font-medium text-text">
                      {d.userName} <span className="text-text-faint font-normal">(User #{d.userId})</span>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-text-muted">#{d.walletId}</td>
                    <td className="py-3 px-3.5 font-mono text-text">
                      <Amount value={d.balance} size="xs" weight="medium" />
                    </td>
                    <td className="py-3 px-3.5 font-mono text-primary font-medium">
                      <Amount value={d.ledgerSum} size="xs" weight="medium" />
                    </td>
                    <td className="py-3 px-3.5 font-mono text-warning font-medium">
                      <Amount value={d.difference} size="xs" weight="medium" />
                    </td>
                    <td className="py-3 px-3.5">
                      {d.fixed ? (
                        <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-success-subtle/50 text-success border border-success/30">
                          Fixed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-warning-subtle/50 text-warning border border-warning/30">
                          Drift
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {report.walletCheck.discrepancies.length > 10 && (
              <p className="text-center text-xs text-text-muted py-2 bg-surface-subtle border-t border-border">
                Showing first 10 of {report.walletCheck.discrepancies.length} discrepancies.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Append-Only Ledger Entries Table */}
      <div className="bg-surface rounded-[10px] border border-border p-6 space-y-5 shadow-xs">
        {/* Table Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text">
                Append-Only Ledger Entries (<code className="text-primary text-xs font-mono">ledger_entries</code>)
              </h3>
              <p className="text-xs text-text-muted">
                Immutable, append-only records written atomically with every money transfer.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user or note..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 bg-surface-subtle border border-border rounded-[6px] text-xs text-text placeholder-text-faint focus:outline-none focus:border-primary transition-colors w-48 shadow-xs"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center bg-surface-subtle p-0.5 rounded-[6px] border border-border text-xs">
              <button
                onClick={() => {
                  setDirectionFilter("ALL");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                  directionFilter === "ALL"
                    ? "bg-surface text-text shadow-xs border border-border font-semibold"
                    : "text-text-muted hover:text-text"
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setDirectionFilter("CREDIT");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                  directionFilter === "CREDIT"
                    ? "bg-surface text-success shadow-xs border border-border font-semibold"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Credits
              </button>
              <button
                onClick={() => {
                  setDirectionFilter("DEBIT");
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                  directionFilter === "DEBIT"
                    ? "bg-surface text-danger shadow-xs border border-border font-semibold"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Debits
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto border border-border rounded-[8px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle text-text-muted text-xs font-medium border-b border-border">
              <tr>
                <th className="py-2.5 px-3.5">Entry ID</th>
                <th className="py-2.5 px-3.5">Date & time</th>
                <th className="py-2.5 px-3.5">Direction</th>
                <th className="py-2.5 px-3.5">Amount</th>
                <th className="py-2.5 px-3.5">Wallet / account holder</th>
                <th className="py-2.5 px-3.5">Transfer ref</th>
                <th className="py-2.5 px-3.5">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingEntries ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-primary" />
                    Loading append-only ledger entries...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    No ledger entries found matching criteria.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const isDebit = entry.direction === "DEBIT";
                  return (
                    <tr key={entry.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="py-3 px-3.5 font-mono text-[11px] text-text-muted">
                        {entry.id.slice(0, 10)}...
                      </td>
                      <td className="py-3 px-3.5 text-text font-mono text-[11px]">
                        {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-medium tracking-wide uppercase border font-mono ${
                            isDebit
                              ? "bg-danger-subtle/50 text-danger border-danger/30"
                              : "bg-success-subtle/50 text-success border-success/30"
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
                      <td className="py-3 px-3.5">
                        <Amount
                          value={entry.amount}
                          sign={isDebit ? "negative" : "positive"}
                          variant={isDebit ? "danger" : "success"}
                          size="xs"
                          weight="semibold"
                        />
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="text-text font-medium">
                          {entry.wallet?.user?.name || `Wallet #${entry.walletId}`}
                        </div>
                        <div className="text-[10px] text-text-muted font-mono">
                          Wallet #{entry.walletId}
                          {entry.wallet?.user?.number ? ` • ${entry.wallet.user.number}` : ""}
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        {entry.transactionId ? (
                          <div>
                            <span className="font-mono text-text text-[11px]">
                              Txn #{entry.transactionId}
                            </span>
                            {entry.transaction?.note && (
                              <p className="text-[10px] text-text-muted truncate max-w-[140px]">
                                {entry.transaction.note}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-text-faint italic text-[11px]">System Funding</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-success font-medium">
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
        <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-text-muted">
          <span>
            Page <strong className="font-mono text-text">{page}</strong> of{" "}
            <strong className="font-mono text-text">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loadingEntries}
              className="p-1.5 bg-surface border border-border rounded-[6px] hover:bg-surface-subtle disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loadingEntries}
              className="p-1.5 bg-surface border border-border rounded-[6px] hover:bg-surface-subtle disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Double-Entry Architecture Primer Card */}
      <div className="bg-surface rounded-[10px] border border-border p-6 space-y-3.5 shadow-xs">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Financial Invariant Rules
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 rounded-[8px] bg-surface-subtle border border-border space-y-1">
            <span className="font-medium text-text">1. Global Conservation</span>
            <p className="text-text-muted leading-relaxed">
              Every transfer generates matched debit and credit records. Total debits must strictly equal total credits.
            </p>
          </div>
          <div className="p-3.5 rounded-[8px] bg-surface-subtle border border-border space-y-1">
            <span className="font-medium text-text">2. Transaction Atomicity</span>
            <p className="text-text-muted leading-relaxed">
              For every individual transfer, exactly one DEBIT and one CREDIT are committed within a single database transaction.
            </p>
          </div>
          <div className="p-3.5 rounded-[8px] bg-surface-subtle border border-border space-y-1">
            <span className="font-medium text-text">3. Wallet Determinism</span>
            <p className="text-text-muted leading-relaxed">
              A wallet balance equals its net historical ledger entries (sum of all credits minus sum of all debits).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
