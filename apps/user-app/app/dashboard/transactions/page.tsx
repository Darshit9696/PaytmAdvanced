"use client";

import { useEffect, useState } from "react";
import { useRouter as useNextRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Amount, Avatar } from "@repo/ui";

interface User {
  id: number;
  name: string;
  number: string;
}

interface Trx {
  id: number;
  amount: number;
  note: string | null;
  senderId: number;
  receiverId: number;
  createdAt: string;
  sender: User;
  receiver: User;
}

const ITEMS_PER_PAGE = 8;

export default function TransactionHistory() {
  const router = useNextRouter();
  const session = useSession();
  const userId = Number(session.data?.user?.id);

  const [transactions, setTransactions] = useState<Trx[]>([]);
  const [filter, setFilter] = useState<"ALL" | "SENT" | "RECEIVED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`/api/transactions`);
        if (!res.ok) {
          console.error("Failed to fetch transactions");
          return;
        }
        const data = await res.json();
        setTransactions(data.transactions || data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (session.status === "authenticated") {
      fetchTransactions();
    }
  }, [session.status]);

  const handleFilterChange = (newFilter: "ALL" | "SENT" | "RECEIVED") => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredTransactions = transactions?.filter((tx) => {
    const isSent = tx.senderId === userId;

    const matchesTab =
      filter === "ALL" ||
      (filter === "SENT" && isSent) ||
      (filter === "RECEIVED" && !isSent);

    const displayUser = isSent ? tx.receiver : tx.sender;

    const matchesSearch =
      (displayUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (displayUser?.number?.includes(searchQuery) ?? false) ||
      (tx.note?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil((filteredTransactions?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-surface-subtle text-text-muted hover:text-text rounded-[6px] border border-border transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-text">Account Statement</h1>
            <p className="text-xs text-text-muted">Complete ledger history of wallet transfers</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span>Total records: <strong className="font-mono text-text">{filteredTransactions.length}</strong></span>
        </div>
      </div>

      {/* Action Controls Panel */}
      <div className="bg-surface border border-border rounded-[10px] p-4 shadow-xs space-y-3">
        <div className="bg-surface-subtle border border-border p-2 rounded-[8px] flex items-center gap-3 px-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-xs">
          <Search className="w-4 h-4 text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search by contact name, phone, or remarks..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-transparent outline-none text-text placeholder-text-faint text-sm py-1"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Segmented Filter Buttons */}
          <div className="flex bg-surface-subtle p-0.5 rounded-[8px] border border-border">
            {(["ALL", "SENT", "RECEIVED"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleFilterChange(tab)}
                className={`px-3.5 py-1.5 rounded-[6px] text-xs font-medium transition-all cursor-pointer ${
                  filter === tab
                    ? "bg-surface text-text shadow-xs border border-border font-semibold"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {tab === "ALL" ? "All Payments" : tab === "SENT" ? "Paid Out (Debits)" : "Received (Credits)"}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-text-faint">
            Page {currentPage} of {totalPages || 1}
          </span>
        </div>
      </div>

      {/* Transactions Container */}
      <div className="bg-surface border border-border rounded-[10px] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-muted text-xs">
            Loading statement records...
          </div>
        ) : paginatedTransactions.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-xs space-y-2">
            <Filter className="w-8 h-8 mx-auto text-text-faint stroke-[1.5]" />
            <p className="font-medium text-text">No matching transactions found.</p>
            <p className="text-text-faint">Try adjusting your search query or tab filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedTransactions.map((tx) => {
              const isSent = tx.senderId === userId;
              const displayUser = isSent ? tx.receiver : tx.sender;

              return (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-surface-subtle transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${
                        isSent
                          ? "bg-danger-subtle/40 border-danger/20 text-danger"
                          : "bg-success-subtle/40 border-success/20 text-success"
                      }`}
                    >
                      {isSent ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-text">
                        {displayUser?.name || "PayPulse User"}
                      </h4>
                      <p className="text-xs text-text-muted font-mono mt-0.5">
                        +91 {displayUser?.number} • {formatDate(tx.createdAt)}
                      </p>
                      {tx.note && (
                        <p className="text-[11px] bg-surface-subtle text-text-muted px-2 py-0.5 rounded-[4px] inline-block mt-1 font-sans border border-border">
                          Ref: {tx.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <Amount
                      value={tx.amount}
                      sign={isSent ? "negative" : "positive"}
                      variant={isSent ? "danger" : "success"}
                      size="md"
                      weight="semibold"
                    />
                    <p className="text-[10px] text-text-faint tracking-wider font-mono uppercase mt-0.5">
                      {isSent ? "DEBIT" : "CREDIT"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && filteredTransactions.length > 0 && (
        <div className="flex items-center justify-between bg-surface px-4 py-3 rounded-[10px] border border-border shadow-xs">
          <span className="text-xs font-medium text-text-muted">
            Showing <strong className="font-mono text-text">{startIndex + 1}</strong> to{" "}
            <strong className="font-mono text-text">
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredTransactions.length)}
            </strong>{" "}
            of <strong className="font-mono text-text">{filteredTransactions.length}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-border text-xs font-medium text-text hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-border text-xs font-medium text-text hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
