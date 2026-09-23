"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { QrCode, AlertTriangle } from "lucide-react";

interface Props {
  onResult: (text: string) => void;
}

export function CameraQrScanner({ onResult }: Props) {
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrCodeRef = useRef<any>(null);
  const hasStartedRef = useRef(false);

  const startScanner = useCallback(async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setCameraError(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scannerId = "metrix-qr-reader";

      if (!scannerRef.current) return;

      const html5QrCode = new Html5Qrcode(scannerId, { verbose: false });
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText: string) => {
          html5QrCode
            .stop()
            .then(() => {
              setScanning(false);
              onResult(decodedText);
            })
            .catch(() => {});
        },
        () => {}
      );
      setScanning(true);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || String(err);
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setCameraError(
          "Camera permission denied. Please allow camera access in your browser settings."
        );
      } else if (msg.includes("NotFound") || msg.includes("no camera")) {
        setCameraError("No camera detected on this device.");
      } else {
        setCameraError(`Camera error: ${msg}`);
      }
      hasStartedRef.current = false;
    }
  }, [onResult]);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {
        // already stopped
      }
      html5QrCodeRef.current = null;
    }
    hasStartedRef.current = false;
    setScanning(false);
  }, []);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  return (
    <div className="p-6 space-y-4">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold mb-3">
          <QrCode size={14} />
          {scanning ? "Camera active — point at QR code" : "Initializing camera..."}
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
        <style>{`
          #metrix-qr-reader {
            position: relative !important;
            overflow: hidden !important;
          }
          #metrix-qr-reader video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }
          #metrix-qr-reader img[alt="Scan me!"] {
            display: none !important;
          }
          #metrix-qr-reader > div {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
        `}</style>
        <div
          id="metrix-qr-reader"
          ref={scannerRef}
          style={{ width: "100%", height: 300 }}
        />
        {!scanning && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
            <div className="h-8 w-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {cameraError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-2">
          <AlertTriangle className="h-6 w-6 text-amber-600 mx-auto" />
          <p className="text-xs text-amber-800 font-medium">{cameraError}</p>
          <button
            onClick={() => {
              stopScanner();
              setTimeout(startScanner, 200);
            }}
            className="mt-2 px-4 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition"
          >
            Retry Camera
          </button>
        </div>
      )}

      <p className="text-[11px] text-slate-400 text-center">
        Point your device camera at the QR code printed on the METRIX certificate.
        <br />
        The verification result will appear automatically.
      </p>
    </div>
  );
}
