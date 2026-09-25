"use client";

import React, { useState, useEffect } from "react";
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

const BUSINESS_TYPES = [
  { label: "Commercial User / Retailer", value: "COMMERCIAL_USER" },
  { label: "Manufacturer", value: "MANUFACTURER" },
  { label: "Dealer / Distributor", value: "DEALER" },
  { label: "Repairer", value: "REPAIRER" },
  { label: "Importer", value: "IMPORTER" },
];

export function EditProfileModal({ open, onClose, user, token }: EditProfileModalProps) {
  const dispatch = useAppDispatch();
  const [fullName, setFullName] = useState(user.full_name);
  const [businessName, setBusinessName] = useState(user.profile?.business_name || "");
  const [tradeLicense, setTradeLicense] = useState(user.profile?.trade_license_number || "");
  const [phone, setPhone] = useState(user.profile?.contact_phone || "");
  const [address, setAddress] = useState(user.profile?.address_line || "");
  const [city, setCity] = useState(user.profile?.city || "");
  const [stateName, setStateName] = useState(user.profile?.state || "");
  const [pincode, setPincode] = useState(user.profile?.pincode || "");
  const [gstin, setGstin] = useState(user.profile?.gstin || "");
  const [pan, setPan] = useState(user.profile?.pan || "");
  const [businessType, setBusinessType] = useState(user.profile?.business_type || "COMMERCIAL_USER");
  const [aadhaarRef, setAadhaarRef] = useState(user.profile?.aadhaar_reference || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFullName(user.full_name);
      setBusinessName(user.profile?.business_name || "");
      setTradeLicense(user.profile?.trade_license_number || "");
      setPhone(user.profile?.contact_phone || "");
      setAddress(user.profile?.address_line || "");
      setCity(user.profile?.city || "");
      setStateName(user.profile?.state || "");
      setPincode(user.profile?.pincode || "");
      setGstin(user.profile?.gstin || "");
      setPan(user.profile?.pan || "");
      setBusinessType(user.profile?.business_type || "COMMERCIAL_USER");
      setAadhaarRef(user.profile?.aadhaar_reference || "");
      setError(null);
    }
  }, [open, user]);

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const updatedUser = await updateProfile({
        full_name: fullName,
        business_name: businessName || undefined,
        trade_license_number: tradeLicense || undefined,
        contact_phone: phone || undefined,
        address_line: address || undefined,
        city: city || undefined,
        state: stateName || undefined,
        pincode: pincode || undefined,
        gstin: gstin.toUpperCase().trim() || undefined,
        pan: pan.toUpperCase().trim() || undefined,
        business_type: businessType || undefined,
        aadhaar_reference: aadhaarRef.trim() || undefined,
      }).unwrap();
      if (token) {
        dispatch(setCredentials({ user: updatedUser, token }));
      }
      onClose();
    } catch (err: unknown) {
      const detail = (err as { data?: { detail?: string | { msg: string }[] } })?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d) => d.msg).join(", ")
        : typeof detail === "string"
        ? detail
        : "Failed to update profile.";
      setError(msg);
    }
  };

  const isBusinessUser = user.role === "INSTRUMENT_OWNER" || user.role === "GATC";

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile & KYC Details">
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs max-h-[75vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>
        )}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-8 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {isBusinessUser && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-3">
            <span className="block font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
              Statutory Business & KYC Info
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Business Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  {BUSINESS_TYPES.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">GSTIN (15 Digits)</label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="27AAAAA0000A1Z5"
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">PAN (10 Characters)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  placeholder="ABCDE1234F"
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Trade License No.</label>
                <input
                  type="text"
                  value={tradeLicense}
                  onChange={(e) => setTradeLicense(e.target.value)}
                  placeholder="e.g. TL-88210"
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Aadhaar (Last 4 Digits / Ref)</label>
                <input
                  type="text"
                  maxLength={12}
                  value={aadhaarRef}
                  onChange={(e) => setAadhaarRef(e.target.value)}
                  placeholder="xxxx-xxxx-1234"
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block font-medium text-slate-700 mb-1">Contact Phone *</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-8 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-700 mb-1">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full h-8 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block font-medium text-slate-700 mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-8 px-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">State</label>
            <input
              type="text"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              className="w-full h-8 px-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Pincode</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full h-8 px-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
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
