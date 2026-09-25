"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useGetInstrumentQuery,
  useUpdateInstrumentMutation,
  useDeactivateInstrumentMutation,
} from "@/features/instruments/instrumentApi";
import { CreateApplicationModal } from "@/features/applications/CreateApplicationModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { formatDate, formatInstrumentType, parseImageUrls } from "@/utils/formatters";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { InstrumentImageUpload } from "@/features/instruments/InstrumentImageUpload";
import { Scale, FileText, ArrowLeft, Edit, AlertOctagon, PlusCircle } from "lucide-react";

export default function InstrumentDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: instrument, isLoading, isError } = useGetInstrumentQuery(Number(id));
  const { user, isOwner, isAdmin } = useRoleAccess();

  const [showEdit, setShowEdit] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [editModel, setEditModel] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const [updateInstrument, { isLoading: isUpdating }] = useUpdateInstrumentMutation();
  const [deactivateInstrument, { isLoading: isDeactivating }] = useDeactivateInstrumentMutation();

  if (isLoading) return <LoadingSpinner text="Loading instrument details..." />;
  if (isError || !instrument) {
    return (
      <div className="p-6 text-center text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
        Instrument not found or you don't have permission to view it.
      </div>
    );
  }

  const canManage = isAdmin || (isOwner && instrument.owner_id === user?.id);

  const handleOpenEdit = () => {
    setEditModel(instrument.model_name);
    setEditCapacity(instrument.capacity || "");
    setEditLocation(instrument.location);
    setEditError(null);
    setShowEdit(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    try {
      await updateInstrument({
        id: instrument.id,
        data: {
          model_name: editModel,
          capacity: editCapacity || undefined,
          location: editLocation,
        },
      }).unwrap();
      setShowEdit(false);
    } catch (err: any) {
      setEditError(err?.data?.detail || "Failed to update instrument.");
    }
  };

  const handleDeactivate = async () => {
    if (!confirm(`Are you sure you want to deactivate instrument ${instrument.registration_number}?`)) return;
    try {
      await deactivateInstrument(instrument.id).unwrap();
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to deactivate instrument.");
    }
  };

  const imageUrls = parseImageUrls(instrument?.image_urls);

  const fields = [
    { label: "Registration Number", value: instrument.registration_number },
    { label: "Type", value: formatInstrumentType(instrument.instrument_type) },
    { label: "Manufacturer", value: instrument.manufacturer },
    { label: "Model", value: instrument.model_name },
    { label: "Serial Number", value: instrument.serial_number },
    {
      label: "Capacity Range",
      value:
        instrument.min_capacity || instrument.max_capacity
          ? `${instrument.min_capacity || "0"} to ${instrument.max_capacity || "—"} ${instrument.capacity_unit || ""}`.trim()
          : instrument.capacity || "—",
    },
    { label: "Location", value: instrument.location },
    { label: "Registered On", value: formatDate(instrument.created_at) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/instruments" className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
          <ArrowLeft size={18} />
        </Link>
        <PageHeader
          title={instrument.registration_number}
          badge={<StatusBadge status={instrument.is_active ? "ACTIVE" : "EXPIRED"} size="md" />}
        />
      </div>

      {/* Instrument Details Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Scale size={18} className="text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">Instrument Details</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {fields.map((f) => (
            <div key={f.label}>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{f.label}</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Statutory Dossier Card */}
      {(instrument.tac_certificate_url || instrument.purchase_invoice_url) && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-xs">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Statutory Compliance Dossier (LM Rules)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
              <span className="text-[11px] font-medium text-slate-400 block uppercase">Type Approval Certificate (TAC)</span>
              {instrument.tac_certificate_url ? (
                instrument.tac_certificate_url.startsWith("http") ? (
                  <a href={instrument.tac_certificate_url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-medium mt-1 inline-flex items-center gap-1">
                    View TAC Certificate ↗
                  </a>
                ) : (
                  <span className="font-mono text-slate-800 font-semibold mt-1 block">{instrument.tac_certificate_url}</span>
                )
              ) : (
                <span className="text-slate-400 italic mt-1 block">Not provided</span>
              )}
            </div>
            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
              <span className="text-[11px] font-medium text-slate-400 block uppercase">Purchase Invoice / Bill of Sale</span>
              {instrument.purchase_invoice_url ? (
                instrument.purchase_invoice_url.startsWith("http") ? (
                  <a href={instrument.purchase_invoice_url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-medium mt-1 inline-flex items-center gap-1">
                    View Purchase Invoice ↗
                  </a>
                ) : (
                  <span className="font-mono text-slate-800 font-semibold mt-1 block">{instrument.purchase_invoice_url}</span>
                )
              ) : (
                <span className="text-slate-400 italic mt-1 block">Not provided</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instrument Photos Component */}
      <InstrumentImageUpload
        instrumentId={instrument.id}
        imageUrls={imageUrls}
        canEdit={canManage}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {canManage && (
          <>
            <button
              onClick={() => setShowApply(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs"
            >
              <PlusCircle size={15} /> Apply for Verification
            </button>
            <button
              onClick={handleOpenEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
            >
              <Edit size={15} /> Edit Details
            </button>
            {instrument.is_active && (
              <button
                onClick={handleDeactivate}
                disabled={isDeactivating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 transition"
              >
                <AlertOctagon size={15} /> Deactivate Instrument
              </button>
            )}
          </>
        )}
        <Link
          href={`/applications?instrument_id=${instrument.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
        >
          <FileText size={15} /> View History
        </Link>
      </div>

      {/* Edit Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Instrument Details">
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          {editError && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700">{editError}</div>
          )}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Model Name</label>
            <input
              type="text"
              required
              value={editModel}
              onChange={(e) => setEditModel(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Capacity</label>
            <input
              type="text"
              value={editCapacity}
              onChange={(e) => setEditCapacity(e.target.value)}
              placeholder="e.g. 50kg, 100L"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Premises / Location</label>
            <input
              type="text"
              required
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Apply for Verification Modal */}
      {showApply && (
        <CreateApplicationModal
          preselectedInstrumentId={instrument.id}
          onClose={() => setShowApply(false)}
          onSuccess={(app) => {
            setShowApply(false);
            router.push(`/applications/${app.id}`);
          }}
        />
      )}
    </div>
  );
}
