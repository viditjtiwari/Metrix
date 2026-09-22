"use client";

import React from "react";
import { EmptyState } from "./EmptyState";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  loading,
  emptyTitle = "No data found",
  emptyDescription,
  emptyAction,
  onRowClick,
  page,
  pageSize,
  total,
  onPageChange,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-center py-16">
          <div className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-emerald-600 animate-spin mr-3" />
          <span className="text-sm text-slate-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200">
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </div>
    );
  }

  const totalPages = total && pageSize ? Math.ceil(total / pageSize) : 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.className || ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick?.(row)}
                className={`transition ${onRowClick ? "cursor-pointer hover:bg-slate-50" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-slate-700 ${col.className || ""}`}>
                    {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {page && total && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/30">
          <span className="text-xs text-slate-500">
            Showing {Math.min((page - 1) * (pageSize || 20) + 1, total)}–{Math.min(page * (pageSize || 20), total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-xs font-semibold text-slate-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
