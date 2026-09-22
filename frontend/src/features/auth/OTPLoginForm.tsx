"use client";

import React, { useState } from "react";
import { useSendOtpMutation, useVerifyOtpMutation } from "./authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "./authSlice";

interface OTPLoginFormProps {
  onSuccess?: () => void;
}

export function OTPLoginForm({ onSuccess }: OTPLoginFormProps) {
  const dispatch = useAppDispatch();
  const [sendOtp, { isLoading: isSending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"email" | "verify">("email");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    try {
      const res = await sendOtp({ email }).unwrap();
      setSuccessMsg(res.message || "OTP sent! Check your email.");
      setStep("verify");
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string } };
      setErrorMsg(apiErr?.data?.detail || "Failed to send OTP.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!otpCode || otpCode.length !== 6) {
      setErrorMsg("Please enter the 6-digit OTP code.");
      return;
    }

    try {
      const response = await verifyOtp({ email, otp_code: otpCode }).unwrap();
      dispatch(
        setCredentials({
          user: response.user,
          token: response.access_token,
        })
      );
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string } };
      setErrorMsg(apiErr?.data?.detail || "Invalid or expired OTP.");
    }
  };

  if (step === "email") {
    return (
      <form onSubmit={handleSendOtp} className="space-y-4">
        {errorMsg && (
          <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {errorMsg}
          </div>
        )}
        <div>
          <label
            htmlFor="otp-email"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            Email Address
          </label>
          <input
            id="otp-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={isSending}
          className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isSending ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Sending OTP...</span>
            </>
          ) : (
            <span>Send OTP</span>
          )}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-4">
      {successMsg && (
        <div className="p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          {errorMsg}
        </div>
      )}
      <p className="text-xs text-slate-600">
        OTP sent to <span className="font-semibold">{email}</span>
      </p>
      <div>
        <label
          htmlFor="otp-code"
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
        >
          Enter 6-Digit OTP
        </label>
        <input
          id="otp-code"
          type="text"
          maxLength={6}
          required
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-center tracking-[0.5em] text-lg font-mono"
        />
      </div>
      <button
        type="submit"
        disabled={isVerifying}
        className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow transition disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        {isVerifying ? (
          <>
            <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <span>Verify & Sign In</span>
        )}
      </button>
      <button
        type="button"
        onClick={() => {
          setStep("email");
          setOtpCode("");
          setErrorMsg(null);
          setSuccessMsg(null);
        }}
        className="w-full text-xs text-slate-500 hover:text-emerald-600 transition"
      >
        ← Change email or resend OTP
      </button>
    </form>
  );
}
