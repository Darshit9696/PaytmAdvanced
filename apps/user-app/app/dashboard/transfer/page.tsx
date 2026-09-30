"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Send, Search, User, CheckCircle2, AlertCircle } from "lucide-react";

interface UserType {
    id: number;
    name: string;
    number: string;
}

function SendMoneyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("query") || searchParams.get("name") || "";

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [users, setUsers] = useState<UserType[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [category, setCategory] = useState<string>("Food");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Fetch matching users on search query change
    useEffect(() => {
        const fetchUsers = async (query: string) => {
            if (!searchQuery.trim()) {
                setUsers([]);
                return;
            }
            try {
                const res = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}`);
                
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data.users || data);
                }
            } catch (err) {
                console.error("Failed to search users", err);
            }
        };

        const timer = setTimeout(() => fetchUsers(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !amount || Number(amount) <= 0) return;

        setLoading(true);
        setStatus(null);

        try {
            const res = await fetch("/api/transfer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiverId: selectedUser.id,
                    amount: Number(amount),
                    note: note.trim() || null,
                    category: category || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Transaction failed");
            }

            setStatus({ 
                type: "success", 
                message: `Successfully sent ₹${amount} to ${selectedUser.name}` 
            });

            setAmount("");
            setNote("");
            setSelectedUser(null);

            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);

        } catch (err: any) {
            setStatus({ type: "error", message: err.message || "Something went wrong" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 font-sans">
            
            {/* Header Banner */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Send Money</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Instant peer-to-peer wallet transfer</p>
                    </div>
                </div>
            </div>

            {/* Status Notification */}
            {status && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold border ${
                    status.type === "success" 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}>
                    {status.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <p>{status.message}</p>
                </div>
            )}

            {/* Main Card */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                
                {/* Step 1: Recipient Selection */}
                {!selectedUser ? (
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            1. Select Recipient
                        </label>
                        
                        <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex items-center gap-3 px-4 focus-within:border-cyan-500/50 transition-all">
                            <Search className="w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search recipient name or mobile number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent outline-none text-slate-100 placeholder-slate-400 text-sm py-1"
                                autoFocus
                            />
                        </div>

                        {/* Search Results */}
                        <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto">
                            {users.map((u) => (
                                <div
                                    key={u.id}
                                    onClick={() => setSelectedUser(u)}
                                    className="p-3 hover:bg-slate-800/60 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-600/20 text-cyan-300 border border-blue-500/30 flex items-center justify-center font-bold text-sm">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-100">{u.name}</p>
                                            <p className="text-xs text-slate-400 font-mono">+91 {u.number}</p>
                                        </div>
                                    </div>
                                    <Send className="w-4 h-4 text-cyan-400" />
                                </div>
                            ))}
                            {searchQuery && users.length === 0 && (
                                <p className="text-xs text-slate-400 text-center py-4">No user found matching "{searchQuery}"</p>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Step 2: Payment Form */
                    <form onSubmit={handleTransfer} className="space-y-5">
                        <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600/20 text-cyan-300 border border-blue-500/30 flex items-center justify-center font-bold text-sm">
                                    {selectedUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-100">{selectedUser.name}</p>
                                    <p className="text-xs text-slate-400 font-mono">+91 {selectedUser.number}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedUser(null)}
                                className="text-xs font-semibold text-cyan-400 hover:underline cursor-pointer"
                            >
                                Change
                            </button>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Amount (₹)
                            </label>
                            <input
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="1"
                                className="w-full text-2xl font-extrabold text-white bg-slate-900 p-3.5 rounded-xl border border-slate-800 outline-none focus:border-cyan-500/50 transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Expense Category
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {(["Food", "Shopping", "Travel", "Entertainment"] as const).map((cat) => (
                                    <button
                                        type="button"
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                            category === cat
                                                ? "bg-blue-600/20 text-cyan-300 border-cyan-500/50 shadow-sm"
                                                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Remarks / Note (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Dinner share, Rent payment"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full text-sm text-slate-100 bg-slate-900 p-3.5 rounded-xl border border-slate-800 outline-none focus:border-cyan-500/50 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !amount}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? "Processing Transfer..." : `Send ₹${amount || "0"}`}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function SendMoneyPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading transfer portal...</div>}>
            <SendMoneyContent />
        </Suspense>
    );
}