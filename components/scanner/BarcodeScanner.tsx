"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
}

export default function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"loading" | "scanning" | "error" | "unsupported">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastBarcode, setLastBarcode] = useState("");
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) { clearInterval(scanIntervalRef.current); scanIntervalRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    setStatus("loading");
    setErrorMsg("");

    if (!("BarcodeDetector" in window)) {
      setStatus("unsupported");
      setErrorMsg("Barcode scanning is not supported in this browser. Please enter the barcode manually.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = new (window as any).BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"],
      });

      setStatus("scanning");

      scanIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const barcode = barcodes[0].rawValue;
            if (barcode !== lastBarcode) {
              setLastBarcode(barcode);
              onScan(barcode);
            }
          }
        } catch {
          // detection failed silently
        }
      }, 400);
    } catch (err: any) {
      stopCamera();
      const msg = err?.name === "NotAllowedError"
        ? "Camera permission denied. Please allow camera access to scan barcodes, or enter the barcode manually."
        : err?.name === "NotFoundError"
        ? "No camera found on this device. Please enter the barcode manually."
        : `Camera error: ${err?.message || "Unknown error"}. Please enter the barcode manually.`;
      setStatus("error");
      setErrorMsg(msg);
      onError?.(msg);
    }
  }, [onScan, onError, lastBarcode, stopCamera]);

  useEffect(() => {
    startScanner();
    return () => stopCamera();
  }, []);

  return (
    <div className="relative">
      {(status === "loading" || status === "scanning") && (
        <div className="relative rounded-2xl overflow-hidden" style={{ background: "#0D1A14", border: "2px solid var(--border)" }}>
          <video ref={videoRef} className="w-full aspect-[4/3] object-cover" playsInline muted autoPlay />
          {status === "scanning" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-2xl" style={{ border: "3px dashed var(--brand)", opacity: 0.5 }} />
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(0,0,0,0.6)", color: "var(--brand)" }}>
                  Position barcode in frame
                </span>
              </div>
            </div>
          )}
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }} />
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>Starting camera...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {(status === "error" || status === "unsupported") && (
        <div className="rounded-2xl p-6 text-center" style={{ background: "var(--card-muted)", border: "1px solid var(--border)" }}>
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="var(--text-muted)" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2m4 0v-2m-8 2v-2m4 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5" }}>{errorMsg}</p>
          <button onClick={startScanner} className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold transition-colors" style={{ background: "var(--brand-soft)", color: "var(--brand-dark)" }}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
