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
    const initialQuery = searchParams.get("query") || "";

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [users, setUsers] = useState<UserType[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Fetch matching users on search query change
    useEffect(() => {
        const fetchUsers = async (query : string) => {
            if (!searchQuery.trim()) {
                setUsers([]);
                return;
            }
            try {
                const res = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}`);
                
                if (res.ok) {
                    const data = await res.json();
                    console.log(data);
                    
                    setUsers(data);
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
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Transaction failed");
        }

        // 1. Set success status
        setStatus({ 
            type: "success", 
            message: `Successfully sent ₹${amount} to ${selectedUser.name}` 
        });

        // 2. Clear form
        setAmount("");
        setNote("");
        setSelectedUser(null);

        // 3. Redirect to dashboard after 2 seconds
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
        <div className="flex min-h-screen bg-[#f4f7fa] font-sans">
            <div className="flex-1 max-w-2xl mx-auto px-4 py-8">
                
                {/* Header */}
                <div className="bg-[#002e6e] rounded-2xl p-6 text-white mb-6 shadow-lg">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold tracking-tight">Send Money</h1>
                    </div>
                    <p className="text-xs text-cyan-200 mt-2">Instant wallet-to-wallet transfers</p>
                </div>

                {/* Status Notification */}
                {status && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-semibold ${
                        status.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                        {status.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                        <p>{status.message}</p>
                    </div>
                )}

                {/* Main Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                    
                    {/* Step 1: Recipient Selection */}
                    {!selectedUser ? (
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                1. Search Recipient
                            </label>
                            
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center gap-3 px-4 focus-within:border-[#00baf2] focus-within:ring-2 focus-within:ring-[#00baf2]/10 transition-all">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Enter name or mobile number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent outline-none text-slate-700 placeholder-slate-400 text-sm py-1"
                                    autoFocus
                                />
                            </div>

                            {/* Search Results */}
                            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                {users.map((u) => (
                                    <div
                                        key={u.id}
                                        onClick={() => setSelectedUser(u)}
                                        className="p-3 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#002e6e]/10 text-[#002e6e] flex items-center justify-center font-bold text-sm">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{u.name}</p>
                                                <p className="text-xs text-slate-400 font-mono">+91 {u.number}</p>
                                            </div>
                                        </div>
                                        <Send className="w-4 h-4 text-slate-400" />
                                    </div>
                                ))}
                                {searchQuery && users.length === 0 && (
                                    <p className="text-xs text-slate-400 text-center py-4">No users found matching "{searchQuery}"</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Step 2: Payment Form */
                        <form onSubmit={handleTransfer} className="space-y-5">
                            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#002e6e] text-white flex items-center justify-center font-bold text-sm">
                                        {selectedUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{selectedUser.name}</p>
                                        <p className="text-xs text-slate-400 font-mono">+91 {selectedUser.number}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedUser(null)}
                                    className="text-xs font-semibold text-[#00baf2] hover:underline cursor-pointer"
                                >
                                    Change
                                </button>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                                    Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="1"
                                    className="w-full text-2xl font-black text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none focus:border-[#00baf2] focus:ring-2 focus:ring-[#00baf2]/10 transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                                    Add Note (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dinner share, Rent"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full text-sm text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none focus:border-[#00baf2] transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !amount}
                                className="w-full bg-[#00baf2] hover:bg-[#00a3d5] text-white font-bold py-3.5 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                            >
                                {loading ? "Processing..." : `Pay ₹${amount || "0"}`}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SendMoneyPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading transfer page...</div>}>
            <SendMoneyContent />
        </Suspense>
    );
}