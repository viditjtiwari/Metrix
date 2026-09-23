"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGoogleAuthMutation } from "@/features/auth/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/features/auth/authSlice";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [googleAuth] = useGoogleAuthMutation();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setErrorMsg("No authorization code received from Google.");
      setProcessing(false);
      return;
    }

    const exchangeCode = async () => {
      try {
        const response = await googleAuth({ code }).unwrap();
        dispatch(
          setCredentials({
            user: response.user,
            token: response.access_token,
          })
        );
        router.push("/dashboard");
      } catch (err: unknown) {
        const apiErr = err as { data?: { detail?: string } };
        setErrorMsg(
          apiErr?.data?.detail || "Failed to authenticate with Google."
        );
        setProcessing(false);
      }
    };

    exchangeCode();
  }, [searchParams, googleAuth, dispatch, router]);

  return (
    <div className="max-w-md mx-auto my-16 text-center">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        {processing && !errorMsg ? (
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-slate-600">
              Signing you in with Google...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl">
              ✕
            </div>
            <p className="text-sm text-rose-700">{errorMsg}</p>
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto my-16 text-center">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="h-10 w-10 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-slate-600">Loading Google authentication...</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
