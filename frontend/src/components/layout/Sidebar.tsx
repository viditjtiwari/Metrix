"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { getMenuGroups, GROUP_LABELS, ROLE_PORTAL } from "@/utils/roleConfig";
import { UserRole } from "@/types";
import {
  LayoutDashboard, Scale, FileText, ClipboardCheck, Award,
  Search, Download, Bell, Users, Server, Megaphone,
  ChevronLeft, ChevronRight, LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Scale, FileText, ClipboardCheck, Award,
  Search, Download, Bell, Users, Server, Megaphone,
};

/** Accent classes per role for the active link highlight */
const ACTIVE_CLASSES: Record<UserRole, string> = {
  INSTRUMENT_OWNER: "bg-emerald-50 text-emerald-700 border-emerald-200",
  LMO: "bg-blue-50 text-blue-700 border-blue-200",
  GATC: "bg-violet-50 text-violet-700 border-violet-200",
  ADMIN: "bg-amber-50 text-amber-700 border-amber-200",
};

const LOGO_BG: Record<UserRole, string> = {
  INSTRUMENT_OWNER: "bg-emerald-600",
  LMO: "bg-blue-600",
  GATC: "bg-violet-600",
  ADMIN: "bg-amber-600",
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return null;

  const role = user.role as UserRole;
  const groups = getMenuGroups(role);
  const portal = ROLE_PORTAL[role];
  const activeClass = ACTIVE_CLASSES[role];
  const logoBg = LOGO_BG[role];

  return (
    <aside
      className={`flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo + Portal Name */}
      <div className="flex flex-col h-auto px-4 py-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center">
          <div className={`h-8 w-8 rounded-lg ${logoBg} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
            M
          </div>
          {!collapsed && (
            <span className="ml-3 font-bold text-lg tracking-tight text-slate-900">
              METRIX
            </span>
          )}
        </div>
        {!collapsed && (
          <span className={`mt-1 text-[10px] font-semibold uppercase tracking-widest ${portal.accentText}`}>
            {portal.portalName}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {Object.entries(groups).map(([groupKey, items]) => (
          <div key={groupKey}>
            {!collapsed && (
              <div className="px-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {GROUP_LABELS[groupKey]}
              </div>
            )}
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = ICON_MAP[item.icon];
                const isActive = pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? `${activeClass} border`
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                  >
                    {Icon && <Icon size={18} />}
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-slate-100 p-2 shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> <span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
