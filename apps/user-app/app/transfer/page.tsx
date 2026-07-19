"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldCheck, Wallet, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

interface Reciever {
    id: number;
    name: string;
    number: string;
}

export default function TransactionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Extract recipient details dynamically from URL params (fallback to mock if empty)
    const recipientName = searchParams.get("name") || "Darshit Bhatt";
    const recipientPhone = searchParams.get("phone") || "8320355922";

    // State Management
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const receiverId = searchParams.get("id");
    const [receiver, setReceiver] = useState<Reciever>();



    // Get the receiver details from the backend of the reciever and update the states  
    useEffect(() => {
        if (!receiverId) return;
        const fetchUserInfo = async () => {
            const res = await fetch(`api/user?id=${receiverId}`);
            const data = await res.json();

            if (res.ok) {
                setReceiver(data);
            }
        }
        fetchUserInfo();
    }, [receiverId])


    // Hardcoded current balance for UX check (Replace with real balance from context/state later)
    const currentBalance = 10000;

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);

        // Initial Guard Checks
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setErrorMessage("Please enter a valid amount");
            setStatus("error");
            return;
        }

        if (parsedAmount > currentBalance) {
            setErrorMessage("Insufficient wallet balance");
            setStatus("error");
            return;
        }

        setLoading(true);
        setStatus("idle");
        setErrorMessage("");

        try {
            const res = await fetch("/api/transfer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    receiverId,
                    amount : parsedAmount
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            setStatus("success")

        } catch (err) {
            setErrorMessage("Transaction failed. Please try again.");
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    // --- SUCCESS SCREEN OVERLAY ---
    if (status === "success") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f4f7fa] p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-2xl p-8 text-center shadow-xl border border-emerald-100 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-1">Payment Successful!</h2>
                    <p className="text-sm text-slate-500 mb-6">Sent securely via Paytm 2.0 Network</p>

                    <div className="bg-slate-50 w-full rounded-xl p-4 border border-slate-100 mb-6 font-mono text-left">
                        <div className="flex justify-between text-xs text-slate-400 mb-1"><span>PAID TO</span> <span>{receiver?.name}</span></div>
                        <div className="flex justify-between text-xs text-slate-400 mb-3"><span>PHONE</span> <span>+91 {receiver?.number}</span></div>
                        <div className="border-t border-slate-200/60 my-2"></div>
                        <div className="flex justify-between font-sans items-baseline mt-2">
                            <span className="text-sm font-semibold text-slate-700">Amount Sent:</span>
                            <span className="text-2xl font-black text-slate-900">₹{parseFloat(amount).toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full py-3 bg-[#002e6e] text-white font-bold rounded-xl shadow hover:bg-slate-800 transition-all cursor-pointer"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // --- MAIN FORM INTERFACE ---
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f4f7fa] px-4 py-8 font-sans">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100">

                {/* Header Ribbon */}
                <div className="bg-[#002e6e] px-6 py-4 text-white flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-bold tracking-wide uppercase">Send Money</span>
                    <span className="flex items-center gap-1 text-[10px] bg-white/10 text-cyan-200 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        <ShieldCheck className="w-3 h-3" /> Secured
                    </span>
                </div>

                {/* Form Body */}
                <form onSubmit={handlePayment} className="p-6 space-y-6">

                    {/* Recipient Profile Summary Card */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-[#002e6e] font-black text-base border border-cyan-200 uppercase">
                            {recipientName[0]}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">{recipientName}</h3>
                            <p className="text-xs text-slate-400 font-mono">+91 {recipientPhone}</p>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {status === "error" && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
                        </div>
                    )}

                    {/* Hero Amount Input Section */}
                    <div className="text-center space-y-2">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Enter Amount
                        </label>
                        <div className="relative flex items-center justify-center">
                            <span className="text-3xl font-black text-slate-900 mr-1.5 select-none">₹</span>
                            <input
                                type="number"
                                pattern="[0-9]*"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                disabled={loading}
                                className="w-48 text-center text-4xl font-black text-slate-900 placeholder-slate-300 bg-transparent outline-none focus:placeholder-transparent border-b-2 border-transparent focus:border-[#00baf2] transition-colors py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>

                        {/* Real-time Available Balance Validation Context */}
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full mt-1">
                            <Wallet className="w-3.5 h-3.5 text-[#002e6e]" />
                            <span>Available Balance:</span>
                            <span className="font-bold text-slate-700">₹{currentBalance.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Optional Message / Remind Input */}
                    <div>
                        <input
                            type="text"
                            placeholder="Add a note (e.g., Dinner, Rent) - Optional"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            disabled={loading}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00baf2]/20 focus:border-[#00baf2] transition-all"
                        />
                    </div>

                    {/* Big Action Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !amount}
                        className="w-full py-3.5 px-4 bg-[#00baf2] hover:bg-[#00a3d9] active:bg-[#008cc0] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing secure payment...
                            </span>
                        ) : (
                            <>
                                Proceed to Pay ₹{amount || "0"} <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
}