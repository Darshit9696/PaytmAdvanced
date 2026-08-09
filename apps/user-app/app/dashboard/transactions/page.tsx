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

    // Reset pagination to page 1 whenever search query or tab filter changes
    const handleFilterChange = (newFilter: "ALL" | "SENT" | "RECEIVED") => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    // Filter logic updated to match real DB columns
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

    // Pagination calculations
    const totalPages = Math.ceil((filteredTransactions?.length || 0) / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedTransactions = filteredTransactions.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    // Date formatting helper
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
        <div className="flex min-h-screen bg-[#f4f7fa] font-sans">
            <div className="flex-1 max-w-4xl mx-auto px-4 py-8">

                {/* Top Header Card */}
                <div className="bg-[#002e6e] rounded-2xl p-6 text-white mb-6 shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                        <Calendar className="w-48 h-48 -mr-10 -mb-10" />
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold tracking-tight">Passbook & History</h1>
                    </div>

                    <p className="text-xs text-cyan-200 uppercase tracking-widest font-semibold">Paytm Secure Ledger</p>
                    <h2 className="text-3xl font-black mt-1">All Wallet Statements</h2>
                </div>

                {/* Action Controls Panel */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 space-y-4">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center gap-3 px-4 focus-within:border-[#00baf2] focus-within:ring-2 focus-within:ring-[#00baf2]/10 transition-all">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, phone number, or remarks..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full bg-transparent outline-none text-slate-700 placeholder-slate-400 text-sm py-1"
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                            {(["ALL", "SENT", "RECEIVED"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleFilterChange(tab)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                                        filter === tab
                                            ? "bg-white text-[#002e6e] shadow-sm"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    {tab === "ALL" ? "All Payments" : tab === "SENT" ? "Paid Out" : "Received"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Transactions Stack Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 text-sm">
                            Loading your transaction details...
                        </div>
                    ) : paginatedTransactions.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-sm space-y-2">
                            <Filter className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                            <p>No matching transactions found matching your selection.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {paginatedTransactions.map((tx) => {
                                const isSent = tx.senderId === userId;
                                const displayUser = isSent ? tx.receiver : tx.sender;

                                return (
                                    <div
                                        key={tx.id}
                                        className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between group"
                                    >
                                        {/* Left block: Icon + Name Info */}
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-11 h-11 rounded-full border flex items-center justify-center shrink-0 ${
                                                    isSent
                                                        ? "bg-slate-50 border-slate-100 text-slate-600 group-hover:bg-[#002e6e]/5 group-hover:text-[#002e6e] transition-colors"
                                                        : "bg-emerald-50 border-emerald-100 text-emerald-600"
                                                }`}
                                            >
                                                {isSent ? (
                                                    <ArrowUpRight className="w-5 h-5" />
                                                ) : (
                                                    <ArrowDownLeft className="w-5 h-5" />
                                                )}
                                            </div>

                                            {/* Recipient Details */}
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800">
                                                    {displayUser.name}
                                                </h4>
                                                <p className="text-xs text-slate-400 font-mono mt-0.5">
                                                    +91 {displayUser.number} • {formatDate(tx.createdAt)}
                                                </p>
                                                {tx.note && (
                                                    <p className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md inline-block mt-1.5 font-sans">
                                                        💬 {tx.note}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right block: Absolute Cash Values */}
                                        <div className="text-right">
                                            <span
                                                className={`text-base font-black tracking-tight ${
                                                    isSent ? "text-slate-900" : "text-emerald-600"
                                                }`}
                                            >
                                                {isSent ? "-" : "+"}₹{tx.amount.toLocaleString()}
                                            </span>
                                            <p className="text-[10px] text-slate-400 tracking-wide font-medium uppercase mt-0.5">
                                                Wallet Balance
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
                    <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-slate-100">
                        <span className="text-xs font-semibold text-slate-500">
                            Page <span className="text-[#002e6e] font-bold">{currentPage}</span> of{" "}
                            <span className="text-slate-800">{totalPages || 1}</span>
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Prev
                            </button>

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}