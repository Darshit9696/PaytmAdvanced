"use client";

import React, { useState } from "react";
import { X, Copy, Check, QrCode, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Amount, Button } from "@repo/ui";

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
  transactionId,
}: PaymentRequestModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const displayAmount = Number(amount) > 0 ? Number(amount) : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
      <div className="w-full max-w-md bg-surface border border-border rounded-[16px] shadow-lg overflow-hidden relative space-y-5 p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3.5">
          <div>
            <h3 className="text-sm font-semibold text-text">Customer payment request</h3>
            <p className="text-xs text-text-muted">Dynamic point-of-sale checkout</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text hover:bg-surface-subtle rounded-[6px] transition-colors cursor-pointer border border-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Business & Amount Info */}
        <div className="text-center space-y-1.5">
          <p className="text-xs font-medium text-text-muted">{businessName}</p>
          <div>
            <Amount value={displayAmount} size="3xl" weight="semibold" />
          </div>
          {description && (
            <p className="text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md inline-block font-medium">
              {description}
            </p>
          )}
        </div>

        {/* Real QR Code Graphic */}
        <div className="bg-surface-subtle border border-border rounded-[10px] p-5 flex flex-col items-center justify-center space-y-3">
          <div className="w-40 h-40 bg-white p-2.5 rounded-[8px] border border-border flex items-center justify-center">
            <QRCodeSVG
              value={paymentUrl}
              size={144}
              level="M"
              className="w-full h-full"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-mono">
            <span>Payment ID:</span>
            <span className="font-semibold text-text">{transactionId}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleCopy}
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300 mr-1.5" />
                <span>Link Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1.5" />
                <span>Copy Customer Checkout Link</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full"
          >
            Close Preview
          </Button>
        </div>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-success font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Real-time double-entry settlement upon scan</span>
        </div>
      </div>
    </div>
  );
}
