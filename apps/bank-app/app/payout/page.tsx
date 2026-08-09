"use client";

import { useEffect, useState, Suspense } from "react";
import { Lock, ShieldCheck, CheckCircle2, ArrowRight, Loader2, Building2, Wallet } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface UserPayoutData {
  name: string;
  walletBalance: number;
  bankAccount: {
    accountNumber: string;
    balance: number;
    bankName: "HDFC";
  };
  token: string;
  amount: number;
  status: string;
}

function PayoutGatewayContent() {
  const [step, setStep] = useState<"idle" | "processing" | "success" | "webhook" | "redirecting">("idle");
  const [userData, setUserData] = useState<UserPayoutData | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const fetchPayoutData = async () => {
      try {
        const response = await fetch(`/api/user/payout?token=${token}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          setErrorMsg("Invalid or expired payout transaction token");
        }
      } catch (err) {
        console.error("Failed to fetch payout transaction details", err);
        setErrorMsg("Failed to connect to bank server");
      } finally {
        setLoadingUser(false);
      }
    };

    if (token) {
      fetchPayoutData();
    } else {
      setLoadingUser(false);
      setErrorMsg("Transaction token is missing");
    }
  }, [token]);

  const getMaskedAccount = (accNo?: string) => {
    if (!accNo) return "XXXX2345";
    return `XXXX${accNo.slice(-4)}`;
  };

  const handleConfirmPayout = async () => {
    setStep("processing");
    setErrorMsg(null);

    try {
      // 1. Execute Payout API
      const res = await fetch(`/api/payout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Payout execution failed");
      }

      // 2. Show Success State
      setStep("success");

      // 3. Trigger Webhook confirmation step after 1.5s
      setTimeout(async () => {
        setStep("webhook");

        // 4. Redirect back to dashboard
        setTimeout(() => {
          setStep("redirecting");
          setTimeout(() => {
            router.push("http://localhost:3000/dashboard");
          }, 1500);
        }, 2000);
      }, 1500);

    } catch (err: any) {
      console.error("Payout execution failed", err);
      setErrorMsg(err.message || "Payout execution failed. Please try again.");
      setStep("idle");
    }
  };

  const currentAmount = userData?.amount ?? 0;
  const currentAccountHolder = userData?.name ?? "Account Holder";
  const currentMaskedAccount = getMaskedAccount(userData?.bankAccount?.accountNumber);
  const currentWalletBalance = userData?.walletBalance ?? 0;
  const currentBankBalance = userData?.bankAccount?.balance ?? 0;
  const currentTransactionToken = token ?? "TXN_UNKNOWN";

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#06244f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center font-black tracking-tighter text-xl">
            <span className="text-[#004C8F]">HDFC</span>
            <span className="text-[#ED1C24] ml-0.5">BANK</span>
          </div>
          <div className="hidden sm:block h-5 w-px bg-slate-200" />
          <span className="hidden sm:inline-block text-xs font-bold text-slate-500 uppercase tracking-widest">
            Secure Payout Gateway
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-bit SSL Secured</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden transition-all duration-300">

          {/* Gateway Top Banner */}
          <div className="bg-[#06244f] px-6 py-5 text-white flex justify-between items-center">
            <div>
              <p className="text-xs text-cyan-200/80 font-bold uppercase tracking-wider">Paytm Wallet Withdrawal</p>
              <h2 className="text-lg font-bold tracking-tight mt-0.5">Bank Payout</h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-cyan-200/80 font-bold uppercase tracking-wider">Amount</p>
              <p className="text-2xl font-black tracking-tight">₹{currentAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Body Section */}
          <div className="p-6 sm:p-8 space-y-6">

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3.5 rounded-xl">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Step 0 & 1: Initial View / Processing */}
            {step === "idle" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* Transaction Details Box */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Transaction Token</span>
                    <span className="font-mono text-slate-700 truncate max-w-[200px]">{currentTransactionToken}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Source</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-[#00baf2]" /> Paytm Balance (₹{currentWalletBalance.toLocaleString()})
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Destination Account</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#06244f]" /> HDFC ({currentMaskedAccount})
                    </span>
                  </div>
                </div>

                {/* Account Information Card */}
                <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recipient Details</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">Verified</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{currentAccountHolder}</p>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">A/C: {currentMaskedAccount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400">Current Bank Balance</p>
                      <p className="text-sm font-bold text-slate-800">₹{currentBankBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleConfirmPayout}
                    disabled={!userData || userData.status !== "Processing"}
                    className="flex-1 bg-[#06244f] hover:bg-[#051c3d] active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-blue-900/10 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Confirm Payout ₹{currentAmount.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("http://localhost:3000/dashboard")}
                    className="sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Processing State */}
            {step === "processing" && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-[#06244f]">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">Processing withdrawal...</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Transferring funds securely from Paytm Wallet to your HDFC Bank account.
                  </p>
                </div>
              </div>
            )}

            {/* Success State */}
            {step === "success" && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">Withdrawal Successful</h3>
                  <p className="text-xs text-slate-500">Funds credited to your bank account successfully.</p>
                </div>
              </div>
            )}

            {/* Webhook Completion State */}
            {step === "webhook" && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in duration-300">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-[#06244f]">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-800">Syncing with Paytm Ledger...</h3>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200/60 py-2 px-4 rounded-xl mx-auto w-fit">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#06244f]" />
                    <span>Sending confirmation webhook...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Final Redirect State */}
            {step === "redirecting" && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 w-full">
                  <p className="text-sm font-bold text-slate-800">Redirecting to Paytm Dashboard...</p>
                  <p className="text-xs text-slate-400">Taking you back to the application securely.</p>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
                    <div className="bg-[#06244f] h-full w-full animate-pulse rounded-full transition-all duration-1000" />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Card Footer Security Note */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Verified by HDFC Bank Secure Payout Engine</span>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 space-y-2">
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 font-medium text-slate-600">
          <a href="#rbi" className="hover:text-[#06244f] transition-colors">RBI Guidelines</a>
          <a href="#privacy" className="hover:text-[#06244f] transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-[#06244f] transition-colors">Terms & Conditions</a>
        </div>
        <p className="text-slate-400 text-[11px]">
          © Dummy HDFC Bank 2026. All rights reserved. Powered by HDFC Secure Payout Gateway.
        </p>
      </footer>

    </div>
  );
}

export default function HdfcPayoutGateway() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#06244f]" />
      </div>
    }>
      <PayoutGatewayContent />
    </Suspense>
  );
}
