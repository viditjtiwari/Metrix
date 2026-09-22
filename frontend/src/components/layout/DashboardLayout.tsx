"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { AuthGuard } from "./AuthGuard";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar - hidden on mobile by default */}
        <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
          <Sidebar />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
