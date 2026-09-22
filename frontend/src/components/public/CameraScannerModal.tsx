"use client";

import React, { useState } from "react";

export function CameraScannerModal({
  onScan,
}: {
  onScan: (token: string) => void;
}) {
  const [scanning, setScanning] = useState(true);

  const handleSimulateScan = () => {
    setScanning(false);
    setTimeout(() => {
      onScan("METRIX-CERT-2026-000001");
    }, 400);
  };

  return (
    <div className="w-full flex flex-col items-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl overflow-hidden shadow-inner border border-surface-variant/40">
        {/* Simulated Camera Window */}
        <div className="w-full h-64 bg-primary-container relative flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Reticle Target Area */}
          <div className="relative w-48 h-48 rounded-lg flex items-center justify-center shadow-[0_0_0_9999px_rgba(15,23,42,0.65)]">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-tertiary rounded-tl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-tertiary rounded-tr" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-tertiary rounded-bl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-tertiary rounded-br" />

            {/* Scanning Laser */}
            {scanning && (
              <div className="absolute left-2 right-2 h-0.5 bg-tertiary shadow-[0_0_12px_#10b981] animate-bounce" />
            )}

            <div className="flex flex-col items-center gap-1.5 z-10 text-on-secondary/80 pointer-events-none">
              <span className="material-symbols-outlined text-4xl text-tertiary animate-pulse">
                qr_code_2
              </span>
              <span className="text-[11px] font-mono tracking-wider">
                ALIGN QR WITHIN FRAME
              </span>
            </div>
          </div>

          <div className="absolute bottom-3 text-center">
            <span className="text-[10px] text-tertiary-fixed bg-black/40 px-2.5 py-1 rounded-full font-mono">
              High-Precision Optical Decoder Ready
            </span>
          </div>
        </div>

        {/* Scan Actions */}
        <div className="p-4 bg-surface-container-low flex flex-col gap-2">
          <button
            onClick={handleSimulateScan}
            className="w-full py-2.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded-lg font-semibold text-xs transition shadow flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">qr_code_scanner</span>
            <span>Simulate Physical QR Stamp Scan</span>
          </button>
          <p className="text-[11px] text-center text-outline">
            Point camera at the QR code printed on the physical metrology seal stamp.
          </p>
        </div>
      </div>
    </div>
  );
}
