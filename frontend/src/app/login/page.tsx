"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/authSlice";
import { LoginForm } from "@/features/auth/LoginForm";
import { RegisterForm } from "@/features/auth/RegisterForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleRegisterSuccess = () => {
    router.push("/dashboard");
  };

  const handleLoginSuccess = () => {
    router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto my-8 animate-fade-in">
      {isAuthenticated && user ? (
        <Card>
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-tertiary/10 text-tertiary rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {user.full_name}
              </h2>
              <p className="text-xs text-on-surface-variant">{user.email}</p>
              <span className="inline-block mt-2 px-2.5 py-1 text-xs font-semibold rounded-full bg-tertiary/10 text-tertiary border border-tertiary/20">
                Role: {user.role}
              </span>
            </div>

            {user.profile && (
              <div className="text-left bg-surface-container-low p-4 rounded-lg border border-surface-variant/40 text-xs space-y-1">
                <div className="font-semibold text-on-surface">
                  {user.profile.business_name}
                </div>
                <div className="text-on-surface-variant">
                  {user.profile.city}, {user.profile.state} -{" "}
                  {user.profile.pincode}
                </div>
                <div className="text-outline">
                  Phone: {user.profile.contact_phone}
                </div>
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => router.push("/dashboard")}
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => dispatch(logout())}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="lg">
          {/* Header */}
          <div className="border-b border-surface-variant/40 pb-5 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl text-on-primary">
                balance
              </span>
            </div>
            <h1 className="text-xl font-headline font-bold text-on-surface">
              METRIX Authentication
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Access the legal metrology verification portal
            </p>

            {/* Tab switch */}
            <div className="mt-5 flex rounded-lg bg-surface-container-low p-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setSuccessNotice(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                  activeTab === "login"
                    ? "bg-surface-container-lowest text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
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
                    ? "bg-surface-container-lowest text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Register
              </button>
            </div>
          </div>

          <div className="pt-5">
            {successNotice && (
              <div className="mb-4 p-3 text-xs text-tertiary bg-tertiary/5 border border-tertiary/20 rounded-lg">
                {successNotice}
              </div>
            )}

            {activeTab === "login" ? (
              <LoginForm onSuccess={handleLoginSuccess} />
            ) : (
              <RegisterForm onSuccess={handleRegisterSuccess} />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
