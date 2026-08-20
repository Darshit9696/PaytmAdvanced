"use client";

import React, { useState } from "react";
import { QrCode, ArrowRight, Sparkles } from "lucide-react";
import { PaymentRequestModal } from "./PaymentRequestModal";

interface ReceivePaymentCardProps {
  businessName: string;
}

export function ReceivePaymentCard({ businessName }: ReceivePaymentCardProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");

  const quickChips = [100, 250, 500, 1000, 2500];

  const handleGenerate = async(e: React.FormEvent) => {
    e.preventDefault();
    

    if (!amount || Number(amount) <= 0) return;

    try {
      const res = await fetch(`/api/merchant/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          description,
        })

      });

      if (!res.ok) {
        throw new Error("Failed to create payment request");
    }

    const data = await res.json();
    console.log(data.transactionId);
 
    setTransactionId(data.transactionId)

    const paymentUrl = `http://localhost:3001/pay?transactionId=${data.transactionId}`;

    setPaymentUrl(paymentUrl);
    setIsModalOpen(true);

    }catch(e)
    {
      console.error(e);
    }

  };

  return (
    <>
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between">

        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Receive Payment</h3>
              <p className="text-xs text-slate-400">Generate on-demand checkout QR or payment link</p>
            </div>
          </div>

          <span className="text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Instant Request
          </span>
        </div>

        {/* Payment Request Form */}
        <form onSubmit={handleGenerate} className="space-y-4">

          {/* Amount Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Amount (₹)
            </label>
            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 focus-within:border-indigo-500/50 transition-all">
              <span className="text-xl font-extrabold text-slate-400 mr-2">₹</span>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="any"
                className="w-full text-lg font-bold text-white bg-transparent outline-none placeholder-slate-600"
              />
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap gap-2">
            {quickChips.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${amount === val.toString()
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800"
                  }`}
              >
                ₹{val}
              </button>
            ))}
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Counter Sale, Invoice #892"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"


          >
            <span>Generate Payment Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>
      </div>

      {/* Embedded Modal */}
      <PaymentRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={amount}
        description={description}
        businessName={businessName}
        transactionId={transactionId}
        paymentUrl={paymentUrl}
      />
    </>
  );
}
