"use client";

import React, { useState } from "react";
import { QrCode, Download, Check } from "lucide-react";
import { Button } from "@repo/ui";

interface MerchantQRCardProps {
  businessName: string;
  merchantId?: string;
}

export function MerchantQRCard({
  businessName,
  merchantId = "MRC_1234",
}: MerchantQRCardProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="bg-surface border border-border rounded-[10px] p-6 space-y-5 flex flex-col justify-between items-center text-center font-sans">
      {/* Header */}
      <div className="w-full pb-4 border-b border-border text-left">
        <span className="text-sm font-semibold text-text">Countertop QR</span>
        <p className="text-xs text-text-muted mt-0.5">Physical store payment standee</p>
      </div>

      {/* QR Visual Frame (Flat, no card-in-card) */}
      <div className="space-y-3 w-full flex flex-col items-center py-2">
        <div className="w-40 h-40 bg-white p-2.5 rounded-[8px] border border-border flex items-center justify-center">
          {/* SVG Store QR in Ink-Green & Slate */}
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
            <rect x="0" y="0" width="30" height="30" rx="3" fill="#0F3D33" />
            <rect x="5" y="5" width="20" height="20" rx="1.5" fill="#ffffff" />
            <rect x="10" y="10" width="10" height="10" fill="#0F3D33" />

            <rect x="70" y="0" width="30" height="30" rx="3" fill="#0F3D33" />
            <rect x="75" y="5" width="20" height="20" rx="1.5" fill="#ffffff" />
            <rect x="80" y="10" width="10" height="10" fill="#0F3D33" />

            <rect x="0" y="70" width="30" height="30" rx="3" fill="#0F3D33" />
            <rect x="5" y="75" width="20" height="20" rx="1.5" fill="#ffffff" />
            <rect x="10" y="80" width="10" height="10" fill="#0F3D33" />

            <rect x="35" y="10" width="10" height="10" fill="#177A4B" />
            <rect x="50" y="20" width="10" height="10" fill="#0F3D33" />
            <rect x="40" y="40" width="20" height="20" rx="3" fill="#0F3D33" />
            <rect x="65" y="35" width="10" height="10" fill="#177A4B" />
            <rect x="35" y="70" width="10" height="10" fill="#0F3D33" />
            <rect x="50" y="80" width="10" height="10" fill="#177A4B" />
            <rect x="70" y="60" width="10" height="10" fill="#0F3D33" />
            <rect x="80" y="75" width="10" height="10" fill="#0F3D33" />
          </svg>
        </div>

        <div className="space-y-0.5 text-center">
          <p className="text-xs font-semibold text-text truncate max-w-[200px]">{businessName}</p>
          <p className="text-[10px] text-text-muted">Scan to pay with any consumer wallet</p>
        </div>

        <div className="text-[11px] text-text-muted font-mono">
          Terminal ID: <span className="font-semibold text-text">{merchantId}</span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant="outline"
        size="md"
        onClick={handleDownload}
        className="w-full"
      >
        {downloaded ? (
          <>
            <Check className="w-4 h-4 text-success mr-1.5" />
            <span className="text-success">QR Standee Downloaded!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 text-primary mr-1.5" />
            <span>Download Store Standee</span>
          </>
        )}
      </Button>
    </div>
  );
}
