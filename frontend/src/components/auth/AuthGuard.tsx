"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { UserRole } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Wraps protected pages. Redirects to /login if not authenticated.
 * Optionally restricts by role via allowedRoles prop.
 */
export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAppSelector(
    (state) => state.auth
  );

  // Still hydrating auth state from localStorage
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" label="Authenticating..." />
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!isAuthenticated || !user) {
    if (typeof window !== "undefined") {
      router.replace("/login");
    }
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="md" label="Redirecting to sign in..." />
      </div>
    );
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-error-container flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl text-error">
            block
          </span>
        </div>
        <h2 className="text-lg font-headline font-bold text-on-surface">
          Access Denied
        </h2>
        <p className="text-xs text-on-surface-variant mt-1 max-w-sm">
          Your role ({user.role}) does not have permission to access this page.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-4 py-2 rounded-lg bg-secondary text-on-secondary text-xs font-semibold hover:bg-secondary-container transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
