"use client";

import React from "react";
import Link from "next/link";
import { ApplicationDetailResponse } from "@/types";
import { User, Building2, Phone, Mail, Scale, MapPin, Tag, Hash, Calendar, FileText } from "lucide-react";

interface Props {
  app: ApplicationDetailResponse;
}

export function ApplicationInfoCards({ app }: Props) {
  return (
    <div className="space-y-4">
      {/* 2-Column Grid: Applicant Profile + Instrument Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Applicant Profile */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-3">
            <User className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Applicant & Business Info
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Owner / Rep</span>
              <span className="font-semibold text-slate-800">
                {app.applicant_name || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Business Name</span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <Building2 className="h-3 w-3 text-slate-400" />
                {app.applicant_business_name || "Direct Individual"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Email</span>
              <span className="font-medium text-slate-800 flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
                {app.applicant_email || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Contact Phone</span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400" />
                {app.applicant_phone || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Instrument Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Instrument Specifications
              </h3>
            </div>
            <Link
              href={`/instruments/${app.instrument_id}`}
              className="text-[11px] font-medium text-blue-600 hover:underline"
            >
              View Instrument →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Reg Number</span>
              <span className="font-mono font-semibold text-slate-900">
                {app.instrument_registration_number || `INST-#${app.instrument_id}`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Type / Category</span>
              <span className="font-medium text-slate-800">
                {app.instrument_type?.replace(/_/g, " ") || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Make & Model</span>
              <span className="font-medium text-slate-800">
                {app.instrument_manufacturer || "—"} {app.instrument_model || ""}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Serial Number</span>
              <span className="font-mono text-slate-800 flex items-center gap-1">
                <Hash className="h-3 w-3 text-slate-400" />
                {app.instrument_serial_number || "—"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Capacity</span>
              <span className="font-semibold text-emerald-700">
                {app.instrument_capacity || "Standard"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Operating Location</span>
              <span className="font-medium text-slate-800 flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                {app.instrument_location || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Application Meta Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs text-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-3">
          <FileText className="h-4 w-4 text-slate-500" />
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Application Information
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-slate-400 block text-[11px]">Application Type</span>
            <span className="font-semibold text-slate-800">{app.application_type}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Submission Date</span>
            <span className="font-medium text-slate-800 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "Draft (Not submitted)"}
            </span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-400 block text-[11px]">Applicant Remarks</span>
            <span className="text-slate-700 italic">{app.remarks || "No remarks provided."}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
