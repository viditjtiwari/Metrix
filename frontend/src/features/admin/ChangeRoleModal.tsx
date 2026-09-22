"use client";

import React, { useState } from "react";
import { useUpdateUserRoleMutation } from "@/features/auth/authApi";
import { UserRole } from "@/types";

interface ChangeRoleModalProps {
  userId: number;
  userName: string;
  currentRole: UserRole;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "INSTRUMENT_OWNER", label: "Instrument Owner" },
  { value: "LMO", label: "Legal Metrology Officer (LMO)" },
  { value: "GATC", label: "Test Centre (GATC)" },
  { value: "ADMIN", label: "System Administrator" },
];

export function ChangeRoleModal({
  userId,
  userName,
  currentRole,
  onClose,
  onSuccess,
}: ChangeRoleModalProps) {
  const [updateRole, { isLoading }] = useUpdateUserRoleMutation();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedRole === currentRole) {
      setErrorMsg("Please select a different role.");
      return;
    }

    try {
      await updateRole({
        userId,
        data: { role: selectedRole },
      }).unwrap();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string } };
      setErrorMsg(apiErr?.data?.detail || "Failed to update role.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Change User Role</h2>
          <p className="text-xs text-slate-500 mt-1">
            Update role for <span className="font-semibold">{userName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Current Role
            </label>
            <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {currentRole}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              New Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedRole === currentRole}
              className="flex-1 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow transition disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
