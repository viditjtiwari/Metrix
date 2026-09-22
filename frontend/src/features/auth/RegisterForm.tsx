"use client";

import React, { useState } from "react";
import { useRegisterMutation, useLoginMutation } from "./authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "./authSlice";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface RegisterFormProps {
  onSuccess: (registeredEmail: string) => void;
}

const roleOptions = [
  { value: "INSTRUMENT_OWNER", label: "Instrument Owner / Business" },
  { value: "LMO", label: "Legal Metrology Officer (LMO)" },
  { value: "GATC", label: "Test Centre (GATC)" },
  { value: "ADMIN", label: "System Administrator" },
];

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const dispatch = useAppDispatch();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const isLoading = isRegistering || isLoggingIn;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("INSTRUMENT_OWNER");

  const [includeProfile, setIncludeProfile] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [tradeLicense, setTradeLicense] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload = {
      email,
      password,
      full_name: fullName,
      role,
      ...(includeProfile && {
        profile: {
          business_name: businessName,
          trade_license_number: tradeLicense || undefined,
          contact_phone: phone,
          address_line: address,
          city,
          state: stateName,
          pincode,
        },
      }),
    };

    try {
      await register(payload).unwrap();
      try {
        const loginRes = await login({ email, password }).unwrap();
        dispatch(
          setCredentials({
            user: loginRes.user,
            token: loginRes.access_token,
          })
        );
      } catch {
        // Fallback if auto-login encounters any transient issue
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="p-3 text-xs text-on-error-container bg-error-container rounded-xl">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Full Name"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Rajesh Verma"
        />

        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={roleOptions}
        />
      </div>

      <Input
        label="Email Address"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="owner@example.com"
        icon="mail"
      />

      <Input
        label="Password"
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Minimum 6 characters"
        icon="lock"
      />

      {/* Optional Business Profile Toggle */}
      <div className="pt-2 border-t border-surface-variant/40">
        <label className="flex items-center space-x-2 text-xs text-on-surface cursor-pointer">
          <input
            type="checkbox"
            checked={includeProfile}
            onChange={(e) => setIncludeProfile(e.target.checked)}
            className="rounded border-surface-variant text-tertiary focus:ring-tertiary"
          />
          <span className="font-medium">Attach Business / Organization Profile</span>
        </label>
      </div>

      {includeProfile && (
        <div className="space-y-3 pt-2 bg-surface-container-low p-3.5 rounded-xl border border-surface-variant/40 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Business Name"
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Verma Retail Store"
            />
            <Input
              label="Contact Phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="City"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Indore"
            />
            <Input
              label="State"
              type="text"
              required
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              placeholder="Madhya Pradesh"
            />
            <Input
              label="Pincode"
              type="text"
              required
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="452001"
            />
          </div>

          <Input
            label="Address Line"
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="12, Market Square"
          />
        </div>
      )}

      <Button
        type="submit"
        isLoading={isLoading}
        variant="primary"
        className="w-full justify-center"
      >
        Register Account
      </Button>
    </form>
  );
}
