"use client";

import React from "react";

export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-emerald-600 animate-spin mr-3" />
      <span className="text-sm text-slate-500">{text}</span>
    </div>
  );
}
