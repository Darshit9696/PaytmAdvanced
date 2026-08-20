"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import jsQR from "jsqr";
import {
  Camera,
  CameraOff,
  AlertCircle,
  RefreshCw,
  Upload,
  CheckCircle2,
  ScanLine,
  ShieldCheck,
  Zap,
} from "lucide-react";

/**
 * Multi-pass image decoder using jsQR (primary) and Html5Qrcode (fallback)
 * to reliably decode any uploaded QR code image, screenshot, or photo.
 */
async function decodeQRFromImageFile(file: File): Promise<string> {
  // Helper to load file as HTMLImageElement
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error("Failed to load image file"));
      img.src = src;
    });
  };

  const fileUrl = URL.createObjectURL(file);

  try {
    const img = await loadImage(fileUrl);
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;

    if (width > 0 && height > 0) {
      // Pass 1: Direct canvas at original resolution with both color polarity attempts
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth",
        });

        if (code && code.data && code.data.trim().length > 0) {
          return code.data.trim();
        }

        // Pass 2: Downsampled pass if image is very high resolution (e.g. phone camera capture)
        const maxDim = Math.max(width, height);
        if (maxDim > 1000) {
          const scale = 800 / maxDim;
          const downW = Math.max(1, Math.floor(width * scale));
          const downH = Math.max(1, Math.floor(height * scale));
          const downCanvas = document.createElement("canvas");
          downCanvas.width = downW;
          downCanvas.height = downH;
          const downCtx = downCanvas.getContext("2d", { willReadFrequently: true });

          if (downCtx) {
            downCtx.drawImage(img, 0, 0, downW, downH);
            const downData = downCtx.getImageData(0, 0, downW, downH);
            const downCode = jsQR(downData.data, downData.width, downData.height, {
              inversionAttempts: "attemptBoth",
            });

            if (downCode && downCode.data && downCode.data.trim().length > 0) {
              return downCode.data.trim();
            }
          }
        }

        // Pass 3: Contrast / Grayscale thresholding pass
        const thresholdData = ctx.createImageData(width, height);
        for (let i = 0; i < imgData.data.length; i += 4) {
          const r = imgData.data[i];
          const g = imgData.data[i + 1];
          const b = imgData.data[i + 2];
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          const val = brightness > 128 ? 255 : 0;
          thresholdData.data[i] = val;
          thresholdData.data[i + 1] = val;
          thresholdData.data[i + 2] = val;
          thresholdData.data[i + 3] = 255;
        }

        const threshCode = jsQR(thresholdData.data, width, height, {
          inversionAttempts: "attemptBoth",
        });

        if (threshCode && threshCode.data && threshCode.data.trim().length > 0) {
          return threshCode.data.trim();
        }
      }
    }
  } finally {
    URL.revokeObjectURL(fileUrl);
  }

  // Pass 4: Fallback to detached Html5Qrcode file scan
  const tempDivId = "temp-qr-detached-decoder-" + Math.random().toString(36).substring(2, 9);
  const tempDiv = document.createElement("div");
  tempDiv.id = tempDivId;
  tempDiv.style.display = "none";
  document.body.appendChild(tempDiv);

  try {
    const tempScanner = new Html5Qrcode(tempDivId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    const result = await tempScanner.scanFile(file, false);
    try {
      await tempScanner.clear();
    } catch {
      // ignore
    }
    if (result && result.trim().length > 0) {
      return result.trim();
    }
  } finally {
    if (document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
  }

  throw new Error("No QR code detected in uploaded image");
}

export function QRScanner() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invalidQrMessage, setInvalidQrMessage] = useState<string | null>(null);
  const [scannedTxId, setScannedTxId] = useState<string | null>(null);
  const [activeCameraLabel, setActiveCameraLabel] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const isProcessingRef = useRef(false);
  const isStartingRef = useRef(false);
  const isMountedRef = useRef(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerId = "qr-video-region";

  // Unconditionally stop all active MediaStream tracks directly from browser hardware
  const stopAllMediaTracks = useCallback(() => {
    // 1. Stop cached stream tracks
    if (activeStreamRef.current) {
      try {
        activeStreamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
            track.enabled = false;
          } catch {
            // ignore
          }
        });
      } catch {
        // ignore
      }
      activeStreamRef.current = null;
    }

    // 2. Query container video elements and stop all attached tracks
    try {
      const container = document.getElementById(containerId);
      if (container) {
        const videos = container.querySelectorAll("video");
        videos.forEach((video) => {
          if (video.srcObject) {
            try {
              const stream = video.srcObject as MediaStream;
              stream.getTracks().forEach((track) => {
                try {
                  track.stop();
                  track.enabled = false;
                } catch {
                  // ignore
                }
              });
            } catch {
              // ignore
            }
            video.srcObject = null;
          }
          try {
            video.pause();
            video.removeAttribute("src");
            video.load();
          } catch {
            // ignore
          }
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // Function to extract transactionId from scanned QR content
  const extractTransactionId = useCallback((decodedText: string): string | null => {
    if (!decodedText || typeof decodedText !== "string") return null;

    try {
      // Handles http://localhost:3001/pay?transactionId=PAY_xxx or relative /pay?transactionId=PAY_xxx
      const url = new URL(decodedText, window.location.origin);
      const txId = url.searchParams.get("transactionId");
      if (txId && txId.trim().length > 0) {
        return txId.trim();
      }
    } catch {
      // In case URL parsing fails for non-standard URI strings, proceed to regex
    }

    // Regex fallback: search for transactionId parameter inside query string
    const match = decodedText.match(/[?&]transactionId=([^&#\s]+)/i);
    if (match && match[1]) {
      return decodeURIComponent(match[1]).trim();
    }

    return null;
  }, []);

  // Safe scanner cleanup
  const stopAndClearScanner = useCallback(async () => {
    stopAllMediaTracks();

    const scanner = scannerRef.current;
    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch {
        // ignore
      }

      try {
        await scanner.clear();
      } catch {
        // ignore
      }

      scannerRef.current = null;
    }

    stopAllMediaTracks();
  }, [stopAllMediaTracks]);

  // Stable callback ref
  const handleScanSuccessRef = useRef<(text: string) => void>(() => {});

  // Handle successful scan
  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      // Prevent repeated processing of the same or multiple QR scans
      if (isProcessingRef.current || !isMountedRef.current) return;

      const transactionId = extractTransactionId(decodedText);

      if (!transactionId) {
        setInvalidQrMessage(
          "Invalid QR Code. Please scan or upload a valid PayPulse merchant QR code containing a transactionId."
        );
        setTimeout(() => {
          if (isMountedRef.current) {
            setInvalidQrMessage(null);
          }
        }, 4000);
        return;
      }

      // Lock scanning to prevent duplicate triggers
      isProcessingRef.current = true;
      setInvalidQrMessage(null);
      setScannedTxId(transactionId);

      // Stop camera stream & tracks on successful QR detection
      await stopAndClearScanner();

      // Navigate to payment page with extracted transactionId
      setTimeout(() => {
        router.push(`/pay?transactionId=${encodeURIComponent(transactionId)}`);
      }, 500);
    },
    [extractTransactionId, router, stopAndClearScanner]
  );

  handleScanSuccessRef.current = handleScanSuccess;

  // Start QR Scanner with robust camera enumeration & permission handling
  const startScanner = useCallback(async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;

    if (isMountedRef.current) {
      setIsLoading(true);
      setErrorMessage(null);
      setInvalidQrMessage(null);
      setScannedTxId(null);
    }
    isProcessingRef.current = false;

    // Stop previous instance and tracks if any
    await stopAndClearScanner();

    if (!isMountedRef.current) {
      isStartingRef.current = false;
      return;
    }

    // 1. Check browser mediaDevices support
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      if (isMountedRef.current) {
        setErrorMessage(
          "Camera access is not supported by your browser in this context (requires HTTPS or localhost)."
        );
        setIsLoading(false);
        setIsScanning(false);
      }
      isStartingRef.current = false;
      return;
    }

    // 2. Request camera permission via getUserMedia first to ensure device access and unlock camera labels
    try {
      const probeStream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop probe stream immediately
      probeStream.getTracks().forEach((track) => track.stop());
    } catch (permErr: any) {
      console.error("Camera permission probe error:", permErr);
      const permErrStr = permErr?.name || permErr?.message || "";
      if (
        permErr?.name === "NotAllowedError" ||
        permErr?.name === "PermissionDeniedError" ||
        permErrStr.toLowerCase().includes("permission") ||
        permErrStr.toLowerCase().includes("denied")
      ) {
        if (isMountedRef.current) {
          setErrorMessage(
            "Camera permission was denied. Please allow camera access in your browser settings or address bar to scan QR codes."
          );
          setIsLoading(false);
          setIsScanning(false);
        }
        isStartingRef.current = false;
        return;
      } else if (
        permErr?.name === "NotFoundError" ||
        permErr?.name === "DevicesNotFoundError" ||
        permErrStr.toLowerCase().includes("notfound")
      ) {
        if (isMountedRef.current) {
          setErrorMessage("No camera hardware detected on this device.");
          setIsLoading(false);
          setIsScanning(false);
        }
        isStartingRef.current = false;
        return;
      }
    }

    if (!isMountedRef.current) {
      isStartingRef.current = false;
      return;
    }

    const containerElement = document.getElementById(containerId);
    if (!containerElement) {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      isStartingRef.current = false;
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode(containerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      const qrConfig = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minDim = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.floor(minDim * 0.72);
          return { width: size, height: size };
        },
        aspectRatio: 1.0,
      };

      // 3. Enumerate available cameras to pick the best device
      let selectedCameraIdOrConfig: any = { facingMode: "environment" };
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          // Prefer back/rear camera on mobile devices, otherwise default to primary webcam
          const backCam = cameras.find((cam) =>
            /back|rear|environment|rear-facing/i.test(cam.label)
          );
          const activeCam = backCam || cameras[0];
          selectedCameraIdOrConfig = activeCam.id;
          if (isMountedRef.current) {
            setActiveCameraLabel(activeCam.label || "Default Camera");
          }
        }
      } catch (enumErr) {
        console.warn("Camera enumeration fallback to facingMode:", enumErr);
      }

      // 4. Start camera stream
      let startedSuccessfully = false;
      try {
        await html5QrCode.start(
          selectedCameraIdOrConfig,
          qrConfig,
          (decodedText) => {
            handleScanSuccessRef.current(decodedText);
          },
          () => {
            // Per-frame decode misses, ignored
          }
        );
        startedSuccessfully = true;
      } catch (startErr: any) {
        console.warn("Primary camera start failed, attempting fallback:", startErr);
        // Fallback: try default facingMode "user" if specific device ID failed
        try {
          await html5QrCode.start(
            { facingMode: "user" },
            qrConfig,
            (decodedText) => {
              handleScanSuccessRef.current(decodedText);
            },
            () => {}
          );
          startedSuccessfully = true;
        } catch (fallbackErr: any) {
          throw fallbackErr || startErr;
        }
      }

      // Store reference to live media stream for hardware track control
      const videoEl = containerElement.querySelector("video");
      if (videoEl && videoEl.srcObject) {
        activeStreamRef.current = videoEl.srcObject as MediaStream;
      }

      if (isMountedRef.current && startedSuccessfully) {
        setIsScanning(true);
        setIsLoading(false);
        setErrorMessage(null);
      } else {
        // Component unmounted while start was executing
        stopAllMediaTracks();
        try {
          if (html5QrCode.isScanning) {
            await html5QrCode.stop();
          }
          await html5QrCode.clear();
        } catch {
          // ignore
        }
        stopAllMediaTracks();
      }
    } catch (err: any) {
      const errString = err?.toString?.() || "";
      const isAbort =
        err?.name === "AbortError" ||
        errString.includes("AbortError") ||
        errString.includes("interrupted") ||
        errString.includes("media was removed");

      if (!isAbort && isMountedRef.current) {
        console.error("Camera initialization error:", err);
        setIsLoading(false);
        setIsScanning(false);

        if (
          err?.name === "NotAllowedError" ||
          errString.includes("NotAllowedError") ||
          errString.includes("Permission") ||
          errString.includes("denied")
        ) {
          setErrorMessage(
            "Camera permission was denied. Please allow camera access in your browser settings to scan QR codes."
          );
        } else if (
          err?.name === "NotFoundError" ||
          errString.includes("NotFoundError") ||
          errString.includes("No device")
        ) {
          setErrorMessage("No camera hardware detected on this device.");
        } else if (
          err?.name === "NotReadableError" ||
          errString.includes("NotReadableError") ||
          errString.includes("in use")
        ) {
          setErrorMessage(
            "Camera is already in use by another application or tab. Please close other camera apps and retry."
          );
        } else {
          setErrorMessage(
            err?.message || "Could not access the camera. Please check camera permissions and retry."
          );
        }
      } else if (isMountedRef.current) {
        setIsLoading(false);
      }
    } finally {
      isStartingRef.current = false;
    }
  }, [stopAndClearScanner, stopAllMediaTracks]);

  // Scan from uploaded file using jsQR with multi-pass image preprocessing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setInvalidQrMessage(null);
      setErrorMessage(null);

      // Directly decode the uploaded image file (independent of camera DOM state)
      const decodedText = await decodeQRFromImageFile(file);
      console.log("Decoded QR from uploaded file:", decodedText);

      handleScanSuccessRef.current(decodedText);
    } catch (err: any) {
      console.error("QR image decode failed:", err);
      if (isMountedRef.current) {
        setIsLoading(false);
        setInvalidQrMessage(
          "Could not detect a valid QR code in the selected image. Please make sure the QR is clear and well-lit."
        );
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const startScannerRef = useRef<() => Promise<void>>(() => Promise.resolve());
  startScannerRef.current = startScanner;

  useEffect(() => {
    isMountedRef.current = true;
    startScannerRef.current();

    // Listen to browser tab visibility and unload events to stop camera
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopAllMediaTracks();
      }
    };

    const handleUnload = () => {
      stopAllMediaTracks();
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);

      // Unconditionally stop all media tracks synchronously on unmount
      stopAllMediaTracks();
      stopAndClearScanner();
    };
  }, [stopAllMediaTracks, stopAndClearScanner]);

  return (
    <div className="space-y-6">
      {/* Scanner Viewport Box */}
      <div className="relative bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
        
        {/* Top Instructions / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">QR Code Viewfinder</h2>
              <p className="text-xs text-slate-400">
                {activeCameraLabel ? `Active: ${activeCameraLabel}` : "Position the merchant QR code within the frame"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => startScanner()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Restart Camera</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/20 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload QR</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Camera Display Region */}
        <div className="mt-6 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-sm aspect-square bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-inner flex items-center justify-center">
            
            {/* HTML5 QR Container */}
            <div
              id={containerId}
              className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&>video]:rounded-xl"
            />

            {/* Viewfinder Target Overlay (Visible when scanning) */}
            {isScanning && !scannedTxId && !errorMessage && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-60 h-60 relative">
                  {/* Corner Borders */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />
                  
                  {/* Scanning Animation Bar */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-pulse" />
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-sm font-semibold text-white">Starting camera...</p>
                <p className="text-xs text-slate-400">Requesting permission and starting video feed</p>
              </div>
            )}

            {/* Camera Permission / Error State */}
            {errorMessage && !isLoading && (
              <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <CameraOff className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Camera Access Error</h3>
                  <p className="text-xs text-slate-300 max-w-xs">{errorMessage}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={() => startScanner()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                  >
                    Grant Permission & Retry
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Upload QR Image Instead
                  </button>
                </div>
              </div>
            )}

            {/* Scanned Success State */}
            {scannedTxId && (
              <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-in fade-in zoom-in duration-200">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Payment Request Detected!</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {scannedTxId}</p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Redirecting to Checkout...</span>
                </div>
              </div>
            )}

          </div>

          {/* Invalid QR Warning Message */}
          {invalidQrMessage && (
            <div className="mt-4 w-full max-w-sm flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{invalidQrMessage}</p>
            </div>
          )}

          {/* Helper Caption */}
          <p className="text-xs text-slate-400 mt-4 text-center">
            Point camera at any PayPulse Merchant QR code with URL format <code className="text-cyan-400 font-mono">/pay?transactionId=...</code>
          </p>
        </div>

      </div>

      {/* Security & Verification Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Secure Merchant Validation</h4>
            <p className="text-[11px] text-slate-400">Transactions are verified directly with database records.</p>
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Instant Routing</h4>
            <p className="text-[11px] text-slate-400">Scanned QR automatically resolves and prepares the payment checkout screen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
