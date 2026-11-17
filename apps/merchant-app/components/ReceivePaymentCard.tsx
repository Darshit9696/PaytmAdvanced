"use client";

import React, { useState } from "react";
import { QrCode, ArrowRight, Sparkles } from "lucide-react";
import { PaymentRequestModal } from "./PaymentRequestModal";
import { Button } from "@repo/ui";

interface ReceivePaymentCardProps {
  businessName: string;
}

export function ReceivePaymentCard({ businessName }: ReceivePaymentCardProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const quickChips = [100, 250, 500, 1000, 2500];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/merchant/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          description,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create payment request");
      }

      const data = await res.json();
      setTransactionId(data.transactionId);

      const generatedUrl = `http://localhost:3000/pay?transactionId=${data.transactionId}`;
      setPaymentUrl(generatedUrl);
      setIsModalOpen(true);
    } catch (e) {
      console.error(e);
      alert("Failed to create payment request. Please check inputs and retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-surface border border-border rounded-[10px] p-6 shadow-xs space-y-5 flex flex-col justify-between">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[6px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text">Generate Charge Request</h3>
              <p className="text-xs text-text-muted">Dynamic point-of-sale checkout QR and direct link</p>
            </div>
          </div>

          <span className="text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Point of Sale
          </span>
        </div>

        {/* Payment Request Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          {/* Amount Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted block">
              Charge amount
            </label>
            <div className="relative flex items-center bg-surface border border-border rounded-[8px] px-3.5 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-xs">
              <span className="text-xl font-mono text-text-muted mr-2 font-medium">₹</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="any"
                className="w-full text-xl font-semibold font-mono tabular-nums text-text bg-transparent outline-none placeholder-text-faint"
              />
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div className="space-y-1">
            <span className="text-[11px] text-text-faint font-medium">Quick Amount Presets:</span>
            <div className="flex flex-wrap gap-2">
              {quickChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setAmount(chip.toString())}
                  className={`py-1.5 px-3 rounded-[6px] text-xs font-mono font-medium border transition-all cursor-pointer ${
                    amount === chip.toString()
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-surface-subtle text-text border border-border hover:bg-surface"
                  }`}
                >
                  ₹{chip}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Item / Note Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted block">
              Item or invoice description (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Table 4 Order, Grocery Basket #102"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs text-text bg-surface p-2.5 rounded-[8px] border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-xs placeholder-text-faint"
            />
          </div>

          {/* Generate Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            disabled={loading || !amount || Number(amount) <= 0}
            className="w-full"
          >
            <span>{loading ? "Generating Payment QR..." : "Create Checkout Request"}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      </div>

      {/* Payment Request Modal */}
      <PaymentRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={amount}
        description={description}
        businessName={businessName}
        paymentUrl={paymentUrl}
        transactionId={transactionId}
      />
    </>
  );
}
