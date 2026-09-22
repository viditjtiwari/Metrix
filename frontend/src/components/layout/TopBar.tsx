"use client";

import React from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/authSlice";
import { useGetNotificationsQuery } from "@/features/notifications/notificationApi";
import { Bell, LogOut, User, Menu } from "lucide-react";
import { getRoleBadgeColor, getRoleLabel } from "@/utils/formatters";

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { data: notifData } = useGetNotificationsQuery(
    { page: 1, page_size: 5 },
    { pollingInterval: 30000 }
  );

  const unreadCount = notifData?.unread_count ?? 0;

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
        >
          <Menu size={18} />
        </button>
        <div className="hidden sm:block text-xs text-slate-400">
          Legal Metrology Verification Platform
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <Link href="/profile" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition">
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
              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
