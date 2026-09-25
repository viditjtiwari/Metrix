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

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [filterUnread, setFilterUnread] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isError, refetch } = useGetNotificationsQuery(
    {
      is_read: filterUnread,
      page,
      page_size: 20,
    },
    { skip: !isAuthenticated || !user }
  );

  const [markRead, { isLoading: isMarkingRead }] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();
  const [checkExpiries, { isLoading: isScanning }] = useCheckExpiriesMutation();
  const [scanResult, setScanResult] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <h2 className="text-base font-semibold text-slate-900">Sign In Required</h2>
        <p className="mt-1 text-xs text-slate-500">
          Please sign in to view your in-app notifications and alerts.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const handleScanExpiries = async () => {
    try {
      const res = await checkExpiries().unwrap();
      setScanResult(
        `Scan complete: ${res.expiring_notifications_created} expiring alerts, ${res.expired_notifications_created} expired alerts, ${res.certificates_marked_expired} marked expired.`
      );
    } catch {
      setScanResult("Failed to run expiry scan.");
    }
  };

  const isStaff = user?.role === "ADMIN" || user?.role === "LMO";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Notifications</h1>
            {data && data.unread_count > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                {data.unread_count} unread
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time verification lifecycle events, assignment notices, and certificate alerts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isStaff && (
            <button
              onClick={handleScanExpiries}
              disabled={isScanning}
              className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-xs font-medium hover:bg-amber-100 transition disabled:opacity-50"
            >
              {isScanning ? "Scanning..." : "Trigger Expiry Scan"}
            </button>
          )}
          <button
            onClick={() => markAllRead()}
            disabled={isMarkingAll || data?.unread_count === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs hover:bg-slate-50 transition disabled:opacity-50"
          >
            {isMarkingAll ? "Updating..." : "Mark All as Read"}
          </button>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs hover:bg-slate-50 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {scanResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex justify-between items-center">
          <span>{scanResult}</span>
          <button onClick={() => setScanResult(null)} className="font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setFilterUnread(undefined);
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            filterUnread === undefined
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => {
            setFilterUnread(false);
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            filterUnread === false
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Unread Only
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-xs text-slate-500">
            <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-emerald-600 animate-spin mr-2" />
            Loading notifications...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-600">
            Failed to load notifications.
          </div>
        ) : !data?.items.length ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No notifications found.
          </div>
        ) : (
          data.items.map((n) => {
            const isAlert =
              n.type === "CERTIFICATE_EXPIRING" ||
              n.type === "CERTIFICATE_EXPIRED" ||
              n.type === "APPLICATION_REJECTED";

            return (
              <div
                key={n.id}
                className={`p-4 flex items-start justify-between gap-4 transition ${
                  !n.is_read ? "bg-slate-50/70" : "hover:bg-slate-50/40"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        !n.is_read ? "bg-emerald-600" : "bg-transparent"
                      }`}
                    />
                    <span className="font-semibold text-xs text-slate-900">{n.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isAlert
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {n.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 pl-4">{n.message}</p>
                  <span className="text-[10px] text-slate-400 pl-4 block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => markRead(n.id)}
                    disabled={isMarkingRead}
                    className="shrink-0 text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 rounded hover:bg-emerald-50 transition"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {data && data.total > 20 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(page - 1) * 20 + 1} - {Math.min(page * 20, data.total)} of {data.total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= data.total}
              className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
