"use client";

import React from "react";
import { Button } from "./Button";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  if (total <= pageSize) return null;

  const totalPages = Math.ceil(total / pageSize);
  const showingFrom = (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2">
      <span>
        Showing{" "}
        <span className="font-semibold text-on-surface">
          {showingFrom}–{showingTo}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-on-surface">{total}</span>
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          icon="chevron_left"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="px-2 py-1 text-[11px] font-mono font-semibold text-on-surface bg-surface-container rounded-md">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          icon="chevron_right"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
