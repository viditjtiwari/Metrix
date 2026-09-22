"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useUpdateProfileMutation } from "@/features/auth/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/features/auth/authSlice";
import { User } from "@/types";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
  token: string | null;
}

export function EditProfileModal({ open, onClose, user, token }: EditProfileModalProps) {
  const dispatch = useAppDispatch();
  const [fullName, setFullName] = useState(user.full_name);
  const [phone, setPhone] = useState(user.profile?.contact_phone || "");
  const [address, setAddress] = useState(user.profile?.address_line || "");
  const [city, setCity] = useState(user.profile?.city || "");
  const [stateName, setStateName] = useState(user.profile?.state || "");
  const [pincode, setPincode] = useState(user.profile?.pincode || "");
  const [error, setError] = useState<string | null>(null);

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const updatedUser = await updateProfile({
        full_name: fullName,
        contact_phone: phone || undefined,
        address_line: address || undefined,
        city: city || undefined,
        state: stateName || undefined,
        pincode: pincode || undefined,
      }).unwrap();
      if (token) {
        dispatch(setCredentials({ user: updatedUser, token }));
      }
      onClose();
    } catch (err: any) {
      setError(err?.data?.detail || "Failed to update profile.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>
        )}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-700 mb-1">Contact Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-700 mb-1">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block font-medium text-slate-700 mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">State</label>
            <input
              type="text"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Pincode</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
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
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
