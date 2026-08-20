"use client";

import { useState } from "react";
import { ArrowDownLeft, ShieldCheck, ArrowRight, ArrowLeft, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WithdrawMoneyPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  const numericAmount = Number(amount) || 0;
  const processingFee = 0;
  const totalDeduction = numericAmount + processingFee;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) return;

    setLoading(true);

    try {
      const response = await fetch("/api/off-ramp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: numericAmount,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.message || "Failed to initialize withdrawal");
      }

      const data = await response.json();
      if (data.token) {
        window.location.href = data.redirectUrl || `http://localhost:3001/payout?token=${data.token}`;
      } else {
        throw new Error("Token not received from backend");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Withdraw to Bank</h1>
            <p className="text-xs text-slate-400">Transfer wallet balance to bank account</p>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Header Banner */}
        <div className="bg-slate-900 border-b border-slate-800 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Bank Off-Ramp</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Transfer funds securely from your digital wallet to your verified bank account.
            </p>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleWithdraw} className="p-6 sm:p-8 space-y-6">
          
          {/* Amount Input Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Withdrawal Amount
            </label>
            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 focus-within:border-cyan-500/50 transition-all">
              <span className="text-3xl font-extrabold text-slate-400 mr-2">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || Number(val) >= 0) {
                    setAmount(val);
                  }
                }}
                className="w-full text-3xl font-extrabold text-white bg-transparent outline-none placeholder-slate-600"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Quick Select
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {quickAmounts.map((val) => {
                const isActive = numericAmount === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    ₹{val}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Bank Destination Info */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-cyan-300 flex items-center justify-center border border-blue-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100">Destination Account</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">HDFC Bank •••• 8921</p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-md border border-emerald-500/20">
              Verified
            </span>
          </div>

          {/* Payment Summary Box */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 space-y-2.5 text-xs font-medium text-slate-400">
            <div className="flex justify-between">
              <span>Withdrawal Amount</span>
              <span className="font-bold text-slate-100">₹{numericAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Transfer Fee</span>
              <span className="font-bold text-emerald-400">Free (₹0)</span>
            </div>
            <div className="h-px bg-slate-800 my-1" />
            <div className="flex justify-between text-sm">
              <span className="font-bold text-slate-200">Total Deduction</span>
              <span className="font-extrabold text-cyan-400">₹{totalDeduction.toFixed(2)}</span>
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-300 space-y-1 font-medium leading-relaxed">
              <p>Funds will be transferred directly to your primary verified HDFC Bank account.</p>
              <p className="text-slate-400">Redirects to HDFC Bank payout gateway.</p>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="sm:w-auto px-6 py-3.5 rounded-xl border border-slate-700/80 text-slate-300 hover:bg-slate-800 font-bold text-sm transition-all cursor-pointer text-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={numericAmount <= 0 || loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? "Processing..." : "Confirm Withdrawal"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}