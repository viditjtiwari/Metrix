"use client";

import React, { useState } from "react";
import { useRegisterMutation, useLoginMutation } from "./authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "./authSlice";

interface RegisterFormProps {
  onSuccess: (registeredEmail: string) => void;
}

const BUSINESS_TYPES = [
  { label: "Commercial User / Retailer", value: "COMMERCIAL_USER" },
  { label: "Manufacturer", value: "MANUFACTURER" },
  { label: "Dealer / Distributor", value: "DEALER" },
  { label: "Repairer", value: "REPAIRER" },
  { label: "Importer", value: "IMPORTER" },
];

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const dispatch = useAppDispatch();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const isLoading = isRegistering || isLoggingIn;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [includeProfile, setIncludeProfile] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [tradeLicense, setTradeLicense] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [businessType, setBusinessType] = useState("COMMERCIAL_USER");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload = {
      email,
      password,
      full_name: fullName,
      role: "INSTRUMENT_OWNER" as const,
      ...(includeProfile && {
        profile: {
          business_name: businessName,
          trade_license_number: tradeLicense || undefined,
          contact_phone: phone,
          address_line: address,
          city,
          state: stateName,
          pincode,
          gstin: gstin.toUpperCase().trim() || undefined,
          pan: pan.toUpperCase().trim() || undefined,
          business_type: businessType,
        },
      }),
    };

    try {
      await register(payload).unwrap();
      try {
        const loginRes = await login({ email, password }).unwrap();
        dispatch(setCredentials({ user: loginRes.user, token: loginRes.access_token }));
      } catch {
        // Fallback
      }
      onSuccess(email);
    } catch (err: unknown) {
      const apiErr = err as { data?: { detail?: string }; status?: number };
      if (apiErr?.data?.detail) {
        setErrorMsg(apiErr.data.detail);
      } else if (apiErr?.status === 409) {
        setErrorMsg("This email address is already registered.");
      } else {
        setErrorMsg("Failed to register. Please check your inputs.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {errorMsg && (
        <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Full Name
        </label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Rajesh Verma"
          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="p-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg">
        📋 Registering as <span className="font-semibold text-emerald-700">Instrument Owner</span>.
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@example.com"
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 chars"
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200">
        <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={includeProfile}
            onChange={(e) => setIncludeProfile(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600"
          />
          <span className="font-medium">Attach Business Profile & KYC</span>
        </label>
      </div>

      {includeProfile && (
        <div className="space-y-2.5 pt-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">Business Name *</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Verma Retail Store"
                className="w-full px-2.5 py-1 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">Business Type</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
              >
                {BUSINESS_TYPES.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">GSTIN (15 Digits)</label>
              <input
                type="text"
                maxLength={15}
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="27AAAAA0000A1Z5"
                className="w-full px-2.5 py-1 border border-slate-300 rounded font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">PAN (10 Chars)</label>
              <input
                type="text"
                maxLength={10}
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                placeholder="ABCDE1234F"
                className="w-full px-2.5 py-1 border border-slate-300 rounded font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">Contact Phone *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full px-2.5 py-1 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">Trade License No.</label>
              <input
                type="text"
                value={tradeLicense}
                onChange={(e) => setTradeLicense(e.target.value)}
                placeholder="TL-88210"
                className="w-full px-2.5 py-1 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Indore"
                className="w-full px-2 py-1 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">State *</label>
              <input
                type="text"
                required
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="MP"
                className="w-full px-2 py-1 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">Pincode *</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="452001"
                className="w-full px-2 py-1 border border-slate-300 rounded"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-0.5">Address *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="12, Market Square"
              className="w-full px-2.5 py-1 border border-slate-300 rounded"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow transition disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>Creating Account...</span>
          </>
        ) : (
          <span>Register Account</span>
        )}
      </button>
    </form>
  );
}
