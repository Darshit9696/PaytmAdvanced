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
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Top Breadcrumb & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <QrCode className="w-7 h-7 text-cyan-400" />
            <span>Scan & Pay</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Scan any PayPulse merchant checkout QR to instantly open payment.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-semibold self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Live Camera Feed</span>
        </div>
      </div>

      {/* QR Scanner Component */}
      <QRScanner />
    </div>
  );
}
