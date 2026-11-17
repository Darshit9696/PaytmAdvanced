"use client";

import { useEffect, useState, Suspense } from "react";
import { Lock, ShieldCheck, CheckCircle2, ArrowRight, Loader2, Building2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Amount, Button } from "@repo/ui";

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
    if (!accNo) return "••••4092";
    return `••••${accNo.slice(-4)}`;
  };

  const handleConfirmPayout = async () => {
    setStep("processing");
    setErrorMsg(null);

    try {
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

      setStep("success");

      setTimeout(async () => {
        setStep("webhook");

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

  const amountVal = userData?.amount ?? 1000;
  const userName = userData?.name ?? "Account Holder";
  const accNumber = userData?.bankAccount?.accountNumber;
  const bankBal = userData?.bankAccount?.balance ?? 24590.5;

  return (
    <div className="min-h-screen bg-bg text-text font-sans flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full bg-surface border-b border-border py-4 px-6 md:px-12 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center font-semibold tracking-tight text-base text-text">
            <span>HDFC Bank</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-[11px] font-mono text-text-muted">
            IMPS / NEFT settlement gateway
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Lock className="w-3.5 h-3.5 text-primary" />
          <span>Automated clearing house</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md bg-surface rounded-[10px] shadow-xs border border-border overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

          {/* Banner */}
          <div className="bg-surface-subtle border-b border-border p-5 text-center space-y-1">
            <span className="text-xs font-medium text-text-muted block">
              Simulated bank account payout
            </span>
            <div className="pt-1">
              <Amount value={amountVal} size="3xl" weight="semibold" />
            </div>
            <p className="text-xs text-text-muted">Crediting HDFC Bank account from wallet</p>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {errorMsg && (
              <div className="p-3 bg-danger-subtle/50 border border-danger/30 rounded-[8px] text-xs text-danger">
                {errorMsg}
              </div>
            )}

            {/* Account Details (Flat definition list, no card-in-card) */}
            <dl className="divide-y divide-border text-xs">
              <div className="flex justify-between items-center py-2.5 first:pt-0">
                <dt className="text-text-muted">Beneficiary</dt>
                <dd className="font-medium text-text">{userName}</dd>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <dt className="text-text-muted">Target account</dt>
                <dd className="font-mono text-text">HDFC {getMaskedAccount(accNumber)}</dd>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <dt className="text-text-muted">Current balance</dt>
                <dd className="font-mono text-text">
                  <Amount value={bankBal} size="xs" weight="medium" />
                </dd>
              </div>
              <div className="flex justify-between items-center py-2.5 last:pb-0">
                <dt className="text-text-muted">Transaction token</dt>
                <dd className="font-mono text-[11px] text-primary truncate max-w-[180px]">
                  {token || "TEST_TOKEN"}
                </dd>
              </div>
            </dl>

            {/* Stepper Status Alerts */}
            {step === "processing" && (
              <div className="bg-surface-subtle border border-border rounded-[8px] p-4 text-center space-y-2">
                <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" />
                <p className="text-xs font-semibold text-text">Processing Core Banking Settlement...</p>
                <p className="text-[11px] text-text-muted">Crediting funds directly into savings account</p>
              </div>
            )}

            {step === "success" && (
              <div className="bg-success-subtle/50 border border-success/30 rounded-[8px] p-4 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-success mx-auto" />
                <p className="text-xs font-semibold text-success">Bank Account Credited Successfully!</p>
                <p className="text-[11px] text-text-muted">Triggering double-entry off-ramp webhook...</p>
              </div>
            )}

            {step === "webhook" && (
              <div className="bg-success-subtle/50 border border-success/30 rounded-[8px] p-4 text-center space-y-2">
                <ShieldCheck className="w-6 h-6 text-success mx-auto" />
                <p className="text-xs font-semibold text-success">Ledger Webhook Acknowledged!</p>
                <p className="text-[11px] text-text-muted">Wallet balance deduction permanently logged</p>
              </div>
            )}

            {step === "redirecting" && (
              <div className="bg-surface-subtle border border-border rounded-[8px] p-4 text-center space-y-2">
                <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" />
                <p className="text-xs font-semibold text-text">Returning to Wallet Dashboard...</p>
              </div>
            )}

            {/* Action Buttons (when idle) */}
            {step === "idle" && (
              <div className="space-y-2 pt-1">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleConfirmPayout}
                  disabled={loadingUser || !token}
                  className="w-full"
                >
                  <span>Confirm Payout Receipt ₹{Number(amountVal).toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => router.push("http://localhost:3000/dashboard")}
                  className="w-full"
                >
                  Cancel Payout
                </Button>
              </div>
            )}

            {/* Trust Footer */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted pt-2 border-t border-border">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              <span>Simulated Instant Clearing Service</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface border-t border-border py-3 px-6 text-center text-xs text-text-faint">
        <p>© Simulated Core Banking Gateway 2026. Test Harness Only.</p>
      </footer>
    </div>
  );
}

export default function PayoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <div className="text-primary text-xs font-medium animate-pulse">
            Connecting to bank network...
          </div>
        </div>
      }
    >
      <PayoutGatewayContent />
    </Suspense>
  );
}
