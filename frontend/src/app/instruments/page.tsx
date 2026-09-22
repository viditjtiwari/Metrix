"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useSearchInstrumentsQuery } from "@/features/instruments/instrumentApi";
import { RegisterInstrumentModal } from "@/features/instruments/RegisterInstrumentModal";
import { CreateApplicationModal } from "@/features/applications/CreateApplicationModal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { InstrumentResponse, InstrumentType } from "@/types";

const instrumentTypeLabels: Record<InstrumentType, string> = {
  WEIGHING_SCALE: "Weighing Scale",
  ELECTRONIC_BALANCE: "Electronic Balance",
  PETROL_DISPENSER: "Petrol Dispenser",
  FLOW_METER: "Flow Meter",
  LENGTH_MEASURE: "Length Measure",
  OTHER: "Other",
};

export default function InstrumentsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [showCreateApp, setShowCreateApp] = useState(false);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<
    number | undefined
  >();
  const [banner, setBanner] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useSearchInstrumentsQuery({
    registration_number: searchQuery || undefined,
    manufacturer: searchQuery || undefined,
  });

  const instruments = data?.items || [];

  const columns = [
    {
      key: "registration_number",
      header: "Registration No.",
      render: (row: InstrumentResponse) => (
        <span className="font-mono font-bold text-on-surface">
          {row.registration_number}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row: InstrumentResponse) => (
        <Badge variant="info">
          {instrumentTypeLabels[row.instrument_type] || row.instrument_type}
        </Badge>
      ),
    },
    {
      key: "manufacturer",
      header: "Manufacturer / Model",
      render: (row: InstrumentResponse) => (
        <span>
          {row.manufacturer} — {row.model_name}
        </span>
      ),
    },
    {
      key: "serial",
      header: "Serial No.",
      render: (row: InstrumentResponse) => (
        <span className="font-mono text-on-surface-variant">
          {row.serial_number}
        </span>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (row: InstrumentResponse) => (
        <span className="text-on-surface-variant">{row.location}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: InstrumentResponse) => (
        <Badge variant={row.is_active ? "success" : "error"} dot>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row: InstrumentResponse) => (
        <Button
          variant="ghost"
          size="sm"
          icon="add_circle"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedInstrumentId(row.id);
            setShowCreateApp(true);
          }}
        >
          New Application
        </Button>
      ),
    },
  ];

  return (
    <AuthGuard>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-secondary text-xs uppercase font-semibold tracking-wider">
                <span className="material-symbols-outlined text-base">
                  precision_manufacturing
                </span>
                <span>Instrument Registry</span>
              </div>
              <h1 className="font-headline font-bold text-2xl text-on-surface tracking-tight mt-0.5">
                Registered Instruments
              </h1>
              <p className="text-xs text-on-surface-variant mt-1">
                Manage your weighing and measuring instruments. Register new
                instruments and create verification applications.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="primary"
                icon="add"
                onClick={() => setShowRegister(true)}
              >
                Register Instrument
              </Button>
              <Button variant="outline" icon="refresh" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* Banner */}
        {banner && (
          <div className="rounded-xl border border-tertiary/30 bg-tertiary/5 p-3 text-xs text-tertiary font-medium flex items-center justify-between animate-slide-up">
            <span>{banner}</span>
            <button
              onClick={() => setBanner(null)}
              className="font-bold ml-4"
            >
              ×
            </button>
          </div>
        )}

        {/* Search */}
        <Card padding="sm">
          <Input
            icon="search"
            placeholder="Search by registration number, manufacturer, or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Card>

        {/* Table */}
        <DataTable
          columns={columns}
          data={instruments}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          isError={isError}
          emptyIcon="precision_manufacturing"
          emptyTitle="No instruments registered"
          emptyDescription="Register your first instrument to begin the verification process."
          emptyAction={
            <Button icon="add" onClick={() => setShowRegister(true)}>
              Register Instrument
            </Button>
          }
        />

        {/* Modals */}
        {showRegister && (
          <RegisterInstrumentModal
            onClose={() => setShowRegister(false)}
            onSuccess={(inst) => {
              setBanner(
                `Instrument registered! Reg Number: ${inst.registration_number}`
              );
              setSelectedInstrumentId(inst.id);
              refetch();
            }}
          />
        )}

        {showCreateApp && (
          <CreateApplicationModal
            preselectedInstrumentId={selectedInstrumentId}
            onClose={() => setShowCreateApp(false)}
            onSuccess={(app) => {
              setBanner(
                `Application created! Number: ${app.application_number}`
              );
            }}
          />
        )}
      </div>
    </AuthGuard>
  );
}
