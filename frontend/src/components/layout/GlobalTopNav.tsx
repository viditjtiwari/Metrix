"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/authSlice";
import { useGetNotificationsQuery } from "@/features/notifications/notificationApi";
import {
  Shield,
  QrCode,
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  PhoneCall,
  LayoutDashboard,
  Scale,
  FileCheck2,
} from "lucide-react";
import { getRoleBadgeColor, getRoleLabel } from "@/utils/formatters";

export function GlobalTopNav() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: notifData } = useGetNotificationsQuery(
    { page: 1, page_size: 5 },
    { skip: !isAuthenticated, pollingInterval: 30000 }
  );
  const unreadCount = notifData?.unread_count ?? 0;

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* 1. National Tricolor Strip */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* 2. Official Government Branding Sub-Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200 tracking-wide">भारत सरकार / Government of India</span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline text-slate-400">
              Department of Consumer Affairs — Legal Metrology Division
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:1915"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition font-medium"
              title="National Consumer Helpline"
            >
              <PhoneCall size={11} />
              <span>NCH: 1915 (Toll-Free)</span>
            </a>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-amber-300 font-mono">
              SIH26036
            </span>
          </div>
        </div>
      </div>

      {/* 3. Primary Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition">
            <Shield size={22} className="text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">METRIX</span>
              <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-sm border border-emerald-200/80">
                GOV.IN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block -mt-0.5 font-medium">
              National Online Verification & Digital Certification
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600">
          <Link
            href="/"
            className={`px-3 py-2 rounded-lg transition ${
              isActive("/") ? "text-emerald-700 bg-emerald-50" : "hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Home
          </Link>
          <Link
            href="/verify/lookup"
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
              isActive("/verify/lookup") ? "text-emerald-700 bg-emerald-50" : "hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <QrCode size={14} className="text-emerald-600" />
            <span>Verify QR</span>
          </Link>

          {isAuthenticated && (
            <>
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                  isActive("/dashboard") ? "text-emerald-700 bg-emerald-50" : "hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard size={14} />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/instruments"
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                  isActive("/instruments") ? "text-emerald-700 bg-emerald-50" : "hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Scale size={14} />
                <span>Instruments</span>
              </Link>
              <Link
                href="/applications"
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition ${
                  isActive("/applications") ? "text-emerald-700 bg-emerald-50" : "hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <FileCheck2 size={14} />
                <span>Applications</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right Action Section */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated && (
            <Link
              href="/search"
              title="Search System Registry"
              className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Search size={17} />
            </Link>
          )}

          {isAuthenticated && (
            <Link
              href="/notifications"
              title="Notifications"
              className="relative h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute 1 top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{user.full_name}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold leading-none">
                    {getRoleLabel(user.role)}
                  </div>
                </div>
              </Link>
              <button
                onClick={() => dispatch(logout())}
                title="Sign Out"
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/verify/lookup"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 text-xs font-medium transition"
              >
                <QrCode size={14} /> Scan QR
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition"
              >
                <UserIcon size={14} /> Sign In
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-9 w-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* 4. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 text-xs font-semibold text-slate-700 shadow-md">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            href="/verify/lookup"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-emerald-700"
          >
            <QrCode size={15} /> Verify QR Certificate
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                href="/instruments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Instrument Registry
              </Link>
              <Link
                href="/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Applications
              </Link>
              <Link
                href="/certificates"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                Certificates
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                My Profile
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
