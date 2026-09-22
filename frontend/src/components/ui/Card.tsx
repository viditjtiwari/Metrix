"use client";

import React from "react";
import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hoverable?: boolean;
}

const paddingMap = {
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  children,
  className,
  padding = "md",
  hoverable = false,
}: CardProps) {
  return (
    <div
      className={clsx(
        "bg-surface-container-lowest rounded-xl border border-surface-variant/40 shadow-xs",
        paddingMap[padding],
        hoverable && "hover:shadow-sm hover:border-surface-variant/60 transition-all duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
