"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useGetApplicationInspectionQuery,
  useGetApplicationQuery,
  useStartInspectionMutation,
  useUpdateApplicationStatusMutation,
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
import { RejectModal } from "@/features/applications/RejectModal";
import { useAppSelector } from "@/store/hooks";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = Number(params?.id);
  const { user } = useAppSelector((state) => state.auth);

  const [showSchedule, setShowSchedule] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showAddObs, setShowAddObs] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showIssueCert, setShowIssueCert] = useState(false);
  const [showReject, setShowReject] = useState(false);
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

  const handleReview = async () => {
    setActionError(null);
    try {
      await updateStatus({ id: applicationId, status: "UNDER_REVIEW", remarks: "Officer commenced review" }).unwrap();
      refetch();
    } catch (err: unknown) {
      setActionError((err as { data?: { detail?: string } })?.data?.detail || "Review failed.");
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    setActionError(null);
    try {
      await updateStatus({ id: applicationId, status: "REJECTED", remarks: reason }).unwrap();
      refetch();
    } catch (err: unknown) {
      setActionError((err as { data?: { detail?: string } })?.data?.detail || "Rejection failed.");
      throw err;
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
    <AuthGuard>
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-5 rounded-xl border border-surface-variant/40 shadow-xs">
        <div>
          <Link href="/applications" className="text-xs font-semibold text-secondary hover:underline">
            ← Back to Applications
          </Link>
          <div className="flex items-center gap-3 mt-1.5">
            <h1 className="text-xl font-bold font-mono text-on-surface">{app.application_number}</h1>
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
          onRejectReview={() => setShowReject(true)}
          onOpenSchedule={() => setShowSchedule(true)}
          onOpenAssign={() => setShowAssign(true)}
          onStartInspection={handleStartInspection}
          onOpenAddObs={() => setShowAddObs(true)}
          onOpenResult={() => setShowResult(true)}
          onOpenIssueCert={() => setShowIssueCert(true)}
          onSubmitDraft={handleSubmitDraft}
        />
      </div>

      {actionError && (
        <div className="rounded-lg bg-error-container/10 border border-error/20 p-3 text-xs text-error">{actionError}</div>
      )}

      {/* Main Grid: Details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Certificate Card when CERTIFICATE_ISSUED */}
          {app.status === "CERTIFICATE_ISSUED" && certificate && (
            <CertificateCard certificate={certificate} />
          )}

          {/* Metadata */}
          <div className="rounded-xl border border-surface-variant/40 bg-surface-container-lowest p-5 shadow-xs text-xs space-y-3">
            <h3 className="text-sm font-semibold text-on-surface border-b border-surface-variant/30 pb-2">Application Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-outline block">Instrument ID</span>
                <span className="font-mono font-medium text-on-surface">INST-#{app.instrument_id}</span>
              </div>
              <div>
                <span className="text-outline block">Application Type</span>
                <span className="font-medium text-on-surface">{app.application_type}</span>
              </div>
              <div>
                <span className="text-outline block">Submitted At</span>
                <span className="font-medium text-on-surface">
                  {app.submitted_at ? new Date(app.submitted_at).toLocaleString() : "Draft"}
                </span>
              </div>
              <div>
                <span className="text-outline block">Remarks</span>
                <span className="text-on-surface-variant">{app.remarks || "—"}</span>
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

      {showReject && (
        <RejectModal
          isOpen={showReject}
          applicationNumber={app.application_number}
          onClose={() => setShowReject(false)}
          onConfirm={handleRejectConfirm}
          isLoading={updatingStatus}
        />
      )}
    </div>
    </AuthGuard>
  );
}
