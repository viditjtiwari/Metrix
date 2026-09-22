"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useChangePasswordMutation } from "@/features/auth/authApi";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPass !== confirmPass) {
      setError("New passwords do not match.");
      return;
    }
    try {
      await changePassword({ current_password: currPass, new_password: newPass }).unwrap();
      setSuccess("Password updated successfully.");
      setCurrPass("");
      setNewPass("");
      setConfirmPass("");
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err?.data?.detail || "Failed to update password.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>
        )}
        {success && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">{success}</div>
        )}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Current Password</label>
          <input
            type="password"
            required
            value={currPass}
            onChange={(e) => setCurrPass(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-700 mb-1">New Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
