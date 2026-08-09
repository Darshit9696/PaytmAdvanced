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
    <div className="min-h-screen bg-[#f4f7fa] flex flex-col justify-between font-sans selection:bg-cyan-100 selection:text-[#06244f]">
      
      {/* Top App Header */}
      <header className="w-full bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-black text-[#06244f] tracking-tight">
            Paytm
          </div>
          <div className="h-5 w-px bg-slate-200" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Wallet Withdrawal
          </span>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#06244f] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </header>

      {/* Main Centered Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
          
          {/* Card Header Banner */}
          <div className="bg-[#06244f] px-8 py-6 text-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#00baf2] shrink-0">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Withdraw to Bank</h1>
              <p className="text-xs text-cyan-200/80 font-medium mt-0.5">
                Transfer money securely from your Paytm Wallet to your linked bank account.
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
              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus-within:border-[#00baf2] focus-within:ring-2 focus-within:ring-[#00baf2]/10 transition-all">
                <span className="text-3xl font-black text-slate-400 mr-2">₹</span>
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
                  className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none placeholder-slate-300"
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
                          ? "bg-[#06244f] text-white shadow-sm"
                          : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      ₹{val}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Bank Destination Info */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#06244f] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Linked Bank Account</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">HDFC Bank •••• 8921</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">Primary</span>
            </div>

            {/* Payment Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs font-medium text-slate-600">
              <div className="flex justify-between">
                <span>Withdrawal Amount</span>
                <span className="font-bold text-slate-900">₹{numericAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transfer Fee</span>
                <span className="font-bold text-emerald-600">Free (₹0)</span>
              </div>
              <div className="h-px bg-slate-200 my-1" />
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-900">Total Deduction</span>
                <span className="font-black text-[#06244f]">₹{totalDeduction.toFixed(2)}</span>
              </div>
            </div>

            {/* Information Card */}
            <div className="bg-cyan-50/60 border border-cyan-100 rounded-2xl p-4 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 text-[#00baf2] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-600 space-y-1 font-medium leading-relaxed">
                <p>Funds will be transferred directly to your primary verified HDFC Bank account instantaneously.</p>
                <p className="text-slate-400">Standard IMPS/NEFT routing rules apply.</p>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all duration-200 cursor-pointer text-center"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={numericAmount <= 0 || loading}
                className="flex-1 bg-[#00baf2] hover:bg-[#00a3d5] active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-cyan-500/10 transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span>{loading ? "Processing Transfer..." : "Confirm Withdrawal"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400">
        <p>© Paytm Wallet 2026. Secure PCI-DSS Compliant Infrastructure.</p>
      </footer>

    </div>
  );
}