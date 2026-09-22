"use client";

import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  isError,
  errorMessage = "Failed to load data. Please try again.",
  emptyIcon = "inbox",
  emptyTitle = "No results found",
  emptyDescription,
  emptyAction,
  page,
  pageSize,
  total,
  onPageChange,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant/40 shadow-xs p-12">
        <LoadingSpinner label="Loading data..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant/40 shadow-xs p-8 text-center">
        <p className="text-xs text-error">{errorMessage}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant/40 shadow-xs">
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-variant/40 bg-surface-container-low text-on-surface-variant font-semibold">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-3 px-4 ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/20 text-on-surface">
              {data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className={`hover:bg-surface-container-low/60 transition ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3 px-4 ${col.className || ""}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {page && pageSize && total && onPageChange && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
