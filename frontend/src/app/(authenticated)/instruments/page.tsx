"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useListInstrumentsQuery } from "@/features/instruments/instrumentApi";
import { RegisterInstrumentModal } from "@/features/instruments/RegisterInstrumentModal";
import { BatchRegisterModal } from "@/features/instruments/BatchRegisterModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatInstrumentType } from "@/utils/formatters";
import { InstrumentResponse, InstrumentType } from "@/types";
import { Plus, Scale, Upload } from "lucide-react";

export default function InstrumentsPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  const { data, isLoading } = useListInstrumentsQuery({
    page,
    page_size: 20,
    instrument_type: (typeFilter as InstrumentType) || undefined,
    registration_number: searchText || undefined,
  });

  const canRegister = user?.role === "INSTRUMENT_OWNER";

  const columns = [
    {
      key: "registration_number",
      label: "Reg. Number",
      render: (row: InstrumentResponse) => (
        <span className="font-mono text-xs font-semibold text-slate-900">{row.registration_number}</span>
      ),
    },
    {
      key: "instrument_type",
      label: "Type",
      render: (row: InstrumentResponse) => (
        <span className="text-xs">{formatInstrumentType(row.instrument_type)}</span>
      ),
    },
    { key: "manufacturer", label: "Manufacturer" },
    { key: "model_name", label: "Model" },
    { key: "serial_number", label: "Serial No." },
    {
      key: "capacity",
      label: "Capacity",
      render: (row: InstrumentResponse) => (
        <span className="text-xs font-medium text-emerald-700">
          {row.min_capacity || row.max_capacity
            ? `${row.min_capacity || "0"} - ${row.max_capacity || "—"} ${row.capacity_unit || ""}`.trim()
            : row.capacity || "—"}
        </span>
      ),
    },
    { key: "location", label: "Location" },
    {
      key: "is_active",
      label: "Status",
      render: (row: InstrumentResponse) => (
        <StatusBadge status={row.is_active ? "ACTIVE" : "EXPIRED"} />
      ),
    },
    {
      key: "created_at",
      label: "Registered",
      render: (row: InstrumentResponse) => (
        <span className="text-xs text-slate-500">{formatDate(row.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Instrument Registry"
        description="Registered weighing and measuring instruments"
        badge={<Scale size={18} className="text-slate-400" />}
        actions={
          canRegister ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBatchModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-emerald-600/30 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-sm font-medium transition"
              >
                <Upload size={16} /> Bulk Upload (CSV)
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
              >
                <Plus size={16} /> Register Instrument
              </button>
            </div>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by registration number..."
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 w-64"
        />
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
        >
          <option value="">All Types</option>
          <option value="WEIGHING_SCALE">Weighing Scale</option>
          <option value="ELECTRONIC_BALANCE">Electronic Balance</option>
          <option value="PETROL_DISPENSER">Petrol Dispenser</option>
          <option value="FLOW_METER">Flow Meter</option>
          <option value="LENGTH_MEASURE">Length Measure</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        keyField="id"
        loading={isLoading}
        emptyTitle="No instruments registered"
        emptyDescription={canRegister ? "Register your first instrument to get started." : "No instruments found matching your filters."}
        emptyAction={
          canRegister ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setShowBatchModal(true)} className="px-4 py-2 rounded-lg border border-emerald-600/30 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-sm font-medium transition">
                Bulk Upload (CSV)
              </button>
              <button onClick={() => setShowRegister(true)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition">
                Register Instrument
              </button>
            </div>
          ) : undefined
        }
        onRowClick={(row) => router.push(`/instruments/${row.id}`)}
        page={page}
        pageSize={20}
        total={data?.total || 0}
        onPageChange={setPage}
      />

      {showRegister && (
        <RegisterInstrumentModal
          onClose={() => setShowRegister(false)}
          onSuccess={(inst) => {
            setShowRegister(false);
            router.push(`/instruments/${inst.id}`);
          }}
        />
      )}

      {showBatchModal && (
        <BatchRegisterModal
          onClose={() => setShowBatchModal(false)}
          onSuccess={() => {
            setShowBatchModal(false);
          }}
        />
      )}
    </div>
  );
}
