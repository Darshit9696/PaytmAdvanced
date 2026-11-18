"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Avatar, Amount, Button, Input } from "@repo/ui";

interface UserType {
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

function SendMoneyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || searchParams.get("name") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<string>("Food");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Idempotency key, redirect timer, and in-flight guard
  const isSubmittingRef = useRef(false);
  const idempotencyKeyRef = useRef<string>(generateIdempotencyKey());
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevIntentRef = useRef<{ receiverId: number | undefined; amount: string }>({
    receiverId: selectedUser?.id,
    amount,
  });

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  // Update idempotency key when core intent changes
  useEffect(() => {
    if (
      prevIntentRef.current.receiverId !== selectedUser?.id ||
      prevIntentRef.current.amount !== amount
    ) {
      prevIntentRef.current = { receiverId: selectedUser?.id, amount };
      idempotencyKeyRef.current = generateIdempotencyKey();
    }
  }, [selectedUser?.id, amount]);

  // Fetch users on search query change
  useEffect(() => {
    const fetchUsers = async (query: string) => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }
      try {
        const res = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || data);
        }
      } catch (err) {
        console.error("Failed to search users", err);
      }
    };

    const timer = setTimeout(() => fetchUsers(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // If user navigated with ?id=..., auto-load recipient info
  const directId = searchParams.get("id");
  useEffect(() => {
    if (directId && !selectedUser) {
      const fetchDirect = async () => {
        try {
          const res = await fetch(`/api/users/search?query=${encodeURIComponent(directId)}`);
          if (res.ok) {
            const data = await res.json();
            const list: UserType[] = data.users || data;
            const match = list.find((u) => String(u.id) === String(directId));
            if (match) setSelectedUser(match);
          }
        } catch {
          // ignore
        }
      };
      fetchDirect();
    }
  }, [directId, selectedUser]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;
    const parsedAmount = Number(amount);
    if (!selectedUser || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;

    isSubmittingRef.current = true;
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKeyRef.current,
        },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          amount: parsedAmount,
          note: note.trim() || null,
          category: category || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          data.message ||
          (res.status >= 500
            ? "Transaction failed. Please try again."
            : "Transaction failed");
        setStatus({ type: "error", message });

        if (res.status >= 400 && res.status < 500 && res.status !== 409) {
          idempotencyKeyRef.current = generateIdempotencyKey();
        }
        return;
      }

      setStatus({
        type: "success",
        message: `Successfully transferred ₹${amount} to ${selectedUser.name}. Double-entry ledger entry committed.`,
      });

      setAmount("");
      setNote("");
      setSelectedUser(null);
      idempotencyKeyRef.current = generateIdempotencyKey();
      prevIntentRef.current = {
        receiverId: undefined,
        amount: "",
      };

      redirectTimerRef.current = setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err.message || "Network error. Please try again.",
      });
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1100px] w-full space-y-6 font-sans">
      <div className="max-w-xl space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 hover:bg-surface-subtle text-text-muted hover:text-text rounded-[6px] border border-border transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-text">Send money</h1>
              <p className="text-xs text-text-muted">Direct peer-to-peer ledger transfer</p>
            </div>
          </div>
        </div>

        {/* Status Notification */}
        {status && (
          <div
            className={`p-4 rounded-[10px] flex items-center gap-3 text-xs font-medium border shadow-xs ${
              status.type === "success"
                ? "bg-success-subtle/40 text-success border-success/30"
                : "bg-danger-subtle/40 text-danger border-danger/30"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <p>{status.message}</p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-surface border border-border rounded-[10px] p-6 shadow-xs space-y-6">
          {/* Step 1: Select Recipient */}
          {!selectedUser ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-text-muted">
                  1. Select recipient
                </label>
                <span className="text-[11px] text-text-faint">Search by name or number</span>
              </div>

              <div className="bg-surface-subtle border border-border p-2 rounded-[8px] flex items-center gap-3 px-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-xs">
                <Search className="w-4 h-4 text-text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Search recipient name or mobile number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none text-text placeholder-text-faint text-sm py-1"
                  autoFocus
                />
              </div>

              {/* Search Results */}
              <div className="divide-y divide-border border border-border rounded-[8px] overflow-hidden max-h-60 overflow-y-auto bg-surface">
                {users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className="p-3 hover:bg-surface-subtle cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="md" />
                      <div>
                        <p className="text-sm font-medium text-text">{u.name}</p>
                        <p className="text-xs text-text-muted font-mono">+91 {u.number}</p>
                      </div>
                    </div>
                    <Send className="w-3.5 h-3.5 text-primary" />
                  </div>
                ))}
                {searchQuery && users.length === 0 && (
                  <p className="text-xs text-text-muted text-center py-6">
                    No registered contact found matching "{searchQuery}"
                  </p>
                )}
                {!searchQuery && (
                  <p className="text-xs text-text-faint text-center py-6">
                    Type a name or phone number above to select a recipient.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Step 2: Payment Form */
            <form onSubmit={handleTransfer} className="space-y-5">
              {/* Recipient summary (Flat divider, no card-in-card) */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedUser.name} size="md" />
                  <div>
                    <p className="text-sm font-medium text-text">{selectedUser.name}</p>
                    <p className="text-xs text-text-muted font-mono">+91 {selectedUser.number}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted block">
                  Transfer amount
                </label>
                <div className="flex items-center bg-surface border border-border rounded-[8px] px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-xs">
                  <span className="text-2xl font-mono text-text-muted mr-2 font-medium">₹</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="any"
                    className="w-full text-2xl font-semibold font-mono tabular-nums text-text bg-transparent outline-none placeholder-text-faint"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Category selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted block">
                  Expense category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["Food", "Shopping", "Travel", "Entertainment"] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`py-2 px-3 rounded-[6px] text-xs font-medium border transition-all cursor-pointer ${
                        category === cat
                          ? "bg-primary text-primary-fg border-primary shadow-xs"
                          : "bg-surface-subtle text-text-muted border-border hover:text-text hover:bg-surface"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note / Remarks */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-muted block">
                  Remarks / reference (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dinner share, Rent payment"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-sm text-text bg-surface p-3 rounded-[8px] border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-xs placeholder-text-faint"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={loading || !amount}
              >
                <Send className="w-4 h-4 mr-1.5" />
                <span>{loading ? "Committing Ledger Transfer..." : `Transfer ₹${amount || "0"}`}</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SendMoneyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-muted">Loading transfer portal...</div>}>
      <SendMoneyContent />
    </Suspense>
  );
}
