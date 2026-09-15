"use client";

import React from "react";
import { useGetHealthQuery } from "@/services/api";

export default function HomePage() {
  const { data: health, isLoading, isFetching, error, refetch } = useGetHealthQuery();
  const loading = isLoading || isFetching;

  const errorMessage: string | null = error
    ? "status" in error
      ? `API responded with status: ${error.status}`
      : (error as { message?: string }).message || "Could not reach backend health endpoint"
    : null;


  return (
    <div className="space-y-8">
      {/* Hero / System Overview */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            METRIX Online Verification System
          </h1>
          <p className="mt-2 text-slate-600 leading-relaxed">
            Standardized digital verification, testing observation recording, and QR-verifiable
            certification platform for weighing and measuring instruments under Legal Metrology.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Modular Monolith
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              FastAPI + SQLAlchemy 2.x
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              PostgreSQL
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Next.js + Redux Toolkit
            </span>
          </div>
        </div>
      </section>

      {/* Backend API Health Status Widget */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">System Connection Status</h2>
            <p className="text-xs text-slate-500">Checking GET /api/v1/health</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition disabled:opacity-50"
          >
            {loading ? "Checking..." : "Recheck Status"}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center space-x-3 text-sm text-slate-500 py-4">
            <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-emerald-600 animate-spin" />
            <span>Connecting to backend service...</span>
          </div>
        ) : errorMessage ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-start">
              <span className="text-amber-600 text-lg mr-2 font-bold">!</span>
              <div>
                <h3 className="text-sm font-medium text-amber-800">Backend Unreachable</h3>
                <p className="mt-1 text-xs text-amber-700">{errorMessage}</p>
                <p className="mt-2 text-xs text-amber-600">
                  Ensure the backend is running via{" "}
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">
                    uvicorn app.main:app --reload
                  </code>{" "}
                  at port 8000.
                </p>
              </div>
            </div>
          </div>
        ) : health ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-500">API Status</span>
              <div className="mt-1 flex items-center space-x-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    health.status === "ok" ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="font-semibold text-sm capitalize text-slate-800">
                  {health.status}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-500">Environment</span>
              <div className="mt-1 font-semibold text-sm text-slate-800">
                {health.environment}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-500">Database</span>
              <div className="mt-1 flex items-center space-x-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    health.database === "connected" ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="font-semibold text-sm capitalize text-slate-800">
                  {health.database}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-500">API Version</span>
              <div className="mt-1 font-semibold text-sm text-slate-800">
                v{health.version}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Verification Lifecycle Architecture Map */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Core Legal Metrology Lifecycle
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            "1. Instrument Registration",
            "2. Verification Request",
            "3. Application Review",
            "4. Officer Scheduling",
            "5. Field/Lab Inspection",
            "6. Verification Observations",
            "7. Digital Certificate",
            "8. QR Verification",
          ].map((step, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-700"
            >
              {step}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
