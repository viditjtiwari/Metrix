"use client";

import React from "react";

export type DashboardRole = "lmo" | "owner" | "gatc" | "admin";

interface RoleSwitcherProps {
  currentRole: DashboardRole;
  onChangeRole: (role: DashboardRole) => void;
}

export function RoleSwitcher({ currentRole, onChangeRole }: RoleSwitcherProps) {
  const roles: { id: DashboardRole; label: string; icon: string }[] = [
    { id: "lmo", label: "LMO Officer", icon: "local_police" },
    { id: "owner", label: "Instrument Owner", icon: "storefront" },
    { id: "gatc", label: "GATC Lab", icon: "biotech" },
    { id: "admin", label: "System Admin", icon: "admin_panel_settings" },
  ];

  return (
    <div className="inline-flex p-1 rounded-xl bg-surface-container border border-surface-variant/50 shadow-xs">
      {roles.map((r) => {
        const active = currentRole === r.id;
        return (
          <button
            key={r.id}
            onClick={() => onChangeRole(r.id)}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              active
                ? "bg-primary-container text-on-secondary shadow-xs font-bold"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-base">{r.icon}</span>
            <span>{r.label}</span>
            {active && <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed" />}
          </button>
        );
      })}
    </div>
  );
}
