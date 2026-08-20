"use client";

import React, { useState } from "react";
import { QrCode, Download, Check, ShieldCheck } from "lucide-react";

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
    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between items-center text-center">
      
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <QrCode className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-white">My Store QR</span>
        </div>
        <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
          Active
        </span>
      </div>

      {/* QR Visual Frame */}
      <div className="space-y-3 w-full flex flex-col items-center">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col items-center justify-center space-y-3 w-full max-w-[240px]">
          
          <div className="w-40 h-40 bg-white p-2.5 rounded-xl shadow-inner flex items-center justify-center">
            {/* SVG Mock Store QR */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
              <rect x="0" y="0" width="30" height="30" rx="3" fill="#0f172a" />
              <rect x="5" y="5" width="20" height="20" rx="1.5" fill="#ffffff" />
              <rect x="10" y="10" width="10" height="10" fill="#0f172a" />

              <rect x="70" y="0" width="30" height="30" rx="3" fill="#0f172a" />
              <rect x="75" y="5" width="20" height="20" rx="1.5" fill="#ffffff" />
              <rect x="80" y="10" width="10" height="10" fill="#0f172a" />

              <rect x="0" y="70" width="30" height="30" rx="3" fill="#0f172a" />
              <rect x="5" y="75" width="20" height="20" rx="1.5" fill="#ffffff" />
              <rect x="10" y="80" width="10" height="10" fill="#0f172a" />

              <rect x="35" y="10" width="10" height="10" fill="#6366f1" />
              <rect x="50" y="20" width="10" height="10" fill="#0f172a" />
              <rect x="40" y="40" width="20" height="20" rx="3" fill="#6366f1" />
              <rect x="65" y="35" width="10" height="10" fill="#0f172a" />
              <rect x="35" y="70" width="10" height="10" fill="#0f172a" />
              <rect x="50" y="80" width="10" height="10" fill="#6366f1" />
              <rect x="70" y="60" width="10" height="10" fill="#0f172a" />
              <rect x="80" y="75" width="10" height="10" fill="#6366f1" />
            </svg>
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-bold text-white truncate max-w-[200px]">{businessName}</p>
            <p className="text-[10px] text-slate-400">Scan to pay with any UPI app</p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Merchant ID: <span className="font-bold text-slate-200">{merchantId}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleDownload}
        className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold py-3 px-4 rounded-2xl border border-slate-800 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
      >
        {downloaded ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400">QR Downloaded!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Download Store QR</span>
          </>
        )}
      </button>

    </div>
  );
}
