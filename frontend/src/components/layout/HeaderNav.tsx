"use client";

import React from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/authSlice";

export function HeaderNav() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="flex items-center space-x-4 text-xs font-medium">
      <Link
        href="/"
        className="text-slate-600 hover:text-slate-900 transition hidden sm:inline-block"
      >
        Home
      </Link>
      {isAuthenticated && (
        <Link
          href="/applications"
          className="text-slate-600 hover:text-slate-900 transition font-medium"
        >
          Applications
        </Link>
      )}

      {isAuthenticated && user ? (
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-100 py-1 px-2.5 rounded-full text-slate-700">
            <span className="font-semibold">{user.full_name}</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">
              {user.role}
            </span>
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="text-slate-500 hover:text-rose-600 transition"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
        >
          Sign In
        </Link>
      )}
    </div>
  );
}
