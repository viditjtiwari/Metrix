"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetMeQuery } from "@/features/auth/authApi";
import { setUser, logout } from "@/features/auth/authSlice";

export function AuthInitializer({ children }: { children?: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  const shouldFetch = Boolean(token && !user);
  const { data, isError } = useGetMeQuery(undefined, {
    skip: !shouldFetch,
  });

  useEffect(() => {
    if (data) {
      dispatch(setUser(data));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (isError && shouldFetch) {
      dispatch(logout());
    }
  }, [isError, shouldFetch, dispatch]);

  return <>{children}</>;
}
