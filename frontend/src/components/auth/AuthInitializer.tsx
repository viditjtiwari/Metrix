"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetMeQuery } from "@/features/auth/authApi";
import { setUser, logout, markInitialized } from "@/features/auth/authSlice";

/**
 * Hydrates auth state from localStorage token on mount.
 * If a token exists, calls GET /auth/me to validate it and populate user.
 * If no token or token is invalid, marks state as initialized without auth.
 */
export function AuthInitializer({ children }: { children?: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, token, isInitialized } = useAppSelector((state) => state.auth);

  const shouldFetch = Boolean(token && !user);
  const { data, isError, isSuccess } = useGetMeQuery(undefined, {
    skip: !shouldFetch,
  });

  // Token exists, /me returned user
  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUser(data));
    }
  }, [data, isSuccess, dispatch]);

  // Token was invalid or /me failed
  useEffect(() => {
    if (isError && shouldFetch) {
      dispatch(logout());
    }
  }, [isError, shouldFetch, dispatch]);

  // No token at all — just mark as initialized
  useEffect(() => {
    if (!token && !isInitialized) {
      dispatch(markInitialized());
    }
  }, [token, isInitialized, dispatch]);

  return <>{children}</>;
}
