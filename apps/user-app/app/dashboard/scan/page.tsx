"use client";

import React, { useState } from "react";
import { PageHeader } from "@repo/ui";
import { QRScanner, ScannerStatus, ScannerStatusBadge } from "@/components/QRScanner";

export default function ScanPayPage() {
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>("starting");

  return (
    <div className="max-w-[1100px] w-full space-y-6 font-sans">
      <PageHeader
        title="Scan & Pay"
        subtitle="Scan any PayPulse merchant checkout QR code to authorize payment."
        actions={<ScannerStatusBadge status={scannerStatus} />}
      />

      {/* QR Scanner Component */}
      <QRScanner onStatusChange={setScannerStatus} />
    </div>
  );
}
