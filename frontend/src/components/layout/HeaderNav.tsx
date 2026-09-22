"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/authSlice";

export function HeaderNav() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/applications", label: "Applications" },
    { href: "/instruments", label: "Instruments" },
    { href: "/certificates", label: "Certificates" },
    { href: "/search", label: "Search" },
    { href: "/reports", label: "Reports" },
    { href: "/notifications", label: "Notifications" },
  ];

  return (
    <div className="flex items-center space-x-3 text-xs font-medium">
      <Link
        href="/"
        className={`transition hidden sm:inline-block ${
          pathname === "/" ? "text-secondary font-bold" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        Home
      </Link>
      {isAuthenticated &&
        links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`transition font-medium ${
              pathname.startsWith(link.href)
                ? "text-secondary font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {link.label}
          </Link>
        ))}

      {isAuthenticated && user ? (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-surface-container py-1 px-2.5 rounded-full text-on-surface">
            <span className="font-semibold">{user.full_name}</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-secondary-container text-on-secondary-container rounded font-bold">
              {user.role}
            </span>
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="text-outline hover:text-error transition"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-secondary transition shadow-sm font-semibold"
        >
          Sign In
        </Link>
      )}
    </div>
  );
}
