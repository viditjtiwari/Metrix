"use client";

import React, { useState, useEffect } from "react";

export function TopBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await fetch(`${apiUrl}/health`, { method: "GET" });
        setIsHealthy(res.ok);
      } catch {
        setIsHealthy(false);
      }
    };
    checkHealth();
  }, []);

  if (dismissed) return null;

  return (
    <section className="w-full bg-surface-container-high py-1.5 px-4 sm:px-6 border-b border-surface-variant/40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-secondary text-on-secondary font-bold text-[10px]">
            IN
          </span>
          <span className="font-semibold text-on-surface tracking-wider uppercase">
            National Metrology Portal • SIH26036
          </span>
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-tertiary" />
          <span className="hidden sm:inline-block text-on-surface-variant text-[11px]">
            Directorate of Legal Metrology Enforcement Framework
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-on-tertiary-fixed-variant bg-tertiary-fixed px-2 py-0.5 rounded font-medium">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                isHealthy === false ? "bg-error" : "bg-tertiary animate-pulse"
              }`}
            />
            {isHealthy === false ? "BACKEND OFFLINE" : "LEDGER SYNC LIVE"}
          </span>
          <span className="text-[11px] text-secondary font-semibold hover:underline cursor-pointer hidden sm:inline">
            Gazette Specs v4.2
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-outline hover:text-on-surface text-sm font-bold ml-1"
            title="Dismiss Banner"
          >
            ×
          </button>
        </div>
      </div>
    </section>
  );
}
