import React from "react";
import Link from "next/link";
import { ArrowLeft, QrCode, Sparkles } from "lucide-react";
import { QRScanner } from "@/components/QRScanner";

export const metadata = {
  title: "Scan & Pay | PayPulse",
  description: "Scan a merchant QR code to initiate payment",
};

export default function ScanPayPage() {
  return (
    <div className="max-w-[1100px] w-full space-y-6 font-sans">
      {/* Top Breadcrumb & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-semibold text-text tracking-tight flex items-center gap-2">
            <QrCode className="w-6 h-6 text-primary" />
            <span>Scan & Pay</span>
          </h1>
          <p className="text-text-muted text-xs sm:text-sm">
            Scan any PayPulse merchant checkout QR code to authorize payment.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-text-muted self-start sm:self-auto shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Live Scanner</span>
        </div>
      </div>

      {/* QR Scanner Component */}
      <QRScanner />
    </div>
  );
}
