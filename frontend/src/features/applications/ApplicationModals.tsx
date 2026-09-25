"use client";

import React from "react";
import { ApplicationDetailResponse, InspectionDetailResponse } from "@/types";
import { ScheduleModal } from "@/features/applications/ScheduleModal";
import { AssignModal } from "@/features/applications/AssignModal";
import { AddObservationModal } from "@/features/applications/AddObservationModal";
import { InspectionResultModal } from "@/features/applications/InspectionResultModal";
import { IssueCertificateModal } from "@/features/certificates/IssueCertificateModal";
import { PaymentReceiptModal } from "@/features/applications/PaymentReceiptModal";
import { PaymentVerificationModal } from "@/features/applications/PaymentVerificationModal";
import { ClarificationModal } from "@/features/applications/ClarificationModal";

interface ApplicationModalsProps {
  applicationId: number;
  app: ApplicationDetailResponse;
  inspection?: InspectionDetailResponse;
  showSchedule: boolean;
  setShowSchedule: (v: boolean) => void;
  showAssign: boolean;
  setShowAssign: (v: boolean) => void;
  showAddObs: boolean;
  setShowAddObs: (v: boolean) => void;
  showResult: boolean;
  setShowResult: (v: boolean) => void;
  showIssueCert: boolean;
  setShowIssueCert: (v: boolean) => void;
  showUploadPayment: boolean;
  setShowUploadPayment: (v: boolean) => void;
  showVerifyPayment: boolean;
  setShowVerifyPayment: (v: boolean) => void;
  showClarificationRequest: boolean;
  setShowClarificationRequest: (v: boolean) => void;
  showClarificationRespond: boolean;
  setShowClarificationRespond: (v: boolean) => void;
  onRefreshAll: () => void;
  onRefreshInspection: () => void;
  onRefreshCert: () => void;
}

export const ApplicationModals: React.FC<ApplicationModalsProps> = ({
  applicationId,
  app,
  inspection,
  showSchedule,
  setShowSchedule,
  showAssign,
  setShowAssign,
  showAddObs,
  setShowAddObs,
  showResult,
  setShowResult,
  showIssueCert,
  setShowIssueCert,
  showUploadPayment,
  setShowUploadPayment,
  showVerifyPayment,
  setShowVerifyPayment,
  showClarificationRequest,
  setShowClarificationRequest,
  showClarificationRespond,
  setShowClarificationRespond,
  onRefreshAll,
  onRefreshInspection,
  onRefreshCert,
}) => {
  return (
    <>
      {showSchedule && (
        <ScheduleModal
          applicationId={applicationId}
          initialDate={inspection?.scheduled_date}
          initialTime={inspection?.scheduled_time}
          initialLocation={inspection?.inspection_location}
          initialRemarks={inspection?.scheduling_remarks}
          initialVerifierId={inspection?.assigned_to_id}
          onClose={() => setShowSchedule(false)}
          onSuccess={() => {
            onRefreshAll();
            onRefreshInspection();
          }}
        />
      )}

      {showAssign && (
        <AssignModal
          applicationId={applicationId}
          currentVerifierId={inspection?.assigned_to_id}
          onClose={() => setShowAssign(false)}
          onSuccess={() => {
            onRefreshAll();
            onRefreshInspection();
          }}
        />
      )}

      {showAddObs && inspection && (
        <AddObservationModal
          inspectionId={inspection.id}
          applicationId={applicationId}
          onClose={() => setShowAddObs(false)}
          onSuccess={onRefreshInspection}
        />
      )}

      {showResult && inspection && (
        <InspectionResultModal
          inspectionId={inspection.id}
          applicationId={applicationId}
          onClose={() => setShowResult(false)}
          onSuccess={() => {
            onRefreshAll();
            onRefreshInspection();
          }}
        />
      )}

      {showIssueCert && app.status !== "CERTIFICATE_ISSUED" && (
        <IssueCertificateModal
          applicationId={applicationId}
          applicationNumber={app.application_number}
          onClose={() => setShowIssueCert(false)}
          onSuccess={() => {
            onRefreshAll();
            onRefreshCert();
          }}
        />
      )}

      {showUploadPayment && (
        <PaymentReceiptModal
          app={app}
          onClose={() => setShowUploadPayment(false)}
          onSuccess={onRefreshAll}
        />
      )}

      {showVerifyPayment && (
        <PaymentVerificationModal
          app={app}
          onClose={() => setShowVerifyPayment(false)}
          onSuccess={onRefreshAll}
        />
      )}

      {showClarificationRequest && (
        <ClarificationModal
          app={app}
          mode="request"
          onClose={() => setShowClarificationRequest(false)}
          onSuccess={onRefreshAll}
        />
      )}

      {showClarificationRespond && (
        <ClarificationModal
          app={app}
          mode="respond"
          onClose={() => setShowClarificationRespond(false)}
          onSuccess={onRefreshAll}
        />
      )}
    </>
  );
};
