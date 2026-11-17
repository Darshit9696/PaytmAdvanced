"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Store,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  QrCode,
  Lock,
  Wallet,
  RefreshCw,
  LogIn,
} from "lucide-react";
import { Amount, Avatar, Button } from "@repo/ui";

interface PaymentTransactionDetails {
  transactionId: string;
  amount: number;
  note?: string | null;
  status: string;
  merchant: {
    businessName: string;
  };
}

function PayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const transactionId = searchParams.get("transactionId");

  const [txDetails, setTxDetails] = useState<PaymentTransactionDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "success">("idle");
  const [copied, setCopied] = useState(false);

  const fetchTxDetails = useCallback(async (id: string) => {
    setIsLoadingDetails(true);
    setFetchError(null);
    setPaymentError(null);

    try {
      const res = await fetch(`/api/payment?transactionId=${encodeURIComponent(id.trim())}`);

      if (!res.ok) {
        if (res.status === 404) {
          setFetchError("Payment request not found or has expired. Please scan a valid merchant QR code.");
        } else {
          const errorData = await res.json().catch(() => null);
          setFetchError(errorData?.msg || errorData?.message || `Failed to fetch payment details (Status: ${res.status})`);
        }
        setTxDetails(null);
        setIsLoadingDetails(false);
        return;
      }

      const data = await res.json();

      if (!data || !data.transactionId) {
        setFetchError("Invalid payment request. The transaction data could not be verified.");
        setTxDetails(null);
        setIsLoadingDetails(false);
        return;
      }

      const normalizedData: PaymentTransactionDetails = {
        transactionId: data.transactionId,
        amount: typeof data.amount === "number" ? data.amount : Number(data.amount || 0),
        note: data.note || null,
        status: data.status || "PENDING",
        merchant: {
          businessName: data.merchant?.businessName || "Verified Merchant",
        },
      };

      setTxDetails(normalizedData);
      setIsLoadingDetails(false);
    } catch (err: any) {
      console.error("Error fetching transaction details:", err);
      setFetchError("Network error: Could not load payment request. Please check your connection and retry.");
      setTxDetails(null);
      setIsLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (transactionId && transactionId.trim().length > 0) {
      fetchTxDetails(transactionId.trim());
    } else {
      setIsLoadingDetails(false);
      setFetchError("No transaction ID was provided in the checkout URL.");
      setTxDetails(null);
    }
  }, [transactionId, fetchTxDetails]);

  const handleCopyTransactionId = () => {
    const idToCopy = txDetails?.transactionId || transactionId;
    if (!idToCopy) return;
    navigator.clipboard.writeText(idToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!txDetails || paymentState === "processing") return;

    if (authStatus === "unauthenticated") {
      router.push(`/login?callbackUrl=/pay?transactionId=${encodeURIComponent(txDetails.transactionId)}`);
      return;
    }

    setPaymentState("processing");
    setPaymentError(null);

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId: txDetails.transactionId,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setPaymentError(
          data?.message || "Payment processing failed. Please check your wallet balance and try again."
        );
        setPaymentState("idle");
        return;
      }

      if (data?.transaction) {
        setTxDetails((prev) => ({
          transactionId: data.transaction.transactionId || prev?.transactionId || txDetails.transactionId,
          amount: typeof data.transaction.amount === "number" ? data.transaction.amount : (prev?.amount || txDetails.amount),
          note: data.transaction.note ?? prev?.note,
          status: "SUCCESS",
          merchant: {
            businessName: data.transaction.merchant?.businessName || prev?.merchant?.businessName || "Verified Merchant",
          },
        }));
      }

      setPaymentState("success");
    } catch (err: any) {
      console.error("Payment execution error:", err);
      setPaymentError(
        "Network error: Could not complete transaction. Please check your internet connection and retry."
      );
      setPaymentState("idle");
    }
  };

  // 1. LOADING STATE
  if (isLoadingDetails) {
    return (
      <div className="min-h-screen bg-bg text-text font-sans flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="bg-surface border border-border rounded-[10px] p-8 text-center space-y-4 shadow-xs">
            <RefreshCw className="w-6 h-6 text-primary animate-spin mx-auto" />
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-text">Loading Payment Request</h2>
              <p className="text-xs text-text-muted">Verifying merchant transaction ledger...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. ERROR / INVALID
  if (fetchError || !txDetails) {
    return (
      <div className="min-h-screen bg-bg text-text font-sans flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="bg-surface border border-border rounded-[10px] p-8 text-center space-y-5 shadow-xs">
            <div className="w-12 h-12 rounded-[8px] bg-danger-subtle/50 border border-danger/30 text-danger flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-base font-semibold text-text">Payment Request Unavailable</h1>
              <p className="text-xs text-text-muted leading-relaxed">
                {fetchError || "Could not retrieve valid transaction details for this payment request."}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/dashboard/scan"
                className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium py-2.5 px-4 rounded-[6px] text-xs transition-all shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan Merchant QR Code</span>
              </Link>

              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 bg-surface hover:bg-surface-subtle text-text font-medium py-2 px-4 rounded-[6px] border border-border text-xs transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. SUCCESS RECEIPT STATE
  if (paymentState === "success") {
    const businessName = txDetails?.merchant?.businessName || "Verified Merchant";
    const resolvedTxId = txDetails?.transactionId || transactionId || "TXN_UNKNOWN";

    return (
      <div className="min-h-screen bg-bg text-text font-sans flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="bg-surface border border-border rounded-[10px] p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />

            {/* Success Icon & Header */}
            <div className="text-center space-y-2 pt-2">
              <div className="w-12 h-12 rounded-full bg-success-subtle/50 border border-success/30 text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-text">Payment Confirmed</h1>
                <p className="text-xs text-success font-medium">Debited from wallet ledger</p>
              </div>
            </div>

            {/* Amount Paid Display */}
            <div className="text-center bg-surface-subtle border border-border rounded-[8px] py-4 px-6 space-y-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Amount Paid</span>
              <div>
                <Amount value={txDetails.amount} size="3xl" weight="semibold" />
              </div>
            </div>

            {/* Summary Details */}
            <div className="space-y-2.5 bg-surface-subtle border border-border rounded-[8px] p-4 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border">
                <span className="text-text-muted">Paid To</span>
                <span className="font-semibold text-text flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-primary" />
                  {businessName}
                </span>
              </div>

              {txDetails.note && (
                <div className="flex items-center justify-between py-1 border-b border-border">
                  <span className="text-text-muted">Reference Note</span>
                  <span className="font-medium text-text">{txDetails.note}</span>
                </div>
              )}

              <div className="flex items-start justify-between py-1 border-b border-border gap-2">
                <span className="text-text-muted shrink-0">Transaction ID</span>
                <span className="font-mono text-[11px] text-text break-all text-right">
                  {resolvedTxId}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-text-muted">Status</span>
                <span className="font-medium text-success bg-success-subtle/50 px-2 py-0.5 rounded-[4px] border border-success/30 text-[10px] font-mono">
                  CONFIRMED
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium py-2.5 px-4 rounded-[6px] text-xs transition-all shadow-xs"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/dashboard/scan"
                className="w-full inline-flex items-center justify-center gap-2 bg-surface hover:bg-surface-subtle text-text font-medium py-2 px-4 rounded-[6px] border border-border text-xs transition-all"
              >
                <QrCode className="w-3.5 h-3.5 text-primary" />
                <span>Scan Another QR</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. MAIN CHECKOUT FORM
  const businessName = txDetails?.merchant?.businessName || "Verified Merchant";
  const isAlreadyPaid = txDetails?.status === "SUCCESS";
  const isUnauthenticated = authStatus === "unauthenticated";

  return (
    <div className="min-h-screen bg-bg text-text font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Main Card */}
        <div className="bg-surface border border-border rounded-[10px] p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[6px] bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-text">Merchant Authorization</h1>
                <p className="text-xs text-text-muted">Verify checkout payment details</p>
              </div>
            </div>

            <span className="text-[11px] font-medium bg-success-subtle/50 text-success border border-success/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          </div>

          {/* Unauthenticated Alert */}
          {isUnauthenticated && (
            <div className="bg-warning-subtle/50 border border-warning/30 rounded-[8px] p-3.5 flex items-center justify-between gap-3 text-xs text-text">
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4 text-warning shrink-0" />
                <span>Please sign in to authorize this payment.</span>
              </div>
              <Link
                href={`/login?callbackUrl=/pay?transactionId=${encodeURIComponent(txDetails?.transactionId || transactionId || "")}`}
                className="bg-primary hover:bg-primary-hover text-white font-medium px-3 py-1 rounded-[4px] text-xs transition-colors shrink-0"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Merchant Card */}
          <div className="bg-surface-subtle border border-border rounded-[8px] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Paying Merchant
              </span>
              <span className="text-[10px] font-mono text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border">
                Store Terminal
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Avatar name={businessName} size="lg" />
              <div>
                <h2 className="text-sm font-semibold text-text">{businessName}</h2>
                <p className="text-xs text-text-muted">Merchant Checkout Direct</p>
              </div>
            </div>
          </div>

          {/* Amount Card */}
          <div className="text-center bg-surface-subtle border border-border rounded-[8px] p-5 space-y-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Payable Amount
            </span>
            <div className="py-1">
              <Amount value={txDetails.amount} size="3xl" weight="semibold" />
            </div>
            {txDetails?.note && (
              <p className="text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md inline-block font-medium">
                Ref: {txDetails.note}
              </p>
            )}
          </div>

          {/* Metadata Summary */}
          <div className="space-y-2.5 bg-surface-subtle border border-border rounded-[8px] p-3.5 text-xs">
            <div className="flex items-center justify-between gap-2 py-1 border-b border-border">
              <span className="text-text-muted shrink-0">Transaction ID</span>
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="font-mono text-[11px] text-text truncate max-w-[200px]">
                  {txDetails?.transactionId || transactionId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTransactionId}
                  className="p-1 hover:bg-surface rounded text-text-muted hover:text-text transition-colors cursor-pointer"
                  title="Copy Transaction ID"
                >
                  {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border">
              <span className="text-text-muted">Payment Source</span>
              <span className="font-medium text-text flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-primary" />
                Personal Wallet Ledger
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-text-muted">Status</span>
              <span
                className={`font-medium px-2 py-0.5 rounded-[4px] text-[10px] uppercase font-mono border ${
                  txDetails?.status === "SUCCESS"
                    ? "text-success bg-success-subtle/50 border-success/30"
                    : txDetails?.status === "FAILED"
                    ? "text-danger bg-danger-subtle/50 border-danger/30"
                    : "text-warning bg-warning-subtle/50 border-warning/30"
                }`}
              >
                {txDetails?.status || "PENDING"}
              </span>
            </div>
          </div>

          {/* Payment Error Alert Banner */}
          {paymentError && (
            <div className="bg-danger-subtle/50 border border-danger/30 text-danger rounded-[8px] p-3.5 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">Payment Unsuccessful</p>
                <p className="leading-relaxed">{paymentError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <Button
              variant="primary"
              size="lg"
              onClick={handleConfirmPayment}
              disabled={paymentState === "processing" || isAlreadyPaid}
              loading={paymentState === "processing"}
              className="w-full"
            >
              {paymentState === "processing" ? (
                <span>Authorizing & Debiting Wallet...</span>
              ) : isAlreadyPaid ? (
                <span>Transaction Already Paid</span>
              ) : (
                <span>Authorize ₹{Number(txDetails.amount).toFixed(2)}</span>
              )}
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => router.push("/dashboard")}
              disabled={paymentState === "processing"}
              className="w-full"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>Cancel Payment</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <div className="text-primary text-xs font-medium animate-pulse">
            Loading Payment Request...
          </div>
        </div>
      }
    >
      <PayContent />
    </Suspense>
  );
}
