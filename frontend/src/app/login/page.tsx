"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/authSlice";
import { LoginForm } from "@/features/auth/LoginForm";
import { RegisterForm } from "@/features/auth/RegisterForm";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleRegisterSuccess = (registeredEmail: string) => {
    setSuccessNotice(
      `Registration successful for ${registeredEmail}! You may now sign in.`
    );
    setActiveTab("login");
  };

  const handleLoginSuccess = () => {
    router.push("/");
  };

  return (
    <div className="max-w-md mx-auto my-8">
      {isAuthenticated && user ? (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.full_name}</h2>
            <p className="text-xs text-slate-500">{user.email}</p>
            <span className="inline-block mt-2 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Role: {user.role}
            </span>
          </div>

          {user.profile && (
            <div className="text-left bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800">
                {user.profile.business_name}
              </div>
              <div className="text-slate-600">
                {user.profile.city}, {user.profile.state} - {user.profile.pincode}
              </div>
              <div className="text-slate-500">Phone: {user.profile.contact_phone}</div>
            </div>
          )}

          <div className="pt-2 flex space-x-3">
            <button
              onClick={() => router.push("/")}
              className="flex-1 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => dispatch(logout())}
              className="flex-1 py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 text-center">
            <h1 className="text-xl font-bold text-slate-900">METRIX Authentication</h1>
            <p className="text-xs text-slate-500 mt-1">
              Access the legal metrology verification portal
            </p>

            {/* Tab switch */}
            <div className="mt-6 flex rounded-lg bg-slate-100 p-1">
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
      )}
    </div>
  );
}
