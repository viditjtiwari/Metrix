"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ApplicationStatusBadge } from "@/features/applications/ApplicationStatusBadge";
import {
  InstrumentResponse,
  ApplicationResponse,
  CertificateDetailResponse,
} from "@/types";

export const instrumentColumns = [
  {
    key: "reg",
    header: "Reg. Number",
    render: (r: InstrumentResponse) => (
      <span className="font-mono font-bold text-on-surface">
        {r.registration_number}
      </span>
    ),
  },
  {
    key: "type",
    header: "Type",
    render: (r: InstrumentResponse) => (
      <Badge variant="info">{r.instrument_type}</Badge>
    ),
  },
  {
    key: "mfg",
    header: "Manufacturer / Model",
    render: (r: InstrumentResponse) => (
      <span>
        {r.manufacturer} — {r.model_name}
      </span>
    ),
  },
  {
    key: "serial",
    header: "Serial No.",
    render: (r: InstrumentResponse) => (
      <span className="font-mono">{r.serial_number}</span>
    ),
  },
  {
    key: "location",
    header: "Location",
    render: (r: InstrumentResponse) => r.location,
  },
];

export const applicationColumns = [
  {
    key: "number",
    header: "App Number",
    render: (r: ApplicationResponse) => (
      <span className="font-mono font-bold text-on-surface">
        {r.application_number}
      </span>
    ),
  },
  {
    key: "inst",
    header: "Instrument ID",
    render: (r: ApplicationResponse) => (
      <span className="font-mono text-secondary">#{r.instrument_id}</span>
    ),
  },
  {
    key: "type",
    header: "Type",
    render: (r: ApplicationResponse) => (
      <Badge variant="neutral">{r.application_type}</Badge>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (r: ApplicationResponse) => (
      <ApplicationStatusBadge status={r.status} />
    ),
  },
  {
    key: "created",
    header: "Created",
    render: (r: ApplicationResponse) =>
      new Date(r.created_at).toLocaleDateString(),
  },
  {
    key: "action",
    header: "",
    className: "text-right",
    render: (r: ApplicationResponse) => (
      <Link
        href={`/applications/${r.id}`}
        className="text-secondary hover:text-secondary-container font-semibold text-xs"
      >
        View →
      </Link>
    ),
  },
];

export const certColumns = [
  {
    key: "number",
    header: "Cert Number",
    render: (r: CertificateDetailResponse) => (
      <span className="font-mono font-bold text-on-surface">
        {r.certificate_number}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (r: CertificateDetailResponse) => (
      <Badge variant={r.status === "ACTIVE" ? "success" : "error"}>
        {r.status}
      </Badge>
    ),
  },
  {
    key: "valid_from",
    header: "Valid From",
    render: (r: CertificateDetailResponse) => r.valid_from,
  },
  {
    key: "valid_until",
    header: "Valid Until",
    render: (r: CertificateDetailResponse) => (
      <span
        className={
          r.status === "EXPIRED"
            ? "text-error font-semibold"
            : "text-on-surface"
        }
      >
        {r.valid_until}
      </span>
    ),
  },
  {
    key: "action",
    header: "",
    className: "text-right",
    render: (r: CertificateDetailResponse) => (
      <Link
        href={`/verify/${r.verification_token}`}
        className="text-secondary hover:text-secondary-container font-semibold text-xs"
      >
        Verify →
      </Link>
    ),
  },
];
