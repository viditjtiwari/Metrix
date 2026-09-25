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
import { ApplicationModals } from "@/features/applications/ApplicationModals";
import { PaymentDetailsCard } from "@/features/applications/PaymentDetailsCard";
import { InspectionCard } from "@/features/applications/InspectionCard";
import { ObservationsList } from "@/features/applications/ObservationsList";
import { StatusTimeline } from "@/features/applications/StatusTimeline";
import { CertificateCard } from "@/features/certificates/CertificateCard";
import { ApplicationInfoCards } from "@/features/applications/ApplicationInfoCards";
import { InspectionImageUpload } from "@/features/applications/InspectionImageUpload";
import { parseImageUrls } from "@/utils/formatters";
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
  const [showUploadPayment, setShowUploadPayment] = useState(false);
  const [showVerifyPayment, setShowVerifyPayment] = useState(false);
  const [showClarificationRequest, setShowClarificationRequest] = useState(false);
  const [showClarificationRespond, setShowClarificationRespond] = useState(false);
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

  const safeRefetch = (fn?: () => void) => {
    try {
      fn?.();
    } catch {
      // Query was not started or skipped; RTK tag invalidation handles updates
    }
  };

  React.useEffect(() => {
    if (app?.status === "CERTIFICATE_ISSUED" && showIssueCert) {
      setShowIssueCert(false);
    }
  }, [app?.status, showIssueCert]);

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
      safeRefetch(refetchInspection);
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
  const inspectionImageUrls = parseImageUrls(inspection?.image_urls);

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
          onOpenUploadPayment={() => setShowUploadPayment(true)}
          onOpenVerifyPayment={() => setShowVerifyPayment(true)}
          onOpenClarificationRequest={() => setShowClarificationRequest(true)}
          onOpenClarificationRespond={() => setShowClarificationRespond(true)}
        />
      </div>

      {actionError && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">{actionError}</div>
      )}

      {/* Main Grid: Details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {app.status === "CERTIFICATE_ISSUED" && certificate && (
            <CertificateCard certificate={certificate} />
          )}

          <ApplicationInfoCards app={app} />

          <PaymentDetailsCard app={app} />

          {inspection && <InspectionCard inspection={inspection} />}

          {inspection && (
            <ObservationsList
              observations={inspection.observations || []}
              canAdd={app.status === "INSPECTION_IN_PROGRESS" && isAssignedVerifier}
              onAddClick={() => setShowAddObs(true)}
            />
          )}

          {inspection && (
            <InspectionImageUpload
              inspectionId={inspection.id}
              imageUrls={inspectionImageUrls}
              certificateImageUrl={
                (inspection as unknown as { certificate_image_url?: string })?.certificate_image_url
              }
              canUpload={
                (app.status === "INSPECTION_IN_PROGRESS" ||
                  app.status === "SCHEDULED" ||
                  app.status === "INSPECTION_COMPLETED") &&
                isAssignedVerifier
              }
              canSelectCertImage={user?.role === "LMO" || user?.role === "ADMIN"}
            />
          )}
        </div>

        <StatusTimeline history={app.status_history} />
      </div>

      <ApplicationModals
        applicationId={applicationId}
        app={app}
        inspection={inspection}
        showSchedule={showSchedule}
        setShowSchedule={setShowSchedule}
        showAssign={showAssign}
        setShowAssign={setShowAssign}
        showAddObs={showAddObs}
        setShowAddObs={setShowAddObs}
        showResult={showResult}
        setShowResult={setShowResult}
        showIssueCert={showIssueCert}
        setShowIssueCert={setShowIssueCert}
        showUploadPayment={showUploadPayment}
        setShowUploadPayment={setShowUploadPayment}
        showVerifyPayment={showVerifyPayment}
        setShowVerifyPayment={setShowVerifyPayment}
        showClarificationRequest={showClarificationRequest}
        setShowClarificationRequest={setShowClarificationRequest}
        showClarificationRespond={showClarificationRespond}
        setShowClarificationRespond={setShowClarificationRespond}
        onRefreshAll={refetch}
        onRefreshInspection={() => safeRefetch(refetchInspection)}
        onRefreshCert={() => safeRefetch(refetchCert)}
      />
    </div>
  );
}
