"use client";

import React, { useState } from "react";
import { useLoginMutation } from "./authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "./authSlice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

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
      if (onSuccess) {
        onSuccess();
      }
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="p-3 text-xs text-on-error-container bg-error-container rounded-xl">
          {errorMsg}
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="officer@metrix.gov.in"
        icon="mail"
      />

      <Input
        label="Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        icon="lock"
      />

      <Button
        type="submit"
        isLoading={isLoading}
        variant="primary"
        className="w-full justify-center"
      >
        Sign In to Account
      </Button>

      {/* Quick Demo Credentials for Rapid Evaluation */}
      <div className="pt-3 border-t border-surface-variant/40 space-y-2 text-xs">
        <span className="text-[11px] font-semibold text-outline uppercase tracking-wider block">
          Demo Accounts (1-Click Autofill):
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setEmail("lmo@metrix.gov.in");
              setPassword("Officer@123456");
            }}
            className="p-2 text-left rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-variant/40 transition"
          >
            <div className="font-bold text-on-surface text-[11px]">👮 LMO Officer</div>
            <div className="text-[10px] text-outline truncate">lmo@metrix.gov.in</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("owner@example.com");
              setPassword("Owner@123456");
            }}
            className="p-2 text-left rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-variant/40 transition"
          >
            <div className="font-bold text-on-surface text-[11px]">🏪 Instrument Owner</div>
            <div className="text-[10px] text-outline truncate">owner@example.com</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("gatc@metrix.gov.in");
              setPassword("Lab@123456");
            }}
            className="p-2 text-left rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-variant/40 transition"
          >
            <div className="font-bold text-on-surface text-[11px]">🔬 GATC Lab</div>
            <div className="text-[10px] text-outline truncate">gatc@metrix.gov.in</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("admin@metrix.gov.in");
              setPassword("Admin@123456");
            }}
            className="p-2 text-left rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-variant/40 transition"
          >
            <div className="font-bold text-on-surface text-[11px]">🛡️ System Admin</div>
            <div className="text-[10px] text-outline truncate">admin@metrix.gov.in</div>
          </button>
        </div>
      </div>
    </form>
  );
}
