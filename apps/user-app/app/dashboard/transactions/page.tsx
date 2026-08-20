"use client";

import { useEffect, useState } from "react";
import { useRouter as useNextRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Calendar,
    Filter,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useSession } from "next-auth/react";

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

const ITEMS_PER_PAGE = 5;

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
            displayUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            displayUser.number.includes(searchQuery) ||
            tx.note?.toLowerCase().includes(searchQuery.toLowerCase()) === true;

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
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="flex items-center gap-3 mb-2">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Transaction History</h1>
                        <p className="text-xs text-slate-400">Complete statement of wallet credits and debits</p>
                    </div>
                </div>
            </div>

            {/* Action Controls Panel */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex items-center gap-3 px-4 focus-within:border-cyan-500/50 transition-all">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone number, or remarks..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full bg-transparent outline-none text-slate-100 placeholder-slate-400 text-sm py-1"
                    />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                        {(["ALL", "SENT", "RECEIVED"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleFilterChange(tab)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                                    filter === tab
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                {tab === "ALL" ? "All Payments" : tab === "SENT" ? "Paid Out" : "Received"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transactions Stack Container */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-6">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 text-sm">
                        Loading transaction statement...
                    </div>
                ) : paginatedTransactions.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm space-y-2">
                        <Filter className="w-8 h-8 mx-auto text-slate-500 stroke-[1.5]" />
                        <p>No matching transactions found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800/80">
                        {paginatedTransactions.map((tx) => {
                            const isSent = tx.senderId === userId;
                            const displayUser = isSent ? tx.receiver : tx.sender;

                            return (
                                <div
                                    key={tx.id}
                                    className="p-4 hover:bg-slate-900/60 transition-colors flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${
                                                isSent
                                                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                            }`}
                                        >
                                            {isSent ? (
                                                <ArrowUpRight className="w-5 h-5" />
                                            ) : (
                                                <ArrowDownLeft className="w-5 h-5" />
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-slate-100">
                                                {displayUser.name}
                                            </h4>
                                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                                                +91 {displayUser.number} • {formatDate(tx.createdAt)}
                                            </p>
                                            {tx.note && (
                                                <p className="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md inline-block mt-1.5 font-sans border border-slate-800">
                                                    💬 {tx.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span
                                            className={`text-base font-extrabold tracking-tight ${
                                                isSent ? "text-rose-400" : "text-emerald-400"
                                            }`}
                                        >
                                            {isSent ? "-" : "+"}₹{tx.amount.toLocaleString()}
                                        </span>
                                        <p className="text-[10px] text-slate-400 tracking-wide font-medium uppercase mt-0.5">
                                            {isSent ? "Debit" : "Credit"}
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
                <div className="flex items-center justify-between bg-[#0f172a] px-5 py-3.5 rounded-2xl border border-slate-800 shadow-sm">
                    <span className="text-xs font-medium text-slate-400">
                        Page <span className="text-cyan-400 font-bold">{currentPage}</span> of{" "}
                        <span className="text-slate-200">{totalPages || 1}</span>
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Prev
                        </button>

                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}