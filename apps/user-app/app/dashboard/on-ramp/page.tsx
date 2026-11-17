"use client";

import { useState } from "react";
import { Wallet, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Amount, Button } from "@repo/ui";

export default function AddMoneyPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const quickAmounts = [100, 250, 500, 1000, 2000, 5000];

  const numericAmount = Number(amount) || 0;
  const processingFee = 0;
  const totalAmount = numericAmount + processingFee;

  const handleProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) return;

    setLoading(true);

    try {
      const response = await fetch("/api/onramp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: numericAmount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize on-ramp transaction");
      }

      const data = await response.json();
      const token = data.token;

      if (token) {
        window.location.href = `http://localhost:3001/pay?token=${token}`;
      } else {
        throw new Error("Token not received from backend");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-surface-subtle text-text-muted hover:text-text rounded-[6px] border border-border transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-text">Add Money</h1>
            <p className="text-xs text-text-muted">Deposit funds via linked bank gateway</p>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-text-muted bg-surface-subtle border border-border px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>NetBanking Secured</span>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-surface border border-border rounded-[10px] overflow-hidden shadow-xs">
        {/* Banner */}
        <div className="bg-surface-subtle border-b border-border p-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[8px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">On-Ramp Deposit</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Select or type the amount to deposit from your linked bank account into your ledger wallet.
            </p>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleProceed} className="p-6 space-y-5">
          {/* Amount Input Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
              Deposit Amount
            </label>
            <div className="relative flex items-center bg-surface border border-border rounded-[8px] px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-xs">
              <span className="text-2xl font-mono text-text-muted mr-2 font-medium">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || Number(val) >= 0) {
                    setAmount(val);
                  }
                }}
                className="w-full text-2xl font-semibold font-mono tabular-nums text-text bg-transparent outline-none placeholder-text-faint"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
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
                    className={`py-2 px-3 rounded-[6px] text-xs font-mono font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary text-white shadow-xs border border-primary"
                        : "bg-surface-subtle text-text border border-border hover:bg-surface"
                    }`}
                  >
                    ₹{val}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Summary Box */}
          <div className="bg-surface-subtle rounded-[8px] p-4 border border-border space-y-2 text-xs font-medium text-text-muted">
            <div className="flex justify-between items-center">
              <span>Amount to Add</span>
              <span className="font-mono text-text">
                <Amount value={numericAmount} size="sm" weight="semibold" />
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Processing Fee</span>
              <span className="font-medium text-success">Free (₹0.00)</span>
            </div>
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between items-center text-sm pt-0.5">
              <span className="font-semibold text-text">Total Payable</span>
              <span className="text-primary">
                <Amount value={totalAmount} size="md" weight="semibold" />
              </span>
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-surface-subtle border border-border rounded-[8px] p-3.5 flex items-start gap-3">
            <div className="w-7 h-7 rounded-[6px] bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs text-text-muted space-y-0.5 leading-relaxed">
              <p className="font-medium text-text">Simulated HDFC NetBanking Gateway</p>
              <p className="text-[11px] text-text-faint">
                You will be redirected to the bank test portal to authorize the transaction.
              </p>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={numericAmount <= 0 || loading}
              loading={loading}
              className="flex-1"
            >
              <span>{loading ? "Initializing..." : "Proceed to Bank Gateway"}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
