"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldCheck, Wallet, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Amount, Avatar, Button } from "@repo/ui";

interface Reciever {
  id: number;
  name: string;
  number: string;
}

function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function TransactionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const recipientName = searchParams.get("name") || "Contact";
  const recipientPhone = searchParams.get("phone") || "9876543210";

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const receiverId = searchParams.get("id");
  const [receiver, setReceiver] = useState<Reciever>();

  const isSubmittingRef = useRef(false);
  const idempotencyKeyRef = useRef<string>(generateIdempotencyKey());
  const prevIntentRef = useRef<{ receiverId: string | null; amount: string }>({
    receiverId,
    amount,
  });

  useEffect(() => {
    if (
      prevIntentRef.current.receiverId !== receiverId ||
      prevIntentRef.current.amount !== amount
    ) {
      prevIntentRef.current = {
        receiverId,
        amount,
      };
      idempotencyKeyRef.current = generateIdempotencyKey();
    }
  }, [receiverId, amount]);

  useEffect(() => {
    if (!receiverId) return;
    const fetchUserInfo = async () => {
      const res = await fetch(`api/user?id=${receiverId}`);
      const data = await res.json();

      if (res.ok) {
        setReceiver(data);
      }
    };
    fetchUserInfo();
  }, [receiverId]);

  const currentBalance = 10000;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid amount");
      setStatus("error");
      return;
    }

    if (parsedAmount > currentBalance) {
      setErrorMessage("Insufficient wallet balance");
      setStatus("error");
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKeyRef.current,
        },
        body: JSON.stringify({
          receiverId,
          amount: parsedAmount,
          note: note.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          data.message ||
          (res.status >= 500 ? "Transaction failed. Please try again." : "Transaction failed");
        setErrorMessage(message);
        setStatus("error");

        if (res.status >= 400 && res.status < 500 && res.status !== 409) {
          idempotencyKeyRef.current = generateIdempotencyKey();
        }
        return;
      }

      setStatus("success");
      idempotencyKeyRef.current = generateIdempotencyKey();
      prevIntentRef.current = {
        receiverId,
        amount: "",
      };
    } catch (err: any) {
      setErrorMessage(err.message || "Transaction failed. Please try again.");
      setStatus("error");
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-4 font-sans">
        <div className="w-full max-w-md bg-surface rounded-[10px] p-6 sm:p-8 text-center shadow-xs border border-border flex flex-col items-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-success-subtle/50 flex items-center justify-center text-success border border-success/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text">Transfer confirmed</h2>
            <p className="text-xs text-text-muted">Recorded securely in the double-entry ledger</p>
          </div>

          <div className="w-full divide-y divide-border border-t border-b border-border py-2 font-mono text-left space-y-2 text-xs">
            <div className="flex justify-between text-text-muted pt-1">
              <span>Paid to</span>
              <span className="font-sans font-medium text-text">{receiver?.name || recipientName}</span>
            </div>
            <div className="flex justify-between text-text-muted pt-2">
              <span>Phone</span>
              <span className="text-text tabular-nums">+91 {receiver?.number || recipientPhone}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 font-sans">
              <span className="text-xs font-medium text-text-muted">Amount sent:</span>
              <Amount value={parseFloat(amount)} size="lg" weight="semibold" />
            </div>
            <div className="pt-2 flex items-center justify-between text-[11px] font-sans">
              <span className="text-text-muted">Ledger verification:</span>
              <span className="bg-success-subtle/50 text-success px-2 py-0.5 rounded-[4px] border border-success/30 font-medium">
                1 Debit & 1 Credit Committed
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => router.push("/dashboard")}
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // MAIN FORM INTERFACE
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-8 font-sans">
      <div className="w-full max-w-md overflow-hidden rounded-[10px] bg-surface shadow-xs border border-border">
        {/* Header Ribbon */}
        <div className="bg-surface-subtle border-b border-border px-5 py-3.5 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-surface text-text-muted hover:text-text rounded-[6px] transition-colors cursor-pointer border border-border shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-text">Send money</span>
          <div className="w-4" />
        </div>

        {/* Form Body */}
        <form onSubmit={handlePayment} className="p-6 space-y-5">
          {/* Recipient Profile Summary (Flat row, no card-in-card) */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-border">
            <Avatar name={recipientName} size="md" />
            <div>
              <h3 className="text-sm font-semibold text-text">{recipientName}</h3>
              <p className="text-xs text-text-muted font-mono tabular-nums">+91 {recipientPhone}</p>
            </div>
          </div>

          {/* Error Banner */}
          {status === "error" && (
            <div className="p-3 text-xs text-danger bg-danger-subtle/50 border border-danger/30 rounded-[8px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Hero Amount Input Section */}
          <div className="text-center space-y-2">
            <label className="block text-xs font-medium text-text-muted">
              Transfer amount
            </label>
            <div className="relative flex items-center justify-center">
              <span className="text-2xl font-mono text-text-muted mr-1.5 select-none font-medium">₹</span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={loading}
                className="w-48 text-center text-3xl font-semibold font-mono tabular-nums text-text placeholder-text-faint bg-transparent outline-none border-b border-border focus:border-primary transition-colors py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs text-text-muted bg-surface-subtle border border-border px-3 py-1 rounded-full mt-1">
              <Wallet className="w-3.5 h-3.5 text-primary" />
              <span>Available:</span>
              <span className="font-semibold text-text font-mono">₹{currentBalance.toLocaleString("en-IN")}</span>
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
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-[8px] text-xs placeholder-text-faint text-text focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-xs"
            />
          </div>

          {/* Action Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={loading || !amount}
            className="w-full"
          >
            {loading ? (
              <span>Processing secure payment...</span>
            ) : (
              <>
                <span>Pay ₹{amount || "0"}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function TransactionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-muted">Loading payment page...</div>}>
      <TransactionContent />
    </Suspense>
  );
}
