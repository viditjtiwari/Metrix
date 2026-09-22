"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useGetApplicationInspectionQuery,
  useGetApplicationQuery,
  useStartInspectionMutation,
  useUpdateApplicationStatusMutation,
  useDeleteApplicationMutation,
} from "@/features/applications/applicationApi";
import { useGetApplicationCertificateQuery } from "@/features/certificates/certificateApi";
import { ApplicationStatusBadge } from "@/features/applications/ApplicationStatusBadge";
import { ApplicationActionBar } from "@/features/applications/ApplicationActionBar";
import { AssignModal } from "@/features/applications/AssignModal";
import { AddObservationModal } from "@/features/applications/AddObservationModal";
import { InspectionCard } from "@/features/applications/InspectionCard";
import { InspectionResultModal } from "@/features/applications/InspectionResultModal";
import { ObservationsList } from "@/features/applications/ObservationsList";
import { ScheduleModal } from "@/features/applications/ScheduleModal";
import { StatusTimeline } from "@/features/applications/StatusTimeline";
import { CertificateCard } from "@/features/certificates/CertificateCard";
import { IssueCertificateModal } from "@/features/certificates/IssueCertificateModal";
import { useAppSelector } from "@/store/hooks";

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = Number(params?.id);
  const { user } = useAppSelector((state) => state.auth);

  const [showSchedule, setShowSchedule] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showAddObs, setShowAddObs] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showIssueCert, setShowIssueCert] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: app, isLoading, isError, refetch } = useGetApplicationQuery(applicationId, {
    skip: !applicationId,
  });

  const { data: inspection, refetch: refetchInspection } =
    useGetApplicationInspectionQuery(applicationId, {
      skip: !applicationId || !app?.status || app.status === "DRAFT" || app.status === "SUBMITTED",
    });

  const { data: certificate, refetch: refetchCert } =
    useGetApplicationCertificateQuery(applicationId, {
      skip: !applicationId || !app?.status || app.status !== "CERTIFICATE_ISSUED",
    });

  const [updateStatus, { isLoading: updatingStatus }] = useUpdateApplicationStatusMutation();
  const [startInspection, { isLoading: startingInspection }] = useStartInspectionMutation();
  const [deleteApplication] = useDeleteApplicationMutation();

  const handleDeleteDraft = async () => {
    if (!confirm("Are you sure you want to permanently delete this draft application?")) return;
    setActionError(null);
    try {
      await deleteApplication(applicationId).unwrap();
      router.push("/applications");
    } catch (err: unknown) {
      setActionError((err as { data?: { detail?: string } })?.data?.detail || "Could not delete application.");
    }
  };

  const handleReview = async () => {
    setActionError(null);
    try {
      await updateStatus({ id: applicationId, status: "UNDER_REVIEW", remarks: "Officer commenced review" }).unwrap();
      refetch();
    } catch (err: unknown) {
      setActionError((err as { data?: { detail?: string } })?.data?.detail || "Review failed.");
    }
  };

  const handleRejectReview = async () => {
    const reason = prompt("Enter reason for rejection:");
    if (!reason) return;
    setActionError(null);
    try {
      await updateStatus({ id: applicationId, status: "REJECTED", remarks: reason }).unwrap();
      refetch();
    } catch (err: unknown) {
      setActionError((err as { data?: { detail?: string } })?.data?.detail || "Rejection failed.");
    }
  };

  const handleStartInspection = async () => {
    setActionError(null);
    try {
      await startInspection(applicationId).unwrap();
      refetch();
      refetchInspection();
    } catch (err: unknown) {
      setActionError((err as { data?: { detail?: string } })?.data?.detail || "Could not start inspection.");
    }
  };

  const handleSubmitDraft = async () => {
    setActionError(null);
    try {
      await updateStatus({ id: applicationId, status: "SUBMITTED", remarks: "Applicant submitted application" }).unwrap();
      refetch();
    } catch (err: unknown) {
      setActionError((err as { data?: { detail?: string } })?.data?.detail || "Submission failed.");
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading application details...</div>;
  }
  if (isError || !app) {
    return <div className="p-12 text-center text-xs text-rose-600">Application not found or access denied.</div>;
  }

  const isAssignedVerifier = inspection?.assigned_to_id === user?.id || user?.role === "ADMIN" || user?.role === "LMO";

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <Link href="/applications" className="text-xs font-semibold text-emerald-600 hover:underline">
            ← Back to Applications
          </Link>
          <div className="flex items-center gap-3 mt-1.5">
            <h1 className="text-xl font-bold font-mono text-slate-900">{app.application_number}</h1>
            <ApplicationStatusBadge status={app.status} size="md" />
          </div>
        </div>

        <ApplicationActionBar
          app={app}
          user={user}
          isAssignedVerifier={isAssignedVerifier}
          updatingStatus={updatingStatus}
          startingInspection={startingInspection}
          onReview={handleReview}
          onRejectReview={handleRejectReview}
          onOpenSchedule={() => setShowSchedule(true)}
          onOpenAssign={() => setShowAssign(true)}
          onStartInspection={handleStartInspection}
          onOpenAddObs={() => setShowAddObs(true)}
          onOpenResult={() => setShowResult(true)}
          onOpenIssueCert={() => setShowIssueCert(true)}
          onSubmitDraft={handleSubmitDraft}
          onDeleteDraft={handleDeleteDraft}
        />
      </div>

      {actionError && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">{actionError}</div>
      )}

      {/* Main Grid: Details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Certificate Card when CERTIFICATE_ISSUED */}
          {app.status === "CERTIFICATE_ISSUED" && certificate && (
            <CertificateCard certificate={certificate} />
          )}

          {/* Metadata */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs text-xs space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Application Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-400 block">Instrument ID</span>
                <span className="font-mono font-medium text-slate-800">INST-#{app.instrument_id}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Application Type</span>
                <span className="font-medium text-slate-800">{app.application_type}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Submitted At</span>
                <span className="font-medium text-slate-800">
                  {app.submitted_at ? new Date(app.submitted_at).toLocaleString() : "Draft"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Remarks</span>
                <span className="text-slate-700">{app.remarks || "—"}</span>
              </div>
            </div>
          </div>

          {/* Inspection Info Card */}
          {inspection && <InspectionCard inspection={inspection} />}

          {/* Observations */}
          {inspection && (
            <ObservationsList
              observations={inspection.observations || []}
              canAdd={app.status === "INSPECTION_IN_PROGRESS" && isAssignedVerifier}
              onAddClick={() => setShowAddObs(true)}
            />
          )}
        </div>

        {/* Audit Status History Timeline */}
        <StatusTimeline history={app.status_history} />
      </div>

      {/* Modals */}
      {showSchedule && (
        <ScheduleModal
          applicationId={applicationId}
          initialDate={inspection?.scheduled_date}
          initialTime={inspection?.scheduled_time}
          initialLocation={inspection?.inspection_location}
          initialRemarks={inspection?.scheduling_remarks}
          initialVerifierId={inspection?.assigned_to_id}
          onClose={() => setShowSchedule(false)}
          onSuccess={() => { refetch(); refetchInspection(); }}
        />
      )}

      {showAssign && (
        <AssignModal
          applicationId={applicationId}
          currentVerifierId={inspection?.assigned_to_id}
          onClose={() => setShowAssign(false)}
          onSuccess={() => { refetch(); refetchInspection(); }}
        />
      )}

      {showAddObs && inspection && (
        <AddObservationModal
          inspectionId={inspection.id}
          applicationId={applicationId}
          onClose={() => setShowAddObs(false)}
          onSuccess={() => refetchInspection()}
        />
      )}

      {showResult && inspection && (
        <InspectionResultModal
          inspectionId={inspection.id}
          applicationId={applicationId}
          onClose={() => setShowResult(false)}
          onSuccess={() => { refetch(); refetchInspection(); }}
        />
      )}

      {showIssueCert && (
        <IssueCertificateModal
          applicationId={applicationId}
          applicationNumber={app.application_number}
          onClose={() => setShowIssueCert(false)}
          onSuccess={() => {
            refetch();
            refetchCert();
          }}
        />
      )}
    </div>
  );
}
