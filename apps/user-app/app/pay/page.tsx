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
  Clock,
  LogIn,
} from "lucide-react";

/**
 * Type definition for the payment transaction returned by GET /api/payment
 */
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

  // React states for transaction details, loading, and errors
  const [txDetails, setTxDetails] = useState<PaymentTransactionDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Payment execution state: "idle" | "processing" | "success"
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "success">("idle");
  const [copied, setCopied] = useState(false);

  /**
   * Fetch real transaction details from GET /api/payment?transactionId=<id>
   */
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

      // Ensure data has valid structure before setting state
      if (!data || !data.transactionId) {
        setFetchError("Invalid payment request. The transaction data could not be verified.");
        setTxDetails(null);
        setIsLoadingDetails(false);
        return;
      }

      // Safe normalization for merchant data
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

  // Fetch transaction details on mount whenever transactionId changes
  useEffect(() => {
    if (transactionId && transactionId.trim().length > 0) {
      fetchTxDetails(transactionId.trim());
    } else {
      setIsLoadingDetails(false);
      setFetchError("No transaction ID was provided in the checkout URL.");
      setTxDetails(null);
    }
  }, [transactionId, fetchTxDetails]);

  // Copy transaction ID helper
  const handleCopyTransactionId = () => {
    const idToCopy = txDetails?.transactionId || transactionId;
    if (!idToCopy) return;
    navigator.clipboard.writeText(idToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Execute real backend payment processing.
   * Sends ONLY { transactionId } to POST /api/payment.
   */
  const handleConfirmPayment = async () => {
    if (!txDetails || paymentState === "processing") return;

    // Check if user is authenticated
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

      // Update local state with finalized transaction from database
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

  // ---------------------------------------------------------------------------
  // 1. LOADING STATE (Fetching real transaction details from API)
  // ---------------------------------------------------------------------------
  if (isLoadingDetails) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#090d16] rounded-[9px] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-base font-extrabold text-white">PayPulse</span>
            </Link>
          </div>

          {/* Loading Container */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white">Loading Payment Details</h2>
              <p className="text-xs text-slate-400">Verifying merchant transaction with database...</p>
            </div>

            {/* Skeleton shimmer preview */}
            <div className="space-y-3 pt-2">
              <div className="h-16 bg-slate-900/80 rounded-2xl border border-slate-800/80 animate-pulse" />
              <div className="h-24 bg-slate-900/80 rounded-2xl border border-slate-800/80 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. ERROR / INVALID / NOT FOUND TRANSACTION STATE
  // ---------------------------------------------------------------------------
  if (fetchError || !txDetails) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#090d16] rounded-[9px] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-base font-extrabold text-white">PayPulse</span>
            </Link>
          </div>

          {/* Error Card */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-lg font-bold text-white">Payment Request Unavailable</h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                {fetchError || "Could not retrieve valid transaction details for this payment request."}
              </p>
            </div>

            {/* Error Actions */}
            <div className="space-y-2.5 pt-2">
              {transactionId && (
                <button
                  type="button"
                  onClick={() => fetchTxDetails(transactionId)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-cyan-400" />
                  <span>Retry Verification</span>
                </button>
              )}

              <Link
                href="/dashboard/scan"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan Merchant QR Code</span>
              </Link>

              <Link
                href="/dashboard"
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold py-2.5 px-4 rounded-xl border border-slate-800 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. PAYMENT CONFIRMATION SUCCESS RECEIPT STATE (Real Completed Database State)
  // ---------------------------------------------------------------------------
  if (paymentState === "success") {
    const businessName = txDetails?.merchant?.businessName || "Verified Merchant";
    const amountVal = Number(txDetails?.amount || 0).toFixed(2);
    const resolvedTxId = txDetails?.transactionId || transactionId || "TXN_UNKNOWN";

    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in duration-200">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#090d16] rounded-[9px] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-base font-extrabold text-white">PayPulse</span>
            </Link>
          </div>

          {/* Receipt Card */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />

            {/* Success Icon & Header */}
            <div className="text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white">Payment Successful</h1>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">Transaction debited and confirmed</p>
              </div>
            </div>

            {/* Amount Paid Display */}
            <div className="text-center bg-slate-900/90 border border-slate-800 rounded-2xl py-4 px-6 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount Paid</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                ₹{amountVal}
              </div>
            </div>

            {/* Summary Details */}
            <div className="space-y-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Paid To</span>
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-cyan-400" />
                  {businessName}
                </span>
              </div>

              {txDetails.note && (
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Note</span>
                  <span className="font-medium text-slate-200">{txDetails.note}</span>
                </div>
              )}

              <div className="flex items-start justify-between py-1 border-b border-slate-800/60 gap-2">
                <span className="text-slate-400 shrink-0">Transaction ID</span>
                <span className="font-mono text-[11px] text-cyan-300 break-all text-right">
                  {resolvedTxId}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Status</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  SUCCESS
                </span>
              </div>
            </div>

            {/* Information Notice */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 flex items-start gap-2.5 text-emerald-300 text-[11px] leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                Your wallet balance has been updated and the payment has been settled into the merchant&apos;s account.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <Link
                href="/dashboard"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard/scan"
                className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold py-2.5 px-4 rounded-xl border border-slate-800 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-cyan-400" />
                <span>Scan Another Merchant QR</span>
              </Link>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-500">
            PayPulse Personal App • Verified Merchant Settlement
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 4. MAIN PAYMENT CHECKOUT FORM (Real Fetched Backend Data)
  // ---------------------------------------------------------------------------
  const businessName = txDetails?.merchant?.businessName || "Verified Merchant";
  const displayAmount = Number(txDetails?.amount || 0).toFixed(2);
  const merchantInitial = businessName.length > 0 ? businessName[0]?.toUpperCase() || "M" : "M";

  // Check if transaction is already completed before user pays
  const isAlreadyPaid = txDetails?.status === "SUCCESS";
  const isUnauthenticated = authStatus === "unauthenticated";

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand & Top Navigation Header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090d16] rounded-[9px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <span className="text-base font-extrabold text-white">PayPulse</span>
          </Link>

          <Link
            href="/dashboard/scan"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Different QR</span>
          </Link>
        </div>

        {/* Main Payment Checkout Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Merchant Checkout</h1>
                <p className="text-xs text-slate-400">Review and authorize payment</p>
              </div>
            </div>

            <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Merchant
            </span>
          </div>

          {/* Unauthenticated Alert */}
          {isUnauthenticated && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-amber-200 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <LogIn className="w-4 h-4 text-amber-400 shrink-0" />
                <span>You must sign in to authorize this payment.</span>
              </div>
              <Link
                href={`/login?callbackUrl=/pay?transactionId=${encodeURIComponent(txDetails?.transactionId || transactionId || "")}`}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Merchant "Paying to" Presentation */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Paying to</span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                Verified Store
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md shrink-0">
                {merchantInitial}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  {businessName}
                </h2>
                <p className="text-xs text-slate-400">Merchant Payment Request</p>
              </div>
            </div>
          </div>

          {/* Prominent Amount Card */}
          <div className="text-center bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-1.5 relative overflow-hidden">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Amount</span>
            <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight flex items-center justify-center gap-1">
              <span className="text-2xl sm:text-3xl text-cyan-400 font-sans">₹</span>
              <span>{displayAmount}</span>
            </div>
            {txDetails?.note && (
              <p className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full inline-block font-medium mt-1">
                {txDetails.note}
              </p>
            )}
          </div>

          {/* Payment & Transaction Metadata Summary */}
          <div className="space-y-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs">
            {/* Transaction ID */}
            <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-800/60">
              <span className="text-slate-400 shrink-0">Transaction ID</span>
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="font-mono text-[11px] text-slate-200 truncate max-w-[200px] sm:max-w-[240px]">
                  {txDetails?.transactionId || transactionId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTransactionId}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy Transaction ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Payment Method</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                PayPulse Personal Wallet
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Status</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] uppercase ${
                  txDetails?.status === "SUCCESS"
                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                    : txDetails?.status === "FAILED"
                      ? "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                      : "text-amber-300 bg-amber-500/10 border border-amber-500/20"
                }`}
              >
                {txDetails?.status || "PENDING"}
              </span>
            </div>
          </div>

          {/* Payment Error Alert Banner */}
          {paymentError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl p-4 flex items-start gap-3 text-xs animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-rose-200">Payment Unsuccessful</p>
                <p className="leading-relaxed text-slate-300">{paymentError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* Primary Confirm Button */}
            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={paymentState === "processing" || isAlreadyPaid}
              className={`w-full font-extrabold py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2.5 text-sm ${
                isAlreadyPaid
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-cyan-500/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              }`}
            >
              {paymentState === "processing" ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Authorizing & Debiting Payment...</span>
                </>
              ) : isAlreadyPaid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Transaction Already Paid</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-cyan-200" />
                  <span>Pay ₹{displayAmount}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            {/* Cancel & Back Button */}
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              disabled={paymentState === "processing"}
              className="w-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold py-3 px-4 rounded-xl border border-slate-800 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Cancel Payment</span>
            </button>
          </div>

          {/* Security Assurance Footer */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>256-Bit Encrypted Secure Merchant Transaction</span>
          </div>
        </div>

        {/* Global Footer Note */}
        <p className="text-center text-xs text-slate-500">
          PayPulse Personal App • Secure Checkout Platform
        </p>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
          <div className="text-cyan-400 text-sm font-semibold animate-pulse">
            Loading Payment Request...
          </div>
        </div>
      }
    >
      <PayContent />
    </Suspense>
  );
}
