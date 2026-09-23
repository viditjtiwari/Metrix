"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { LoginForm } from "@/features/auth/LoginForm";
import { RegisterForm } from "@/features/auth/RegisterForm";
import { GlobalTopNav } from "@/components/layout/GlobalTopNav";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { Shield } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Auto-redirect authenticated users immediately to dashboard (or redirect target)
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, user, router, redirectUrl]);

  const handleRegisterSuccess = (_registeredEmail: string) => {
    router.replace(redirectUrl);
  };

  const handleLoginSuccess = () => {
    router.replace(redirectUrl);
  };

  // If already authenticated, do not show any card or login form - redirect directly
  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Redirecting to portal...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 text-center bg-gradient-to-b from-emerald-50/30 to-white">
          <div className="h-10 w-10 mx-auto rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 shadow-2xs">
            <Shield size={22} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">METRIX Authentication</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access the legal metrology verification portal
          </p>

          {/* Tab switch */}
          <div className="mt-5 flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setSuccessNotice(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setSuccessNotice(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === "register"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Register
            </button>
          </div>
        </div>

        <div className="p-6">
          {successNotice && (
            <div className="mb-4 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
              {successNotice}
            </div>
          )}

          {activeTab === "login" ? (
            <LoginForm onSuccess={handleLoginSuccess} />
          ) : (
            <RegisterForm onSuccess={handleRegisterSuccess} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <GlobalTopNav />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-emerald-600 animate-spin" />
            </div>
          }
        >
          <LoginContent />
        </Suspense>
      </main>
      <GlobalFooter />
    </div>
  );
}
