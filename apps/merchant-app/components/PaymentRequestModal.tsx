"use client";

import React, { useState } from "react";
import { X, Copy, Check, QrCode, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface PaymentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  description?: string;
  businessName: string;
  transactionId: string;
  paymentUrl: string;
}

export function PaymentRequestModal({
  isOpen,
  onClose,
  amount,
  description,
  businessName,
  paymentUrl,
  transactionId
}: PaymentRequestModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const displayAmount = Number(amount) > 0 ? Number(amount).toFixed(2) : "0.00";

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative space-y-6 p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Payment Request</h3>
              <p className="text-xs text-slate-400">Ready for customer payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business & Amount Info */}
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{businessName}</p>
          <div className="text-4xl font-extrabold text-white font-mono tracking-tight">
            ₹{displayAmount}
          </div>
          {description && (
            <p className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full inline-block font-medium">
              {description}
            </p>
          )}
        </div>

        {/* Real QR Code Graphic */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3">
          <div className="w-44 h-44 bg-white p-3 rounded-2xl shadow-md flex items-center justify-center relative">
            <QRCodeSVG
              value={paymentUrl}
              size={152}
              level="M"
              className="w-full h-full"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span>Payment ID:</span>
            <span className="font-bold text-slate-200">{transactionId}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleCopy}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Link Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Payment Link</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold py-2.5 px-4 rounded-xl border border-slate-800 transition-all text-xs cursor-pointer"
          >
            Close Preview
          </button>
        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PayPulse Merchant Verified Request</span>
        </div>

      </div>
    </div>
  );
}
