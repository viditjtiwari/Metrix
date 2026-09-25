"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { PageHeader } from "@/components/ui/PageHeader";
import { EditProfileModal } from "@/features/auth/EditProfileModal";
import { ChangePasswordModal } from "@/features/auth/ChangePasswordModal";
import { getRoleLabel, getRoleBadgeColor, formatDate } from "@/utils/formatters";
import { User, Mail, Building2, Phone, MapPin, Calendar, Shield, Edit, KeyRound } from "lucide-react";

export default function ProfilePage() {
  const { user, token } = useAppSelector((state) => state.auth);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="My Profile"
        description="Your account information and credentials management."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Edit size={14} /> Edit Profile
            </button>
            <button
              onClick={() => setShowPassModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <KeyRound size={14} /> Change Password
            </button>
          </div>
        }
      />

      {/* User Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user.full_name}</h2>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
              <Shield size={12} /> {getRoleLabel(user.role)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow icon={<Mail size={16} />} label="Email" value={user.email} />
          <InfoRow icon={<Calendar size={16} />} label="Member Since" value={formatDate(user.created_at)} />
          <InfoRow icon={<User size={16} />} label="Account Status" value={user.is_active ? "Active" : "Inactive"} />
        </div>
      </div>

      {/* Stakeholder Profile */}
      {user.profile && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            {user.role === "INSTRUMENT_OWNER" || user.role === "GATC" ? "Business & KYC Details" : "Contact & Office Details"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(user.role === "INSTRUMENT_OWNER" || user.role === "GATC") && (
              <>
                <InfoRow icon={<Building2 size={16} />} label="Business Name" value={user.profile.business_name} />
                <InfoRow icon={<Shield size={16} />} label="Business Type" value={user.profile.business_type?.replace(/_/g, " ") || "Commercial User"} />
                <InfoRow icon={<Shield size={16} />} label="GSTIN" value={user.profile.gstin || "—"} />
                <InfoRow icon={<Shield size={16} />} label="PAN" value={user.profile.pan || "—"} />
                <InfoRow icon={<Shield size={16} />} label="Trade License" value={user.profile.trade_license_number || "—"} />
                <InfoRow icon={<Shield size={16} />} label="Aadhaar Reference" value={user.profile.aadhaar_reference || "—"} />
              </>
            )}
            <InfoRow icon={<Phone size={16} />} label="Contact Phone" value={user.profile.contact_phone} />
            <InfoRow icon={<MapPin size={16} />} label="Address" value={user.profile.address_line} />
            <InfoRow icon={<MapPin size={16} />} label="City / State" value={`${user.profile.city}, ${user.profile.state}`} />
            <InfoRow icon={<MapPin size={16} />} label="Pincode" value={user.profile.pincode} />
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        token={token}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={showPassModal}
        onClose={() => setShowPassModal(false)}
      />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-slate-400 mt-0.5">{icon}</div>
      <div>
        <div className="text-xs font-medium text-slate-400">{label}</div>
        <div className="text-sm font-semibold text-slate-800">{value}</div>
      </div>
    </div>
  );
}
