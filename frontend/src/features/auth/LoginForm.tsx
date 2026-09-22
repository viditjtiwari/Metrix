"use client";

import React, { useState } from "react";
import { useLoginMutation } from "./authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "./authSlice";
import { OTPLoginForm } from "./OTPLoginForm";
import { GoogleLoginButton } from "./GoogleLoginButton";

interface LoginFormProps {
  onSuccess?: () => void;
}

type AuthMethod = "password" | "otp";

export function LoginForm({ onSuccess }: LoginFormProps) {
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [method, setMethod] = useState<AuthMethod>("password");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      const response = await login({ email, password }).unwrap();
      dispatch(
        setCredentials({
          user: response.user,
          token: response.access_token,
        })
      );
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string }; status?: number };
      if (apiErr?.data?.detail) {
        setErrorMsg(apiErr.data.detail);
      } else if (apiErr?.status === 401) {
        setErrorMsg("Invalid email or password.");
      } else {
        setErrorMsg("Failed to connect to the authentication service.");
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Auth Method Tabs */}
      <div className="flex rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMethod("password")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
            method === "password"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Email & Password
        </button>
        <button
          type="button"
          onClick={() => setMethod("otp")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
            method === "otp"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Login with OTP
        </button>
      </div>

      {/* Password Login */}
      {method === "password" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {errorMsg}
            </div>
          )}
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@metrix.gov.in"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      )}

      {/* OTP Login */}
      {method === "otp" && <OTPLoginForm onSuccess={onSuccess} />}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-slate-400">or</span>
        </div>
      </div>

      {/* Google Login */}
      <GoogleLoginButton />
    </div>
  );
}
