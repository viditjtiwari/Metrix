"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useCheckExpiriesMutation,
} from "@/features/notifications/notificationApi";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { NotificationType } from "@/types";

const typeIcons: Record<NotificationType, string> = {
  APPLICATION_SUBMITTED: "send",
  APPLICATION_SCHEDULED: "event",
  INSPECTION_ASSIGNED: "person_add",
  INSPECTION_COMPLETED: "task_alt",
  APPLICATION_VERIFIED: "verified",
  APPLICATION_REJECTED: "cancel",
  CERTIFICATE_ISSUED: "workspace_premium",
  CERTIFICATE_EXPIRING: "schedule",
  CERTIFICATE_EXPIRED: "event_busy",
};

const typeBadgeVariant = (type: NotificationType) => {
  if (
    type === "CERTIFICATE_EXPIRING" ||
    type === "CERTIFICATE_EXPIRED" ||
    type === "APPLICATION_REJECTED"
  )
    return "warning" as const;
  if (type === "APPLICATION_VERIFIED" || type === "CERTIFICATE_ISSUED")
    return "success" as const;
  return "info" as const;
};

export default function NotificationsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [filterUnread, setFilterUnread] = useState<boolean | undefined>(
    undefined
  );
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isError, refetch } = useGetNotificationsQuery({
    is_read: filterUnread,
    page,
    page_size: 20,
  });

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();
  const [checkExpiries, { isLoading: isScanning }] =
    useCheckExpiriesMutation();
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleScanExpiries = async () => {
    try {
      const res = await checkExpiries().unwrap();
      setScanResult(
        `Scan complete: ${res.expiring_notifications_created} expiring, ${res.expired_notifications_created} expired, ${res.certificates_marked_expired} marked expired.`
      );
      refetch();
    } catch {
      setScanResult("Failed to run expiry scan.");
    }
  };

  const isStaff = user?.role === "ADMIN" || user?.role === "LMO";

  return (
    <AuthGuard>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-headline font-bold tracking-tight text-on-surface">
                  Notifications
                </h1>
                {data && data.unread_count > 0 && (
                  <Badge variant="error" size="md">
                    {data.unread_count} unread
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-on-surface-variant">
                Verification lifecycle events, assignment notices, and
                certificate alerts.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isStaff && (
                <Button
                  variant="outline"
                  size="sm"
                  icon="schedule"
                  loading={isScanning}
                  onClick={handleScanExpiries}
                >
                  Trigger Expiry Scan
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                icon="done_all"
                loading={isMarkingAll}
                disabled={data?.unread_count === 0}
                onClick={() => markAllRead()}
              >
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon="refresh"
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* Scan Result Banner */}
        {scanResult && (
          <div className="rounded-xl border border-tertiary/30 bg-tertiary/5 p-3 text-xs text-tertiary font-medium flex items-center justify-between animate-slide-up">
            <span>{scanResult}</span>
            <button
              onClick={() => setScanResult(null)}
              className="font-bold ml-4"
            >
              ×
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {[
            { label: "All", value: undefined as boolean | undefined },
            { label: "Unread Only", value: false },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setFilterUnread(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterUnread === tab.value
                  ? "bg-primary-container text-on-secondary shadow-xs font-bold"
                  : "bg-surface-container-lowest text-on-surface-variant border border-surface-variant/40 hover:bg-surface-container-low"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <Card padding="sm">
          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner label="Loading notifications..." />
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-xs text-error">
              Failed to load notifications.
            </div>
          ) : !data?.items.length ? (
            <EmptyState
              icon="notifications_off"
              title="No notifications"
              description="You're all caught up! New notifications will appear here."
            />
          ) : (
            <div className="divide-y divide-surface-variant/20">
              {data.items.map((n) => {
                const icon = typeIcons[n.type] || "info";
                const variant = typeBadgeVariant(n.type);

                return (
                  <div
                    key={n.id}
                    className={`p-4 flex items-start justify-between gap-4 transition ${
                      !n.is_read
                        ? "bg-surface-container-low/40"
                        : "hover:bg-surface-container-low/20"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-base text-secondary">
                          {icon}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                          )}
                          <span className="font-semibold text-xs text-on-surface">
                            {n.title}
                          </span>
                          <Badge variant={variant}>{n.type}</Badge>
                        </div>
                        <p className="text-xs text-on-surface-variant">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-outline block">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                        {n.entity_type && n.entity_id && (
                          <Link
                            href={
                              n.entity_type === "application"
                                ? `/applications/${n.entity_id}`
                                : n.entity_type === "certificate"
                                ? `/certificates`
                                : "#"
                            }
                            className="text-[11px] text-secondary font-semibold hover:underline inline-flex items-center gap-0.5 mt-0.5"
                          >
                            <span className="material-symbols-outlined text-xs">
                              open_in_new
                            </span>
                            View{" "}
                            {n.entity_type === "application"
                              ? "Application"
                              : "Details"}
                          </Link>
                        )}
                      </div>
                    </div>

                    {!n.is_read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="shrink-0 text-xs text-secondary hover:text-secondary-container font-medium px-2 py-1 rounded hover:bg-secondary/5 transition"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Pagination */}
        {data && (
          <Pagination
            page={page}
            pageSize={20}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </AuthGuard>
  );
}
