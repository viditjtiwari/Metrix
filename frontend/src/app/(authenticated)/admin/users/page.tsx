"use client";

import React, { useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import {
  useListUsersQuery,
  useUpdateUserStatusMutation,
  useCreateOfficialUserMutation,
  AdminUserItem,
} from "@/features/admin/adminApi";
import { ChangeRoleModal } from "@/features/admin/ChangeRoleModal";
import { getRoleBadgeColor, getRoleLabel, formatDate } from "@/utils/formatters";
import { UserPlus, CheckCircle, XCircle } from "lucide-react";
import { UserRole } from "@/types";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState<{ id: number; name: string; role: UserRole } | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"LMO" | "GATC" | "ADMIN">("LMO");
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useListUsersQuery({
    query: search || undefined,
    role: roleFilter || undefined,
    page,
    page_size: 20,
  });

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation();
  const [createOfficial, { isLoading: isCreating }] = useCreateOfficialUserMutation();

  const handleToggleStatus = async (user: AdminUserItem) => {
    const action = user.is_active ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} user "${user.full_name}"?`)) return;
    try {
      await updateStatus({ id: user.id, is_active: !user.is_active }).unwrap();
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to update user status.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await createOfficial({
        full_name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
      }).unwrap();
      setShowAddModal(false);
      setFormName("");
      setFormEmail("");
      setFormPassword("");
    } catch (err: any) {
      setFormError(err?.data?.detail || "Failed to create user.");
    }
  };

  const columns = [
    {
      key: "full_name",
      label: "User",
      render: (u: AdminUserItem) => (
        <div>
          <div className="font-semibold text-slate-900 text-xs">{u.full_name}</div>
          <div className="text-[11px] text-slate-500">{u.email}</div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (u: AdminUserItem) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadgeColor(u.role)}`}>
          {getRoleLabel(u.role)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (u: AdminUserItem) => (
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${u.is_active ? "text-emerald-700" : "text-slate-400"}`}>
          {u.is_active ? <CheckCircle size={12} className="text-emerald-600" /> : <XCircle size={12} className="text-slate-400" />}
          {u.is_active ? "Active" : "Deactivated"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Registered",
      render: (u: AdminUserItem) => (
        <span className="text-slate-500 text-xs">{formatDate(u.created_at)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (u: AdminUserItem) => (
        <div className="flex gap-1.5">
          <button
            onClick={() => setRoleChangeUser({ id: u.id, name: u.full_name, role: u.role as UserRole })}
            className="px-2.5 py-1 rounded text-[11px] font-medium border border-blue-200 text-blue-700 hover:bg-blue-50 transition"
          >
            Change Role
          </button>
          <button
            onClick={() => handleToggleStatus(u)}
            disabled={isUpdatingStatus}
            className={`px-2.5 py-1 rounded text-[11px] font-medium border transition ${
              u.is_active
                ? "border-red-200 text-red-700 hover:bg-red-50"
                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            {u.is_active ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <AuthGuard requiredRoles={["ADMIN"]}>
      <div className="space-y-6">
        <PageHeader
          title="User & Stakeholder Management"
          description="Provision officers, authorize test centres, and manage active system accounts."
          actions={
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs"
            >
              <UserPlus size={15} />
              Add Official User
            </button>
          }
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 max-w-sm h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
          >
            <option value="">All Stakeholder Roles</option>
            <option value="LMO">Legal Metrology Officers (LMO)</option>
            <option value="GATC">Test Centres (GATC)</option>
            <option value="INSTRUMENT_OWNER">Instrument Owners</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>

        {/* User Table */}
        <DataTable<AdminUserItem>
          columns={columns}
          data={data?.items || []}
          keyField="id"
          loading={isLoading}
          emptyTitle="No users found"
          emptyDescription="No users match the selected search and filter criteria."
          page={page}
          pageSize={20}
          total={data?.total || 0}
          onPageChange={setPage}
        />

        {/* Create Official User Modal */}
        <Modal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Provision Official Account"
        >
          <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
            {formError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700">
                {formError}
              </div>
            )}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Officer Sunita Rao"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="e.g. s.rao@gov.in"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Initial Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">System Role</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="LMO">Legal Metrology Officer (LMO)</option>
                <option value="GATC">Government Approved Test Centre (GATC)</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition"
              >
                {isCreating ? "Provisioning..." : "Create Account"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Change Role Modal */}
        {roleChangeUser && (
          <ChangeRoleModal
            userId={roleChangeUser.id}
            userName={roleChangeUser.name}
            currentRole={roleChangeUser.role}
            onClose={() => setRoleChangeUser(null)}
            onSuccess={() => setRoleChangeUser(null)}
          />
        )}
      </div>
    </AuthGuard>
  );
}
