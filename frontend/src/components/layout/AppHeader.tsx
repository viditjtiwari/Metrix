"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/authSlice";
import { useGetNotificationsQuery } from "@/features/notifications/notificationApi";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [quickSearch, setQuickSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch unread notification count (only when authenticated)
  const { data: notifData } = useGetNotificationsQuery(
    { page: 1, page_size: 1 },
    { skip: !isAuthenticated, pollingInterval: 60000 }
  );
  const unreadCount = notifData?.unread_count || 0;

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      router.push(`/verify?token=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  const navLinks = [
    { href: "/verify", label: "Public Verifier", icon: "verified_user" },
    ...(isAuthenticated
      ? [
          { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
          { href: "/applications", label: "Applications", icon: "assignment" },
          {
            href: "/instruments",
            label: "Instruments",
            icon: "precision_manufacturing",
          },
          {
            href: "/certificates",
            label: "Certificates",
            icon: "workspace_premium",
          },
          { href: "/search", label: "Search", icon: "search" },
          { href: "/reports", label: "Reports", icon: "analytics" },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-surface-variant/40 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-base shadow-sm">
            <span className="material-symbols-outlined text-xl">balance</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-headline font-bold text-lg tracking-tight text-on-surface">
                METRIX
              </span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-secondary text-[10px] font-bold">
                GOVTECH
              </span>
            </div>
            <span className="text-[10px] text-on-surface-variant hidden md:inline-block leading-tight">
              Legal Metrology Verification
            </span>
          </div>
        </Link>

        {/* Center Quick Verify Box */}
        <form
          onSubmit={handleQuickVerify}
          className="hidden md:flex flex-1 max-w-md mx-2 relative items-center"
        >
          <span className="material-symbols-outlined absolute left-3 text-outline text-lg">
            search_check
          </span>
          <input
            type="text"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            placeholder="Verify Token or Certificate ID..."
            className="w-full pl-9 pr-20 py-1.5 bg-surface-container-low rounded-lg text-xs text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-secondary transition-all"
          />
          <button
            type="submit"
            className="absolute right-1 px-2.5 py-1 bg-secondary text-on-secondary rounded-md text-[11px] font-semibold hover:bg-secondary-container transition"
          >
            VERIFY
          </button>
        </form>

        {/* Navigation & User controls */}
        <div className="flex items-center gap-3">
          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                    active
                      ? "bg-surface-container text-secondary font-bold"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="material-symbols-outlined text-xl">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-surface-variant">
              {/* Notification Bell */}
              <Link
                href="/notifications"
                className="relative p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-xl">
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-error text-on-error text-[9px] font-bold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Avatar */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary-container text-on-secondary flex items-center justify-center font-bold text-xs">
                  {user?.full_name?.charAt(0) || "U"}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-on-surface leading-tight">
                    {user?.full_name}
                  </span>
                  <span className="text-[10px] text-secondary font-semibold uppercase">
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={() => dispatch(logout())}
                className="p-1.5 text-outline hover:text-error transition"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-lg">
                  logout
                </span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg bg-secondary text-on-secondary text-xs font-semibold hover:bg-secondary-container transition shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">
                  lock
                </span>
                <span>Officer Portal</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-surface-variant/40 bg-surface-container-lowest animate-slide-up">
          <nav className="flex flex-col p-3 gap-1">
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
                    active
                      ? "bg-surface-container text-secondary font-bold"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
