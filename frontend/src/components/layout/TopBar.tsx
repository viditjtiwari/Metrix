"use client";

import React from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/authSlice";
import { useGetNotificationsQuery } from "@/features/notifications/notificationApi";
import { Bell, LogOut, Menu, Search, QrCode } from "lucide-react";
import { getRoleBadgeColor, getRoleLabel } from "@/utils/formatters";

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: notifData } = useGetNotificationsQuery(
    { page: 1, page_size: 5 },
    { skip: !isAuthenticated || !user, pollingInterval: 30000 }
  );

  const unreadCount = notifData?.unread_count ?? 0;

  return (
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-xs flex items-center justify-between px-4 lg:px-6 shrink-0 shadow-2xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition"
          aria-label="Toggle navigation drawer"
        >
          <Menu size={18} />
        </button>

        {/* National Portal Indicator */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-1.5 rounded-full bg-emerald-600 hidden sm:block" />
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-800">METRIX</span>
            <span className="text-slate-300 hidden md:inline">|</span>
            <span className="text-slate-500 hidden md:inline text-[11px]">
              Legal Metrology Online Verification System
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Shortcut */}
        <Link
          href="/search"
          title="Search Instruments, Applications, Certificates (Ctrl+K)"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs transition"
        >
          <Search size={14} className="text-slate-400" />
          <span className="text-[11px] font-medium">Quick Search...</span>
          <kbd className="hidden lg:inline px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-400 font-mono">
            ⌘K
          </kbd>
        </Link>

        {/* Quick QR Scanner Link */}
        <Link
          href="/verify/lookup"
          title="Open Public QR Scanner"
          className="h-8 px-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 text-slate-600 hover:text-emerald-700 flex items-center gap-1.5 text-xs font-medium transition"
        >
          <QrCode size={14} className="text-emerald-600" />
          <span className="hidden md:inline text-[11px]">Verify QR</span>
        </Link>

        {/* Notifications */}
        <Link
          href="/notifications"
          title="Notifications"
          className="relative h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
            <Link href="/profile" className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 transition group">
              <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition leading-tight">
                  {user.full_name}
                </div>
                <div className={`text-[10px] font-semibold ${getRoleBadgeColor(user.role).replace("bg-", "text-").split(" ")[1]}`}>
                  {getRoleLabel(user.role)}
                </div>
              </div>
            </Link>
            <button
              onClick={() => dispatch(logout())}
              title="Sign Out"
              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
